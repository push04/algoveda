import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
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
  const response = NextResponse.redirect(buildRedirect(request), { status: 302 });
  const cookieStore = await cookies();
  cookieStore.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-')) {
      response.cookies.set(name, '', { path: '/', maxAge: 0 });
    }
  });
  return response;
}

// Support GET logout links (e.g. email unsubscribe / simple nav)
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const response = NextResponse.redirect(buildRedirect(request), { status: 302 });
  const cookieStore = await cookies();
  cookieStore.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-')) {
      response.cookies.set(name, '', { path: '/', maxAge: 0 });
    }
  });
  return response;
}
