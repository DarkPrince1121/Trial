'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Copy,
  FileText,
  FileDown,
  Trash2,
  Save,
  AlertTriangle,
  Lock,
  Edit3,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { Narrative, ReadinessStatus, Plan } from '@/types'
import { format } from 'date-fns'

const STATUS_OPTIONS: ReadinessStatus[] = ['draft', 'edited', 'exported', 'archived']

export default function NarrativeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [narrative, setNarrative] = useState<Narrative | null>(null)
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<Plan>('free')
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exportLoading, setExportLoading] = useState<'docx' | 'pdf' | null>(null)

  const canExport = userPlan === 'pro' || userPlan === 'team' || userPlan === 'lifetime'

  useEffect(() => {
    Promise.all([
      fetch(`/api/history/${id}`).then((r) => r.json()),
      fetch('/api/usage').then((r) => r.json()),
    ]).then(([narrativeData, usageData]) => {
      if (narrativeData.error) {
        toast.error(narrativeData.error)
        router.push('/history')
        return
      }
      setNarrative(narrativeData)
      setEditText(narrativeData.narrative_text || '')
      setUserPlan(usageData.plan || 'free')
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load narrative')
      setLoading(false)
    })
  }, [id, router])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsaved])

  async function handleSave() {
    if (!narrative) return
    setSaving(true)
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative_text: editText,
          readiness_status: 'edited',
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const updated = await res.json()
      setNarrative(updated)
      setHasUnsaved(false)
      setIsEditing(false)
      toast.success('Narrative saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status: ReadinessStatus) {
    if (!narrative) return
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readiness_status: status }),
      })
      if (!res.ok) throw new Error()
      setNarrative((n) => n ? { ...n, readiness_status: status } : n)
      toast.success(`Status updated to ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function handleExport(format: 'docx' | 'pdf') {
    if (!canExport || !narrative) return
    setExportLoading(format)
    try {
      const res = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrativeId: id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExportLoading(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this narrative? This cannot be undone.')) return
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' })
      toast.success('Narrative deleted')
      router.push('/history')
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!narrative) return null

  const formData = narrative.form_data

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/history" className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to History
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-text-primary">
            {narrative.subject_name || 'Unnamed Narrative'}
          </h1>
          <p className="text-text-muted text-xs mt-1 font-mono">
            {format(new Date(narrative.created_at), 'MMMM d, yyyy HH:mm')} ·{' '}
            ID: {narrative.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status selector */}
          <select
            value={narrative.readiness_status}
            onChange={(e) => handleStatusChange(e.target.value as ReadinessStatus)}
            className={cn(
              'text-xs border rounded px-2 py-1.5 bg-surface-variant font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent',
              narrative.readiness_status === 'draft' && 'border-border text-text-muted',
              narrative.readiness_status === 'edited' && 'border-warning/40 text-warning',
              narrative.readiness_status === 'exported' && 'border-success/40 text-success',
              narrative.readiness_status === 'archived' && 'border-border text-text-muted'
            )}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {narrative.word_count && (
            <span className="badge badge-muted font-mono">{narrative.word_count} words</span>
          )}

          <button
            onClick={async () => {
              await navigator.clipboard.writeText(narrative.narrative_text || '')
              toast.success('Copied to clipboard')
            }}
            className="btn-ghost py-1.5 text-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>

          <button
            onClick={() => handleExport('docx')}
            disabled={!canExport || exportLoading === 'docx'}
            className={cn('btn-ghost py-1.5 text-xs', !canExport && 'opacity-50')}
            title={!canExport ? 'Pro required' : ''}
          >
            {!canExport ? <Lock className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {exportLoading === 'docx' ? '...' : 'DOCX'}
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={!canExport || exportLoading === 'pdf'}
            className={cn('btn-ghost py-1.5 text-xs', !canExport && 'opacity-50')}
            title={!canExport ? 'Pro required' : ''}
          >
            {!canExport ? <Lock className="w-3.5 h-3.5" /> : <FileDown className="w-3.5 h-3.5" />}
            {exportLoading === 'pdf' ? '...' : 'PDF'}
          </button>

          <button
            onClick={handleDelete}
            className="btn-ghost py-1.5 text-xs text-danger hover:text-danger"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI warning */}
      <div className="ai-warning-banner">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
      </div>

      {/* Summary card */}
      {formData && (
        <div className="card">
          <div className="section-header">Case Details</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
            {formData.transactionType && (
              <div>
                <div className="text-text-muted text-xs">Transaction Type</div>
                <div className="text-text-primary">{formData.transactionType}</div>
              </div>
            )}
            {narrative.transaction_amount && (
              <div>
                <div className="text-text-muted text-xs">Amount</div>
                <div className="text-text-primary font-mono">
                  {narrative.transaction_currency}{' '}
                  {narrative.transaction_amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
            {formData.reportingPeriodStart && (
              <div>
                <div className="text-text-muted text-xs">Reporting Period</div>
                <div className="text-text-primary">
                  {formData.reportingPeriodStart} — {formData.reportingPeriodEnd || 'Present'}
                </div>
              </div>
            )}
            {formData.jurisdiction && (
              <div>
                <div className="text-text-muted text-xs">Jurisdiction</div>
                <div className="text-text-primary">{formData.jurisdiction}</div>
              </div>
            )}
            {formData.redFlags && formData.redFlags.length > 0 && (
              <div className="col-span-2 md:col-span-3">
                <div className="text-text-muted text-xs mb-1.5">Red Flags</div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.redFlags.map((f: string) => (
                    <span key={f} className="badge badge-warning text-2xs">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Narrative text */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="section-header mb-0">Narrative Text</div>
          <div className="flex gap-2">
            {hasUnsaved && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary py-1.5 text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button
              onClick={() => {
                if (isEditing && hasUnsaved) {
                  if (!confirm('Discard changes?')) return
                  setEditText(narrative.narrative_text || '')
                  setHasUnsaved(false)
                }
                setIsEditing((v) => !v)
              }}
              className={cn(
                'btn-ghost py-1.5 text-xs',
                isEditing && 'bg-accent/10 text-accent border border-accent/30'
              )}
            >
              {isEditing ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Done</>
              ) : (
                <><Edit3 className="w-3.5 h-3.5" /> Edit</>
              )}
            </button>
          </div>
        </div>

        {isEditing ? (
          <textarea
            className="textarea w-full min-h-[300px] text-sm leading-relaxed"
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value)
              setHasUnsaved(true)
            }}
            autoFocus
          />
        ) : (
          <div className="font-sans text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
            {narrative.narrative_text || <span className="text-text-muted italic">No narrative text</span>}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-text-muted text-center font-sans">
        AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
        NarrateAML does not provide legal advice.
      </p>
    </div>
  )
}
