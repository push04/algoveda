import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: update the request-side cookies so subsequent reads see them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Step 2: create a fresh response carrying those cookies to the browser
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession() is fast (reads cookies). Safe for routing decisions.
  // getUser() (network call) is used inside individual API routes / server actions.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoggedIn = !!session?.user;
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon');

  // Helper: redirect while carrying any refreshed session cookies
  function redirectWith(url: URL): NextResponse {
    const res = NextResponse.redirect(url);
    // Forward any cookies Supabase may have refreshed during this request
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      res.cookies.set(name, value);
    });
    return res;
  }

  // Unauthenticated user hitting a protected route
  if (!isPublic && !isLoggedIn) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return redirectWith(url);
  }

  // Authenticated user hitting login/signup — send to dashboard
  if (isLoggedIn && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return redirectWith(new URL('/dashboard', request.url));
  }

  // IMPORTANT: always return supabaseResponse so refreshed tokens reach the browser
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
