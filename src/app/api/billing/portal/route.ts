import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createPortalSession } from '@/lib/stripe'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const supabase = getSupabaseServerClient()

  // Get Stripe customer ID from subscriptions table
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found. Please subscribe first.' },
      { status: 404 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const returnUrl = `${appUrl}/billing`

  try {
    const { url } = await createPortalSession({
      stripeCustomerId: subscription.stripe_customer_id,
      returnUrl,
    })
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[billing/portal] error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Portal session failed' },
      { status: 500 }
    )
  }
}
