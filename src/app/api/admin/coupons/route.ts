import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ coupons: coupons || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const body = await request.json();
    const { code, description, discount_percent, max_uses, valid_until, is_active } = body;

    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    const { data, error } = await supabase
      .from('coupons')
      .insert({ code: code.toUpperCase(), description, discount_percent, max_uses, valid_until: valid_until || null, is_active })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ coupon: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const body = await request.json();
    const { id, code, description, discount_percent, max_uses, valid_until, is_active } = body;

    const { data, error } = await supabase
      .from('coupons')
      .update({ code: code.toUpperCase(), description, discount_percent, max_uses, valid_until: valid_until || null, is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ coupon: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const body = await request.json();
    const { id, is_active } = body;

    const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const body = await request.json();
    const { id } = body;

    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}