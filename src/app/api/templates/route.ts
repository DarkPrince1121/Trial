import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getUserByClerkId } from '@/lib/supabase/user-sync'
import { canUseTemplates } from '@/lib/utils/entitlements'

export const dynamic = 'force-dynamic'

// GET /api/templates — list user templates + shared team templates
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const supabase = getSupabaseServerClient()

  // Fetch user's own templates
  const { data: ownTemplates, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch shared templates from team members (if applicable)
  const { data: teamMemberships } = await supabase
    .from('team_memberships')
    .select('team_owner_user_id')
    .eq('member_user_id', user.id)

  let sharedTemplates: unknown[] = []
  if (teamMemberships && teamMemberships.length > 0) {
    const ownerIds = teamMemberships.map((m: { team_owner_user_id: string }) => m.team_owner_user_id)
    const { data: shared } = await supabase
      .from('templates')
      .select('*, users!templates_user_id_fkey(full_name)')
      .in('user_id', ownerIds)
      .eq('is_shared', true)
      .order('created_at', { ascending: false })
    sharedTemplates = shared || []
  }

  return NextResponse.json({
    templates: [...(ownTemplates || []), ...sharedTemplates],
  })
}

// POST /api/templates — create template
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const entitlement = canUseTemplates(user)
  if (!entitlement.allowed) {
    return NextResponse.json({ error: entitlement.reason }, { status: 403 })
  }

  const body = await request.json()
  const { name, description, formData, isShared } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
  }

  const supabase = getSupabaseServerClient()

  const { data, error } = await supabase
    .from('templates')
    .insert({
      user_id: user.id,
      name: name.trim().slice(0, 100),
      description: description?.trim().slice(0, 500) || null,
      form_data: formData || {},
      is_shared: user.plan === 'team' ? Boolean(isShared) : false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log usage
  await supabase.from('usage_log').insert({
    user_id: user.id,
    action: 'template_save',
    metadata: { template_id: data.id, name: data.name },
  })

  return NextResponse.json({ template: data }, { status: 201 })
}
