import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FilePlus2, Clock, Download, BarChart3, ArrowRight, AlertTriangle } from 'lucide-react'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NarrativeRowActions } from '@/components/dashboard/NarrativeRowActions'
import { getUsagePercentage, isNearLimit, isAtLimit, getRemainingNarratives } from '@/lib/utils/entitlements'
import { cn } from '@/lib/utils/cn'
import type { Narrative } from '@/types'
import { format } from 'date-fns'

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatCurrency(amount: number | null, currency: string): string {
  if (!amount) return '—'
  return `${currency} ${amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  sub?: string
}

function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className="stat-label">{label}</div>
        <div className="text-text-muted">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="text-2xs text-text-muted mt-1 font-mono">{sub}</div>}
    </div>
  )
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')

  const supabase = getSupabaseServerClient()

  // Fetch recent narratives
  const { data: recentNarratives } = await supabase
    .from('narratives')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch usage stats
  const { data: allNarratives } = await supabase
    .from('narratives')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_deleted', false)

  const { data: exports } = await supabase
    .from('usage_log')
    .select('id')
    .eq('user_id', user.id)
    .in('action', ['export_docx', 'export_pdf'])

  const totalNarratives = allNarratives?.length || 0
  const totalExports = exports?.length || 0
  const hoursSaved = parseFloat(((totalNarratives * 45) / 60).toFixed(1))
  const usagePct = getUsagePercentage(user)
  const nearLimit = isNearLimit(user)
  const atLimit = isAtLimit(user)
  const remaining = getRemainingNarratives(user)

  const greeting = getTimeGreeting()
  const firstName = user.full_name?.split(' ')[0] || 'there'

  const narratives = (recentNarratives || []) as Narrative[]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {greeting}, {firstName}.
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {new Date().toLocaleDateString('en-CA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link href="/generate" className="btn-primary">
          <FilePlus2 className="w-4 h-4" />
          Generate New Narrative
        </Link>
      </div>

      {/* Usage warning banner */}
      {atLimit && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-danger/10 border border-danger/30">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-danger text-sm font-medium">Monthly limit reached</p>
            <p className="text-danger/80 text-xs mt-0.5">
              You&apos;ve used all {user.monthly_limit} narrative drafts this month. Upgrade to Pro for unlimited access.
            </p>
          </div>
          <Link href="/billing" className="btn-primary py-1.5 text-xs shrink-0">
            Upgrade Now
          </Link>
        </div>
      )}

      {!atLimit && nearLimit && user.plan === 'free' && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-warning/8 border border-warning/25">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-warning text-sm font-medium">Approaching monthly limit</p>
            <p className="text-warning/80 text-xs mt-0.5">
              {remaining} of {user.monthly_limit} narrative drafts remaining this month.
            </p>
          </div>
          <Link href="/billing" className="btn-secondary py-1.5 text-xs shrink-0">
            Upgrade
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Narratives Generated"
          value={totalNarratives.toLocaleString()}
          icon={<BarChart3 className="w-4 h-4" />}
          sub="all time"
        />
        <StatCard
          label="Estimated Hours Saved"
          value={hoursSaved}
          icon={<Clock className="w-4 h-4" />}
          sub="at 45 min/narrative"
        />
        <StatCard
          label="Exports"
          value={totalExports.toLocaleString()}
          icon={<Download className="w-4 h-4" />}
          sub="DOCX + PDF"
        />
        <div className="stat-card">
          <div className="flex items-start justify-between mb-3">
            <div className="stat-label">This Month</div>
            <span
              className={cn(
                'badge text-2xs',
                user.plan === 'free' && 'plan-badge-free',
                user.plan === 'pro' && 'plan-badge-pro',
                user.plan === 'team' && 'plan-badge-team',
                user.plan === 'lifetime' && 'plan-badge-lifetime'
              )}
            >
              {user.plan.toUpperCase()}
            </span>
          </div>
          {user.plan === 'free' ? (
            <>
              <div className="stat-value">
                {user.narratives_used_this_month}
                <span className="text-text-muted text-base font-sans font-normal">
                  /{user.monthly_limit}
                </span>
              </div>
              <div className="w-full h-1 bg-surface rounded-full mt-2 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    usagePct >= 100 ? 'bg-danger' : usagePct >= 67 ? 'bg-warning' : 'bg-accent'
                  )}
                  style={{ width: `${Math.min(usagePct, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="stat-value">{user.narratives_used_this_month}</div>
              <div className="text-2xs text-text-muted mt-1 font-mono">unlimited</div>
            </>
          )}
        </div>
      </div>

      {/* Recent narratives */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-text-primary">
            Recent Narratives
          </h2>
          <Link
            href="/history"
            className="text-xs text-accent hover:text-accent-light flex items-center gap-1 font-sans"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {narratives.length === 0 ? (
          // Empty state
          <div className="py-16 text-center space-y-4">
            <div className="text-4xl">📋</div>
            <div>
              <h3 className="font-display text-lg font-bold text-text-primary mb-2">
                No narratives yet
              </h3>
              <p className="text-text-muted text-sm max-w-sm mx-auto">
                Generate your first STR narrative draft. Fill in the transaction
                details, hit Generate, and get a structured narrative in under 60 seconds.
              </p>
            </div>
            <Link href="/generate" className="btn-primary inline-flex">
              <FilePlus2 className="w-4 h-4" />
              Generate First Narrative
            </Link>
            <p className="text-2xs text-text-muted">
              Free plan: 3 narratives/month. No credit card required.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Transaction Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Words</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {narratives.map((n) => (
                  <tr key={n.id}>
                    <td className="max-w-[160px]">
                      <Link
                        href={`/history/${n.id}`}
                        className="text-text-primary hover:text-accent transition-colors truncate block"
                      >
                        {n.subject_name || <span className="text-text-muted italic">Unnamed</span>}
                      </Link>
                    </td>
                    <td className="text-text-secondary text-xs">
                      {n.transaction_type || '—'}
                    </td>
                    <td className="font-mono text-xs text-text-secondary">
                      {formatCurrency(n.transaction_amount, n.transaction_currency)}
                    </td>
                    <td className="text-xs text-text-muted font-mono">
                      {format(new Date(n.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="text-xs font-mono text-text-muted">
                      {n.word_count?.toLocaleString() || '—'}
                    </td>
                    <td>
                      <span
                        className={cn(
                          'badge text-2xs',
                          n.readiness_status === 'draft' && 'badge-muted',
                          n.readiness_status === 'edited' && 'badge-warning',
                          n.readiness_status === 'exported' && 'badge-success',
                          n.readiness_status === 'archived' && 'badge-muted'
                        )}
                      >
                        {n.readiness_status}
                      </span>
                    </td>
                    <td className="text-right">
                      <NarrativeRowActions narrative={n} userPlan={user.plan} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upgrade CTA for free plan */}
      {user.plan === 'free' && (
        <div className="card border-accent/20 bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-bold text-text-primary mb-1">
                Upgrade to Pro
              </h3>
              <p className="text-text-muted text-sm">
                Unlimited narratives, DOCX/PDF export, templates, statement upload, and revision mode.
              </p>
            </div>
            <Link href="/billing" className="btn-primary shrink-0">
              View Plans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="ai-warning-banner">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
        </span>
      </div>
    </div>
  )
}
