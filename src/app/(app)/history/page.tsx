import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NarrativeRowActions } from '@/components/dashboard/NarrativeRowActions'
import { cn } from '@/lib/utils/cn'
import type { Narrative } from '@/types'
import { format } from 'date-fns'
import { Search, Filter } from 'lucide-react'

interface SearchParams {
  search?: string
  type?: string
  range?: string
  sort?: string
  page?: string
}

const TRANSACTION_TYPES = [
  'All Types',
  'EMT',
  'Wire Transfer — Domestic',
  'Wire Transfer — International',
  'Cash Deposit',
  'Cash Withdrawal',
  'Cheque',
  'ATM',
  'ACH',
  'Internal Transfer',
  'Multiple',
]

function formatAmount(amount: number | null, currency: string): string {
  if (!amount) return '—'
  return `${currency} ${amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')

  const params = await searchParams
  const search = params.search || ''
  const typeFilter = params.type || ''
  const range = params.range || 'all'
  const sort = params.sort || 'newest'
  const page = parseInt(params.page || '1')
  const limit = 20

  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('narratives')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_deleted', false)

  // Search
  if (search) {
    query = query.ilike('subject_name', `%${search}%`)
  }

  // Type filter
  if (typeFilter && typeFilter !== 'All Types') {
    query = query.eq('transaction_type', typeFilter)
  }

  // Date range
  if (range === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    query = query.gte('created_at', weekAgo.toISOString())
  } else if (range === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    query = query.gte('created_at', monthAgo.toISOString())
  }

  // Sort
  if (sort === 'amount') {
    query = query.order('transaction_amount', { ascending: false })
  } else if (sort === 'words') {
    query = query.order('word_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Pagination
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count } = await query
  const narratives = (data || []) as Narrative[]
  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  function buildUrl(overrides: Partial<SearchParams>) {
    const p = new URLSearchParams({
      ...(search && { search }),
      ...(typeFilter && { type: typeFilter }),
      ...(range !== 'all' && { range }),
      ...(sort !== 'newest' && { sort }),
      ...(page > 1 && { page: String(page) }),
      ...overrides,
    })
    const str = p.toString()
    return `/history${str ? `?${str}` : ''}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Narrative History
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {total.toLocaleString()} narrative{total !== 1 ? 's' : ''} generated
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="label">Search by Subject</label>
            <form action="/history" method="get" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="Subject name..."
                className="input pl-9"
              />
              {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
              {range !== 'all' && <input type="hidden" name="range" value={range} />}
              {sort !== 'newest' && <input type="hidden" name="sort" value={sort} />}
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>

          {/* Transaction type */}
          <div className="min-w-[180px]">
            <label className="label">Transaction Type</label>
            <div className="relative">
              <select
                className="select"
                defaultValue={typeFilter || 'All Types'}
                onChange={(e) => {
                  const url = buildUrl({ type: e.target.value, page: '1' })
                  window.location.href = url
                }}
              >
                {TRANSACTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Date range */}
          <div className="min-w-[140px]">
            <label className="label">Date Range</label>
            <select
              className="select"
              defaultValue={range}
              onChange={(e) => {
                window.location.href = buildUrl({ range: e.target.value, page: '1' })
              }}
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Sort */}
          <div className="min-w-[140px]">
            <label className="label">Sort By</label>
            <select
              className="select"
              defaultValue={sort}
              onChange={(e) => {
                window.location.href = buildUrl({ sort: e.target.value, page: '1' })
              }}
            >
              <option value="newest">Newest</option>
              <option value="amount">Amount</option>
              <option value="words">Word Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {narratives.length === 0 ? (
          <div className="py-16 text-center text-text-muted">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-text-secondary font-display text-lg font-semibold mb-1">
              No narratives found
            </p>
            <p className="text-sm">
              {search || typeFilter || range !== 'all'
                ? 'Try adjusting your filters.'
                : 'Generate your first narrative to see it here.'}
            </p>
            {!search && !typeFilter && range === 'all' && (
              <Link href="/generate" className="btn-primary inline-flex mt-4">
                Generate Narrative
              </Link>
            )}
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
                    <td className="max-w-[180px]">
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
                      {formatAmount(n.transaction_amount, n.transaction_currency)}
                    </td>
                    <td className="text-xs text-text-muted font-mono whitespace-nowrap">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted font-mono text-xs">
            Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="btn-secondary py-1.5 text-xs"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="btn-secondary py-1.5 text-xs"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
