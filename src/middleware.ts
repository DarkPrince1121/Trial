import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/generate(.*)',
  '/history(.*)',
  '/templates(.*)',
  '/billing(.*)',
  '/settings(.*)',
  '/onboarding(.*)',
  '/api/generate(.*)',
  '/api/history(.*)',
  '/api/templates(.*)',
  '/api/export(.*)',
  '/api/billing(.*)',
  '/api/onboarding(.*)',
  '/api/usage(.*)',
  '/api/settings(.*)',
  '/api/account(.*)',
])

// Auth pages — redirect away if already logged in
const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const url = req.nextUrl.clone()

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(req) && userId) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Protect app routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
