'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Trash2,
  ArrowUpRight,
  BookTemplate,
  Share2,
  Lock,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { Template, Plan } from '@/types'
import { format } from 'date-fns'

interface CreateTemplateModal {
  open: boolean
  name: string
  description: string
  isShared: boolean
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState<Plan>('free')
  const [modal, setModal] = useState<CreateTemplateModal>({
    open: false,
    name: '',
    description: '',
    isShared: false,
  })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const canUseTemplates = userPlan !== 'free'
  const canShare = userPlan === 'team'

  useEffect(() => {
    Promise.all([
      fetch('/api/templates').then((r) => r.json()),
      fetch('/api/usage').then((r) => r.json()),
    ]).then(([tmplData, usageData]) => {
      setTemplates(tmplData.templates || [])
      setUserPlan(usageData.plan || 'free')
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load templates')
      setLoading(false)
    })
  }, [])

  async function handleCreate() {
    if (!modal.name.trim()) return
    setCreating(true)
    try {
      // Get current form state from localStorage if available
      let formData = {}
      try {
        const saved = localStorage.getItem('narrateaml_draft_form')
        if (saved) formData = JSON.parse(saved)
      } catch {}

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modal.name,
          description: modal.description,
          formData,
          isShared: modal.isShared,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create template')
      }
      const created = await res.json()
      setTemplates((t) => [created.template, ...t])
      setModal({ open: false, name: '', description: '', isShared: false })
      toast.success('Template saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create template')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setTemplates((t) => t.filter((tmpl) => tmpl.id !== id))
      toast.success('Template deleted')
    } catch {
      toast.error('Failed to delete template')
    } finally {
      setDeleting(null)
    }
  }

  function handleUseTemplate(template: Template) {
    // Save template form_data to localStorage, then navigate to generate
    try {
      localStorage.setItem('narrateaml_draft_form', JSON.stringify(template.form_data))
    } catch {}
    toast.success(`Template "${template.name}" loaded`)
    router.push('/generate')
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Templates
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Save frequently used form configurations and reload them instantly.
          </p>
        </div>
        {canUseTemplates ? (
          <button
            onClick={() => setModal((m) => ({ ...m, open: true }))}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        ) : (
          <div className="text-right">
            <button className="btn-secondary opacity-60 cursor-default" disabled>
              <Lock className="w-4 h-4" />
              New Template
            </button>
            <p className="text-2xs text-text-muted mt-1">Pro plan required</p>
          </div>
        )}
      </div>

      {/* Free plan upgrade prompt */}
      {!canUseTemplates && (
        <div className="card border-accent/20 bg-accent/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-bold text-text-primary mb-1">
                Templates require Pro
              </h3>
              <p className="text-text-muted text-sm">
                Save and reuse form configurations. Available on Pro and Team plans.
              </p>
            </div>
            <Link href="/billing" className="btn-primary shrink-0 text-sm">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* Templates grid */}
      {templates.length === 0 ? (
        <div className="card py-16 text-center">
          <BookTemplate className="w-10 h-10 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="font-display text-lg font-bold text-text-primary mb-2">
            No templates yet
          </h3>
          <p className="text-text-muted text-sm max-w-xs mx-auto mb-4">
            {canUseTemplates
              ? 'Save your current form configuration as a template to reuse it later. Go to Generate, fill in your common fields, then save as template.'
              : 'Upgrade to Pro to create and save reusable templates.'}
          </p>
          {canUseTemplates ? (
            <Link href="/generate" className="btn-secondary inline-flex">
              Go to Generate
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link href="/billing" className="btn-primary inline-flex">
              Upgrade to Pro
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="card-elevated flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-text-primary text-sm truncate">
                      {t.name}
                    </h3>
                    {t.is_shared && (
                      <span className="badge badge-accent text-2xs shrink-0">
                        <Share2 className="w-2.5 h-2.5" />
                        Shared
                      </span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-text-muted text-xs mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-2xs text-text-muted font-mono">
                Created {format(new Date(t.created_at), 'MMM d, yyyy')}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
                <button
                  onClick={() => handleUseTemplate(t)}
                  className="btn-primary flex-1 py-1.5 text-xs"
                >
                  Use Template
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                  className="btn-ghost py-1.5 px-2 text-danger hover:text-danger"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-surface border border-border rounded-xl shadow-surface-lg w-full max-w-md p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-text-primary">
              Save as Template
            </h2>
            <p className="text-sm text-text-muted">
              This will save the current form state from the Generate page.
            </p>

            <div className="space-y-1">
              <label className="label">Template Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Cash structuring — individual"
                value={modal.name}
                onChange={(e) => setModal((m) => ({ ...m, name: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="label">Description (optional)</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="Brief description of when to use this template"
                value={modal.description}
                onChange={(e) => setModal((m) => ({ ...m, description: e.target.value }))}
              />
            </div>

            {canShare && (
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors',
                    modal.isShared ? 'bg-accent' : 'bg-surface-elevated border border-border'
                  )}
                  onClick={() => setModal((m) => ({ ...m, isShared: !m.isShared }))}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      modal.isShared ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </div>
                <span className="text-sm text-text-secondary">
                  Share with team members
                </span>
              </label>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal({ open: false, name: '', description: '', isShared: false })}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!modal.name.trim() || creating}
                className="btn-primary flex-1"
              >
                {creating ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
