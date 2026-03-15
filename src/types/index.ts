// ============================================================
// NarrateAML — TypeScript Types & Constants
// ============================================================

// ── Plans ──────────────────────────────────────────────────

export type Plan = 'free' | 'pro' | 'team' | 'lifetime'
export type BillingStatus = 'active' | 'past_due' | 'canceled' | 'trialing'
export type ReadinessStatus = 'draft' | 'edited' | 'exported' | 'archived'
export type UsageAction = 'generate' | 'export_docx' | 'export_pdf' | 'template_save'
export type TeamRole = 'owner' | 'admin' | 'member'

export const PLAN_LIMITS: Record<Plan, { narrativesPerMonth: number }> = {
  free: { narrativesPerMonth: 3 },
  pro: { narrativesPerMonth: Infinity },
  team: { narrativesPerMonth: Infinity },
  lifetime: { narrativesPerMonth: Infinity },
}

export const PLAN_FEATURES: Record<
  Plan,
  {
    export: boolean
    templates: boolean
    statementUpload: boolean
    revisionMode: boolean
    history: boolean
    teamSeats: number
    sharedTemplates: boolean
    auditLog: boolean
  }
> = {
  free: {
    export: false,
    templates: false,
    statementUpload: false,
    revisionMode: false,
    history: true,
    teamSeats: 1,
    sharedTemplates: false,
    auditLog: false,
  },
  pro: {
    export: true,
    templates: true,
    statementUpload: true,
    revisionMode: true,
    history: true,
    teamSeats: 1,
    sharedTemplates: false,
    auditLog: false,
  },
  team: {
    export: true,
    templates: true,
    statementUpload: true,
    revisionMode: true,
    history: true,
    teamSeats: 5,
    sharedTemplates: true,
    auditLog: true,
  },
  lifetime: {
    export: true,
    templates: true,
    statementUpload: true,
    revisionMode: true,
    history: true,
    teamSeats: 1,
    sharedTemplates: false,
    auditLog: false,
  },
}

export const PLAN_DISPLAY_NAMES: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
  lifetime: 'Lifetime',
}

// ── Database Models ─────────────────────────────────────────

export interface User {
  id: string
  clerk_user_id: string
  email: string
  full_name: string | null
  role: string | null
  institution_name: string | null
  institution_type: string | null
  plan: Plan
  billing_status: BillingStatus
  narratives_used_this_month: number
  monthly_limit: number
  reset_date: string | null
  onboarding_completed: boolean
  onboarding_role: string | null
  onboarding_institution_type: string | null
  onboarding_str_volume: string | null
  created_at: string
  updated_at: string
}

export interface Narrative {
  id: string
  user_id: string
  title: string | null
  subject_name: string | null
  subject_type: string | null
  transaction_type: string | null
  transaction_amount: number | null
  transaction_currency: string
  reporting_period_start: string | null
  reporting_period_end: string | null
  form_data: STRFormData | null
  narrative_text: string | null
  word_count: number | null
  estimated_time_saved_minutes: number
  readiness_status: ReadinessStatus
  revision_notes: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  user_id: string
  name: string
  description: string | null
  form_data: Partial<STRFormData>
  is_shared: boolean
  created_at: string
  updated_at: string
  // Joined
  owner_name?: string | null
}

export interface UsageLog {
  id: string
  user_id: string
  action: UsageAction
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface TeamMembership {
  id: string
  team_owner_user_id: string
  member_user_id: string
  role: TeamRole
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  entity_type: string | null
  entity_id: string | null
  action: string
  before_data: Record<string, unknown> | null
  after_data: Record<string, unknown> | null
  created_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  usage_alerts: boolean
  billing_alerts: boolean
  product_updates: boolean
  created_at: string
  updated_at: string
}

// ── STR Form Data ────────────────────────────────────────────

export type SubjectType = 'Individual' | 'Business' | 'Unknown'
export type AccountType =
  | 'Chequing'
  | 'Savings'
  | 'Business'
  | 'Investment'
  | 'Multiple'
export type PEPStatus = 'Yes' | 'No' | 'Unknown'

export type TransactionType =
  | 'EMT'
  | 'Wire Transfer — Domestic'
  | 'Wire Transfer — International'
  | 'Cash Deposit'
  | 'Cash Withdrawal'
  | 'Cheque'
  | 'ATM'
  | 'ACH'
  | 'Internal Transfer'
  | 'Multiple'

export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'Other'
export type TransactionDirection = 'Incoming' | 'Outgoing' | 'Both'
export type TransactionFrequency =
  | 'Daily'
  | 'Weekly'
  | 'Bi-weekly'
  | 'Monthly'
  | 'Irregular'
export type NarrativeTone = 'Formal' | 'Detailed' | 'Concise'
export type NarrativeLength = 'Short' | 'Standard' | 'Detailed'
export type Jurisdiction = 'FINTRAC — Canada' | 'FinCEN — USA' | 'Other'

export const RED_FLAGS = [
  'Structuring / Smurfing',
  'Rapid movement of funds',
  'No apparent business purpose',
  'Inconsistent with client profile / occupation',
  'Round dollar amounts',
  'Multiple third-party deposits',
  'International nexus to high-risk jurisdiction',
  'Use of multiple accounts',
  'Sudden spike in account activity',
  'Unusual hours of transactions',
  'Cash-intensive despite non-cash business',
  'Frequent E-transfers to/from unknown parties',
  'Layering behaviour',
  'Prior STR or internal alert history',
  'Refused to provide explanation',
  'Provided implausible explanation',
] as const

export type RedFlag = (typeof RED_FLAGS)[number]

export interface STRFormData {
  // Section 1 — Subject Information
  subjectName: string
  subjectType: SubjectType | ''
  dateOfBirthOrRegistration: string
  accountNumbers: string
  accountType: AccountType | ''
  clientSince: string
  occupationOrBusinessType: string
  countryOfResidence: string
  pepStatus: PEPStatus | ''

