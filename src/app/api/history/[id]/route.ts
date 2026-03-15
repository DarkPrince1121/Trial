import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'

export const dynamic = 'force-dynamic'

// GET /api/history/[id] — fetch single narrative
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { id } = await params
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('narratives')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Narrative not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/history/[id] — update narrative
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { id } = await params
  const body = await request.json()

  // Only allow updating specific fields
  const allowedFields = ['narrative_text', 'readiness_status', 'revision_notes', 'title']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  // Recalculate word count if narrative_text changed
  if (updates.narrative_text && typeof updates.narrative_text === 'string') {
    updates.word_count = updates.narrative_text
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length
  }

  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('narratives')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Update failed or narrative not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// DELETE /api/history/[id] — soft delete
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { id } = await params
  const supabase = getSupabaseServerClient()

  // Verify ownership before delete
  const { data: existing } = await supabase
    .from('narratives')
    .select('id, subject_name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Narrative not found' }, { status: 404 })
  }

  // Soft delete
  const { error } = await supabase
    .from('narratives')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Insert audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    entity_type: 'narrative',
    entity_id: id,
    action: 'soft_delete',
    before_data: { subject_name: existing.subject_name },
  })

  return NextResponse.json({ success: true })
}
