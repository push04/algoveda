import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
  Expires: '0',
  Pragma: 'no-cache',
};

function applyNoCacheHeaders(response: NextResponse) {
  Object.entries(NO_CACHE_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // Primary check: verified claims.
  // Fallback: cookie session (avoids false redirects when auth network is flaky).
  const { data: claimsData } = await supabase.auth.getClaims();
  let isLoggedIn = !!claimsData?.claims;
  if (!isLoggedIn) {
    const { data: sessionData } = await supabase.auth.getSession();
    isLoggedIn = !!sessionData?.session?.user;
  }
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon');

  function redirectWith(url: URL): NextResponse {
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => {
        const { name, value, ...options } = cookie;
        response.cookies.set(name, value, options);
      });
    supabaseResponse.headers.forEach((value, key) => response.headers.set(key, value));
    applyNoCacheHeaders(response);
    return response;
  }

  if (!isPublic && !isLoggedIn) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return redirectWith(url);
  }

  if (isLoggedIn && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    return redirectWith(new URL('/dashboard', request.url));
  }

  applyNoCacheHeaders(supabaseResponse);
  return supabaseResponse;
}
