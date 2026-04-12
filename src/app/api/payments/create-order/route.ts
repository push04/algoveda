import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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

    // Create Razorpay order (amount in paise - multiply rupees by 100)
    const amountInPaise = amount;
    const order = await razorpay.orders.create({
      amount: amountInPaise,
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
  } catch (err: any) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: err.message ?? 'Failed to create order' }, { status: 500 });
  }
}
