import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using service role key
// BYPASSES Row Level Security — use only in API routes and server components
// NEVER import this file in client components

export function getSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
