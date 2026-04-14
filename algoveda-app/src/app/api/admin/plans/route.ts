import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, admin: null, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return { user, admin: null, error: 'Forbidden' };
  return { user, admin: createAdminClient(), error: null };
}

// GET — list all plans
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price_monthly', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data });
}

// POST — create plan (admin)
export async function POST(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();
  const { name, price_monthly, price_yearly, features, limits, is_active = true } = body;

  const { data, error: dbErr } = await admin!
    .from('subscription_plans')
    .insert({ name, price_monthly, price_yearly, features, limits, is_active })
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ plan: data }, { status: 201 });
}

// PUT — update plan (admin)
export async function PUT(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });

  const { data, error: dbErr } = await admin!
    .from('subscription_plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ plan: data });
}

// DELETE — delete plan (admin)
export async function DELETE(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });

  const { error: dbErr } = await admin!
    .from('subscription_plans')
    .delete()
    .eq('id', id);

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
