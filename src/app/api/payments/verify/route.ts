import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billingCycle = 'monthly',
    } = body;

    // Verify Razorpay signature FIRST (no auth required for this step)
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const supabase = await createClient();

    // Use getSession() — local JWT validation, more reliable than getUser()
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate subscription end date
    const now = new Date();
    const endsAt = new Date(now);
    if (billingCycle === 'yearly') {
      endsAt.setFullYear(endsAt.getFullYear() + 1);
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1);
    }

    // Cancel any existing active subscription
    await supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Create new subscription record
    const { data: sub, error: subErr } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'active',
        billing_cycle: billingCycle,
        starts_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: endsAt.toISOString(),
      })
      .select()
      .single();

    if (subErr) throw subErr;

    // Read plan name for profile update
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('name, slug')
      .eq('id', planId)
      .single();

    // Update user profile with plan name
    await supabase
      .from('profiles')
      .update({ plan: plan?.slug ?? plan?.name ?? 'standard', updated_at: now.toISOString() })
      .eq('id', user.id);

    // Auto-create paper trading portfolio for all paid plan subscribers
    const { data: existingPort } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'paper')
      .eq('is_active', true)
      .maybeSingle();

    if (!existingPort) {
      await supabase.from('portfolios').insert({
        user_id: user.id,
        name: 'My Paper Portfolio',
        type: 'paper',
        initial_capital: 100000,
        current_cash: 100000,
        is_active: true,
      });
    }

    return NextResponse.json({
      success: true,
      subscription: sub,
      message: 'Subscription activated successfully!',
    });
  } catch (err: unknown) {
    console.error('Payment verify error:', err);
    const msg = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
