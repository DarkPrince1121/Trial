import type { STRFormData } from '@/types'

// ── Input Sanitization ────────────────────────────────────────
// Strip HTML tags and LLM prompt injection tokens from user input

const INJECTION_PATTERNS = [
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /---SYSTEM/gi,
  /```/g,
  /<\|/g,
  /\|>/g,
  /<\/?s>/gi,
  /<<SYS>>/gi,
  /<\/SYS>>/gi,
  /\[SYSTEM\]/gi,
  /\[USER\]/gi,
  /\[ASSISTANT\]/gi,
]

// Strip HTML tags
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

// Strip LLM injection tokens
function stripInjectionTokens(input: string): string {
  let sanitized = input
  INJECTION_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '')
  })
  return sanitized
}

// Sanitize a single string field
export function sanitizeInput(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') return ''

  let sanitized = input
  sanitized = stripHtml(sanitized)
  sanitized = stripInjectionTokens(sanitized)
  sanitized = sanitized.trim()

  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }

  return sanitized
}

// ── Sanitize Full Form Data ───────────────────────────────────

export function sanitizeFormData(formData: STRFormData): STRFormData {
  return {
    // Section 1
    subjectName: sanitizeInput(formData.subjectName, 200),
    subjectType: formData.subjectType,
    dateOfBirthOrRegistration: sanitizeInput(formData.dateOfBirthOrRegistration, 50),
    accountNumbers: sanitizeInput(formData.accountNumbers, 500),
    accountType: formData.accountType,
    clientSince: sanitizeInput(formData.clientSince, 50),
    occupationOrBusinessType: sanitizeInput(formData.occupationOrBusinessType, 200),
    countryOfResidence: sanitizeInput(formData.countryOfResidence, 100),
    pepStatus: formData.pepStatus,

    // Section 2
    transactionType: formData.transactionType,
    transactionDate: sanitizeInput(formData.transactionDate, 50),
    transactionAmount: sanitizeInput(formData.transactionAmount, 30),
    currency: formData.currency,
    counterpartyName: sanitizeInput(formData.counterpartyName, 200),
    counterpartyInstitution: sanitizeInput(formData.counterpartyInstitution, 200),
    counterpartyCountry: sanitizeInput(formData.counterpartyCountry, 100),
    transactionReference: sanitizeInput(formData.transactionReference, 100),
    dispositionOfFunds: sanitizeInput(formData.dispositionOfFunds, 500),

    // Section 3
    reportingPeriodStart: sanitizeInput(formData.reportingPeriodStart, 50),
    reportingPeriodEnd: sanitizeInput(formData.reportingPeriodEnd, 50),
    totalTransactionsInPeriod: sanitizeInput(formData.totalTransactionsInPeriod, 20),
    totalDollarValueInPeriod: sanitizeInput(formData.totalDollarValueInPeriod, 30),
    transactionFrequency: formData.transactionFrequency,
    patternDirection: formData.patternDirection,

    // Section 4 — Red flags are from a fixed enum set, safe as-is
    redFlags: formData.redFlags,

    // Section 5
    priorSTRFiled: Boolean(formData.priorSTRFiled),
    priorSTRDate: sanitizeInput(formData.priorSTRDate, 50),
    priorSTRCaseReference: sanitizeInput(formData.priorSTRCaseReference, 100),
    priorInternalAlerts: Boolean(formData.priorInternalAlerts),
    priorInternalAlertsDetails: sanitizeInput(formData.priorInternalAlertsDetails, 1000),
    clientExplanationProvided: Boolean(formData.clientExplanationProvided),
    clientExplanation: sanitizeInput(formData.clientExplanation, 2000),
    osintFindings: sanitizeInput(formData.osintFindings, 2000),
    investigatorNotes: sanitizeInput(formData.investigatorNotes, 3000),

    // Section 6
    narrativeTone: formData.narrativeTone,
    narrativeLength: formData.narrativeLength,
    jurisdiction: formData.jurisdiction,
    includeRegulatoryLanguage: Boolean(formData.includeRegulatoryLanguage),
    addReviewerCautionNote: Boolean(formData.addReviewerCautionNote),

    // Revision instructions
    revisionInstructions: formData.revisionInstructions
      ? sanitizeInput(formData.revisionInstructions, 500)
      : undefined,
  }
}

// ── In-Memory Rate Limiter ────────────────────────────────────
// Per-user rate limiting: 10 requests per minute
// Note: This is in-process only. For multi-instance deployments, use Upstash Redis.

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private readonly limit: number
  private readonly windowMs: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.windowMs = windowMs

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  check(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.store.get(userId)

    if (!entry || now > entry.resetAt) {
      // New window
      const resetAt = now + this.windowMs
      this.store.set(userId, { count: 1, resetAt })
      return { allowed: true, remaining: this.limit - 1, resetAt }
    }

    if (entry.count >= this.limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    entry.count++
    return {
      allowed: true,
      remaining: this.limit - entry.count,
      resetAt: entry.resetAt,
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key)
      }
    }
  }
}

// Singleton: 10 requests per 60 seconds per user
export const generateRateLimiter = new RateLimiter(10, 60 * 1000)

// ── Validate Required Fields ──────────────────────────────────

export function validateGenerateRequest(formData: STRFormData): string | null {
  if (!formData.subjectName || formData.subjectName.trim().length === 0) {
    return 'Subject name is required.'
  }
  if (!formData.transactionAmount || formData.transactionAmount.trim().length === 0) {
    return 'Transaction amount is required.'
  }
  const amount = parseFloat(formData.transactionAmount.replace(/[^0-9.]/g, ''))
  if (isNaN(amount) || amount <= 0) {
    return 'Transaction amount must be a positive number.'
  }
  return null
}
