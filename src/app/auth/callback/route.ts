import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const errorParam = requestUrl.searchParams.get('error');

  // Surface any Supabase error params (e.g. expired link)
  if (errorParam) {
    const desc = requestUrl.searchParams.get('error_description') ?? 'Authentication error';
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(desc)}`, request.url)
    );
  }

  // PKCE flow: exchange code for session (email confirm, OAuth)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Use absolute redirect so Vercel edge doesn't strip Set-Cookie headers
      const redirectUrl = new URL(next, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.redirect(
      new URL('/auth/login?error=auth_callback_error', request.url)
    );
  }

  // No code and no error — could be a fragment (#access_token) flow.
  // Fragments are client-side only; redirect to update-password which
  // listens to onAuthStateChange to pick up the token.
  return NextResponse.redirect(new URL('/auth/update-password', request.url));
}