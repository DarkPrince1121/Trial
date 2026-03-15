import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
} from 'docx'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { canExport } from '@/lib/utils/entitlements'
import { format } from 'date-fns'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BORDER_STYLE = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: '1E2D45',
}

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

  // 5. Build DOCX
  const generatedDate = format(new Date(), 'MMMM d, yyyy')
  const caseRef = narrative.id.slice(0, 8).toUpperCase()
  const reportingPeriod =
    narrative.reporting_period_start && narrative.reporting_period_end
      ? `${narrative.reporting_period_start} to ${narrative.reporting_period_end}`
      : narrative.reporting_period_start || 'Not specified'

  const metadataRows = [
    ['Generated Date', generatedDate],
    ['Subject Name', narrative.subject_name || 'Not specified'],
    ['Transaction Type', narrative.transaction_type || 'Not specified'],
    ['Reporting Period', reportingPeriod],
    ['Case Reference', caseRef],
  ]

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Calibri', size: 22, color: '000000' },
          paragraph: { spacing: { line: 276 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          // Header: Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: 'NarrateAML — STR Narrative Draft',
                bold: true,
                size: 32,
                font: 'Calibri',
              }),
            ],
          }),

          // AI Warning
          new Paragraph({
            children: [
              new TextRun({
                text: '⚠ AI-Assisted Draft — Review Before Submission',
                bold: true,
                color: 'B45309',
                size: 22,
                font: 'Calibri',
              }),
            ],
            spacing: { after: 300 },
          }),

          // Metadata table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: metadataRows.map(([label, value]) =>
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    borders: {
                      top: BORDER_STYLE,
                      bottom: BORDER_STYLE,
                      left: BORDER_STYLE,
                      right: BORDER_STYLE,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: label,
                            bold: true,
                            size: 20,
                            font: 'Calibri',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    borders: {
                      top: BORDER_STYLE,
                      bottom: BORDER_STYLE,
                      left: BORDER_STYLE,
                      right: BORDER_STYLE,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: value,
                            size: 20,
                            font: 'Calibri',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              })
            ),
          }),

          // Spacer
          new Paragraph({ children: [], spacing: { after: 400 } }),

          // Narrative heading
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: 'NARRATIVE',
                bold: true,
                size: 26,
                font: 'Calibri',
              }),
            ],
          }),

          // Narrative paragraphs
          ...narrative.narrative_text
            .split(/\n\n+/)
            .filter((p: string) => p.trim().length > 0)
            .map(
              (paragraphText: string) =>
                new Paragraph({
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { after: 200, line: 276 },
                  children: [
                    new TextRun({
                      text: paragraphText.replace(/\n/g, ' ').trim(),
                      size: 22,
                      font: 'Calibri',
                    }),
                  ],
                })
            ),

          // Footer
          new Paragraph({ children: [], spacing: { after: 400 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission. NarrateAML does not provide legal advice.',
                italics: true,
                color: '6B7280',
                size: 18,
                font: 'Calibri',
              }),
            ],
          }),
        ],
      },
    ],
  })

  // 6. Generate buffer
  const buffer = await Packer.toBuffer(doc)

  // 7. Log export
  await supabase.from('usage_log').insert({
    user_id: user.id,
    action: 'export_docx',
    metadata: { narrative_id: narrativeId },
  })

  // 8. Update readiness status
  await supabase
    .from('narratives')
    .update({ readiness_status: 'exported', updated_at: new Date().toISOString() })
    .eq('id', narrativeId)

  // 9. Return file
  const subject = (narrative.subject_name || 'STR').replace(/\s+/g, '_').slice(0, 50)
  const date = format(new Date(), 'yyyy-MM-dd')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="STR_Narrative_${subject}_${date}.docx"`,
      'Content-Length': String(buffer.length),
    },
  })
}
