import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// Razorpay sends webhooks — verify and update subscription status
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') ?? '';

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
    if (webhookSecret) {
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      if (expected !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const supabase = createAdminClient();

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      await supabase
        .from('user_subscriptions')
        .update({ status: 'active', razorpay_payment_id: payment.id })
        .eq('razorpay_order_id', orderId);
    }

    if (event.event === 'subscription.cancelled') {
      const orderId = event.payload.subscription?.entity?.notes?.orderId;
      if (orderId) {
        await supabase
          .from('user_subscriptions')
          .update({ status: 'cancelled' })
          .eq('razorpay_order_id', orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
