import type { User, Plan } from '@/types'
import { PLAN_LIMITS, PLAN_FEATURES, PLAN_DISPLAY_NAMES } from '@/types'

// ── Plan Feature Checks ───────────────────────────────────────

export function canGenerateNarrative(user: User): {
  allowed: boolean
  reason?: string
} {
  const limit = PLAN_LIMITS[user.plan].narrativesPerMonth

  if (limit === Infinity) {
    return { allowed: true }
  }

  if (user.narratives_used_this_month >= limit) {
    return {
      allowed: false,
      reason: `You've used ${user.narratives_used_this_month} of ${limit} narrative drafts this month. Upgrade to Pro for unlimited drafts.`,
    }
  }

  return { allowed: true }
}

export function canExport(user: User): { allowed: boolean; reason?: string } {
  if (!PLAN_FEATURES[user.plan].export) {
    return {
      allowed: false,
      reason: 'Export to DOCX and PDF is available on the Pro plan and above.',
    }
  }
  return { allowed: true }
}

export function canUseTemplates(user: User): {
  allowed: boolean
  reason?: string
} {
  if (!PLAN_FEATURES[user.plan].templates) {
    return {
      allowed: false,
      reason: 'Saved templates are available on the Pro plan and above.',
    }
  }
  return { allowed: true }
}

export function canUploadStatement(user: User): {
  allowed: boolean
  reason?: string
} {
  if (!PLAN_FEATURES[user.plan].statementUpload) {
    return {
      allowed: false,
      reason: 'Statement upload and parsing is available on the Pro plan and above.',
    }
  }
  return { allowed: true }
}

export function canUseRevisionMode(user: User): {
  allowed: boolean
  reason?: string
} {
  if (!PLAN_FEATURES[user.plan].revisionMode) {
    return {
      allowed: false,
      reason: 'Revision mode is available on the Pro plan and above.',
    }
  }
  return { allowed: true }
}

export function canShareTemplates(user: User): {
  allowed: boolean
  reason?: string
} {
  if (!PLAN_FEATURES[user.plan].sharedTemplates) {
    return {
      allowed: false,
      reason: 'Shared templates are available on the Team plan.',
    }
  }
  return { allowed: true }
}

// ── Display Helpers ───────────────────────────────────────────

export function getPlanDisplayName(plan: Plan): string {
  return PLAN_DISPLAY_NAMES[plan]
}

export function getMonthlyLimit(plan: Plan): number {
  return PLAN_LIMITS[plan].narrativesPerMonth
}

export function getUsagePercentage(user: User): number {
  const limit = getMonthlyLimit(user.plan)
  if (limit === Infinity) return 0
  return Math.min(100, Math.round((user.narratives_used_this_month / limit) * 100))
}

export function isNearLimit(user: User): boolean {
  const limit = getMonthlyLimit(user.plan)
  if (limit === Infinity) return false
  return user.narratives_used_this_month >= Math.floor(limit * 0.67)
}

export function isAtLimit(user: User): boolean {
  const limit = getMonthlyLimit(user.plan)
  if (limit === Infinity) return false
  return user.narratives_used_this_month >= limit
}

export function getRemainingNarratives(user: User): number {
  const limit = getMonthlyLimit(user.plan)
  if (limit === Infinity) return Infinity
  return Math.max(0, limit - user.narratives_used_this_month)
}

// ── Billing Status Helpers ────────────────────────────────────

export function isPlanActive(user: User): boolean {
  return user.billing_status === 'active' || user.billing_status === 'trialing'
}

export function isPastDue(user: User): boolean {
  return user.billing_status === 'past_due'
}
