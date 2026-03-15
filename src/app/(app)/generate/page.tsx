'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronDown,
  Copy,
  FileText,
  FileDown,
  RefreshCcw,
  Trash2,
  Save,
  AlertTriangle,
  X,
  CheckCircle2,
  Lock,
  RotateCcw,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  DEFAULT_FORM_DATA,
  RED_FLAGS,
  type STRFormData,
  type ReadinessStatus,
  type Plan,
} from '@/types'
import { PLAN_FEATURES } from '@/types'

// ── Constants ────────────────────────────────────────────────

const LOCALSTORAGE_KEY = 'narrateaml_draft_form'
const TABS = [
  { id: 'subject', label: 'Subject' },
  { id: 'transaction', label: 'Transaction' },
  { id: 'period', label: 'Period & Pattern' },
  { id: 'redflags', label: 'Red Flags' },
  { id: 'history', label: 'History & Context' },
  { id: 'settings', label: 'Settings' },
] as const

type TabId = typeof TABS[number]['id']

// ── Sub-components ────────────────────────────────────────────

function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="label">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-2xs text-text-muted">{hint}</p>}
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select pr-8"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={cn(
          'relative w-9 h-5 rounded-full transition-colors duration-200',
          checked ? 'bg-accent' : 'bg-surface-elevated border border-border'
        )}
        onClick={() => onChange(!checked)}
      >
        <div
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </div>
      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors select-none">
        {label}
      </span>
    </label>
  )
}

// ── Main Page ────────────────────────────────────────────────

