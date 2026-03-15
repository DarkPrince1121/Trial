import Link from 'next/link'
import { CheckCircle2, ArrowLeft, Shield } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-base font-bold text-accent">
            NARRATEAML
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="btn-ghost text-sm py-2">Sign In</Link>
            <Link href="/sign-up" className="btn-primary text-sm py-2">Start Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-16 space-y-12">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-3">
            Simple, transparent pricing.
          </h1>
          <p className="text-text-muted">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: 'Free',
              price: '$0',
              description: 'Try NarrateAML at no cost.',
              features: [
                '3 narrative drafts per month',
                'Manual entry form (6 sections)',
                'Copy to clipboard',
                'Narrative history',
                'FINTRAC-oriented language',
                'No credit card required',
              ],
              cta: 'Start Free',
              href: '/sign-up',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$49/mo',
              annual: '$399/yr',
              description: 'For individual AML investigators.',
              features: [
                'Unlimited narrative drafts',
                'DOCX & PDF export',
                'Saved reusable templates',
                'Statement upload & auto-parsing',
                'Revision mode with notes',
                'Full narrative history',
                'Priority email support',
              ],
              cta: 'Upgrade to Pro',
              href: '/sign-up',
              highlight: true,
            },
            {
              name: 'Team',
              price: '$149/mo',
              description: 'For compliance teams.',
              features: [
                'Everything in Pro',
                '5 team seats included',
                'Shared templates across team',
                'Full audit log',
                'Admin team management',
                'Priority support',
              ],
              cta: 'Upgrade to Team',
              href: '/sign-up',
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-7 flex flex-col gap-5 ${
                plan.highlight
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface'
              }`}
            >
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary mb-1">{plan.name}</h2>
                <p className="text-text-muted text-sm">{plan.description}</p>
                <div className="mt-3 font-display text-2xl font-bold text-text-primary">{plan.price}</div>
                {(plan as { annual?: string }).annual && (
                  <div className="text-text-muted text-xs mt-1">or {(plan as { annual?: string }).annual} (save 32%)</div>
                )}
              </div>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
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

        {/* Lifetime */}
        <div className="card border-accent/30 bg-accent/5 text-center space-y-3">
          <h3 className="font-display text-xl font-bold text-text-primary">Lifetime Access — $297</h3>
          <p className="text-text-muted">One-time payment. All Pro features. No subscription ever.</p>
          <Link href="/sign-up" className="btn-primary inline-flex">Get Lifetime Access</Link>
        </div>

        <div className="flex items-start gap-2 text-xs text-text-muted max-w-xl mx-auto">
          <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warning" />
          <p>
            AI-Assisted Draft — All narrative outputs require human review before submission.
            NarrateAML is not a FINTRAC filing tool and does not provide legal advice.
            Payments processed by Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}
