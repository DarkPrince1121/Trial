import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  FileText,
  Clock,
  X,
  ChevronDown,
} from 'lucide-react'

// ── Landing page — fully server-rendered ──────────────────────

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
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="font-display text-base font-bold text-accent tracking-wide">
            NARRATEAML
          </div>
          <div className="flex items-center gap-5">
            <Link href="/pricing" className="text-text-secondary hover:text-text-primary text-sm transition-colors hidden md:block">
              Pricing
            </Link>
            <Link href="/faq" className="text-text-secondary hover:text-text-primary text-sm transition-colors hidden md:block">
              FAQ
            </Link>
            <Link href="/sign-in" className="btn-ghost py-2 text-sm">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary py-2 text-sm">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Section 1: Hero ──────────────────────────────────── */}
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
            Structured for Canadian AML workflows.
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

          <p className="text-text-muted text-xs">
            Used by compliance professionals across credit unions, fintechs, and community institutions.
          </p>
        </div>
      </section>

      {/* AI Warning Banner */}
      <div className="px-5 pb-10">
        <div className="max-w-3xl mx-auto ai-warning-banner">
          <span className="text-warning text-sm shrink-0">⚠</span>
          <span>
            AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
            NarrateAML is a drafting tool, not a filing tool.
          </span>
        </div>
      </div>

      {/* ── Section 2: Problem vs Solution ───────────────────── */}
      <section className="py-20 px-5 bg-surface-variant">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-header">The Problem</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              STR narrative writing is a bottleneck.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Old way */}
            <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <X className="w-5 h-5 text-danger" />
                <h3 className="font-display text-lg font-bold text-text-primary">
                  The Old Way
                </h3>
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

            {/* With NarrateAML */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-bold text-text-primary">
                  With NarrateAML
                </h3>
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

      {/* ── Section 3: Feature Highlights ────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-header">Features</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Built for compliance professionals.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🏛️',
                title: 'FINTRAC-Oriented Language',
                description:
                  'Narratives structured for Canadian AML reporting requirements. Designed to support investigator review — not replace it.',
              },
              {
                icon: '🔒',
                title: 'Secure Case Handling',
                description:
                  'Statement files are parsed locally in your browser, never uploaded. Narrative data is encrypted at rest. No analytics on raw content.',
              },
              {
                icon: '📄',
                title: 'Instant Export',
                description:
                  'Export to Word (.docx) or PDF with a single click. Every export includes the mandatory AI-assisted draft disclaimer.',
              },
            ].map((feature) => (
              <div key={feature.title} className="card-elevated space-y-3">
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: How It Works ───────────────────────────── */}
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
                <div className="text-5xl font-display font-bold text-accent/20 mb-4">
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

      {/* ── Section 5: Pricing Preview ────────────────────────── */}
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
                features: [
                  '3 narratives/month',
                  'Manual entry',
                  'Copy to clipboard',
                ],
                cta: 'Start Free',
                href: '/sign-up',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$49',
                period: '/month',
                description: 'For investigators',
                features: [
                  'Unlimited narratives',
                  'DOCX & PDF export',
                  'Templates',
                  'Statement upload',
                ],
                cta: 'Start Pro',
                href: '/sign-up',
                highlight: true,
              },
              {
                name: 'Team',
                price: '$149',
                period: '/month',
                description: 'For compliance teams',
                features: [
                  'Everything in Pro',
                  '5 seats',
                  'Shared templates',
                  'Audit log',
                ],
                cta: 'Start Team',
                href: '/sign-up',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 flex flex-col gap-4 ${
                  plan.highlight
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-surface'
                }`}
              >
                <div>
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
                <Link
                  href={plan.href}
                  className={plan.highlight ? 'btn-primary text-center' : 'btn-secondary text-center'}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link href="/pricing" className="text-accent hover:text-accent-light text-sm flex items-center justify-center gap-1">
              View full pricing details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 6: Trust ─────────────────────────────────── */}
      <section className="py-16 px-5 bg-surface-variant">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: '🏛️', text: 'Designed for AML workflows' },
              { icon: '👤', text: 'Human review required before submission' },
              { icon: '🔒', text: 'Case data is not used to train outputs' },
              { icon: '🛡️', text: 'Security-first, server-side integrations' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex flex-col items-center text-center gap-2 p-4"
              >
                <div className="text-2xl">{item.icon}</div>
                <p className="text-text-secondary text-xs leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: FAQ ───────────────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-header">FAQ</div>
            <h2 className="font-display text-3xl font-bold text-text-primary">
              Common questions
            </h2>
          </div>

          <div className="card divide-y-0">
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
              a="Your narrative data is stored on encrypted servers using Supabase. Statement files (Excel, CSV, PDF) are parsed entirely in your browser — they are never transmitted to or stored on our servers. We do not use your narrative content to train AI models. Analytics are configured to never log raw narrative text."
            />
            <AccordionItem
              q="Do you support Word and PDF export?"
              a="Yes. Pro and Team plan users can export narratives as .docx (Microsoft Word) or .pdf files. Every export includes the mandatory AI-assisted draft disclaimer in the header and footer. Free plan users can copy narrative text to clipboard."
            />
            <AccordionItem
              q="What happens if I cancel?"
              a="You can cancel your subscription at any time from the billing portal. You will retain access to your plan features until the end of the current billing period. After that, your account reverts to the Free plan (3 narratives/month). Your narrative history is preserved."
            />
          </div>
        </div>
      </section>

      {/* ── Section 8: Final CTA ─────────────────────────────── */}
      <section className="py-20 px-5 bg-surface-variant">
        <div className="max-w-2xl mx-auto text-center space-y-6">
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
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-display text-sm font-bold text-accent">NARRATEAML</div>
            <div className="flex items-center gap-5 text-xs text-text-muted">
              <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
              <Link href="/faq" className="hover:text-text-secondary transition-colors">FAQ</Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Shield className="w-3.5 h-3.5 text-warning" />
              <span>AI-Assisted Draft — Review before submission.</span>
            </div>
          </div>
          <p className="text-center text-2xs text-text-muted mt-6">
            AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
            NarrateAML does not provide legal advice and is not a filing tool.
          </p>
        </div>
      </footer>
    </div>
  )
}
