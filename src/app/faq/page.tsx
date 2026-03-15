import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const FAQS = [
  {
    q: 'Is NarrateAML a FINTRAC filing tool?',
    a: 'No. NarrateAML is strictly a drafting assistant. It generates structured narrative text to support your investigative writing process. It does not submit reports to FINTRAC or any other regulatory body. All outputs are labeled as AI-assisted drafts that require human review, editing, and approval before submission.',
  },
  {
    q: 'Does NarrateAML guarantee FINTRAC compliance?',
    a: 'No. NarrateAML generates FINTRAC-oriented narrative drafts designed to support investigator review. We do not claim, represent, or guarantee regulatory compliance, legal sufficiency, or regulator approval. Every output must be reviewed by a qualified AML professional before use.',
  },
  {
    q: 'Is my client data secure?',
    a: 'Yes. Narrative data is stored on encrypted servers (Supabase / PostgreSQL with row-level security). Statement files uploaded for parsing are processed entirely in your browser — file bytes are never transmitted to our servers. We do not use your narrative content to train AI models. Analytics are configured to never log raw narrative text.',
  },
  {
    q: 'Can I edit the generated narrative?',
    a: 'Yes. After generation, you can edit the narrative inline directly in the output panel or on the narrative detail page. Changes are saved to your history. Pro plan users can also use revision mode — provide specific revision instructions and regenerate an improved draft.',
  },
  {
    q: 'What file formats does statement upload support?',
    a: 'Statement upload supports .xlsx, .xls, .csv, and text-based .pdf files. Maximum file size is 10MB. Scanned or image-based PDFs are not supported — use a text-based PDF or export your statement as CSV. Parsing happens entirely in your browser.',
  },
  {
    q: 'How does the DOCX and PDF export work?',
    a: 'Pro and Team plan users can export narratives as .docx (Microsoft Word) or .pdf files generated server-side. Every export includes the mandatory AI-assisted draft disclaimer in the header and footer. Export is not available on the Free plan.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'You can cancel at any time from the billing portal. You retain access to Pro/Team features until the end of your current billing period. After that, your account reverts to the Free plan (3 narratives/month). Your narrative history is preserved.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — the Free plan gives you 3 narrative drafts per month at no cost, with no credit card required. This lets you evaluate the product before upgrading.',
  },
  {
    q: 'What is included in the Lifetime plan?',
    a: 'Lifetime gives you all Pro features permanently for a one-time payment of $297. No subscription, no renewal fees, no price increases. Includes unlimited narratives, DOCX/PDF export, templates, statement upload, and revision mode.',
  },
  {
    q: 'How does the Team plan work?',
    a: 'The Team plan includes 5 named seats. Each seat is a separate user account with full Pro features. Team plans also include shared templates accessible to all team members, a full audit log, and admin team management tools.',
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <MarketingNav />

      <div className="max-w-3xl mx-auto px-5 py-16 space-y-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-text-muted">
            Can&apos;t find what you&apos;re looking for? Email us at{' '}
            <a href="mailto:support@narrateaml.com" className="text-accent hover:text-accent-light transition-colors">
              support@narrateaml.com
            </a>
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="card">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none text-text-primary font-sans font-medium text-sm select-none hover:text-accent transition-colors">
                  {q}
                  <span className="text-text-muted text-xs shrink-0 ml-4 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-text-secondary text-sm leading-relaxed mt-3">{a}</p>
              </details>
            </div>
          ))}
        </div>

        <div className="ai-warning-banner">
          <span>⚠</span>
          <span className="text-xs">
            AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
            NarrateAML does not provide legal advice and is not a FINTRAC filing tool.
          </span>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
