'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

interface Settings {
  full_name: string
  institution_name: string
  role: string
  email: string
  plan: string
  usage_alerts: boolean
  billing_alerts: boolean
  product_updates: boolean
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-text-primary font-medium">{label}</p>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative shrink-0 w-9 h-5 rounded-full transition-colors',
          checked ? 'bg-accent' : 'bg-surface-elevated border border-border'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        setSettings(d)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load settings')
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: settings.full_name,
          institution_name: settings.institution_name,
          role: settings.role,
          usage_alerts: settings.usage_alerts,
          billing_alerts: settings.billing_alerts,
          product_updates: settings.product_updates,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }
    if (!confirm('Are you absolutely sure? This will permanently delete your account and all data. This cannot be undone.')) return

    setDeleteLoading(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      window.location.href = '/'
    } catch {
      toast.error('Account deletion failed. Please contact support.')
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted text-sm mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="card space-y-5">
        <div className="section-header">Profile</div>

        <div className="space-y-1">
          <label className="label">Full Name</label>
          <input
            type="text"
            className="input"
            value={settings.full_name}
            onChange={(e) => setSettings((s) => s ? { ...s, full_name: e.target.value } : s)}
          />
        </div>

        <div className="space-y-1">
          <label className="label">Email</label>
          <input
            type="email"
            className="input opacity-60 cursor-not-allowed"
            value={settings.email}
            disabled
          />
          <p className="text-2xs text-text-muted">
            Email is managed by your authentication provider (Clerk). Change it in your account settings.
          </p>
        </div>

        <div className="space-y-1">
          <label className="label">Institution Name</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Acme Credit Union"
            value={settings.institution_name}
            onChange={(e) => setSettings((s) => s ? { ...s, institution_name: e.target.value } : s)}
          />
        </div>

        <div className="space-y-1">
          <label className="label">Role</label>
          <div className="relative">
            <select
              className="select"
              value={settings.role}
              onChange={(e) => setSettings((s) => s ? { ...s, role: e.target.value } : s)}
            >
              <option value="AML Investigator">AML Investigator</option>
              <option value="Compliance Officer">Compliance Officer</option>
              <option value="Consultant">AML Consultant</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card space-y-5">
        <div className="section-header">Notification Preferences</div>

        <div className="space-y-4">
          <Toggle
            label="Usage alerts"
            description="Get notified when you're approaching your monthly narrative limit"
            checked={settings.usage_alerts}
            onChange={(v) => setSettings((s) => s ? { ...s, usage_alerts: v } : s)}
          />
          <div className="divider my-0" />
          <Toggle
            label="Billing alerts"
            description="Payment failures, upcoming renewals, and subscription changes"
            checked={settings.billing_alerts}
            onChange={(v) => setSettings((s) => s ? { ...s, billing_alerts: v } : s)}
          />
          <div className="divider my-0" />
          <Toggle
            label="Product updates"
            description="New features, improvements, and announcements"
            checked={settings.product_updates}
            onChange={(v) => setSettings((s) => s ? { ...s, product_updates: v } : s)}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Billing section */}
      <div className="card space-y-3">
        <div className="section-header">Billing</div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Current plan: <span className="font-semibold text-accent">{settings.plan.toUpperCase()}</span></p>
            <p className="text-xs text-text-muted mt-0.5">Manage your subscription, invoices, and payment methods.</p>
          </div>
          <Link href="/billing" className="btn-secondary text-sm">
            Manage Billing
          </Link>
        </div>
      </div>

      {/* Security */}
      <div className="card space-y-3">
        <div className="section-header">Security & Privacy</div>
        <div className="flex items-start gap-2 text-sm text-text-secondary">
          <Shield className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>Your narrative data is stored securely on encrypted servers.</p>
            <p className="text-text-muted text-xs">Statement files are parsed entirely in your browser — they are never uploaded to our servers.</p>
            <p className="text-text-muted text-xs">Analytics never include raw narrative content.</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-danger/30 space-y-4">
        <div className="section-header text-danger">Danger Zone</div>

        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">Delete Account</h3>
          <p className="text-xs text-text-muted mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
            Your narrative history, templates, and billing information will be removed.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="label">Type <span className="font-mono text-danger">DELETE</span> to confirm</label>
              <input
                type="text"
                className="input border-danger/30 focus:border-danger focus:ring-danger"
                placeholder="DELETE"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
              />
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteInput !== 'DELETE' || deleteLoading}
              className="btn-danger"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {deleteLoading ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
