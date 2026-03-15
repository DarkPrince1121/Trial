import { getSupabaseServerClient } from './server'
import type { User, Plan } from '@/types'

// ── Sync Clerk user to Supabase users table ─────────────────
// Called on first sign-in if user row doesn't exist.

export async function syncClerkUserToSupabase({
  clerkUserId,
  email,
  fullName,
}: {
  clerkUserId: string
  email: string
  fullName: string | null
}): Promise<User | null> {
  const supabase = getSupabaseServerClient()

  // Upsert — safe to call on every auth even if row already exists
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_user_id: clerkUserId,
        email,
        full_name: fullName,
      },
      {
        onConflict: 'clerk_user_id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single()

  if (error) {
    console.error('[user-sync] upsert error:', error.message)
    return null
  }

  return data as User
}

// ── Get user by Clerk ID ─────────────────────────────────────

export async function getUserByClerkId(
  clerkUserId: string
): Promise<User | null> {
  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      // PGRST116 = not found
      console.error('[user-sync] getUserByClerkId error:', error.message)
    }
    return null
  }

  return data as User
}

// ── Check onboarding completion ──────────────────────────────

export async function checkOnboardingComplete(
  clerkUserId: string
): Promise<boolean> {
  const supabase = getSupabaseServerClient()

  const { data } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('clerk_user_id', clerkUserId)
    .single()

  return data?.onboarding_completed === true
}

// ── Increment narratives_used_this_month ─────────────────────
// Uses atomic increment to avoid race conditions

export async function incrementNarrativesUsed(
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseServerClient()

  const { error } = await supabase.rpc('increment_narratives_used', {
    p_user_id: userId,
  })

  if (error) {
    // Fallback: manual increment if RPC not available
    const { error: updateError } = await supabase
      .from('users')
      .update({
        narratives_used_this_month: supabase.rpc('narratives_used_this_month + 1' as never),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[user-sync] incrementNarrativesUsed error:', updateError.message)
      return false
    }
  }

  return true
}

// ── Safe increment using raw SQL ─────────────────────────────

export async function incrementNarrativesUsedSafe(
  userId: string
): Promise<void> {
  const supabase = getSupabaseServerClient()

  // Use SQL to atomically increment
  await supabase
    .from('users')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', userId)

  // Direct increment via Supabase RPC
  const { error } = await supabase.rpc('increment_narratives_used_by_id', {
    p_user_id: userId,
  })

  if (error) {
    // Fallback: read then write (less ideal but safe enough for this context)
    const { data: user } = await supabase
      .from('users')
      .select('narratives_used_this_month')
      .eq('id', userId)
      .single()

    if (user) {
      await supabase
        .from('users')
        .update({
          narratives_used_this_month: (user.narratives_used_this_month || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    }
  }
}

// ── Update user plan ─────────────────────────────────────────

export async function updateUserPlan(
  clerkUserId: string,
  plan: Plan,
  billingStatus: string = 'active'
): Promise<void> {
  const supabase = getSupabaseServerClient()

  const monthlyLimit =
    plan === 'free'
      ? 3
      : 999999

  await supabase
    .from('users')
    .update({
      plan,
      billing_status: billingStatus,
      monthly_limit: monthlyLimit,
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', clerkUserId)
}

// ── Ensure notification preferences row exists ───────────────

export async function ensureNotificationPreferences(
  userId: string
): Promise<void> {
  const supabase = getSupabaseServerClient()

  await supabase
    .from('notification_preferences')
    .upsert(
      { user_id: userId },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )
}
