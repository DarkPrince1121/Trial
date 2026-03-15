import type { STRFormData, ParsedTransaction, StatementSummary } from '@/types'

// ── System Prompt ─────────────────────────────────────────────
// This prompt is server-side only. Never expose to client.

export const SYSTEM_PROMPT = `You are a senior AML compliance specialist experienced in drafting suspicious transaction report narratives for Canadian AML reporting workflows. You write in precise, objective, formal compliance language.

STRICT RULES:
• Use ONLY the facts provided. Do not invent details.
• Do not speculate beyond the facts provided.
• Never use first person. Write in third person only.
• Organize events chronologically.
• Make the suspicion basis explicit but strictly fact-bound.
• If facts are missing for a section, omit that section — do not fill gaps.
• Keep language professional and regulator-oriented.
• Output plain narrative prose only — no bullet points, no headers, no markdown.
• Avoid absolute legal claims.
• Refer to "the reporting entity," "the subject," "the account holder," or "the member/client" as appropriate.
• End with a careful, fact-grounded basis-for-reporting paragraph.
• Do not mention being an AI or that content was AI-generated.

REQUIRED NARRATIVE STRUCTURE (prose paragraphs, no headings):
1. Opening: Subject identification, account context, reason for suspicion
2. Transaction description: Specific transactions, dates, amounts, counterparties
3. Pattern analysis: Broader activity across reporting period
4. Red flag analysis: Each red flag explained using only the facts supplied
5. Prior history: Prior STRs, internal alerts, historical context (if provided)
6. Client explanation: What was provided and investigator assessment (if provided)
7. Closing: Basis for reporting and rationale for escalation`

// ── Build User Prompt from Form Data ─────────────────────────

