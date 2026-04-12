import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Extended type that includes auth methods
interface AuthClient {
  auth: {
    getUser(): Promise<{ data: { user: { id: string; email: string } | null }; error: Error | null }>;
    getSession(): Promise<{ data: { session: { access_token: string; user: { id: string } } | null }; error: Error | null }>;
    exchangeCodeForSession(code: string): Promise<{ error: Error | null }>;
    signOut(): Promise<{ error: Error | null }>;
  };
  from(table: string): any;
}

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
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
            // ignore
          }
        },
      },
    }
  );

  // Return with type assertion
  return client as AuthClient;
}