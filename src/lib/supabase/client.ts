import { createClient } from '@supabase/supabase-js'

// Browser-safe Supabase client using public anon key
// RLS policies are enforced for this client
// Use only in client components (NOT in API routes)

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    )
  }
  return supabaseClient
}