export function buildUserPrompt(formData: STRFormData): string {
  const parts: string[] = []

  parts.push('=== SUBJECT INFORMATION ===')
  if (formData.subjectName) parts.push(`Subject Full Legal Name: ${formData.subjectName}`)
  if (formData.subjectType) parts.push(`Subject Type: ${formData.subjectType}`)
  if (formData.dateOfBirthOrRegistration)
    parts.push(`Date of Birth / Registration Date: ${formData.dateOfBirthOrRegistration}`)
  if (formData.accountNumbers) parts.push(`Account Number(s): ${formData.accountNumbers}`)
  if (formData.accountType) parts.push(`Account Type: ${formData.accountType}`)
  if (formData.clientSince) parts.push(`Client Since: ${formData.clientSince}`)
  if (formData.occupationOrBusinessType)
    parts.push(`Occupation / Business Type: ${formData.occupationOrBusinessType}`)
  if (formData.countryOfResidence)
    parts.push(`Country of Residence: ${formData.countryOfResidence}`)
  if (formData.pepStatus) parts.push(`PEP/HIO Status: ${formData.pepStatus}`)

  parts.push('\n=== TRANSACTION DETAILS ===')
  if (formData.transactionType) parts.push(`Transaction Type: ${formData.transactionType}`)
  if (formData.transactionDate) parts.push(`Transaction Date: ${formData.transactionDate}`)
  if (formData.transactionAmount) {
    const currency = formData.currency || 'CAD'
    parts.push(`Transaction Amount: ${currency} ${formData.transactionAmount}`)
  }
  if (formData.counterpartyName) parts.push(`Counterparty Name: ${formData.counterpartyName}`)
  if (formData.counterpartyInstitution)
    parts.push(`Counterparty Institution: ${formData.counterpartyInstitution}`)
  if (formData.counterpartyCountry)
    parts.push(`Counterparty Country: ${formData.counterpartyCountry}`)
  if (formData.transactionReference)
    parts.push(`Transaction Reference: ${formData.transactionReference}`)
  if (formData.dispositionOfFunds)
    parts.push(`Disposition of Funds: ${formData.dispositionOfFunds}`)

  parts.push('\n=== REPORTING PERIOD & PATTERN ===')
  if (formData.reportingPeriodStart)
    parts.push(`Reporting Period Start: ${formData.reportingPeriodStart}`)
  if (formData.reportingPeriodEnd)
    parts.push(`Reporting Period End: ${formData.reportingPeriodEnd}`)
  if (formData.totalTransactionsInPeriod)
    parts.push(`Total Transactions in Period: ${formData.totalTransactionsInPeriod}`)
  if (formData.totalDollarValueInPeriod)
    parts.push(`Total Dollar Value in Period: ${formData.totalDollarValueInPeriod}`)
  if (formData.transactionFrequency)
    parts.push(`Transaction Frequency Pattern: ${formData.transactionFrequency}`)
  if (formData.patternDirection)
    parts.push(`Direction of Funds: ${formData.patternDirection}`)

  if (formData.redFlags && formData.redFlags.length > 0) {
    parts.push('\n=== RED FLAGS IDENTIFIED ===')
    formData.redFlags.forEach((flag) => {
      parts.push(`• ${flag}`)
    })
  }

  parts.push('\n=== PRIOR HISTORY & CONTEXT ===')
  if (formData.priorSTRFiled) {
    parts.push(`Prior STR Filed: Yes`)
    if (formData.priorSTRDate) parts.push(`Prior STR Date: ${formData.priorSTRDate}`)
    if (formData.priorSTRCaseReference)
      parts.push(`Prior STR Case Reference: ${formData.priorSTRCaseReference}`)
  } else {
    parts.push(`Prior STR Filed: No`)
  }

  if (formData.priorInternalAlerts) {
    parts.push(`Prior Internal SARs/Alerts: Yes`)
    if (formData.priorInternalAlertsDetails)
      parts.push(`Internal Alert Details: ${formData.priorInternalAlertsDetails}`)
  } else {
    parts.push(`Prior Internal SARs/Alerts: No`)
  }

  if (formData.clientExplanationProvided) {
    parts.push(`Client Explanation Provided: Yes`)
    if (formData.clientExplanation)
      parts.push(`Client Explanation: ${formData.clientExplanation}`)
  } else {
    parts.push(`Client Explanation Provided: No`)
  }

  if (formData.osintFindings) {
    parts.push(`\nOpen Source / OSINT Findings: ${formData.osintFindings}`)
  }

  if (formData.investigatorNotes) {
    parts.push(`\nAdditional Investigator Notes: ${formData.investigatorNotes}`)
  }

  parts.push('\n=== GENERATION SETTINGS ===')
  parts.push(`Narrative Tone: ${formData.narrativeTone}`)
  parts.push(`Target Length: ${formData.narrativeLength} (Short ~200 words / Standard ~400 words / Detailed ~600 words)`)
  parts.push(`Jurisdiction: ${formData.jurisdiction}`)
  if (formData.includeRegulatoryLanguage) {
    parts.push(`Include regulator-specific language: Yes`)
  }
  if (formData.addReviewerCautionNote) {
    parts.push(`Include reviewer caution note at end: Yes — add a brief paragraph reminding the reader that this narrative requires human review before submission.`)
  }

  parts.push(
    '\nPlease draft a complete STR narrative based on the information above. Follow the required structure and all rules specified.'
  )

  return parts.join('\n')
}

// ── Build Revision Prompt ─────────────────────────────────────

export function buildRevisionPrompt(
  originalPrompt: string,
  revisionInstructions: string
): string {
  return `${originalPrompt}

=== REVISION INSTRUCTIONS ===
Please apply the following revision instructions to the narrative while:
• Maintaining strict factual accuracy — do not add any facts not in the original information
• Preserving the formal, third-person compliance tone
• Keeping all original facts intact

Revision instructions: ${revisionInstructions}`
}

// ── Build Upload Mode Prompt ──────────────────────────────────

