import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Lock,
  Database,
  Key,
  Upload,
  Eye,
  Server,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const SECTIONS = [
  {
    id: 'auth',
    icon: <Lock className="w-6 h-6" />,
    title: 'Authentication & Session Management',
    items: [
      { label: 'Provider', desc: 'Clerk — industry-standard authentication platform with SOC 2 compliance' },
      { label: 'Sign-in methods', desc: 'Email/password and Google OAuth — both supported on all plans' },
      { label: 'Session management', desc: 'Clerk-managed JWT sessions with configurable expiry and automatic rotation' },
      { label: 'MFA', desc: 'Multi-factor authentication available through Clerk settings for all users' },
      { label: 'Route protection', desc: 'All application routes protected server-side via Clerk middleware — no client-side trust' },
      { label: 'API protection', desc: 'Every API route verifies Clerk authentication before any database operation or AI call' },
    ],
  },
  {
    id: 'database',
    icon: <Database className="w-6 h-6" />,
    title: 'Database Security',
    items: [
      { label: 'Provider', desc: 'Supabase — PostgreSQL with SOC 2 Type II compliance, hosted on AWS infrastructure' },
      { label: 'Encryption at rest', desc: 'All data encrypted at rest using AES-256' },
      { label: 'Encryption in transit', desc: 'All connections over TLS 1.2/1.3 — no unencrypted database access' },
      { label: 'Row Level Security', desc: 'RLS enabled on all 8 tables — each user can only query their own data, enforced at the database layer' },
      { label: 'Service role isolation', desc: 'Server-side API routes use the service role key (bypasses RLS for trusted operations). Client-side never has access to service role credentials' },
      { label: 'JWT binding', desc: 'Row Level Security policies read the Clerk user ID from the JWT sub claim — tightly binding database access to authenticated sessions' },
    ],
  },
  {
    id: 'upload',
    icon: <Upload className="w-6 h-6" />,
    title: 'Statement File Privacy',
    items: [
      { label: 'Architecture', desc: 'Statement files (.xlsx, .xls, .csv, .pdf) are parsed entirely in the user\'s browser using client-side JavaScript' },
      { label: 'Zero upload policy', desc: 'No file bytes are ever transmitted to our servers. The raw file never leaves the user\'s device' },
      { label: 'Parsing libraries', desc: 'SheetJS (xlsx) for Excel and CSV; PDF.js (pdfjs-dist) for text-based PDF extraction' },
      { label: 'What is transmitted', desc: 'Only the extracted transaction data (plain text/JSON rows) selected by the user is sent to the AI — never the original file' },
      { label: 'Client-side only', desc: 'Parsing happens in a browser Web Worker — no server-side processing of raw financial files' },
    ],
  },
  {
    id: 'ai',
    icon: <Eye className="w-6 h-6" />,
    title: 'AI Transmission & Data Use',
    items: [
      { label: 'What is sent to Anthropic', desc: 'The structured form data entered by the investigator — subject details, transaction facts, red flags, and notes — as formatted by our prompt builder' },
      { label: 'What is NOT sent', desc: 'Raw statement files are never sent. We do not include any additional PII beyond what the user explicitly types into the form' },
      { label: 'AI training', desc: 'NarrateAML does not use your narrative content, form data, or outputs to train Anthropic models. Anthropic\'s API data handling policies apply — see anthropic.com/privacy' },
      { label: 'API key security', desc: 'ANTHROPIC_API_KEY is a server-side environment variable only — never included in client-side bundles or exposed to the browser' },
      { label: 'Rate limiting', desc: '10 AI generation requests per minute per user, enforced server-side. Designed to prevent abuse and runaway costs' },
    ],
  },
  {
    id: 'keys',
    icon: <Key className="w-6 h-6" />,
    title: 'API Key Management',
    items: [
      { label: 'Server-side only keys', desc: 'ANTHROPIC_API_KEY, STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY — all stored as server environment variables, never in client bundles' },
      { label: 'Public keys only in browser', desc: 'Only NEXT_PUBLIC_ prefixed keys (Supabase anon key, Clerk publishable key, Stripe publishable key) are exposed to the client — all are designed to be public' },
      { label: 'Supabase anon key security', desc: 'The anon key is safe to expose because Row Level Security prevents any unauthorized data access — it is a connection credential, not an authorization credential' },
      { label: 'Key rotation', desc: 'API keys can be rotated in provider dashboards and updated in Vercel environment variables without code changes' },
    ],
  },
  {
    id: 'stripe',
    icon: <FileText className="w-6 h-6" />,
    title: 'Payment Security',
    items: [
      { label: 'Payment processor', desc: 'Stripe — PCI DSS Level 1 certified. NarrateAML never stores or processes card details' },
      { label: 'Card data', desc: 'All card information is entered directly on Stripe-hosted checkout pages. NarrateAML has zero access to card numbers, CVV, or expiry dates' },
      { label: 'Webhook verification', desc: 'All Stripe webhooks are verified using HMAC-SHA256 signature verification before any event is processed' },
      { label: 'Billing portal', desc: 'Subscription management (cancellation, plan changes) handled via Stripe\'s hosted billing portal' },
    ],
  },
  {
    id: 'audit',
    icon: <Server className="w-6 h-6" />,
    title: 'Audit Logging',
    items: [
      { label: 'Events logged', desc: 'Narrative generation, export (DOCX/PDF), narrative deletion, plan changes (upgrades/downgrades), account deletion' },
      { label: 'Log content', desc: 'User ID, action type, timestamp, relevant metadata (narrative ID, plan name, etc.) — no raw narrative text in logs' },
      { label: 'Team audit log', desc: 'Team plan users have access to a full audit log covering all team member actions' },
      { label: 'Retention', desc: 'Audit logs are retained for the lifetime of the account. Deleted on account deletion' },
      { label: 'Analytics', desc: 'Product analytics (PostHog) track feature usage events only — never raw narrative text, subject names, or transaction amounts' },
    ],
  },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <MarketingNav />

      <div className="max-w-4xl mx-auto px-5 py-16">
        {/* Header */}
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Shield className="w-5 h-5" />
            </div>
            <div className="section-header mb-0">Security</div>
          </div>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
            Built with security-first architecture.
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            NarrateAML handles sensitive case data. Every architectural decision — from
            client-side file parsing to row-level database security — is made with your
            data protection obligations in mind.
          </p>
        </div>

        {/* Quick Summary */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 mb-16">
          <h2 className="font-display text-lg font-bold text-text-primary mb-4">Security at a glance</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Statement files never leave your browser',
              'Row-level security on all database tables',
              'Server-side only: Anthropic, Stripe, Supabase service keys',
              'Every API route verifies authentication before any operation',
              'Narrative content never used for AI model training',
              'Stripe PCI-DSS Level 1 for all payment processing',
              'Webhook signature verification on all Stripe events',
              'Analytics never log raw narrative text or subject data',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-16">
          {SECTIONS.map(({ id, icon, title, items }) => (
            <div key={id} id={id} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-accent">
                  {icon}
                </div>
                <h2 className="font-display text-xl font-bold text-text-primary">{title}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 ml-13">
                {items.map(({ label, desc }) => (
                  <div key={label} className="card-elevated p-4">
                    <div className="text-xs font-mono text-accent mb-1.5">{label}</div>
                    <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 border-b border-border" />
            </div>
          ))}
        </div>

        {/* Statement Upload Diagram */}
        <div className="mt-16">
          <h2 className="font-display text-xl font-bold text-text-primary mb-6">
            How statement file privacy works
          </h2>
          <div className="rounded-xl border border-border bg-surface p-6 font-mono text-xs space-y-3 text-text-secondary">
            <div className="text-text-muted mb-4">// Statement upload data flow</div>
            <div className="flex items-center gap-3">
              <span className="text-warning">[ Your Browser ]</span>
              <span className="text-text-muted">→</span>
              <span>File selected by user (.xlsx / .csv / .pdf)</span>
            </div>
            <div className="flex items-center gap-3 pl-4">
              <span className="text-success">[ Browser Parser ]</span>
              <span className="text-text-muted">→</span>
              <span>SheetJS / PDF.js reads file locally in memory</span>
            </div>
            <div className="flex items-center gap-3 pl-8">
              <span className="text-accent">[ Extracted Data ]</span>
              <span className="text-text-muted">→</span>
              <span>Plain text rows (date, description, amount)</span>
            </div>
            <div className="flex items-center gap-3 pl-12">
              <span className="text-success">[ User Selects ]</span>
              <span className="text-text-muted">→</span>
              <span>Only relevant transactions checked by investigator</span>
            </div>
            <div className="flex items-center gap-3 pl-16">
              <span className="text-text-primary">[ API Request ]</span>
              <span className="text-text-muted">→</span>
              <span>Selected text rows sent to /api/generate</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border text-danger/80">
              ✗  Original file bytes — NEVER transmitted<br />
              ✗  Unselected transaction rows — NEVER transmitted<br />
              ✓  Only the text you selected — sent for generation
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-16 rounded-xl border border-border bg-surface p-8">
          <h2 className="font-display text-xl font-bold text-text-primary mb-3">
            Security questions or disclosures
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            Have a security question, concern, or responsible disclosure to make?
            Contact our security team directly. We take all security reports seriously
            and respond within 48 hours.
          </p>
          <a
            href="mailto:security@narrateaml.com"
            className="text-accent hover:text-accent-light text-sm flex items-center gap-1"
          >
            security@narrateaml.com <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
