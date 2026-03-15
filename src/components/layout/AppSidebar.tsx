'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FilePlus2,
  History,
  BookTemplate,
  CreditCard,
  Settings,
  Shield,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { User } from '@/types'
import { getPlanDisplayName, getMonthlyLimit, getUsagePercentage } from '@/lib/utils/entitlements'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/generate',
    label: 'Generate',
    icon: FilePlus2,
  },
  {
    href: '/history',
    label: 'History',
    icon: History,
  },
  {
    href: '/templates',
    label: 'Templates',
    icon: BookTemplate,
  },
  {
    href: '/billing',
    label: 'Billing',
    icon: CreditCard,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
]

interface AppSidebarProps {
  user: User
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const usagePct = getUsagePercentage(user)
  const limit = getMonthlyLimit(user.plan)
  const isFreePlan = user.plan === 'free'

  return (
    <aside
      className="hidden md:flex flex-col w-[var(--sidebar-width)] bg-surface-variant border-r border-border shrink-0"
      style={{ '--sidebar-width': '240px' } as React.CSSProperties}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="font-display text-lg font-bold text-accent tracking-wide">
          NARRATEAML
        </div>
        <div className="text-2xs text-text-muted font-mono mt-0.5 uppercase tracking-widest">
          AML Narrative Drafting
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-item group',
                isActive && 'bg-surface-elevated text-text-primary border-l-2 border-accent pl-[calc(0.75rem-2px)]'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Plan + Usage */}
      <div className="px-3 py-4 border-t border-border space-y-3">
        {/* Plan badge */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-text-muted font-sans">Plan</span>
          <span
            className={cn(
              'badge font-mono text-2xs',
              user.plan === 'free' && 'plan-badge-free',
              user.plan === 'pro' && 'plan-badge-pro',
              user.plan === 'team' && 'plan-badge-team',
              user.plan === 'lifetime' && 'plan-badge-lifetime'
            )}
          >
            {getPlanDisplayName(user.plan)}
          </span>
        </div>

        {/* Usage progress (free plan only) */}
        {isFreePlan && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-2xs font-mono">
              <span className="text-text-muted">This month</span>
              <span className="text-text-secondary">
                {user.narratives_used_this_month}/{limit}
              </span>
            </div>
            <div className="w-full h-1 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  usagePct >= 100
                    ? 'bg-danger'
                    : usagePct >= 67
                    ? 'bg-warning'
                    : 'bg-accent'
                )}
                style={{ width: `${Math.min(usagePct, 100)}%` }}
              />
            </div>
            <Link
              href="/billing"
              className="flex items-center gap-1 text-2xs text-accent hover:text-accent-light transition-colors font-sans"
            >
              <ChevronUp className="w-3 h-3" />
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* Security note */}
        <div className="flex items-center gap-1.5 px-1">
          <Shield className="w-3 h-3 text-text-muted shrink-0" />
          <span className="text-2xs text-text-muted">
            Server-side encrypted
          </span>
        </div>
      </div>
    </aside>
  )
}
