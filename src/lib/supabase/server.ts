import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type ExtendedSupabaseClient = ReturnType<typeof createServerClient> & {
  auth: {
    getUser: () => Promise<{ data: { user: any }; error: any }>;
    getSession: () => Promise<{ data: { session: any }; error: any }>;
  };
};

export async function createClient(): Promise<ExtendedSupabaseClient> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore in Server Components
          }
        },
      },
    }
  ) as ExtendedSupabaseClient;

  return supabase;
}