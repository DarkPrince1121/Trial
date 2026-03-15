import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { canExport } from '@/lib/utils/entitlements'
import { format } from 'date-fns'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── PDF Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 60,
    paddingRight: 60,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 6,
  },
  warning: {
    fontSize: 10,
    color: '#B45309',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  metaTable: {
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 5,
  },
  metaLabel: {
    width: '30%',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  metaValue: {
    width: '70%',
    fontSize: 9,
    color: '#374151',
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  narrativeParagraph: {
    fontSize: 10,
    color: '#1F2937',
    lineHeight: 1.6,
    marginBottom: 10,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    fontSize: 8,
    color: '#6B7280',
    fontFamily: 'Helvetica-Oblique',
    textAlign: 'center',
  },
})

// ── PDF Document Component ────────────────────────────────────

interface PDFProps {
  title: string
  warning: string
  metadata: Array<{ label: string; value: string }>
  paragraphs: string[]
  footer: string
}

function NarrativePDF({ title, warning, metadata, paragraphs, footer }: PDFProps) {
  return React.createElement(
    Document,
    { title },
    React.createElement(
      Page,
      { size: 'LETTER', style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, title),
        React.createElement(Text, { style: styles.warning }, warning)
      ),
      // Metadata table
      React.createElement(
        View,
        { style: styles.metaTable },
        ...metadata.map(({ label, value }, i) =>
          React.createElement(
            View,
            { key: i, style: styles.metaRow },
            React.createElement(Text, { style: styles.metaLabel }, label),
            React.createElement(Text, { style: styles.metaValue }, value)
          )
        )
      ),
      // Section heading
      React.createElement(Text, { style: styles.sectionHeading }, 'NARRATIVE'),
      // Narrative paragraphs
      ...paragraphs.map((p, i) =>
        React.createElement(Text, { key: i, style: styles.narrativeParagraph }, p)
      ),
      // Footer
      React.createElement(Text, { style: styles.footer }, footer)
    )
  )
}

// ── Route Handler ─────────────────────────────────────────────

export async function POST(request: Request) {
  // 1. Auth check
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // 2. Plan check
  const entitlement = canExport(user)
  if (!entitlement.allowed) {
    return NextResponse.json({ error: entitlement.reason }, { status: 403 })
  }

  // 3. Parse request
  const { narrativeId } = await request.json()
  if (!narrativeId) return NextResponse.json({ error: 'narrativeId required' }, { status: 400 })

  // 4. Fetch narrative
  const supabase = getSupabaseServerClient()
  const { data: narrative, error } = await supabase
    .from('narratives')
    .select('*')
    .eq('id', narrativeId)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .single()

  if (error || !narrative) {
    return NextResponse.json({ error: 'Narrative not found' }, { status: 404 })
  }

  if (!narrative.narrative_text) {
    return NextResponse.json({ error: 'Narrative has no text to export' }, { status: 400 })
  }

  // 5. Build PDF data
  const generatedDate = format(new Date(), 'MMMM d, yyyy')
  const caseRef = narrative.id.slice(0, 8).toUpperCase()
  const reportingPeriod =
    narrative.reporting_period_start && narrative.reporting_period_end
      ? `${narrative.reporting_period_start} to ${narrative.reporting_period_end}`
      : 'Not specified'

  const metadata = [
    { label: 'Generated Date', value: generatedDate },
    { label: 'Subject Name', value: narrative.subject_name || 'Not specified' },
    { label: 'Transaction Type', value: narrative.transaction_type || 'Not specified' },
    { label: 'Reporting Period', value: reportingPeriod },
    { label: 'Case Reference', value: caseRef },
  ]

  const paragraphs = narrative.narrative_text
    .split(/\n\n+/)
    .filter((p: string) => p.trim().length > 0)
    .map((p: string) => p.replace(/\n/g, ' ').trim())

  const footerText =
    'AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission. NarrateAML does not provide legal advice.'

  // 6. Render PDF
  const pdfElement = React.createElement(NarrativePDF, {
    title: 'NarrateAML — STR Narrative Draft',
    warning: '⚠ AI-Assisted Draft — Review Before Submission',
    metadata,
    paragraphs,
    footer: footerText,
  })

  const buffer = await renderToBuffer(pdfElement)

  // 7. Log export
  await supabase.from('usage_log').insert({
    user_id: user.id,
    action: 'export_pdf',
    metadata: { narrative_id: narrativeId },
  })

  // 8. Update readiness status
  await supabase
    .from('narratives')
    .update({ readiness_status: 'exported', updated_at: new Date().toISOString() })
    .eq('id', narrativeId)

  // 9. Return PDF
  const subject = (narrative.subject_name || 'STR').replace(/\s+/g, '_').slice(0, 50)
  const date = format(new Date(), 'yyyy-MM-dd')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="STR_Narrative_${subject}_${date}.pdf"`,
      'Content-Length': String(buffer.length),
    },
  })
}
