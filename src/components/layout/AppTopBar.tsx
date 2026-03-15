'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { FilePlus2, ChevronRight } from 'lucide-react'
import type { User } from '@/types'

interface AppTopBarProps {
  user: User
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/generate': 'Generate',
  '/history': 'History',
  '/templates': 'Templates',
  '/billing': 'Billing',
  '/settings': 'Settings',
}

export function AppTopBar({ user }: AppTopBarProps) {
  const pathname = usePathname()

  // Build breadcrumb
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = `/${segments[0]}`
  const label = ROUTE_LABELS[firstSegment] || segments[0]
  const isSubPage = segments.length > 1

  return (
    <header className="h-[var(--topbar-height)] bg-surface border-b border-border flex items-center justify-between px-5 shrink-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm font-sans">
        <span className="text-text-muted">NarrateAML</span>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-text-primary font-medium capitalize">
          {label}
        </span>
        {isSubPage && segments[1] && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-text-muted text-xs font-mono">
              {segments[1].slice(0, 8).toUpperCase()}
            </span>
          </>
        )}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Quick generate CTA */}
        <Link href="/generate" className="btn-primary py-2 text-xs hidden sm:inline-flex">
          <FilePlus2 className="w-3.5 h-3.5" />
          New Narrative
        </Link>

        {/* Clerk UserButton */}
        <UserButton
          appearance={{
            variables: {
              colorBackground: '#111827',
              colorText: '#F8FAFC',
              colorPrimary: '#C9A84C',
            },
            elements: {
              userButtonAvatarBox: 'w-8 h-8',
              userButtonPopoverCard: 'bg-surface border border-border shadow-surface-lg',
              userButtonPopoverActionButton: 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated',
            },
          }}
        />
      </div>
    </header>
  )
}