export function buildUploadModePrompt(
  transactions: ParsedTransaction[],
  selectedTransactions: ParsedTransaction[],
  summary: StatementSummary,
  formData: Partial<STRFormData>
): string {
  const parts: string[] = []

  parts.push('=== ACCOUNT SUMMARY ===')
  if (summary.accountHolder) parts.push(`Account Holder: ${summary.accountHolder}`)
  if (summary.accountNumber) parts.push(`Account Number (masked): ${summary.accountNumber}`)
  if (summary.institutionName) parts.push(`Institution: ${summary.institutionName}`)
  parts.push(`Currency: ${summary.currency}`)
  if (summary.statementStart) parts.push(`Statement Period Start: ${summary.statementStart}`)
  if (summary.statementEnd) parts.push(`Statement Period End: ${summary.statementEnd}`)

  parts.push('\n=== STATISTICAL SUMMARY ===')
  parts.push(`Total Transactions: ${summary.totalTransactions}`)
  parts.push(`Total Debits: ${summary.currency} ${summary.totalDebits.toFixed(2)}`)
  parts.push(`Total Credits: ${summary.currency} ${summary.totalCredits.toFixed(2)}`)
  parts.push(`Largest Single Transaction: ${summary.currency} ${summary.largestTransaction.toFixed(2)}`)
  parts.push(`Near-Threshold Transactions ($9,000–$9,999): ${summary.nearThresholdCount}`)
  parts.push(`Round Dollar Amount Transactions: ${summary.roundDollarCount}`)

  if (selectedTransactions.length > 0) {
    parts.push('\n=== SELECTED SUSPICIOUS TRANSACTIONS (Focus of narrative) ===')
    parts.push('DATE | DESCRIPTION | DEBIT | CREDIT | BALANCE')
    selectedTransactions.forEach((t) => {
      const debit = t.debit !== null ? `${summary.currency} ${t.debit.toFixed(2)}` : '—'
      const credit = t.credit !== null ? `${summary.currency} ${t.credit.toFixed(2)}` : '—'
      const balance = t.balance !== null ? `${summary.currency} ${t.balance.toFixed(2)}` : '—'
      parts.push(`${t.date} | ${t.description} | ${debit} | ${credit} | ${balance}`)
    })
  }

  parts.push('\n=== FULL TRANSACTION HISTORY (Context) ===')
  parts.push('DATE | DESCRIPTION | DEBIT | CREDIT | BALANCE')
  const maxRows = Math.min(transactions.length, 200) // Limit to avoid token overflow
  transactions.slice(0, maxRows).forEach((t) => {
    const debit = t.debit !== null ? t.debit.toFixed(2) : '—'
    const credit = t.credit !== null ? t.credit.toFixed(2) : '—'
    const balance = t.balance !== null ? t.balance.toFixed(2) : '—'
    parts.push(`${t.date} | ${t.description} | ${debit} | ${credit} | ${balance}`)
  })
  if (transactions.length > maxRows) {
    parts.push(`[... ${transactions.length - maxRows} additional rows omitted for length]`)
  }

  if (formData.redFlags && formData.redFlags.length > 0) {
    parts.push('\n=== RED FLAGS IDENTIFIED ===')
    formData.redFlags.forEach((flag) => parts.push(`• ${flag}`))
  }

  if (formData.clientExplanationProvided && formData.clientExplanation) {
    parts.push(`\n=== CLIENT EXPLANATION ===\n${formData.clientExplanation}`)
  }

  if (formData.investigatorNotes) {
    parts.push(`\n=== INVESTIGATOR NOTES ===\n${formData.investigatorNotes}`)
  }

  parts.push('\n=== GENERATION SETTINGS ===')
  parts.push(`Narrative Tone: ${formData.narrativeTone || 'Formal'}`)
  parts.push(`Target Length: ${formData.narrativeLength || 'Standard'}`)
  parts.push(`Jurisdiction: ${formData.jurisdiction || 'FINTRAC — Canada'}`)

  parts.push(
    '\nInstruction: Synthesize patterns from the full transaction history. Focus the narrative on the selected suspicious transactions. Do not reproduce the full transaction table verbatim — describe the patterns and specific transactions in clear compliance prose.'
  )

  return parts.join('\n')
}
