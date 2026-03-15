import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Zap,
  Upload,
  Download,
  BookTemplate,
  RefreshCw,
  History,
  Shield,
} from 'lucide-react'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const FEATURES = [
  {
    id: 'form',
    icon: <FileText className="w-6 h-6" />,
    badge: '01',
    title: '6-Section STR Form',
    headline: 'Every field a FINTRAC narrative needs.',
    description:
      'The generate form is structured around the six sections most commonly required in an STR narrative: subject identity, transaction details, reporting period, red flags observed, prior STR history, and investigator notes. Each section is purpose-built to capture the right information for narrative generation.',
    details: [
      { label: 'Subject Information', desc: 'Name, date of birth, occupation, entity type, relationship to institution' },
      { label: 'Transaction Details', desc: 'Amount, transaction type, account number, date of transaction, counterparties' },
      { label: 'Reporting Period', desc: 'Start and end dates, frequency pattern, total volume' },
      { label: 'Red Flags', desc: '16 pre-defined AML red flags — select all that apply, or enter custom flags' },
      { label: 'Prior STR History', desc: 'Previous reports filed, patterns noted, prior monitoring alerts' },
      { label: 'Investigator Notes', desc: 'Free-form observations, branch inquiries, subject explanations, additional context' },
    ],
    plan: 'All plans',
    planVariant: 'badge-muted',
  },
  {
    id: 'streaming',
    icon: <Zap className="w-6 h-6" />,
    badge: '02',
    title: 'AI Streaming Generation',
    headline: 'Watch your narrative appear word by word.',
    description:
      'NarrateAML uses Server-Sent Events (SSE) for real-time streaming generation. The moment you click Generate, the narrative begins appearing on screen — no loading spinners, no waiting. Built on Anthropic Claude, one of the world\'s leading frontier AI models for professional writing tasks.',
    details: [
      { label: 'Model', desc: 'Anthropic Claude — claude-sonnet-4 series — purpose-built for structured professional writing' },
      { label: 'Streaming', desc: 'Real-time SSE stream — text appears word by word as it is generated' },
      { label: 'Speed', desc: 'Average narrative generated in under 60 seconds from form submission' },
      { label: 'Security', desc: 'ANTHROPIC_API_KEY is server-side only — never exposed to the browser' },
      { label: 'Rate limiting', desc: '10 generation requests per minute per user — enforced server-side' },
      { label: 'Input sanitization', desc: 'All form inputs are sanitized to strip HTML and injection tokens before prompt construction' },
    ],
    plan: 'All plans',
    planVariant: 'badge-muted',
  },
  {
    id: 'upload',
    icon: <Upload className="w-6 h-6" />,
    badge: '03',
    title: 'Statement Upload & Auto-Parsing',
    headline: 'Upload a statement. Select transactions. Generate.',
    description:
      'Pro and Team users can upload a bank statement and let NarrateAML automatically parse the transactions. Select the relevant rows, add context, and generate a narrative grounded in the actual transaction data. Privacy-first: all parsing happens in your browser.',
    details: [
      { label: 'Supported formats', desc: '.xlsx, .xls, .csv, and text-based .pdf (not scanned/image PDFs)' },
      { label: 'Maximum file size', desc: '10MB per upload' },
      { label: 'Parsing technology', desc: 'SheetJS (xlsx) for spreadsheets; PDF.js for PDF text extraction' },
      { label: 'Privacy guarantee', desc: 'Zero file bytes are transmitted to our servers — parsing is 100% client-side' },
      { label: 'Transaction selection', desc: 'Review all parsed rows, select the suspicious transactions to include in the narrative' },
      { label: 'Summary generation', desc: 'Auto-calculates total amounts, frequency, and date range from selected transactions' },
    ],
    plan: 'Pro & Team',
    planVariant: 'badge-accent',
  },
  {
    id: 'export',
    icon: <Download className="w-6 h-6" />,
    badge: '04',
    title: 'DOCX & PDF Export',
    headline: 'Compliant documents, one click.',
    description:
      'Export any narrative as a professional Microsoft Word (.docx) or PDF document. Every export automatically includes the mandatory AI-assisted draft disclaimer in the document header and footer, plus a metadata table showing generation date, word count, and draft status.',
    details: [
      { label: 'DOCX format', desc: 'Full Microsoft Word document with metadata table, justified paragraphs, and footer disclaimer' },
      { label: 'PDF format', desc: 'Server-rendered PDF with matching layout — suitable for printing or digital archiving' },
      { label: 'Mandatory disclaimer', desc: 'Every export includes: "AI-Assisted Draft — Review before submission" in header and footer' },
      { label: 'Metadata table', desc: 'Generation date, investigator user, word count, and draft status included in every document' },
      { label: 'Generation', desc: 'Documents generated server-side on every export request — always reflects current narrative content' },
      { label: 'Plan requirement', desc: 'Available on Pro, Team, and Lifetime plans only' },
    ],
    plan: 'Pro & Team',
    planVariant: 'badge-accent',
  },
  {
    id: 'templates',
    icon: <BookTemplate className="w-6 h-6" />,
    badge: '05',
    title: 'Saved Templates',
    headline: 'Standardize. Reuse. Stay consistent.',
    description:
      'Save any filled form as a reusable template. Templates preserve all six form sections, making it fast to start a new narrative for a similar transaction type. Team plan users share a template library across all team members.',
    details: [
      { label: 'Save any form state', desc: 'Save a fully or partially completed form as a named template at any time' },
      { label: 'Quick load', desc: 'Load a template into the generate form with one click — edit what changed, generate' },
      { label: 'Team sharing', desc: 'Team plan: all templates are shared across the entire team — create once, use everywhere' },
      { label: 'Common use cases', desc: 'Ideal for recurring transaction types: ATM structuring, international wire patterns, cash-intensive businesses' },
    ],
    plan: 'Pro & Team',
    planVariant: 'badge-accent',
  },
  {
    id: 'revision',
    icon: <RefreshCw className="w-6 h-6" />,
    badge: '06',
    title: 'Revision Mode',
    headline: 'Refine with specific instructions.',
    description:
      'Not satisfied with the first draft? Enter specific revision instructions — "make the tone more formal", "add more detail on the structuring pattern", "shorten the opening paragraph" — and NarrateAML regenerates an improved draft incorporating your feedback.',
    details: [
      { label: 'Free-form instructions', desc: 'Write any revision instruction in plain language — the AI applies it to the existing draft' },
      { label: 'Original preserved', desc: 'Your original draft is preserved in history — revisions create a new version' },
      { label: 'Iterative refinement', desc: 'Revise as many times as needed until the draft meets your standards' },
      { label: 'Streaming output', desc: 'Revised narrative streams in real time — same experience as initial generation' },
    ],
    plan: 'Pro & Team',
    planVariant: 'badge-accent',
  },
  {
    id: 'history',
    icon: <History className="w-6 h-6" />,
    badge: '07',
    title: 'Narrative History',
    headline: 'Every draft. Searchable. Organised.',
    description:
      'Every generated narrative is automatically saved to your history. Search, filter by status, view word counts, and access the full narrative text at any time. Narratives can be marked as draft, reviewed, or submitted.',
    details: [
      { label: 'Automatic saving', desc: 'Every generated narrative is saved immediately to your account history' },
      { label: 'Status management', desc: 'Mark narratives as draft, reviewed, or submitted to track your workflow' },
      { label: 'Soft delete', desc: 'Deleted narratives are soft-deleted with audit log entry — recoverable if needed' },
      { label: 'Inline editing', desc: 'Edit any narrative directly in the history view — changes are saved instantly' },
      { label: 'Export from history', desc: 'Export any historical narrative to DOCX or PDF at any time (Pro/Team)' },
      { label: 'Access control', desc: 'Row-level security ensures you can only access your own narratives' },
    ],
    plan: 'All plans',
    planVariant: 'badge-muted',
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <MarketingNav />

      <div className="max-w-4xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="section-header mb-3">Features</div>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
            Every feature built for AML investigators.
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            NarrateAML is purpose-built for the Canadian AML narrative workflow —
            from structured data entry to streaming generation to compliant document export.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-20">
          {FEATURES.map(({ id, icon, badge, title, headline, description, details, plan, planVariant }) => (
            <div key={id} id={id} className="scroll-mt-20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-text-muted">{badge}</span>
                    <span className={`${planVariant} text-2xs`}>{plan}</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-text-primary">{title}</h2>
                </div>
              </div>

              <div className="ml-16 space-y-5">
                <h3 className="font-display text-xl text-text-primary">{headline}</h3>
                <p className="text-text-secondary leading-relaxed">{description}</p>

                <div className="grid sm:grid-cols-2 gap-3 mt-6">
                  {details.map(({ label, desc }) => (
                    <div key={label} className="card-elevated p-4">
                      <div className="text-xs font-mono text-accent mb-1">{label}</div>
                      <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ml-16 mt-6 border-b border-border" />
            </div>
          ))}
        </div>

        {/* Security callout */}
        <div className="mt-20 rounded-xl border border-border bg-surface p-8 flex items-start gap-4">
          <Shield className="w-6 h-6 text-accent shrink-0 mt-1" />
          <div>
            <h3 className="font-display text-lg font-bold text-text-primary mb-2">
              Security is a feature, not an afterthought.
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              Every feature is built with compliance-grade security in mind. Statement files are never uploaded.
              API keys stay server-side. Narrative content is never used for AI training. Row-level security
              enforced on every data access.
            </p>
            <Link href="/security" className="text-accent hover:text-accent-light text-sm flex items-center gap-1">
              View our full security posture <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center space-y-4">
          <h2 className="font-display text-2xl font-bold text-text-primary">
            Ready to try every feature?
          </h2>
          <p className="text-text-muted">Start with 3 free narratives. No credit card required.</p>
          <Link href="/sign-up" className="btn-primary inline-flex px-8 py-3">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
