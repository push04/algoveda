import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', admin: null };
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'Forbidden', admin: null };
  return { error: null, admin: createAdminClient() };
}

// GET — list all users with profiles and subscription info
export async function GET(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const from = (page - 1) * limit;

  let query = admin!
    .from('profiles')
    .select('id, full_name, email, is_admin, created_at, quiz_score, education_unlocked', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error: dbErr, count } = await query;
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  return NextResponse.json({ users: data, total: count, page, limit });
}

// PATCH — toggle admin or update user
export async function PATCH(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const { data, error: dbErr } = await admin!
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
