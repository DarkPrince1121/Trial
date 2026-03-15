import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const supabase = getSupabaseServerClient()

  try {
    // 1. Insert audit log before deletion
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      entity_type: 'user',
      entity_id: user.id,
      action: 'account_deleted',
      before_data: {
        email: user.email,
        plan: user.plan,
        clerk_user_id: user.clerk_user_id,
      },
    })

    // 2. Soft-delete user data — cascades will handle related rows via ON DELETE CASCADE
    // But we want to keep the audit log user_id reference, so we use soft delete approach:
    // Mark the user as deleted by setting a flag (we don't have is_deleted on users,
    // so instead we'll clear PII and orphan the audit log entry)

    // Clear user PII
    await supabase
      .from('users')
      .update({
        email: `deleted_${user.id}@deleted.invalid`,
        full_name: null,
        institution_name: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    // 3. Delete from Clerk (this will revoke all sessions)
    const client = await clerkClient()
    await client.users.deleteUser(userId)

    // 4. Hard delete from Supabase (cascade will clean related data)
    await supabase.from('users').delete().eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[account/delete] error:', err)
    return NextResponse.json(
      { error: 'Account deletion failed. Please contact support.' },
      { status: 500 }
    )
  }
}
