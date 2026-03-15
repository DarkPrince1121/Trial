'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Copy,
  FileText,
  FileDown,
  Trash2,
  Lock,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { Narrative, Plan } from '@/types'
import { PLAN_FEATURES } from '@/types'

interface NarrativeRowActionsProps {
  narrative: Narrative
  userPlan: Plan
}

export function NarrativeRowActions({ narrative, userPlan }: NarrativeRowActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const canExport = PLAN_FEATURES[userPlan].export

  async function handleCopy() {
    if (!narrative.narrative_text) {
      toast.error('No narrative text to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(narrative.narrative_text)
      toast.success('Narrative copied to clipboard')
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  async function handleExport(format: 'docx' | 'pdf') {
    if (!canExport) {
      toast.error('Export is available on the Pro plan. Upgrade to continue.')
      return
    }

    setLoading(format)
    try {
      const res = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrativeId: narrative.id }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Export failed')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const subject = narrative.subject_name?.replace(/\s+/g, '_') || 'STR'
      const date = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `STR_Narrative_${subject}_${date}.${format}`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Exported as ${format.toUpperCase()}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this narrative? This cannot be undone.')) return

    setLoading('delete')
    try {
      const res = await fetch(`/api/history/${narrative.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Delete failed')
      }
      toast.success('Narrative deleted')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-accent',
            loading && 'opacity-50 cursor-wait'
          )}
          disabled={!!loading}
          aria-label="Narrative actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[180px] bg-surface border border-border rounded-lg shadow-surface-lg py-1',
            'animate-fade-in'
          )}
          sideOffset={4}
          align="end"
        >
          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated cursor-pointer outline-none transition-colors"
            onSelect={handleCopy}
          >
            <Copy className="w-3.5 h-3.5" />
            Copy text
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer outline-none transition-colors',
              canExport
                ? 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                : 'text-text-muted cursor-default opacity-60'
            )}
            onSelect={() => canExport && handleExport('docx')}
            disabled={!canExport || loading === 'docx'}
          >
            {canExport ? <FileText className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {loading === 'docx' ? 'Exporting...' : 'Export DOCX'}
            {!canExport && (
              <span className="ml-auto badge plan-badge-pro text-2xs">Pro</span>
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer outline-none transition-colors',
              canExport
                ? 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                : 'text-text-muted cursor-default opacity-60'
            )}
            onSelect={() => canExport && handleExport('pdf')}
            disabled={!canExport || loading === 'pdf'}
          >
            {canExport ? <FileDown className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {loading === 'pdf' ? 'Exporting...' : 'Export PDF'}
            {!canExport && (
              <span className="ml-auto badge plan-badge-pro text-2xs">Pro</span>
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 border-t border-border" />

          <DropdownMenu.Item
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 cursor-pointer outline-none transition-colors"
            onSelect={handleDelete}
            disabled={loading === 'delete'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {loading === 'delete' ? 'Deleting...' : 'Delete'}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
