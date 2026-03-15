import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-base font-bold text-accent">NARRATEAML</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-16 space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-2">Privacy Policy</h1>
          <p className="text-text-muted text-sm">Last updated: March 15, 2026</p>
        </div>

        <div className="prose prose-sm space-y-6 text-text-secondary">
          {[
            {
              title: 'What We Collect',
              content: 'We collect: account information (name, email) provided during sign-up; narrative form data and generated narrative text stored in your account; usage metadata (action timestamps, export counts); billing information processed by Stripe (we do not store card details). We do NOT collect: statement files (parsed locally in your browser, never transmitted); raw narrative content for analytics purposes.',
            },
            {
              title: 'How We Use Your Data',
              content: 'We use your data to: provide and operate the NarrateAML service; send essential account communications (usage alerts, billing notifications); improve service reliability and performance. We never use your narrative content to train AI models. We never sell your data to third parties.',
            },
            {
              title: 'Statement File Privacy',
              content: 'Statement files (.xlsx, .xls, .csv, .pdf) uploaded for parsing are processed entirely in your browser using client-side JavaScript libraries. No file bytes are transmitted to our servers. Only the extracted transaction data (text/numbers) may be sent to the AI for narrative generation.',
            },
            {
              title: 'Data Storage and Security',
              content: 'Narrative data is stored on Supabase (PostgreSQL) with row-level security policies ensuring you can only access your own data. All data is encrypted at rest and in transit. Authentication is managed by Clerk with industry-standard security practices.',
            },
            {
              title: 'AI and Third-Party Services',
              content: 'We use Anthropic Claude API for narrative generation. Your form data and investigator notes are transmitted to Anthropic for processing. We do not include personal client information beyond what you explicitly enter. We do not use your data to train Anthropic models. See Anthropic\'s privacy policy for their data handling practices.',
            },
            {
              title: 'Analytics',
              content: 'We use privacy-conscious analytics (PostHog, optional). Analytics events never include raw narrative text, subject names, or transaction details. We track only feature usage patterns (e.g., "narrative generated", "export clicked") to improve the product.',
            },
            {
              title: 'Data Retention and Deletion',
              content: 'You can delete your account at any time from Settings → Danger Zone. Account deletion removes your user record and associated narratives, templates, and usage logs from our active systems. You can also delete individual narratives from your history at any time.',
            },
            {
              title: 'Contact',
              content: 'For privacy questions or data deletion requests, contact us at privacy@narrateaml.com.',
            },
          ].map(({ title, content }) => (
            <div key={title} className="space-y-2">
              <h2 className="font-display font-bold text-text-primary text-lg">{title}</h2>
              <p className="leading-relaxed">{content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
