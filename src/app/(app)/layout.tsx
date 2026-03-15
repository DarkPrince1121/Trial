import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppTopBar } from '@/components/layout/AppTopBar'
import { getUserByClerkId, syncClerkUserToSupabase } from '@/lib/supabase/user-sync'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Get Clerk user for sync
  const clerkUser = await currentUser()
  if (!clerkUser) redirect('/sign-in')

  const email = clerkUser.emailAddresses[0]?.emailAddress || ''
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null

  // Sync to Supabase (upsert — idempotent)
  await syncClerkUserToSupabase({ clerkUserId: userId, email, fullName })

  // Fetch user row
  const user = await getUserByClerkId(userId)

  if (!user) {
    // Should not happen after sync, but guard against DB errors
    redirect('/sign-in')
  }

  if (!user.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AppSidebar user={user} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppTopBar user={user} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}
