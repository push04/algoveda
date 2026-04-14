import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const errorParam = requestUrl.searchParams.get('error');

  if (errorParam) {
    const desc = requestUrl.searchParams.get('error_description') ?? 'Authentication error';
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(desc)}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const redirectUrl = new URL(next, requestUrl.origin);
      const response = NextResponse.redirect(redirectUrl);
      
      const { createServerClient } = await import('@supabase/ssr');
      const supabaseServerClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value);
                response.cookies.set(name, value);
              });
            },
          },
        }
      );
      
      await supabaseServerClient.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      
      return response;
    }

    return NextResponse.redirect(
      new URL('/auth/login?error=auth_callback_error', requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL('/auth/update-password', requestUrl.origin));
}
