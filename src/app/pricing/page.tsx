'use client'

import Link from 'next/link'
import { CheckCircle2, X, ArrowLeft, Shield } from 'lucide-react'
import { useState } from 'react'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

const PLANS = [
  {
    name: 'Free',
    monthly: '$0',
    annual: '$0',
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
    monthly: '$49/mo',
    annual: '$33/mo',
    annualTotal: '$399/yr',
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
    monthly: '$149/mo',
    annual: '$149/mo',
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
]

const COMPARISON = [
  { feature: 'Narratives per month', free: '3', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Manual entry form', free: true, pro: true, team: true },
  { feature: 'Narrative history', free: true, pro: true, team: true },
  { feature: 'Copy to clipboard', free: true, pro: true, team: true },
  { feature: 'Statement upload', free: false, pro: true, team: true },
  { feature: 'DOCX export', free: false, pro: true, team: true },
  { feature: 'PDF export', free: false, pro: true, team: true },
  { feature: 'Saved templates', free: false, pro: true, team: true },
  { feature: 'Revision mode', free: false, pro: true, team: true },
  { feature: 'Team seats', free: '1', pro: '1', team: '5' },
  { feature: 'Shared templates', free: false, pro: false, team: true },
  { feature: 'Audit log', free: false, pro: false, team: true },
  { feature: 'Admin management', free: false, pro: false, team: true },
  { feature: 'Support', free: 'Community', pro: 'Priority email', team: 'Priority' },
]

const PRICING_FAQS = [
  {
    q: 'Can I cancel at any time?',
    a: 'Yes. Cancel anytime from the billing portal. You retain access until the end of your billing period, then revert to the Free plan. Your narrative history is always preserved.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'The Free plan gives you 3 narratives/month with no credit card required — that is effectively a permanent free trial. You upgrade when you need more.',
  },
  {
    q: 'What is the annual discount?',
    a: 'Pro annual is $399/year vs $588/year monthly — a saving of 32%. Billed once per year.',
  },
  {
    q: 'What does the Lifetime plan include?',
    a: 'Lifetime gives you all Pro features, forever, for a one-time payment of $297. No subscription, no renewal.',
  },
  {
    q: 'How are Team seats counted?',
    a: 'Team plan includes 5 named seats. Each seat is a separate user account with full Pro features plus shared templates and audit log visibility.',
  },
]

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
  if (value === false) return <X className="w-4 h-4 text-text-muted mx-auto opacity-30" />
  return <span className="text-text-secondary text-sm">{value}</span>
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <MarketingNav />

      <div className="max-w-5xl mx-auto px-5 py-16 space-y-16">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="font-display text-4xl font-bold text-text-primary mb-3">
            Transparent pricing for compliance professionals.
          </h1>
          <p className="text-text-muted mb-8">Start free. Upgrade when you need more.</p>

          {/* Annual / Monthly Toggle */}
          <div className="inline-flex items-center gap-3 bg-surface border border-border rounded-full px-2 py-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !annual ? 'bg-accent text-background' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                annual ? 'bg-accent text-background' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Annual
              <span className={`text-2xs font-mono px-1.5 py-0.5 rounded ${annual ? 'bg-background/20 text-background' : 'bg-success/15 text-success border border-success/30'}`}>
                Save 32%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-7 flex flex-col gap-5 transition-all hover:shadow-xl ${
                plan.highlight
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-border bg-surface'
              }`}
            >
              <div>
                {plan.highlight && (
                  <div className="badge-accent text-2xs mb-3">Most Popular</div>
                )}
                <h2 className="font-display text-xl font-bold text-text-primary mb-1">{plan.name}</h2>
                <p className="text-text-muted text-sm">{plan.description}</p>
                <div className="mt-3">
                  <div className="font-display text-2xl font-bold text-text-primary">
                    {annual ? plan.annual : plan.monthly}
                  </div>
                  {annual && plan.annualTotal && (
                    <div className="text-text-muted text-xs mt-1">billed as {plan.annualTotal} · save 32%</div>
                  )}
                  {!annual && plan.annualTotal && (
                    <div className="text-text-muted text-xs mt-1">or {plan.annualTotal} annually</div>
                  )}
                </div>
              </div>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
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

        {/* Lifetime Deal */}
        <div className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/8 to-accent/3 p-10 text-center space-y-4">
          <div className="badge-accent text-xs mx-auto mb-2">One-Time Payment</div>
          <h3 className="font-display text-2xl font-bold text-text-primary">Lifetime Access — $297</h3>
          <p className="text-text-muted max-w-sm mx-auto">
            One-time payment. All Pro features. No subscription — ever.
            Pay once, use forever.
          </p>
          <ul className="flex flex-wrap justify-center gap-3 text-sm text-text-secondary">
            {['Unlimited narratives', 'DOCX & PDF export', 'Templates', 'Statement upload', 'Revision mode'].map((f) => (
              <li key={f} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/sign-up" className="btn-primary inline-flex mt-2">
            Get Lifetime Access — $297
          </Link>
          <p className="text-text-muted text-xs">
            Not happy? Email us within 15 days for a full refund. No questions asked.
          </p>
        </div>

        {/* Comparison Table */}
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary mb-6 text-center">
            Full feature comparison
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  <th className="text-left px-5 py-3 text-text-muted font-mono text-xs uppercase tracking-widest font-normal">Feature</th>
                  <th className="text-center px-4 py-3 text-text-muted font-medium w-24">Free</th>
                  <th className="text-center px-4 py-3 text-accent font-medium w-24">Pro</th>
                  <th className="text-center px-4 py-3 text-text-muted font-medium w-24">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON.map(({ feature, free, pro, team }) => (
                  <tr key={feature} className="hover:bg-surface-variant/40 transition-colors">
                    <td className="px-5 py-3 text-text-secondary">{feature}</td>
                    <td className="text-center px-4 py-3"><Cell value={free} /></td>
                    <td className="text-center px-4 py-3 bg-accent/3"><Cell value={pro} /></td>
                    <td className="text-center px-4 py-3"><Cell value={team} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-text-primary mb-6 text-center">
            Pricing questions
          </h2>
          <div className="card divide-y-0">
            {PRICING_FAQS.map(({ q, a }) => (
              <details key={q} className="group border-b border-border last:border-0">
                <summary className="flex items-center justify-between py-4 cursor-pointer list-none text-text-primary font-sans font-medium text-sm select-none hover:text-accent transition-colors">
                  {q}
                  <span className="text-text-muted text-xs group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="pb-4 text-text-secondary text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-text-muted max-w-xl mx-auto">
          <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warning" />
          <p>
            AI-Assisted Draft — All narrative outputs require human review before submission.
            NarrateAML is not a FINTRAC filing tool and does not provide legal advice.
            Payments processed by Stripe.
          </p>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
