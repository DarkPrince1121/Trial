import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { sendWelcomeEmail } from '@/lib/resend/emails'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { role, institutionType, strVolume } = await request.json()

  if (!role || !institutionType || !strVolume) {
    return NextResponse.json(
      { error: 'role, institutionType, and strVolume are required' },
      { status: 400 }
    )
  }

  const supabase = getSupabaseServerClient()

  const { error } = await supabase
    .from('users')
    .update({
      onboarding_role: role,
      onboarding_institution_type: institutionType,
      onboarding_str_volume: strVolume,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Ensure notification preferences row exists
  await supabase
    .from('notification_preferences')
    .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true })

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.full_name).catch(console.error)

  return NextResponse.json({ success: true })
}
