import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { buildUserPrompt, buildRevisionPrompt, buildUploadModePrompt, SYSTEM_PROMPT } from '@/lib/anthropic/prompt'
import { generateRateLimiter, sanitizeFormData, validateGenerateRequest } from '@/lib/utils/sanitize'
import { canGenerateNarrative } from '@/lib/utils/entitlements'
import type { GenerateRequest } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function sendEvent(controller: ReadableStreamDefaultController, encoder: TextEncoder, event: object) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
}

export async function POST(request: Request) {
  // 1. Auth check
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit check
  const rateLimit = generateRateLimiter.check(userId)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum 10 generations per minute. Please wait and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
        },
      }
    )
  }

  // 3. Parse and validate input
  let body: GenerateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // 4. Sanitize form data
  const sanitizedFormData = sanitizeFormData(body.formData)

  // 5. Validate required fields
  const validationError = validateGenerateRequest(sanitizedFormData)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  // 6. Get user + plan/usage check
  const supabase = getSupabaseServerClient()
  const user = await getUserByClerkId(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const entitlement = canGenerateNarrative(user)
  if (!entitlement.allowed) {
    return NextResponse.json({ error: entitlement.reason }, { status: 403 })
  }

  // 7. Build prompt
  let userPrompt: string
  if (body.mode === 'upload' && body.uploadedTransactions && body.statementSummary) {
    userPrompt = buildUploadModePrompt(
      body.uploadedTransactions,
      body.uploadedTransactions.filter((t) => t.isSelected),
      body.statementSummary,
      sanitizedFormData
    )
  } else {
    userPrompt = buildUserPrompt(sanitizedFormData)
  }

  // Handle revision mode
  if (sanitizedFormData.revisionInstructions && sanitizedFormData.revisionInstructions.trim()) {
    userPrompt = buildRevisionPrompt(userPrompt, sanitizedFormData.revisionInstructions)
  }

  // 8. Pre-create narrative row
  const { data: narrativeRow, error: insertError } = await supabase
    .from('narratives')
    .insert({
      user_id: user.id,
      subject_name: sanitizedFormData.subjectName,
      subject_type: sanitizedFormData.subjectType || null,
      transaction_type: sanitizedFormData.transactionType || null,
      transaction_amount: sanitizedFormData.transactionAmount
        ? parseFloat(sanitizedFormData.transactionAmount.replace(/[^0-9.]/g, ''))
        : null,
      transaction_currency: sanitizedFormData.currency || 'CAD',
      reporting_period_start: sanitizedFormData.reportingPeriodStart || null,
      reporting_period_end: sanitizedFormData.reportingPeriodEnd || null,
      form_data: sanitizedFormData,
      narrative_text: '',
      readiness_status: 'draft',
    })
    .select()
    .single()

  if (insertError || !narrativeRow) {
    return NextResponse.json({ error: 'Failed to create narrative record' }, { status: 500 })
  }

  const narrativeId = narrativeRow.id

  // 9. Create SSE stream
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      // Send narrative ID first so client can track it
      sendEvent(controller, encoder, { type: 'id', narrativeId })

      let fullText = ''

      try {
        const stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const chunk = event.delta.text
            fullText += chunk
            sendEvent(controller, encoder, { type: 'chunk', text: chunk })
          }
        }

        // Compute word count
        const wordCount = fullText
          .trim()
          .split(/\s+/)
          .filter((w) => w.length > 0).length

        // 10. Update narrative in DB
        await supabase
          .from('narratives')
          .update({
            narrative_text: fullText,
            word_count: wordCount,
            readiness_status: 'draft',
            updated_at: new Date().toISOString(),
          })
          .eq('id', narrativeId)

        // 11. Increment usage counter
        await supabase
          .from('users')
          .update({
            narratives_used_this_month: (user.narratives_used_this_month || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        // 12. Log to usage_log
        await supabase.from('usage_log').insert({
          user_id: user.id,
          action: 'generate',
          metadata: {
            narrative_id: narrativeId,
            word_count: wordCount,
            mode: body.mode || 'manual',
            subject_name: sanitizedFormData.subjectName,
          },
        })

        sendEvent(controller, encoder, {
          type: 'done',
          narrativeId,
          wordCount,
        })
      } catch (err) {
        console.error('[generate] stream error:', err)

        // Cleanup orphan narrative row on error
        await supabase.from('narratives').delete().eq('id', narrativeId)

        sendEvent(controller, encoder, {
          type: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'Generation failed. Please try again.',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
