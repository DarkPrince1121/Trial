import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { updateUserPlan } from '@/lib/supabase/user-sync'
import { getPlanFromPriceId } from '@/lib/stripe'
import { sendPaymentFailedEmail } from '@/lib/resend/emails'
import type { Plan } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Critical: Read raw body as text for signature verification
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json(
      { error: `Webhook signature error: ${(err as Error).message}` },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServerClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const clerkUserId = session.metadata?.clerk_user_id
        const supabaseUserId = session.metadata?.supabase_user_id
        const priceId = session.metadata?.price_id

        if (!clerkUserId || !priceId) break

        const plan = getPlanFromPriceId(priceId) as Plan

        // Update user plan
        await updateUserPlan(clerkUserId, plan, 'active')

        // Get Stripe subscription ID if subscription mode
        const stripeCustomerId = session.customer as string
        const stripeSubscriptionId = session.subscription as string | null

        // Upsert subscription record
        if (supabaseUserId) {
          await supabase.from('subscriptions').upsert(
            {
              user_id: supabaseUserId,
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              stripe_price_id: priceId,
              status: 'active',
              current_period_end: stripeSubscriptionId
                ? null // Will be updated by subscription.updated event
                : null,
            },
            { onConflict: 'stripe_subscription_id', ignoreDuplicates: false }
          )

          // Log audit
          await supabase.from('audit_logs').insert({
            user_id: supabaseUserId,
            entity_type: 'subscription',
            action: 'plan_upgraded',
            after_data: { plan, price_id: priceId },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? getPlanFromPriceId(priceId) : 'free'

        // Find user by stripe customer ID
        const { data: subRecord } = await supabase
          .from('subscriptions')
          .select('user_id, users!subscriptions_user_id_fkey(clerk_user_id)')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()

        if (subRecord) {
          const clerkUserId = (subRecord as Record<string, unknown> & { users?: { clerk_user_id: string } }).users?.clerk_user_id

          // Map Stripe status to our billing_status
          const billingStatus =
            subscription.status === 'active'
              ? 'active'
              : subscription.status === 'past_due'
              ? 'past_due'
              : subscription.status === 'trialing'
              ? 'trialing'
              : 'canceled'

          if (clerkUserId) {
            await updateUserPlan(clerkUserId, plan as Plan, billingStatus)
          }

          // Update subscription record
          await supabase
            .from('subscriptions')
            .update({
              stripe_price_id: priceId,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', subscription.customer as string)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { data: subRecord } = await supabase
          .from('subscriptions')
          .select('user_id, users!subscriptions_user_id_fkey(clerk_user_id)')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()

        if (subRecord) {
          const clerkUserId = (subRecord as Record<string, unknown> & { users?: { clerk_user_id: string } }).users?.clerk_user_id

          if (clerkUserId) {
            await updateUserPlan(clerkUserId, 'free', 'canceled')
          }

          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', subscription.customer as string)

          if (subRecord.user_id) {
            await supabase.from('audit_logs').insert({
              user_id: subRecord.user_id,
              entity_type: 'subscription',
              action: 'subscription_canceled',
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: subRecord } = await supabase
          .from('subscriptions')
          .select('user_id, users!subscriptions_user_id_fkey(clerk_user_id, email, full_name)')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subRecord) {
          const user = (subRecord as Record<string, unknown> & { users?: { clerk_user_id: string; email: string; full_name: string | null } }).users
          if (user?.clerk_user_id) {
            await updateUserPlan(user.clerk_user_id, user.clerk_user_id ? 'pro' : 'free', 'past_due')
          }

          await supabase
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_customer_id', customerId)

          // Send payment failed email
          if (user?.email) {
            await sendPaymentFailedEmail(user.email, user.full_name)
          }
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        const { data: subRecord } = await supabase
          .from('subscriptions')
          .select('user_id, users!subscriptions_user_id_fkey(clerk_user_id)')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subRecord) {
          const clerkUserId = (subRecord as Record<string, unknown> & { users?: { clerk_user_id: string } }).users?.clerk_user_id
          if (clerkUserId) {
            await supabase
              .from('users')
              .update({
                billing_status: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('clerk_user_id', clerkUserId)
          }
        }
        break
      }

      default:
        // Ignore other events
        break
    }
  } catch (err) {
    console.error(`[webhook] error handling event ${event.type}:`, err)
    // Return 200 to acknowledge receipt even if processing failed
    // Stripe will retry if we return non-2xx
  }

  return NextResponse.json({ received: true })
}
