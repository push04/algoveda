import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function buildRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get('redirect');
  const nextPath = redirectTo
    ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/auth/login';
  return `${origin}${nextPath}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(buildRedirect(request), { status: 302 });
}

// Support GET logout links (e.g. email unsubscribe / simple nav)
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(buildRedirect(request), { status: 302 });
}