  // Section 2 — Transaction Details
  transactionType: TransactionType | ''
  transactionDate: string
  transactionAmount: string
  currency: Currency | ''
  counterpartyName: string
  counterpartyInstitution: string
  counterpartyCountry: string
  transactionReference: string
  dispositionOfFunds: string

  // Section 3 — Reporting Period & Pattern
  reportingPeriodStart: string
  reportingPeriodEnd: string
  totalTransactionsInPeriod: string
  totalDollarValueInPeriod: string
  transactionFrequency: TransactionFrequency | ''
  patternDirection: TransactionDirection | ''

  // Section 4 — Red Flags
  redFlags: RedFlag[]

  // Section 5 — Prior History & Context
  priorSTRFiled: boolean
  priorSTRDate: string
  priorSTRCaseReference: string
  priorInternalAlerts: boolean
  priorInternalAlertsDetails: string
  clientExplanationProvided: boolean
  clientExplanation: string
  osintFindings: string
  investigatorNotes: string

  // Section 6 — Generation Settings
  narrativeTone: NarrativeTone
  narrativeLength: NarrativeLength
  jurisdiction: Jurisdiction
  includeRegulatoryLanguage: boolean
  addReviewerCautionNote: boolean

  // Revision mode
  revisionInstructions?: string
}

export const DEFAULT_FORM_DATA: STRFormData = {
  subjectName: '',
  subjectType: '',
  dateOfBirthOrRegistration: '',
  accountNumbers: '',
  accountType: '',
  clientSince: '',
  occupationOrBusinessType: '',
  countryOfResidence: 'Canada',
  pepStatus: '',

  transactionType: '',
  transactionDate: '',
  transactionAmount: '',
  currency: 'CAD',
  counterpartyName: '',
  counterpartyInstitution: '',
  counterpartyCountry: '',
  transactionReference: '',
  dispositionOfFunds: '',

  reportingPeriodStart: '',
  reportingPeriodEnd: '',
  totalTransactionsInPeriod: '',
  totalDollarValueInPeriod: '',
  transactionFrequency: '',
  patternDirection: '',

  redFlags: [],

  priorSTRFiled: false,
  priorSTRDate: '',
  priorSTRCaseReference: '',
  priorInternalAlerts: false,
  priorInternalAlertsDetails: '',
  clientExplanationProvided: false,
  clientExplanation: '',
  osintFindings: '',
  investigatorNotes: '',

  narrativeTone: 'Formal',
  narrativeLength: 'Standard',
  jurisdiction: 'FINTRAC — Canada',
  includeRegulatoryLanguage: true,
  addReviewerCautionNote: true,
}

// ── Statement Upload Types ───────────────────────────────────

export interface ParsedTransaction {
  id: string
  date: string
  description: string
  debit: number | null
  credit: number | null
  balance: number | null
  isFlagged: boolean
  isSelected: boolean
  flagReasons: string[]
}

export interface StatementSummary {
  accountHolder: string | null
  accountNumber: string | null
  institutionName: string | null
  currency: string
  statementStart: string | null
  statementEnd: string | null
  totalTransactions: number
  totalDebits: number
  totalCredits: number
  largestTransaction: number
  nearThresholdCount: number
  roundDollarCount: number
}

export type ParseProgress =
  | 'idle'
  | 'reading'
  | 'detecting'
  | 'extracting'
  | 'analysing'
  | 'done'
  | 'error'

// ── SSE Events ───────────────────────────────────────────────

export type SSEEvent =
  | { type: 'id'; narrativeId: string }
  | { type: 'chunk'; text: string }
  | { type: 'done'; narrativeId: string; wordCount: number }
  | { type: 'error'; message: string }

// ── API Request/Response Types ───────────────────────────────

export interface GenerateRequest {
  formData: STRFormData
  mode: 'manual' | 'upload'
  uploadedTransactions?: ParsedTransaction[]
  statementSummary?: StatementSummary
  revisionNarrativeId?: string
}

export interface ExportRequest {
  narrativeId: string
}

export interface OnboardingRequest {
  role: string
  institutionType: string
  strVolume: string
}

export interface UsageStats {
  totalNarratives: number
  totalExports: number
  hoursSaved: number
  narrativesThisMonth: number
  monthlyLimit: number
  plan: Plan
  resetDate: string | null
}

export interface HistoryFilters {
  search?: string
  transactionType?: string
  dateRange?: 'week' | 'month' | 'all'
  sortBy?: 'newest' | 'amount' | 'words'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
