import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'

export const dynamic = 'force-dynamic'

// GET /api/settings
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const supabase = getSupabaseServerClient()

  // Get notification preferences (create defaults if missing)
  let { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!prefs) {
    const { data: newPrefs } = await supabase
      .from('notification_preferences')
      .insert({ user_id: user.id })
      .select()
      .single()
    prefs = newPrefs
  }

  return NextResponse.json({
    full_name: user.full_name || '',
    email: user.email,
    institution_name: user.institution_name || '',
    role: user.role || '',
    plan: user.plan,
    usage_alerts: prefs?.usage_alerts ?? true,
    billing_alerts: prefs?.billing_alerts ?? true,
    product_updates: prefs?.product_updates ?? false,
  })
}

// PUT /api/settings
export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json()
  const {
    full_name,
    institution_name,
    role,
    usage_alerts,
    billing_alerts,
    product_updates,
  } = body

  const supabase = getSupabaseServerClient()

  // Update user profile
  const profileUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (full_name !== undefined) profileUpdates.full_name = String(full_name).slice(0, 200)
  if (institution_name !== undefined) profileUpdates.institution_name = String(institution_name).slice(0, 200)
  if (role !== undefined) profileUpdates.role = String(role).slice(0, 100)

  await supabase
    .from('users')
    .update(profileUpdates)
    .eq('id', user.id)

  // Update notification preferences
  const notifUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (usage_alerts !== undefined) notifUpdates.usage_alerts = Boolean(usage_alerts)
  if (billing_alerts !== undefined) notifUpdates.billing_alerts = Boolean(billing_alerts)
  if (product_updates !== undefined) notifUpdates.product_updates = Boolean(product_updates)

  await supabase
    .from('notification_preferences')
    .upsert(
      { user_id: user.id, ...notifUpdates },
      { onConflict: 'user_id', ignoreDuplicates: false }
    )

  return NextResponse.json({ success: true })
}
