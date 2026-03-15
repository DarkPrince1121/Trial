import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || ''
  const range = searchParams.get('range') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const supabase = getSupabaseServerClient()

  let query = supabase
    .from('narratives')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_deleted', false)

  if (search) {
    query = query.ilike('subject_name', `%${search}%`)
  }

  if (type && type !== 'All Types') {
    query = query.eq('transaction_type', type)
  }

  if (range === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    query = query.gte('created_at', weekAgo.toISOString())
  } else if (range === 'month') {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    query = query.gte('created_at', monthAgo.toISOString())
  }

  if (sort === 'amount') {
    query = query.order('transaction_amount', { ascending: false, nullsFirst: false })
  } else if (sort === 'words') {
    query = query.order('word_count', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  })
}
