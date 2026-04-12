import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });

    const body = await request.json();
    const { type, to, subject, html, template } = body;

    // Build email content based on type
    let emailHtml = html || '';
    let emailSubject = subject || 'AlgoVeda Update';

    if (type === 'digest') {
      emailSubject = 'Your Daily Market Digest - AlgoVeda';
      emailHtml = html || `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A4D2E;">Market Digest</h1>
        <p>Here is your daily market update from AlgoVeda.</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">Sent via Resend</p>
      </div>`;
    } else if (type === 'alert') {
      emailSubject = subject || 'Price Alert - AlgoVeda';
      emailHtml = html || `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4A843;">Price Alert</h1>
        <p>One of your watchlist stocks has hit your alert price.</p>
        <hr/>
        <p style="color: #666; font-size: 12px;">Sent via Resend</p>
      </div>`;
    } else if (type === 'welcome') {
      emailSubject = 'Welcome to AlgoVeda - Start Your Trading Journey';
      emailHtml = html || `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A4D2E;">Welcome to AlgoVeda!</h1>
        <p>Your account has been created. Get started with paper trading to practice your strategies.</p>
        <p>Use your Rs 1,00,000 paper trading balance to practice risk-free.</p>
        <a href="https://algoveda.com/paper-trade" style="background: #1A4D2E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Start Paper Trading</a>
        <hr/>
        <p style="color: #666; font-size: 12px;">Sent via Resend</p>
      </div>`;
    }

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AlgoVeda <noreply@algoveda.com>',
        to: to || user.email,
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', data);
      return NextResponse.json({ error: data.message || 'Failed to send email' }, { status: 500 });
    }

    // Log the email
    await supabase.from('email_logs').insert({
      user_id: user.id,
      email_type: type || 'general',
      recipient: to || user.email,
      status: 'sent',
    });

    return NextResponse.json({ ok: true, emailId: data.id });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}