import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Use getSession() — local JWT validation, no network round-trip
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, billingCycle = 'monthly' } = body;

    // Fetch plan from DB
    const { data: plan, error: planErr } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planErr || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const amount = billingCycle === 'yearly'
      ? (plan.price_yearly ?? plan.price_monthly * 10)
      : plan.price_monthly;

    if (amount === 0) {
      return NextResponse.json({ error: 'Cannot create order for free plan' }, { status: 400 });
    }

    // price_monthly is stored in paise — no conversion needed
    const finalAmount = Math.max(amount, 100);

    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency: 'INR',
      receipt: `av_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        billingCycle,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planName: plan.name,
      userEmail: user.email,
    });
  } catch (err: unknown) {
    console.error('Create order error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to create order';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
