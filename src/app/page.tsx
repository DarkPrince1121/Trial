import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Lock,
  FileText,
  Upload,
  Zap,
  Users,
  ChevronDown,
  X,
  Star,
  Database,
  Key,
} from 'lucide-react'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

function AccordionItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-border last:border-0">
      <summary className="flex items-center justify-between py-4 cursor-pointer list-none text-text-primary font-sans font-medium text-sm select-none hover:text-accent transition-colors">
        {q}
        <ChevronDown className="w-4 h-4 text-text-muted shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <p className="pb-4 text-text-secondary text-sm leading-relaxed">{a}</p>
    </details>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/8 text-accent text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            FINTRAC-oriented narrative drafting
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight text-balance">
            STR Narratives.
            <br />
            <span className="gradient-text">Drafted in 60 Seconds.</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto leading-relaxed text-balance">
            AI-assisted narrative drafting for AML investigators and compliance teams.
            Structured for Canadian AML workflows. Reviewed by investigators — always.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/sign-up" className="btn-primary text-base px-8 py-3">
              Generate Your First Narrative Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#how-it-works" className="btn-ghost text-base px-6 py-3">
              See How It Works
            </Link>
          </div>

          <p className="text-text-muted text-sm">
            No credit card required · 3 narratives free per month
          </p>
        </div>

        {/* Narrative Preview Mockup */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xl">
            {/* Terminal bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-elevated border-b border-border">
              <div className="w-3 h-3 rounded-full bg-danger/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-text-muted font-mono">NarrateAML — Narrative Draft</span>
              <div className="ml-auto badge-success text-2xs">Generated</div>
            </div>
            {/* Narrative text */}
            <div className="p-6 font-mono text-sm text-text-secondary space-y-3">
              <div className="text-text-muted text-xs uppercase tracking-widest mb-4">Suspicious Transaction Report — Narrative</div>
              <p className="leading-relaxed">
                <span className="text-accent font-semibold">Subject Overview:</span>{' '}
                The subject, a personal banking customer since 2019, operates a registered sole proprietorship
                in the food service sector. Account activity is inconsistent with the stated business profile.
              </p>
              <p className="leading-relaxed">
                <span className="text-accent font-semibold">Suspicious Activity:</span>{' '}
                Between January and March 2026, the subject conducted{' '}
                <span className="text-warning">14 cash deposits</span> totalling{' '}
                <span className="text-warning">$47,200 CAD</span>, each structured below the{' '}
                $10,000 reporting threshold — consistent with structuring behaviour...
              </p>
              <p className="leading-relaxed text-text-muted">
                <span className="text-accent font-semibold">Investigator Notes:</span>{' '}
                Subject provided no credible explanation for the cash volume during branch inquiry.
                Pattern flagged by transaction monitoring system on 2026-03-01.
                <span className="streaming-cursor" />
              </p>
            </div>
            <div className="px-6 py-3 bg-surface-elevated border-t border-border flex items-center justify-between">
              <div className="text-xs text-text-muted font-mono">Word count: 423 · Generation time: 4.2s</div>
              <div className="ai-warning-banner py-1 px-2 text-2xs">⚠ AI Draft — Review before submission</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof Bar ─────────────────────────────────── */}
      <section className="py-8 px-5 border-y border-border bg-surface">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-text-muted text-xs font-mono uppercase tracking-widest mb-5">
            Trusted by investigators at credit unions, fintechs, and community banks across Canada
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: '~45 min saved per STR', color: 'text-accent' },
              { label: 'FINTRAC-oriented language', color: 'text-success' },
              { label: 'Zero file uploads to servers', color: 'text-warning' },
              { label: 'Used by AML investigators daily', color: 'text-text-secondary' },
            ].map(({ label, color }) => (
              <div
                key={label}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface-elevated text-sm ${color}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Warning Banner ────────────────────────────────── */}
      <div className="px-5 py-6">
        <div className="max-w-3xl mx-auto ai-warning-banner">
          <span className="text-warning text-sm shrink-0">⚠</span>
          <span>
            AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
            NarrateAML is a drafting tool, not a filing tool. Not a substitute for professional judgment.
          </span>
        </div>
      </div>

      {/* ── ROI Stats ────────────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-header">By the Numbers</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Real savings for real investigators.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                stat: '~45 min',
                label: 'Average time saved per STR narrative',
                sub: 'vs. manual drafting',
                color: 'text-accent',
              },
              {
                stat: '<60 sec',
                label: 'Average AI generation time',
                sub: 'from form submission to draft',
                color: 'text-success',
              },
              {
                stat: '0 bytes',
                label: 'Statement data uploaded to servers',
                sub: 'parsed locally in your browser',
                color: 'text-warning',
              },
              {
                stat: '100%',
                label: 'Of narratives require human review',
                sub: 'every output is a draft — always',
                color: 'text-text-secondary',
              },
            ].map(({ stat, label, sub, color }) => (
              <div key={stat} className="card-elevated flex flex-col gap-2 p-6">
                <div className={`font-display text-4xl font-bold ${color}`}>{stat}</div>
                <p className="text-text-primary text-sm font-medium leading-snug">{label}</p>
                <p className="text-text-muted text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem vs Solution ──────────────────────────────── */}
      <section className="py-20 px-5 bg-surface-variant">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-header">The Problem</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              STR narrative writing is a bottleneck.
            </h2>
            <p className="text-text-muted mt-3 max-w-xl mx-auto">
              Investigators spend up to 90 minutes per narrative. Quality varies. Teams struggle to standardize.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <X className="w-5 h-5 text-danger" />
                <h3 className="font-display text-lg font-bold text-text-primary">The Old Way</h3>
              </div>
              {[
                '30–90 minutes per narrative',
                'Quality varies by investigator',
                'Copy-paste errors and inconsistencies',
                'Repetitive and mentally fatiguing',
                'Difficult to standardize across teams',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <X className="w-4 h-4 text-danger/60 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-bold text-text-primary">With NarrateAML</h3>
              </div>
              {[
                'Draft in under 60 seconds',
                'Structured, regulator-oriented language',
                'Saved history and reusable templates',
                'Consistent quality across all investigators',
                'Export to Word or PDF in one click',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-accent/70 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Deep-Dive ────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-header">Features</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Every feature built for AML investigators.
            </h2>
          </div>
          <div className="space-y-16">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="badge-accent mb-4">6-Section STR Form</div>
                <h3 className="font-display text-2xl font-bold text-text-primary mb-3">
                  Structured inputs. Accurate outputs.
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  The narrative form captures subject identity, transaction details, time period,
                  red flags, prior STR history, and investigator notes — everything needed to draft
                  a complete, structured narrative.
                </p>
                <Link href="/features#form" className="text-accent hover:text-accent-light text-sm flex items-center gap-1">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="rounded-xl border border-border bg-surface p-5 space-y-3 font-mono text-xs">
                {[
                  { section: '01', label: 'Subject Information', fields: 'Name · DOB · Occupation · Entity type' },
                  { section: '02', label: 'Transaction Details', fields: 'Amount · Type · Account · Date' },
                  { section: '03', label: 'Time Period', fields: 'Start/end dates · Frequency pattern' },
                  { section: '04', label: 'Red Flags', fields: '16 AML red flags — select all that apply' },
                  { section: '05', label: 'Prior STR History', fields: 'Previous reports · Patterns noted' },
                  { section: '06', label: 'Investigator Notes', fields: 'Free-form observations and context' },
                ].map(({ section, label, fields }) => (
                  <div key={section} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <span className="text-accent/60 w-5 shrink-0">{section}</span>
                    <div>
                      <div className="text-text-primary font-medium">{label}</div>
                      <div className="text-text-muted text-2xs mt-0.5">{fields}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
              <div className="md:order-2">
                <div className="badge-success mb-4">AI Streaming Generation</div>
                <h3 className="font-display text-2xl font-bold text-text-primary mb-3">
                  Watch your narrative draft appear in real time.
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  NarrateAML uses Server-Sent Events for real-time streaming. The narrative appears
                  word by word as it's generated — no waiting, no spinner. Built on Anthropic Claude,
                  the industry-leading frontier model.
                </p>
                <Link href="/features#streaming" className="text-accent hover:text-accent-light text-sm flex items-center gap-1">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="md:order-1 rounded-xl border border-border bg-surface p-5 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4 text-xs text-text-muted">
                  <Zap className="w-3.5 h-3.5 text-success" />
                  Generating narrative...
                  <span className="ml-auto text-text-muted">3.1s</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">
                  The subject presents a pattern of structured cash deposits consistent with layering behaviour.
                  Transaction monitoring identified 14 deposits below the $10,000 threshold...
                  <span className="streaming-cursor" />
                </p>
                <div className="mt-4 pt-4 border-t border-border text-xs text-text-muted flex gap-4">
                  <span className="text-success">● Live</span>
                  <span>Model: claude-sonnet-4</span>
                  <span>SSE stream</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="badge-warning mb-4">Statement Upload</div>
                <h3 className="font-display text-2xl font-bold text-text-primary mb-3">
                  Upload a statement. Parse it. Draft instantly.
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  Upload a bank statement (.xlsx, .xls, .csv, .pdf) and NarrateAML auto-parses
                  the transactions in your browser. Select relevant rows, add context, and generate.
                  Zero file bytes ever reach our servers.
                </p>
                <Link href="/features#upload" className="text-accent hover:text-accent-light text-sm flex items-center gap-1">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-text-muted">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-mono">Drop .xlsx · .xls · .csv · .pdf</p>
                  <p className="text-2xs mt-1 text-text-muted/60">Max 10MB · Parsed in-browser</p>
                </div>
                <div className="text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-2 text-text-muted border-b border-border pb-1">
                    <span className="w-24 shrink-0">Date</span>
                    <span className="flex-1">Description</span>
                    <span className="w-20 text-right">Amount</span>
                  </div>
                  {[
                    { date: '2026-01-04', desc: 'CASH DEPOSIT BRANCH', amt: '$9,200' },
                    { date: '2026-01-11', desc: 'CASH DEPOSIT ATM', amt: '$8,700' },
                    { date: '2026-01-18', desc: 'CASH DEPOSIT BRANCH', amt: '$9,900' },
                  ].map((tx) => (
                    <div key={tx.date} className="flex items-center gap-2 text-text-secondary">
                      <span className="w-24 shrink-0">{tx.date}</span>
                      <span className="flex-1 truncate">{tx.desc}</span>
                      <span className="w-20 text-right text-warning">{tx.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="grid md:grid-cols-2 gap-10 items-center md:flex-row-reverse">
              <div className="md:order-2">
                <div className="badge-muted mb-4">DOCX & PDF Export</div>
                <h3 className="font-display text-2xl font-bold text-text-primary mb-3">
                  Export a compliant document in one click.
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  Pro and Team users can export narratives as Word (.docx) or PDF. Every export
                  includes the mandatory AI-assisted draft disclaimer in the header and footer,
                  plus a metadata table with generation details.
                </p>
                <Link href="/features#export" className="text-accent hover:text-accent-light text-sm flex items-center gap-1">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="md:order-1 rounded-xl border border-border bg-surface p-5">
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface-elevated px-4 py-2 text-xs font-mono text-text-muted flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    STR_Narrative_2026-03-15.docx
                  </div>
                  <div className="p-4 space-y-2 text-xs font-sans">
                    <div className="text-2xs text-warning bg-warning/10 border border-warning/20 rounded px-2 py-1 text-center">
                      ⚠ AI-Assisted Draft — Review before submission
                    </div>
                    <div className="text-text-muted grid grid-cols-2 gap-1 border border-border rounded p-2">
                      <span>Generated:</span><span className="text-text-secondary">2026-03-15</span>
                      <span>Words:</span><span className="text-text-secondary">423</span>
                      <span>Status:</span><span className="text-text-secondary">Draft</span>
                    </div>
                    <div className="text-text-secondary leading-relaxed">
                      The subject presents a pattern of structured cash deposits consistent with layering behaviour...
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="badge-muted text-2xs">.docx</span>
                  <span className="badge-muted text-2xs">.pdf</span>
                  <span className="ml-auto text-text-muted text-2xs">Pro plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-5 bg-surface-variant">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-header">How It Works</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              From facts to draft in under 60 seconds.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter Transaction Facts',
                description:
                  'Fill in the subject details, transaction information, red flags, and investigator notes. Or upload a bank statement for automatic parsing.',
              },
              {
                step: '02',
                title: 'Generate a Draft',
                description:
                  'Click Generate. Our AI drafts a structured, formal narrative in seconds using only the facts you provided.',
              },
              {
                step: '03',
                title: 'Review, Edit & Export',
                description:
                  'Review the draft carefully. Edit inline if needed. Export to DOCX or PDF. Every output carries the required review disclaimer.',
              },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className="text-6xl font-display font-bold text-accent/15 mb-4 leading-none">
                  {step.step}
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role-Based Use Cases ──────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-header">Who It's For</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Built for everyone in the AML workflow.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText className="w-6 h-6" />,
                role: 'AML Investigator',
                headline: 'Draft your next STR narrative before your coffee gets cold.',
                description:
                  'Stop spending 45+ minutes per narrative. Enter your case facts, generate a structured draft, review and refine, then export directly to Word or PDF.',
              },
              {
                icon: <Users className="w-6 h-6" />,
                role: 'Compliance Officer',
                headline: 'Ensure consistent language across your entire team.',
                description:
                  'Create shared templates for your institution\'s most common transaction types. Every investigator generates narratives with the same structure and terminology.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                role: 'AML Consultant',
                headline: 'Scale your narrative writing across multiple reporting entities.',
                description:
                  'Handle multiple client engagements without sacrificing quality. NarrateAML\'s history and templates make switching between clients fast and reliable.',
              },
            ].map(({ icon, role, headline, description }) => (
              <div key={role} className="card-elevated space-y-4 p-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  {icon}
                </div>
                <div>
                  <div className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">{role}</div>
                  <h3 className="font-display text-lg font-bold text-text-primary mb-2">{headline}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & Privacy Callout ────────────────────────── */}
      <section className="py-20 px-5 bg-surface-variant">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border bg-background p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="section-header mb-3">Security & Privacy</div>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
                  Built security-first for compliance professionals.
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: <Upload className="w-4 h-4" />, text: 'Statement files parsed in-browser — never uploaded to our servers' },
                    { icon: <Database className="w-4 h-4" />, text: 'Row-level security on all data — you can only access your own narratives' },
                    { icon: <Lock className="w-4 h-4" />, text: 'Narrative content never used to train AI models' },
                    { icon: <Key className="w-4 h-4" />, text: 'All API keys server-side only — never exposed to the browser' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-start gap-3 text-sm text-text-secondary">
                      <span className="text-accent mt-0.5 shrink-0">{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>
                <Link href="/security" className="text-accent hover:text-accent-light text-sm flex items-center gap-1">
                  View our full security posture <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ───────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-header">Pricing</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Start free. Scale as you grow.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/month',
                description: 'Try it out',
                features: ['3 narratives/month', 'Manual entry form', 'Copy to clipboard', 'Narrative history'],
                cta: 'Start Free',
                href: '/sign-up',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$49',
                period: '/month',
                description: 'For individual investigators',
                features: ['Unlimited narratives', 'DOCX & PDF export', 'Templates + revision mode', 'Statement upload'],
                cta: 'Start Pro',
                href: '/sign-up',
                highlight: true,
              },
              {
                name: 'Team',
                price: '$149',
                period: '/month',
                description: 'For compliance teams',
                features: ['Everything in Pro', '5 team seats', 'Shared templates', 'Audit log'],
                cta: 'Start Team',
                href: '/sign-up',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 flex flex-col gap-4 transition-shadow hover:shadow-xl ${
                  plan.highlight ? 'border-accent bg-accent/5' : 'border-border bg-surface'
                }`}
              >
                <div>
                  {plan.highlight && (
                    <div className="badge-accent text-2xs mb-3">Most Popular</div>
                  )}
                  <h3 className="font-display text-lg font-bold text-text-primary">{plan.name}</h3>
                  <p className="text-text-muted text-xs">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="font-display text-3xl font-bold text-text-primary">{plan.price}</span>
                    <span className="text-text-muted text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={plan.highlight ? 'btn-primary text-center' : 'btn-secondary text-center'}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 space-y-2">
            <div className="text-text-muted text-sm">
              Also available: <span className="text-accent font-semibold">Lifetime Access — $297</span> one-time payment
            </div>
            <Link href="/pricing" className="text-accent hover:text-accent-light text-sm flex items-center justify-center gap-1">
              View full pricing with comparison table <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 px-5 bg-surface-variant">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-header">From Early Access Users</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              What investigators are saying.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'I used to dread writing STR narratives. NarrateAML gives me a structured draft in under a minute — I spend my time reviewing and refining instead of staring at a blank page.',
                role: 'AML Investigator',
                institution: 'Canadian Credit Union',
              },
              {
                quote:
                  'The consistency across our team has improved significantly. Everyone generates narratives with the same structure and language. Our QA review time has dropped noticeably.',
                role: 'Senior Compliance Officer',
                institution: 'Regional Fintech',
              },
              {
                quote:
                  'As a consultant working across multiple reporting entities, NarrateAML lets me draft quickly and maintain quality. The template feature is exactly what I needed.',
                role: 'AML Consultant',
                institution: 'Independent Practice',
              },
            ].map(({ quote, role, institution }) => (
              <div key={role} className="card-elevated p-6 space-y-4 border-l-2 border-accent">
                <Star className="w-5 h-5 text-accent/60" />
                <p className="text-text-secondary text-sm leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
                <div>
                  <div className="text-text-primary text-sm font-medium">{role}</div>
                  <div className="text-text-muted text-xs">{institution}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-text-muted text-xs mt-6">
            Quotes from early access users. Role and institution type only — no names or identifying information.
          </p>
        </div>
      </section>

      {/* ── Trust Badges ─────────────────────────────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: '🏛️', text: 'Designed for Canadian AML workflows' },
              { icon: '👤', text: 'Human review required on every output' },
              { icon: '🔒', text: 'Narrative content never used for AI training' },
              { icon: '🛡️', text: 'Security-first, server-side key management' },
            ].map((item) => (
              <div key={item.text} className="flex flex-col items-center text-center gap-2 p-4">
                <div className="text-2xl">{item.icon}</div>
                <p className="text-text-secondary text-xs leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-surface-variant">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-header">FAQ</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">Common questions</h2>
          </div>
          <div className="card">
            <AccordionItem
              q="Is this a filing tool or a drafting assistant?"
              a="NarrateAML is strictly a drafting assistant. It generates structured narrative text for your review. It does not submit reports to FINTRAC or any regulator. Every output is labeled as an AI-assisted draft that requires human review, editing, and approval before submission."
            />
            <AccordionItem
              q="Can I edit the generated narrative?"
              a="Yes. After generation, you can edit the narrative inline directly in the output panel or on the narrative detail page. Changes are saved to your history. You can also use revision mode to provide specific instructions for regenerating an improved draft."
            />
            <AccordionItem
              q="Is my data secure and confidential?"
              a="Your narrative data is stored on encrypted servers. Statement files are parsed entirely in your browser — never transmitted to our servers. We do not use your narrative content to train AI models. Analytics are configured to never log raw narrative text or subject details."
            />
            <AccordionItem
              q="Do you support Word and PDF export?"
              a="Yes. Pro and Team plan users can export narratives as .docx (Microsoft Word) or .pdf files. Every export includes the mandatory AI-assisted draft disclaimer. Free plan users can copy narrative text to clipboard."
            />
            <AccordionItem
              q="What happens if I cancel my subscription?"
              a="You can cancel at any time from the billing portal. You retain access to your plan features until the end of the current billing period. After that, your account reverts to the Free plan (3 narratives/month). Your narrative history is preserved."
            />
          </div>
          <div className="text-center mt-6">
            <Link href="/faq" className="text-accent hover:text-accent-light text-sm flex items-center justify-center gap-1">
              View all FAQs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-5">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/8 text-accent text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            3 narratives free · No credit card required
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary text-balance">
            Start drafting better narratives today.
          </h2>
          <p className="text-text-muted">
            Structured, FINTRAC-oriented drafts in under 60 seconds.
            AI-assisted — always reviewed by you.
          </p>
          <Link href="/sign-up" className="btn-primary text-base px-8 py-3 inline-flex">
            Try Free — No Credit Card Required
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-text-muted text-xs">
            AI-Assisted Draft — Review for accuracy and regulatory suitability before submission.
            Not a FINTRAC filing tool.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
