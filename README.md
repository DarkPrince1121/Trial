# NarrateAML

**STR narratives drafted in 60 seconds.**

AI-assisted STR narrative drafting for AML investigators and compliance teams. Structured for Canadian AML workflows. Not a filing tool — every output requires human review before submission.

---

## Tech Stack

- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS
- **Auth**: Clerk (email/password + Google OAuth)
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **AI**: Anthropic API — `claude-sonnet-4-20250514`, streaming SSE
- **Payments**: Stripe (subscriptions + one-time)
- **Email**: Resend
- **DOCX Export**: `docx` library
- **PDF Export**: `@react-pdf/renderer`
- **Deployment**: Vercel

---

## Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- A Clerk application
- An Anthropic API key
- A Stripe account (test mode for development)
- A Resend account and verified domain

---

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/narrateaml
cd narrateaml
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_PRO_MONTHLY` + `STRIPE_PRICE_PRO_ANNUAL` + `STRIPE_PRICE_TEAM_MONTHLY` + `STRIPE_PRICE_LIFETIME`
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### 3. Supabase Setup

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** and run the full schema:
   ```
   Copy the contents of supabase/schema.sql and paste into SQL Editor → Run
   ```
3. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

4. Verify RLS is enabled: Settings → Database → Row Level Security

### 4. Clerk Setup

1. Create a new application at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Enable Email/Password + Google OAuth
3. Configure redirect URLs:
   - Sign-in: `http://localhost:3000/sign-in`
   - Sign-up: `http://localhost:3000/sign-up`
   - After sign-in: `http://localhost:3000/dashboard`
   - After sign-up: `http://localhost:3000/onboarding`
4. Copy API keys → `.env.local`

### 5. Stripe Setup

1. Create a Stripe account (use test mode for development)
2. Create 4 products/prices in Stripe Dashboard → Products:
   - **NarrateAML Pro Monthly** — $49/month recurring
   - **NarrateAML Pro Annual** — $399/year recurring
   - **NarrateAML Team Monthly** — $149/month recurring
   - **NarrateAML Lifetime** — $297 one-time payment
3. Copy each Price ID → corresponding env vars
4. Set up webhook for local development:
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

**Required webhook events:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.paid`

### 6. Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain (DNS records)
3. Create API key → `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL=NarrateAML <noreply@yourdomain.com>`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Vercel Deployment

### 1. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com).

### 2. Environment Variables

Add all environment variables from `.env.local` to your Vercel project:
- Project Settings → Environment Variables
- Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g., `https://narrateaml.com`)

### 3. Update Stripe Webhook URL

In Stripe Dashboard → Webhooks, add your production URL:
```
https://yourdomain.com/api/webhooks/stripe
```

Update `STRIPE_WEBHOOK_SECRET` in Vercel with the new production webhook secret.

### 4. Update Clerk Redirect URLs

In Clerk Dashboard, add your production URLs to allowed redirects:
- `https://yourdomain.com/dashboard`
- `https://yourdomain.com/onboarding`
- etc.

### 5. Monthly Usage Reset (Cron Job)

Set up a cron job to reset free-plan usage counters on the 1st of each month.

Option A: Vercel Cron (add to `vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/reset-usage",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

Then create `/src/app/api/cron/reset-usage/route.ts` that calls the `reset_monthly_usage()` SQL function.

Option B: Supabase scheduled function with `pg_cron` (requires paid plan):
```sql
SELECT cron.schedule(
  'reset-monthly-usage',
  '0 0 1 * *',
  'SELECT reset_monthly_usage()'
);
```

---

## Architecture Notes

### Security Model

- `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never exposed to browser
- All API routes verify Clerk authentication before any operation
- All Supabase queries from API routes use service role (bypasses RLS)
- Client-side Supabase queries (if any) use anon key with RLS enforced
- Rate limiting: 10 generation requests/minute/user (in-memory; upgrade to Upstash Redis for multi-instance)
- Input sanitization: strips HTML and LLM injection tokens from all form fields before prompt construction
- Stripe webhook signature verified before processing any event

### Statement Upload Privacy

Statement files (.xlsx, .xls, .csv, .pdf) are parsed entirely in the user's browser:
- **SheetJS** (`xlsx`) for Excel/CSV parsing
- **PDF.js** (`pdfjs-dist`) for PDF text extraction
- **Zero file bytes are transmitted to the server**
- Only extracted transaction data (text/JSON) is sent to the AI

### Streaming Generation

Generation uses SSE (Server-Sent Events) via a custom `ReadableStream`. Event format:
```json
{ "type": "id", "narrativeId": "uuid" }
{ "type": "chunk", "text": "..." }
{ "type": "done", "narrativeId": "uuid", "wordCount": 423 }
{ "type": "error", "message": "..." }
```

---

## Plan Limits

| Plan | Narratives/Month | Export | Templates | Upload | Revision |
|------|-----------------|--------|-----------|--------|----------|
| Free | 3 | ❌ | ❌ | ❌ | ❌ |
| Pro | Unlimited | ✅ | ✅ | ✅ | ✅ |
| Team | Unlimited | ✅ | ✅ (shared) | ✅ | ✅ |
| Lifetime | Unlimited | ✅ | ✅ | ✅ | ✅ |

Plan enforcement is **server-side only** on every generation and export request. Client-side plan state is never trusted.

---

## Post-Deploy Checklist

- [ ] Supabase schema applied and RLS verified
- [ ] Clerk app configured with all redirect URLs
- [ ] Stripe products created, price IDs in env vars
- [ ] Stripe webhook configured and verified (test with `stripe trigger`)
- [ ] Resend domain verified, from address set
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] All env vars added to Vercel
- [ ] Test sign-up → onboarding → generate → export flow
- [ ] Test Stripe checkout with test card `4242 4242 4242 4242`
- [ ] Verify webhook fires: subscribe → check plan updates in DB
- [ ] Set up monthly usage reset cron job

---

## License

Proprietary. All rights reserved. Not licensed for redistribution.

---

## Compliance Disclaimer

NarrateAML is an AI-assisted drafting tool. It is not a FINTRAC filing tool and does not
guarantee regulatory compliance. All narrative outputs are AI-assisted drafts that require
human review, editing, and approval by a qualified AML professional before submission to
any regulatory authority. NarrateAML does not provide legal advice.

**AI-Assisted Draft — Review for accuracy, completeness, and regulatory suitability before submission.**
