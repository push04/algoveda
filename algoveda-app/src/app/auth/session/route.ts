import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accessToken = body?.access_token;
    const refreshToken = body?.refresh_token;

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Missing session tokens' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to sync session' }, { status: 500 });
  }
}
