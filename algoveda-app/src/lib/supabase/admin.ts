import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

/**
 * Server-side admin client that bypasses Row Level Security.
 * ONLY use in server-side API routes — never expose to the client.
 */
export function createAdminClient() {
  return supabaseCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
