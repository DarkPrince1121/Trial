import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL || 'NarrateAML <noreply@narrateaml.com>'

// ── Shared Email Styles ───────────────────────────────────────

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #0B0F1A; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background-color: #111827; border: 1px solid #1E2D45; border-radius: 8px; padding: 40px; }
  .logo { font-size: 18px; font-weight: 700; color: #C9A84C; letter-spacing: 0.05em; margin-bottom: 32px; }
  h1 { color: #F8FAFC; font-size: 22px; font-weight: 700; margin: 0 0 16px; line-height: 1.3; }
  p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 16px; }
  .highlight { color: #F8FAFC; }
  .accent { color: #C9A84C; font-weight: 600; }
  .cta-btn { display: inline-block; background: #C9A84C; color: #0B0F1A; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 6px; text-decoration: none; margin: 8px 0 24px; }
  .divider { border: none; border-top: 1px solid #1E2D45; margin: 24px 0; }
  .footer { color: #475569; font-size: 12px; margin-top: 32px; text-align: center; line-height: 1.6; }
  .warning-box { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 12px 16px; margin: 16px 0; color: #F59E0B; font-size: 13px; }
`

// ── 1. Welcome Email ──────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  name: string | null
): Promise<void> {
  const firstName = name ? name.split(' ')[0] : 'there'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://narrateaml.com'

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="logo">NARRATEAML</div>
          <h1>Welcome, ${firstName}.</h1>
          <p>Your account is ready. You can now draft STR narratives in seconds — structured for Canadian AML workflows and designed to support investigator review.</p>
          <p>You're on the <span class="accent">Free plan</span>, which includes <span class="highlight">3 narrative drafts per month</span> at no cost.</p>
          <a href="${appUrl}/generate" class="cta-btn">Generate Your First Narrative</a>
          <hr class="divider" />
          <p><strong class="highlight">What you can do on Free:</strong></p>
          <p>✓ Manual entry form across 6 sections<br />
             ✓ AI-generated narrative in under 60 seconds<br />
             ✓ Copy to clipboard<br />
             ✓ View your narrative history</p>
          <p><strong class="highlight">Upgrade to Pro ($49/month) to unlock:</strong></p>
          <p>→ Unlimited narrative drafts<br />
             → DOCX and PDF export<br />
             → Saved templates<br />
             → Statement upload with auto-parsing<br />
             → Revision mode</p>
          <div class="warning-box">
            ⚠ All narrative outputs are AI-assisted drafts. Review for accuracy, completeness, and regulatory suitability before submission.
          </div>
        </div>
        <div class="footer">
          NarrateAML · AI-Assisted Draft Tool for AML Investigators<br />
          This email was sent because you created a NarrateAML account.<br />
          <a href="${appUrl}/settings" style="color: #475569;">Manage email preferences</a>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to NarrateAML',
      html,
    })
  } catch (err) {
    console.error('[resend] sendWelcomeEmail error:', err)
  }
}

// ── 2. Usage Limit Warning Email ──────────────────────────────

export async function sendUsageLimitWarningEmail(
  email: string,
  name: string | null,
  used: number,
  limit: number
): Promise<void> {
  const firstName = name ? name.split(' ')[0] : 'there'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://narrateaml.com'
  const remaining = limit - used

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="logo">NARRATEAML</div>
          <h1>You've used ${used} of ${limit} narratives this month</h1>
          <p>Hi ${firstName}, you have <span class="accent">${remaining} narrative draft${remaining === 1 ? '' : 's'} remaining</span> on your Free plan this month.</p>
          <p>Once you reach the limit, you'll need to upgrade to continue drafting. Upgrade now to avoid any interruption to your workflow.</p>
          <a href="${appUrl}/billing" class="cta-btn">Upgrade to Pro — $49/month</a>
          <hr class="divider" />
          <p><strong class="highlight">Pro plan includes:</strong></p>
          <p>→ Unlimited narrative drafts<br />
             → DOCX and PDF export<br />
             → Reusable templates<br />
             → Statement upload with auto-parsing<br />
             → Annual plan available: $399/year (save 32%)</p>
          <p style="color: #475569; font-size: 13px;">Your usage counter resets on the 1st of each month.</p>
        </div>
        <div class="footer">
          NarrateAML · AI-Assisted Draft Tool for AML Investigators<br />
          <a href="${appUrl}/settings" style="color: #475569;">Manage email preferences</a>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You've used ${used} of ${limit} narratives this month`,
      html,
    })
  } catch (err) {
    console.error('[resend] sendUsageLimitWarningEmail error:', err)
  }
}

// ── 3. Payment Failed Email ───────────────────────────────────

export async function sendPaymentFailedEmail(
  email: string,
  name: string | null
): Promise<void> {
  const firstName = name ? name.split(' ')[0] : 'there'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://narrateaml.com'

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="logo">NARRATEAML</div>
          <h1>Action required: Payment failed</h1>
          <p>Hi ${firstName}, we were unable to process your payment for NarrateAML.</p>
          <p>To avoid losing access to your Pro features, please update your payment method as soon as possible.</p>
          <a href="${appUrl}/billing" class="cta-btn">Update Payment Method</a>
          <hr class="divider" />
          <p>If your payment is not updated within a few days, your account may be downgraded to the Free plan.</p>
          <p>If you believe this is an error, or if you have questions, please reply to this email.</p>
          <p style="color: #475569; font-size: 13px;">Payments are processed securely by Stripe. We do not store your card details.</p>
        </div>
        <div class="footer">
          NarrateAML · AI-Assisted Draft Tool for AML Investigators<br />
          <a href="${appUrl}/settings" style="color: #475569;">Manage account</a>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Action required: Payment failed for NarrateAML',
      html,
    })
  } catch (err) {
    console.error('[resend] sendPaymentFailedEmail error:', err)
  }
}
