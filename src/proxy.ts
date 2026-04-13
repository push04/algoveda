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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Optimistic session check from cookie — no network call.
  // Per Next.js 16 docs: Proxy should only read session from cookie, not make
  // DB/auth-server calls, to avoid performance issues and redirect loops.
  // Full token validation happens inside API routes via getUser().
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session?.user;

  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon');

  // Auth-only pages users shouldn't see if already logged in
  const authOnlyPages = ['/auth/login', '/auth/signup'];

  if (!isPublic && !isLoggedIn) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && authOnlyPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
