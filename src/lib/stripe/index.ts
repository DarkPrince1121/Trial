import Stripe from 'stripe'

// Singleton Stripe client — server-side only
// NEVER import this in client components

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return stripeInstance
}

// ── Create Checkout Session ───────────────────────────────────

export async function createCheckoutSession({
  userId,
  clerkUserId,
  priceId,
  email,
  mode,
}: {
  userId: string
  clerkUserId: string
  priceId: string
  email: string
  mode: 'subscription' | 'payment'
}): Promise<{ url: string }> {
  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Find or create Stripe customer
  const customerId = await getOrCreateStripeCustomer({ clerkUserId, email, stripe })

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode,
    success_url: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing?canceled=true`,
    allow_promotion_codes: true,
    metadata: {
      clerk_user_id: clerkUserId,
      supabase_user_id: userId,
      price_id: priceId,
    },
    subscription_data:
      mode === 'subscription'
        ? {
            metadata: {
              clerk_user_id: clerkUserId,
              supabase_user_id: userId,
            },
          }
        : undefined,
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.url) {
    throw new Error('Failed to create Stripe checkout session URL')
  }

  return { url: session.url }
}

// ── Create Billing Portal Session ────────────────────────────

export async function createPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string
  returnUrl: string
}): Promise<{ url: string }> {
  const stripe = getStripe()

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  })

  return { url: session.url }
}

// ── Get or Create Stripe Customer ────────────────────────────

export async function getOrCreateStripeCustomer({
  clerkUserId,
  email,
  stripe,
}: {
  clerkUserId: string
  email: string
  stripe?: Stripe
}): Promise<string> {
  const stripeClient = stripe || getStripe()

  // Search for existing customer by metadata
  const existingCustomers = await stripeClient.customers.search({
    query: `metadata['clerk_user_id']:'${clerkUserId}'`,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  // Create new customer
  const customer = await stripeClient.customers.create({
    email,
    metadata: {
      clerk_user_id: clerkUserId,
    },
  })

  return customer.id
}

// ── Map Price ID to Plan ─────────────────────────────────────

export function getPlanFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_PRO_MONTHLY!]: 'pro',
    [process.env.STRIPE_PRICE_PRO_ANNUAL!]: 'pro',
    [process.env.STRIPE_PRICE_TEAM_MONTHLY!]: 'team',
    [process.env.STRIPE_PRICE_LIFETIME!]: 'lifetime',
  }
  return priceMap[priceId] || 'free'
}

// ── Determine checkout mode from price ID ────────────────────

export function getCheckoutMode(
  priceId: string
): 'subscription' | 'payment' {
  if (priceId === process.env.STRIPE_PRICE_LIFETIME) {
    return 'payment' // One-time payment for lifetime
  }
  return 'subscription'
}