export default function GeneratePage() {
  const router = useRouter()
  const [userPlan, setUserPlan] = useState<Plan>('free')
  const [activeTab, setActiveTab] = useState<TabId>('subject')
  const [form, setForm] = useState<STRFormData>(DEFAULT_FORM_DATA)
  const [narrativeText, setNarrativeText] = useState('')
  const [narrativeId, setNarrativeId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>('draft')
  const [revisionMode, setRevisionMode] = useState(false)
  const [revisionInstructions, setRevisionInstructions] = useState('')
  const [exportLoading, setExportLoading] = useState<'docx' | 'pdf' | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canExport = PLAN_FEATURES[userPlan].export
  const canRevise = PLAN_FEATURES[userPlan].revisionMode

  // Load plan
  useEffect(() => {
    fetch('/api/usage')
      .then((r) => r.json())
      .then((d) => setUserPlan(d.plan || 'free'))
      .catch(() => {})
  }, [])

  // Load saved draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm((f) => ({ ...f, ...parsed }))
      }
    } catch {}
  }, [])

  // Autosave to localStorage with debounce
  const scheduleAutosave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(form))
      } catch {}
    }, 1000)
  }, [form])

  useEffect(() => {
    scheduleAutosave()
  }, [scheduleAutosave])

  // Warn on unsaved edits
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedEdits) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedEdits])

  function updateForm(patch: Partial<STRFormData>) {
    setForm((f) => ({ ...f, ...patch }))
  }

  function toggleRedFlag(flag: (typeof RED_FLAGS)[number]) {
    setForm((f) => {
      const existing = f.redFlags
      if (existing.includes(flag)) {
        return { ...f, redFlags: existing.filter((r) => r !== flag) }
      }
      return { ...f, redFlags: [...existing, flag] }
    })
  }

  const canGenerate =
    form.subjectName.trim().length > 0 && form.transactionAmount.trim().length > 0

  async function handleGenerate(isRevision = false) {
    if (!canGenerate || isGenerating) return

    setIsGenerating(true)
    setNarrativeText('')
    setNarrativeId(null)
    setWordCount(0)
    setReadinessStatus('draft')
    setHasUnsavedEdits(false)

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: {
            ...form,
            revisionInstructions: isRevision ? revisionInstructions : undefined,
          },
          mode: 'manual',
          revisionNarrativeId: isRevision ? narrativeId : undefined,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }

      if (!res.body) throw new Error('No stream body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'id') {
              setNarrativeId(event.narrativeId)
            } else if (event.type === 'chunk') {
              setNarrativeText((t) => t + event.text)
              // Scroll output to bottom
              if (outputRef.current) {
                outputRef.current.scrollTop = outputRef.current.scrollHeight
              }
            } else if (event.type === 'done') {
              setWordCount(event.wordCount || 0)
              setIsGenerating(false)
            } else if (event.type === 'error') {
              throw new Error(event.message)
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        toast.info('Generation cancelled')
      } else {
        toast.error(err instanceof Error ? err.message : 'Generation failed')
      }
      setIsGenerating(false)
    }

    setRevisionMode(false)
    setRevisionInstructions('')
  }

  function handleCancel() {
    abortRef.current?.abort()
    setIsGenerating(false)
  }

  async function handleExport(format: 'docx' | 'pdf') {
    if (!canExport) {
      toast.error('Export is available on Pro plan. Upgrade to continue.')
      return
    }
    if (!narrativeId) return

    setExportLoading(format)
    try {
      const res = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrativeId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const subject = form.subjectName.replace(/\s+/g, '_')
      const date = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `STR_Narrative_${subject}_${date}.${format}`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Exported as ${format.toUpperCase()}`)
      setReadinessStatus('exported')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExportLoading(null)
    }
  }

  async function handleSaveEdits() {
    if (!narrativeId) return
    try {
      const res = await fetch(`/api/history/${narrativeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrative_text: narrativeText,
          readiness_status: 'edited',
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setHasUnsavedEdits(false)
      setReadinessStatus('edited')
      setIsEditing(false)
      toast.success('Changes saved')
    } catch {
      toast.error('Failed to save changes')
    }
  }

  async function handleDelete() {
    if (!narrativeId) return
    if (!confirm('Delete this narrative draft?')) return
    try {
      await fetch(`/api/history/${narrativeId}`, { method: 'DELETE' })
      setNarrativeText('')
      setNarrativeId(null)
      toast.success('Narrative deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  function handleReset() {
    if (!confirm('Reset form to defaults? Current draft will be cleared.')) return
    setForm(DEFAULT_FORM_DATA)
    setNarrativeText('')
    setNarrativeId(null)
    setHasUnsavedEdits(false)
    localStorage.removeItem(LOCALSTORAGE_KEY)
    toast.info('Form reset')
  }

  // ── Render form sections ────────────────────────────────────

  function renderSubjectSection() {
    return (
      <div className="space-y-4">
        <FormField label="Subject Full Legal Name" required>
          <input
            type="text"
            className={cn('input', !form.subjectName && 'border-warning/40')}
            placeholder="e.g. John Alexander Smith"
            value={form.subjectName}
            onChange={(e) => updateForm({ subjectName: e.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Subject Type">
            <Select
              value={form.subjectType}
              onChange={(v) => updateForm({ subjectType: v as STRFormData['subjectType'] })}
              options={['Individual', 'Business', 'Unknown']}
              placeholder="Select type"
            />
          </FormField>
          <FormField label="Date of Birth / Registration">
            <input
              type="date"
              className="input"
              value={form.dateOfBirthOrRegistration}
              onChange={(e) => updateForm({ dateOfBirthOrRegistration: e.target.value })}
            />
          </FormField>
        </div>

        <FormField label="Account Number(s)" hint="Separate multiple accounts with commas">
          <input
            type="text"
            className="input"
            placeholder="e.g. 1234567, 8901234"
            value={form.accountNumbers}
            onChange={(e) => updateForm({ accountNumbers: e.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Account Type">
            <Select
              value={form.accountType}
              onChange={(v) => updateForm({ accountType: v as STRFormData['accountType'] })}
              options={['Chequing', 'Savings', 'Business', 'Investment', 'Multiple']}
              placeholder="Select type"
            />
          </FormField>
          <FormField label="Client Since">
            <input
              type="date"
              className="input"
              value={form.clientSince}
              onChange={(e) => updateForm({ clientSince: e.target.value })}
            />
          </FormField>
        </div>

        <FormField label="Occupation / Business Type">
          <input
            type="text"
            className="input"
            placeholder="e.g. Construction contractor"
            value={form.occupationOrBusinessType}
            onChange={(e) => updateForm({ occupationOrBusinessType: e.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Country of Residence">
            <input
              type="text"
              className="input"
              value={form.countryOfResidence}
              onChange={(e) => updateForm({ countryOfResidence: e.target.value })}
            />
          </FormField>
          <FormField label="PEP / HIO Status">
            <Select
              value={form.pepStatus}
              onChange={(v) => updateForm({ pepStatus: v as STRFormData['pepStatus'] })}
              options={['Yes', 'No', 'Unknown']}
              placeholder="Select status"
            />
          </FormField>
        </div>
      </div>
    )
  }

  function renderTransactionSection() {
    return (
      <div className="space-y-4">
        <FormField label="Transaction Type">
          <Select
            value={form.transactionType}
            onChange={(v) => updateForm({ transactionType: v as STRFormData['transactionType'] })}
            options={[
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
            ]}
            placeholder="Select type"
          />
        </FormField>

        <FormField label="Transaction Date">
          <input
            type="date"
            className="input"
            value={form.transactionDate}
            onChange={(e) => updateForm({ transactionDate: e.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Transaction Amount" required>
            <input
              type="text"
              className={cn('input', !form.transactionAmount && 'border-warning/40')}
              placeholder="e.g. 9500.00"
              value={form.transactionAmount}
              onChange={(e) => updateForm({ transactionAmount: e.target.value })}
            />
          </FormField>
          <FormField label="Currency">
            <Select
              value={form.currency}
              onChange={(v) => updateForm({ currency: v as STRFormData['currency'] })}
              options={['CAD', 'USD', 'EUR', 'GBP', 'Other']}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Counterparty Name">
            <input
              type="text"
              className="input"
              placeholder="Individual or business name"
              value={form.counterpartyName}
              onChange={(e) => updateForm({ counterpartyName: e.target.value })}
            />
          </FormField>
          <FormField label="Counterparty Institution">
            <input
              type="text"
              className="input"
              placeholder="e.g. TD Bank, Interac"
              value={form.counterpartyInstitution}
              onChange={(e) => updateForm({ counterpartyInstitution: e.target.value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Counterparty Country">
            <input
              type="text"
              className="input"
              placeholder="e.g. Canada, China"
              value={form.counterpartyCountry}
              onChange={(e) => updateForm({ counterpartyCountry: e.target.value })}
            />
          </FormField>
          <FormField label="Transaction Reference">
            <input
              type="text"
              className="input"
              placeholder="Wire ref, cheque #, etc."
              value={form.transactionReference}
              onChange={(e) => updateForm({ transactionReference: e.target.value })}
            />
          </FormField>
        </div>

        <FormField label="Disposition of Funds">
          <textarea
            className="textarea"
            rows={2}
            placeholder="e.g. Funds transferred to offshore account"
            value={form.dispositionOfFunds}
            onChange={(e) => updateForm({ dispositionOfFunds: e.target.value })}
          />
        </FormField>
      </div>
    )
  }

  function renderPeriodSection() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Reporting Period Start">
            <input
              type="date"
              className="input"
              value={form.reportingPeriodStart}
              onChange={(e) => updateForm({ reportingPeriodStart: e.target.value })}
            />
          </FormField>
          <FormField label="Reporting Period End">
            <input
              type="date"
              className="input"
              value={form.reportingPeriodEnd}
              onChange={(e) => updateForm({ reportingPeriodEnd: e.target.value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Total Transactions in Period">
            <input
              type="number"
              className="input"
              placeholder="e.g. 14"
              value={form.totalTransactionsInPeriod}
              onChange={(e) => updateForm({ totalTransactionsInPeriod: e.target.value })}
            />
          </FormField>
          <FormField label="Total Dollar Value in Period">
            <input
              type="text"
              className="input"
              placeholder="e.g. 47500.00"
              value={form.totalDollarValueInPeriod}
              onChange={(e) => updateForm({ totalDollarValueInPeriod: e.target.value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Frequency Pattern">
            <Select
              value={form.transactionFrequency}
              onChange={(v) => updateForm({ transactionFrequency: v as STRFormData['transactionFrequency'] })}
              options={['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Irregular']}
              placeholder="Select frequency"
            />
          </FormField>
          <FormField label="Direction of Funds">
            <Select
              value={form.patternDirection}
              onChange={(v) => updateForm({ patternDirection: v as STRFormData['patternDirection'] })}
              options={['Incoming', 'Outgoing', 'Both']}
              placeholder="Select direction"
            />
          </FormField>
        </div>
      </div>
    )
  }

  function renderRedFlagsSection() {
    const count = form.redFlags.length
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="label mb-0">
            Red Flags
            {count > 0 && (
              <span className="ml-2 badge badge-warning">{count} selected</span>
            )}
          </div>
          {count > 0 && (
            <button
              type="button"
              onClick={() => updateForm({ redFlags: [] })}
              className="text-xs text-text-muted hover:text-danger transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {RED_FLAGS.map((flag) => {
            const active = form.redFlags.includes(flag)
            return (
              <button
                key={flag}
                type="button"
                onClick={() => toggleRedFlag(flag)}
                className={cn(
                  'px-2.5 py-1.5 rounded text-xs font-sans border transition-all duration-150',
                  active
                    ? 'bg-warning/15 border-warning/40 text-warning'
                    : 'bg-surface-variant border-border text-text-muted hover:border-accent/40 hover:text-text-secondary'
                )}
              >
                {active && <span className="mr-1">✓</span>}
                {flag}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  function renderHistorySection() {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <Toggle
            label="Prior STR filed"
            checked={form.priorSTRFiled}
            onChange={(v) => updateForm({ priorSTRFiled: v })}
          />
          {form.priorSTRFiled && (
            <div className="pl-4 space-y-3 border-l-2 border-accent/30">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Prior STR Date">
                  <input
                    type="date"
                    className="input"
                    value={form.priorSTRDate}
                    onChange={(e) => updateForm({ priorSTRDate: e.target.value })}
                  />
                </FormField>
                <FormField label="Case Reference">
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. STR-2024-0042"
                    value={form.priorSTRCaseReference}
                    onChange={(e) => updateForm({ priorSTRCaseReference: e.target.value })}
                  />
                </FormField>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Toggle
            label="Prior internal SARs / alerts"
            checked={form.priorInternalAlerts}
            onChange={(v) => updateForm({ priorInternalAlerts: v })}
          />
          {form.priorInternalAlerts && (
            <div className="pl-4 border-l-2 border-accent/30">
              <FormField label="Alert details">
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Describe prior alerts or internal case history"
                  value={form.priorInternalAlertsDetails}
                  onChange={(e) => updateForm({ priorInternalAlertsDetails: e.target.value })}
                />
              </FormField>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Toggle
            label="Client explanation provided"
            checked={form.clientExplanationProvided}
            onChange={(v) => updateForm({ clientExplanationProvided: v })}
          />
          {form.clientExplanationProvided && (
            <div className="pl-4 border-l-2 border-accent/30">
              <FormField label="Client explanation">
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Summarize what the client stated"
                  value={form.clientExplanation}
                  onChange={(e) => updateForm({ clientExplanation: e.target.value })}
                />
              </FormField>
            </div>
          )}
        </div>

        <FormField label="OSINT / Open Source Findings">
          <textarea
            className="textarea"
            rows={3}
            placeholder="Any open-source intelligence findings"
            value={form.osintFindings}
            onChange={(e) => updateForm({ osintFindings: e.target.value })}
          />
        </FormField>

        <FormField
          label="Investigator Notes"
          hint={`${form.investigatorNotes.length}/3000 characters`}
        >
          <textarea
            className="textarea"
            rows={4}
            placeholder="Additional context, observations, or investigator analysis (high priority — included prominently in narrative)"
            maxLength={3000}
            value={form.investigatorNotes}
            onChange={(e) => updateForm({ investigatorNotes: e.target.value })}
          />
        </FormField>
      </div>
    )
  }

  function renderSettingsSection() {
    return (
      <div className="space-y-4">
        <FormField label="Narrative Tone">
          <Select
            value={form.narrativeTone}
            onChange={(v) => updateForm({ narrativeTone: v as STRFormData['narrativeTone'] })}
            options={['Formal', 'Detailed', 'Concise']}
          />
        </FormField>

        <FormField label="Target Length">
          <Select
            value={form.narrativeLength}
            onChange={(v) => updateForm({ narrativeLength: v as STRFormData['narrativeLength'] })}
            options={['Short', 'Standard', 'Detailed']}
          />
          <div className="text-2xs text-text-muted mt-1 font-mono">
            Short ~200 words · Standard ~400 words · Detailed ~600 words
          </div>
        </FormField>

        <FormField label="Jurisdiction">
          <Select
            value={form.jurisdiction}
            onChange={(v) => updateForm({ jurisdiction: v as STRFormData['jurisdiction'] })}
            options={['FINTRAC — Canada', 'FinCEN — USA', 'Other']}
          />
        </FormField>

        <div className="space-y-3 pt-2">
          <Toggle
            label="Include regulator-specific language"
            checked={form.includeRegulatoryLanguage}
            onChange={(v) => updateForm({ includeRegulatoryLanguage: v })}
          />
          <Toggle
            label="Add reviewer caution note"
            checked={form.addReviewerCautionNote}
            onChange={(v) => updateForm({ addReviewerCautionNote: v })}
          />
        </div>
      </div>
    )
  }

  const sectionMap: Record<TabId, React.ReactNode> = {
    subject: renderSubjectSection(),
    transaction: renderTransactionSection(),
    period: renderPeriodSection(),
    redflags: renderRedFlagsSection(),
    history: renderHistorySection(),
    settings: renderSettingsSection(),
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* Form panel */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col border-r border-border overflow-hidden">
        {/* Form header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
          <h1 className="font-display text-base font-bold text-text-primary">
            STR Narrative Form
          </h1>
          <button
            onClick={handleReset}
            className="btn-ghost py-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-surface shrink-0 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-xs font-sans font-medium whitespace-nowrap transition-colors border-b-2',
                activeTab === tab.id
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-transparent text-text-muted hover:text-text-secondary'
              )}
            >
              {tab.label}
              {tab.id === 'redflags' && form.redFlags.length > 0 && (
                <span className="ml-1.5 badge badge-warning py-0 px-1">
                  {form.redFlags.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {sectionMap[activeTab]}
        </div>

        {/* Generate button */}
        <div className="px-5 py-4 border-t border-border bg-surface shrink-0">
          {!canGenerate && (
            <p className="text-xs text-warning mb-2">
              Subject name and transaction amount are required.
            </p>
          )}
          <button
            onClick={() => handleGenerate(false)}
            disabled={!canGenerate || isGenerating}
            className="btn-primary w-full"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Narrative
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output panel */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        {/* Output header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-base font-bold text-text-primary">
              Narrative Draft
            </h2>
            {wordCount > 0 && (
              <span className="badge badge-muted font-mono">
                {wordCount} words
              </span>
            )}
            {narrativeText && (
              <span
                className={cn(
                  'badge text-2xs',
                  readinessStatus === 'draft' && 'badge-muted',
                  readinessStatus === 'edited' && 'badge-warning',
                  readinessStatus === 'exported' && 'badge-success'
                )}
              >
                {readinessStatus}
              </span>
            )}
          </div>

          {narrativeText && !isGenerating && (
            <div className="flex items-center gap-1.5">
              {hasUnsavedEdits && (
                <button onClick={handleSaveEdits} className="btn-secondary py-1.5 text-xs">
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              )}
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(narrativeText)
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
                className={cn(
                  'btn-ghost py-1.5 text-xs',
                  !canExport && 'opacity-50'
                )}
                title={!canExport ? 'Pro plan required' : 'Export to DOCX'}
              >
                {!canExport && <Lock className="w-3.5 h-3.5" />}
                {exportLoading === 'docx' ? '...' : <FileText className="w-3.5 h-3.5" />}
                DOCX
              </button>

              <button
                onClick={() => handleExport('pdf')}
                disabled={!canExport || exportLoading === 'pdf'}
                className={cn(
                  'btn-ghost py-1.5 text-xs',
                  !canExport && 'opacity-50'
                )}
                title={!canExport ? 'Pro plan required' : 'Export to PDF'}
              >
                {!canExport && <Lock className="w-3.5 h-3.5" />}
                {exportLoading === 'pdf' ? '...' : <FileDown className="w-3.5 h-3.5" />}
                PDF
              </button>

              <button
                onClick={() => handleGenerate(false)}
                className="btn-ghost py-1.5 text-xs"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Regenerate
              </button>

              <button
                onClick={handleDelete}
                className="btn-ghost py-1.5 text-xs text-danger hover:text-danger"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isGenerating && (
            <button onClick={handleCancel} className="btn-ghost py-1.5 text-xs text-danger">
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
        </div>

        {/* AI warning */}
        <div className="ai-warning-banner rounded-none border-x-0 border-t-0 shrink-0 px-5 py-2.5 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.
        </div>

        {/* Output content */}
        <div
          ref={outputRef}
          className="flex-1 overflow-y-auto scrollbar-thin p-6"
        >
          {!narrativeText && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-text-muted">
              <div className="text-5xl opacity-30">📋</div>
              <div>
                <p className="font-display text-lg font-semibold text-text-secondary mb-1">
                  Your narrative will appear here
                </p>
                <p className="text-sm max-w-xs mx-auto">
                  Fill in subject name and transaction amount, then click Generate.
                </p>
              </div>
            </div>
          )}

          {(narrativeText || isGenerating) && (
            <div className="space-y-6">
              <div
                className={cn(
                  'font-sans text-sm leading-relaxed text-text-primary whitespace-pre-wrap',
                  isEditing && 'hidden'
                )}
              >
                {narrativeText}
                {isGenerating && <span className="streaming-cursor" />}
              </div>

              {isEditing && !isGenerating && (
                <textarea
                  className="textarea w-full min-h-[400px] text-sm leading-relaxed"
                  value={narrativeText}
                  onChange={(e) => {
                    setNarrativeText(e.target.value)
                    setHasUnsavedEdits(true)
                  }}
                  autoFocus
                />
              )}
            </div>
          )}
        </div>

        {/* Revision mode + edit toggle */}
        {narrativeText && !isGenerating && (
          <div className="px-5 py-3 border-t border-border bg-surface shrink-0 space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing((v) => !v)
                }}
                className={cn(
                  'btn-ghost py-1.5 text-xs',
                  isEditing && 'bg-accent/10 text-accent border border-accent/30'
                )}
              >
                {isEditing ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Done Editing</>
                ) : (
                  'Edit Inline'
                )}
              </button>

              {canRevise ? (
                <button
                  onClick={() => setRevisionMode((v) => !v)}
                  className={cn(
                    'btn-ghost py-1.5 text-xs',
                    revisionMode && 'bg-accent/10 text-accent border border-accent/30'
                  )}
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Revise with Notes
                </button>
              ) : (
                <button className="btn-ghost py-1.5 text-xs opacity-50 cursor-default">
                  <Lock className="w-3.5 h-3.5" />
                  Revise (Pro)
                </button>
              )}
            </div>

            {revisionMode && canRevise && (
              <div className="space-y-2">
                <textarea
                  className="textarea text-xs"
                  rows={2}
                  placeholder="e.g. Emphasize the structuring pattern. Add more detail to the red flag analysis."
                  maxLength={500}
                  value={revisionInstructions}
                  onChange={(e) => setRevisionInstructions(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-text-muted font-mono">
                    {revisionInstructions.length}/500
                  </span>
                  <button
                    onClick={() => handleGenerate(true)}
                    disabled={!revisionInstructions.trim() || isGenerating}
                    className="btn-primary py-1.5 text-xs"
                  >
                    Apply Revisions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
