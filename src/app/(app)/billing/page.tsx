'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, AlertTriangle, Zap, Users, Infinity as InfinityIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { Plan } from '@/types'

interface PlanConfig {
  name: string
  monthlyPrice: number
  annualPrice: number | null
  annualPriceMonthly: number | null
  description: string
  features: string[]
  priceId: {
    monthly: string | null
    annual: string | null
  }
  badge?: string
}

const PLANS: PlanConfig[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: null,
    annualPriceMonthly: null,
    description: 'For occasional use',
    features: [
      '3 narrative drafts / month',
      'Manual entry form',
      'Narrative history',
      'Copy to clipboard',
      'FINTRAC-oriented language',
    ],
    priceId: { monthly: null, annual: null },
  },
  {
    name: 'Pro',
    monthlyPrice: 49,
    annualPrice: 399,
    annualPriceMonthly: 33.25,
    description: 'For individual investigators',
    features: [
      'Unlimited narrative drafts',
      'DOCX & PDF export',
      'Saved templates',
      'Statement upload & parsing',
      'Revision mode',
      'Full history',
      'Priority support',
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || '',
    },
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    monthlyPrice: 149,
    annualPrice: null,
    annualPriceMonthly: null,
    description: 'For compliance teams',
    features: [
      'Everything in Pro',
      '5 team seats',
      'Shared templates',
      'Audit log',
      'Team management',
      'Admin controls',
      'Priority support',
    ],
    priceId: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY || '',
      annual: null,
    },
  },
]

interface UserStatus {
  plan: Plan
  narrativesThisMonth: number
  monthlyLimit: number
  stripeCustomerId?: string
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const [annual, setAnnual] = useState(false)
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Your plan has been updated.', { duration: 6000 })
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelled. Your plan was not changed.')
    }

    fetch('/api/usage')
      .then((r) => r.json())
      .then((d) => {
        setUserStatus({
          plan: d.plan,
          narrativesThisMonth: d.narrativesThisMonth,
          monthlyLimit: d.monthlyLimit,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [searchParams])

  async function handleCheckout(priceId: string) {
    if (!priceId) return
    setCheckoutLoading(priceId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')
      window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
      setCheckoutLoading(null)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal')
      setPortalLoading(false)
    }
  }

  async function handleLifetime() {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME || ''
    if (!priceId) {
      toast.error('Lifetime plan not available')
      return
    }
    await handleCheckout(priceId)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentPlan = userStatus?.plan || 'free'

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Billing</h1>
        <p className="text-text-muted text-sm mt-1">
          Manage your subscription and billing preferences.
        </p>
      </div>

      {/* Current plan card */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="section-header">Current Plan</div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'badge text-sm px-3 py-1',
                  currentPlan === 'free' && 'plan-badge-free',
                  currentPlan === 'pro' && 'plan-badge-pro',
                  currentPlan === 'team' && 'plan-badge-team',
                  currentPlan === 'lifetime' && 'plan-badge-lifetime'
                )}
              >
                {currentPlan.toUpperCase()}
              </span>
              {currentPlan === 'free' && (
                <span className="text-text-muted text-sm">
                  {userStatus?.narrativesThisMonth || 0} / {userStatus?.monthlyLimit || 3} narratives this month
                </span>
              )}
            </div>
          </div>
          {currentPlan !== 'free' && currentPlan !== 'lifetime' && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="btn-secondary"
            >
              {portalLoading ? 'Loading...' : 'Manage Subscription'}
            </button>
          )}
        </div>
      </div>

      {/* Annual/Monthly toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn('text-sm', !annual ? 'text-text-primary' : 'text-text-muted')}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual((v) => !v)}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            annual ? 'bg-accent' : 'bg-surface-elevated border border-border'
          )}
        >
          <div
            className={cn(
              'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
              annual ? 'translate-x-6' : 'translate-x-0'
            )}
          />
        </button>
        <span className={cn('text-sm flex items-center gap-2', annual ? 'text-text-primary' : 'text-text-muted')}>
          Annual
          <span className="badge badge-success text-2xs">Save 32%</span>
        </span>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name.toLowerCase()
          const price = annual && plan.annualPriceMonthly
            ? plan.annualPriceMonthly
            : plan.monthlyPrice
          const priceId = annual && plan.priceId.annual
            ? plan.priceId.annual
            : plan.priceId.monthly

          return (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-xl border p-6 gap-5',
                plan.badge
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface',
                isCurrentPlan && 'ring-2 ring-accent'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-accent text-xs px-3 py-1">{plan.badge}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-lg font-bold text-text-primary">
                    {plan.name}
                  </h3>
                  {plan.name === 'Team' && <Users className="w-4 h-4 text-text-muted" />}
                  {plan.name === 'Pro' && <Zap className="w-4 h-4 text-accent" />}
                </div>
                <p className="text-text-muted text-sm">{plan.description}</p>

                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold text-text-primary">
                      ${price === 0 ? '0' : annual && plan.annualPriceMonthly ? plan.annualPriceMonthly.toFixed(2) : price}
                    </span>
                    <span className="text-text-muted text-sm">/month</span>
                  </div>
                  {annual && plan.annualPrice && (
                    <p className="text-2xs text-text-muted mt-1">
                      Billed annually at ${plan.annualPrice}/year
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {isCurrentPlan ? (
                  <button
                    className="btn-secondary w-full cursor-default opacity-75"
                    disabled
                  >
                    Current Plan
                  </button>
                ) : plan.name === 'Free' ? (
                  <button
                    className="btn-secondary w-full cursor-default opacity-50"
                    disabled
                  >
                    Free Forever
                  </button>
                ) : (
                  <button
                    onClick={() => priceId && handleCheckout(priceId)}
                    disabled={checkoutLoading === priceId}
                    className={cn(
                      'w-full',
                      plan.badge ? 'btn-primary' : 'btn-secondary'
                    )}
                  >
                    {checkoutLoading === priceId ? 'Loading...' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lifetime deal */}
      {currentPlan !== 'lifetime' && (
        <div className="relative card border-accent/30 bg-gradient-to-br from-accent/5 to-transparent overflow-hidden">
          <div className="absolute top-3 right-3 badge badge-warning">Limited Offer</div>
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <InfinityIcon className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-bold text-text-primary">
                  Lifetime Access
                </h3>
              </div>
              <p className="text-text-muted text-sm mb-3">
                One-time payment. All Pro features forever. No subscriptions.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-accent">$297</span>
                <span className="text-text-muted text-sm line-through">$588/year</span>
                <span className="badge badge-success">50% off</span>
              </div>
            </div>
            <button
              onClick={handleLifetime}
              disabled={!!checkoutLoading}
              className="btn-primary shrink-0"
            >
              {checkoutLoading ? 'Loading...' : 'Get Lifetime Access'}
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-text-muted">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warning" />
        <p>
          Payments are processed securely by Stripe. You can cancel your subscription at any time
          from the billing portal. Refunds are subject to our{' '}
          <span className="text-text-secondary">Terms of Service</span>.
          NarrateAML does not store your payment details.
        </p>
      </div>
    </div>
  )
}
