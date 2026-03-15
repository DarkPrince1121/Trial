import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { getMonthlyLimit } from '@/lib/utils/entitlements'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const supabase = getSupabaseServerClient()

  // Get total narratives
  const { count: totalNarratives } = await supabase
    .from('narratives')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_deleted', false)

  // Get total exports
  const { count: totalExports } = await supabase
    .from('usage_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('action', ['export_docx', 'export_pdf'])

  const total = totalNarratives || 0
  const hoursSaved = parseFloat(((total * 45) / 60).toFixed(1))
  const monthlyLimit = getMonthlyLimit(user.plan)

  return NextResponse.json({
    totalNarratives: total,
    totalExports: totalExports || 0,
    hoursSaved,
    narrativesThisMonth: user.narratives_used_this_month,
    monthlyLimit,
    plan: user.plan,
    billingStatus: user.billing_status,
    resetDate: user.reset_date,
  })
}
