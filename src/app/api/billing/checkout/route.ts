import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createCheckoutSession, getCheckoutMode } from '@/lib/stripe'
import { getUserByClerkId } from '@/lib/supabase/user-sync'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { priceId } = await request.json()
  if (!priceId || typeof priceId !== 'string') {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 })
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress || user.email

  try {
    const mode = getCheckoutMode(priceId)
    const { url } = await createCheckoutSession({
      userId: user.id,
      clerkUserId: userId,
      priceId,
      email,
      mode,
    })
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[billing/checkout] error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
