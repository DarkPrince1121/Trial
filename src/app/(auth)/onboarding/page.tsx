'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ChevronRight, ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ── Types ────────────────────────────────────────────────────

type Step = 1 | 2 | 3

interface OnboardingData {
  role: string
  institutionType: string
  strVolume: string
}

// ── Option Cards ─────────────────────────────────────────────

interface OptionCardProps {
  label: string
  description: string
  selected: boolean
  onClick: () => void
  icon: string
}

function OptionCard({ label, description, selected, onClick, icon }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-full text-left p-4 rounded-lg border transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background',
        selected
          ? 'border-accent bg-accent/10 text-text-primary'
          : 'border-border bg-surface hover:border-accent/50 hover:bg-surface-elevated text-text-secondary'
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
          <Check className="w-3 h-3 text-background" />
        </div>
      )}
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-sans font-semibold text-sm text-text-primary mb-1">{label}</div>
      <div className="font-sans text-xs text-text-muted">{description}</div>
    </button>
  )
}

// ── Steps Config ─────────────────────────────────────────────

const ROLE_OPTIONS = [
  {
    value: 'AML Investigator',
    label: 'AML Investigator',
    description: 'Reviewing and investigating suspicious transactions',
    icon: '🔍',
  },
  {
    value: 'Compliance Officer',
    label: 'Compliance Officer',
    description: 'Overseeing AML programs and regulatory obligations',
    icon: '⚖️',
  },
  {
    value: 'Consultant',
    label: 'AML Consultant',
    description: 'Providing advisory services to reporting entities',
    icon: '💼',
  },
  {
    value: 'Other',
    label: 'Other',
    description: 'Other compliance or financial crime role',
    icon: '👤',
  },
]

const INSTITUTION_OPTIONS = [
  {
    value: 'Credit Union',
    label: 'Credit Union',
    description: 'Member-owned cooperative financial institution',
    icon: '🏦',
  },
  {
    value: 'Bank',
    label: 'Bank / Community Bank',
    description: 'Federally or provincially regulated bank',
    icon: '🏛️',
  },
  {
    value: 'Fintech',
    label: 'Fintech',
    description: 'Money services, payments, or digital finance',
    icon: '💳',
  },
  {
    value: 'Independent',
    label: 'Independent / Consultant',
    description: 'Not affiliated with a single institution',
    icon: '🧩',
  },
]

const VOLUME_OPTIONS = [
  {
    value: '1-5',
    label: '1–5 STRs/month',
    description: 'Small volume, occasional reporting',
    icon: '📄',
  },
  {
    value: '6-20',
    label: '6–20 STRs/month',
    description: 'Moderate volume, regular reporting',
    icon: '📋',
  },
  {
    value: '20+',
    label: '20+ STRs/month',
    description: 'High volume, dedicated AML function',
    icon: '📚',
  },
]

// ── Progress Bar ─────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {([1, 2, 3] as Step[]).map((s) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300',
              s < step
                ? 'bg-accent text-background'
                : s === step
                ? 'bg-accent/20 border border-accent text-accent'
                : 'bg-surface-elevated border border-border text-text-muted'
            )}
          >
            {s < step ? <Check className="w-3.5 h-3.5" /> : s}
          </div>
          {s < 3 && (
            <div
              className={cn(
                'flex-1 h-0.5 rounded-full transition-all duration-300',
                s < step ? 'bg-accent' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    role: '',
    institutionType: '',
    strVolume: '',
  })

  const stepTitles: Record<Step, { title: string; subtitle: string }> = {
    1: {
      title: 'What is your role?',
      subtitle: 'This helps us tailor your experience.',
    },
    2: {
      title: 'What type of institution?',
      subtitle: 'We structure narratives to suit your reporting context.',
    },
    3: {
      title: 'How many STRs do you file monthly?',
      subtitle: 'Helps us understand your workload.',
    },
  }

  const currentTitle = stepTitles[step]

  function canAdvance(): boolean {
    if (step === 1) return !!data.role
    if (step === 2) return !!data.institutionType
    if (step === 3) return !!data.strVolume
    return false
  }

  async function handleComplete() {
    if (!data.strVolume) return
    setSaving(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: data.role,
          institutionType: data.institutionType,
          strVolume: data.strVolume,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save onboarding')
      }
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  function handleNext() {
    if (step < 3) {
      setStep((s) => (s + 1) as Step)
    } else {
      handleComplete()
    }
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction > 0 ? -40 : 40,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display text-xl font-bold text-accent mb-1">NARRATEAML</div>
          <div className="text-xs text-text-muted font-mono">Getting started — step {step} of 3</div>
        </div>

        <div className="card p-8">
          <ProgressBar step={step} />

          {/* Step content */}
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <h2 className="font-display text-xl font-bold text-text-primary mb-1">
                {currentTitle.title}
              </h2>
              <p className="text-text-muted text-sm mb-6">{currentTitle.subtitle}</p>

              {step === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {ROLE_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      description={opt.description}
                      icon={opt.icon}
                      selected={data.role === opt.value}
                      onClick={() => setData((d) => ({ ...d, role: opt.value }))}
                    />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  {INSTITUTION_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      description={opt.description}
                      icon={opt.icon}
                      selected={data.institutionType === opt.value}
                      onClick={() => setData((d) => ({ ...d, institutionType: opt.value }))}
                    />
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-3">
                  {VOLUME_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      label={opt.label}
                      description={opt.description}
                      icon={opt.icon}
                      selected={data.strVolume === opt.value}
                      onClick={() => setData((d) => ({ ...d, strVolume: opt.value }))}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => step > 1 && setStep((s) => (s - 1) as Step)}
              className={cn(
                'btn-ghost',
                step === 1 && 'invisible'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canAdvance() || saving}
              className="btn-primary"
            >
              {saving
                ? 'Saving...'
                : step === 3
                ? 'Go to Dashboard'
                : 'Continue'}
              {!saving && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          All narrative outputs are AI-assisted drafts — review before submission.
        </p>
      </div>
    </div>
  )
}
