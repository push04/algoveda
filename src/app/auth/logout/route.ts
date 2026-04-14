import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Use absolute redirect — avoids relative-URL issues on Vercel
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/auth/login`, { status: 302 });
}

// Support GET logout links (e.g. email unsubscribe / simple nav)
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/auth/login`, { status: 302 });
}
