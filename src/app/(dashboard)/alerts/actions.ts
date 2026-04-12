'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { AlertConfig } from '@/lib/supabase/types';

export async function getAlerts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('alert_configs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as AlertConfig[];
}

export async function createAlert(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const symbol = formData.get('symbol') as string;
  const alert_type = formData.get('alert_type') as string;
  const thresholdStr = formData.get('threshold') as string;
  const threshold = parseFloat(thresholdStr);

  if (!symbol || !alert_type || isNaN(threshold)) {
    return { error: 'Missing or invalid fields' };
  }

  const { error } = await supabase
    .from('alert_configs')
    .insert({
      user_id: user.id,
      symbol: symbol.toUpperCase(),
      alert_type,
      threshold,
      channel: 'email',
      is_active: true,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/alerts');
  return { success: true };
}

export async function deleteAlert(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('alert_configs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/alerts');
}

export async function testTriggerAlert(alertId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Fetch the alert details
  const { data: alertData, error: alertError } = await supabase
    .from('alert_configs')
    .select('*')
    .eq('id', alertId)
    .eq('user_id', user.id)
    .single();

  if (alertError || !alertData) {
    throw new Error('Alert not found');
  }

  // Determine subject and HTML based on alert
  const subject = `🔥 ALGOVEDA ALERT: ${alertData.symbol} trigger met!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E8E6DF; border-radius: 12px; overflow: hidden;">
      <div style="background: #1A4D2E; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">AlgoVeda Alert Triggered</h1>
      </div>
      <div style="padding: 24px; background: #fafafa;">
        <p style="font-size: 16px; color: #333;">Your alert condition has been met.</p>
        <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #E8E6DF; margin-top: 16px;">
          <p style="margin: 0 0 8px 0;"><strong>Symbol:</strong> ${alertData.symbol}</p>
          <p style="margin: 0 0 8px 0;"><strong>Type:</strong> ${alertData.alert_type}</p>
          <p style="margin: 0 0 0 0;"><strong>Threshold:</strong> ${alertData.threshold}</p>
        </div>
      </div>
      <div style="padding: 16px 24px; text-align: center; color: #666; font-size: 12px; background: white;">
        <p style="margin: 0;">Sent automatically by AlgoVeda alerts engine.</p>
      </div>
    </div>
  `;

  // Use the internal email API endpoint logic, but we can't easily fetch our own nextjs full url in server actions reliably.
  // Instead, fetch from the route using a full absolute URL if available, or just call resend directly here?
  // The route '/api/email/send' relies on RESEND_API_KEY. It's safer to reproduce the logic or hit the app endpoint.
  // We can just hit 'http://localhost:3000/api/email/send' but that is environment dependent. Let's send the email locally using Resend here to guarantee delivery.
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY variable.');
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AlgoVeda <onboarding@resend.dev>', // or noreply@algoveda.com if domain verified
      to: user.email,
      subject: subject,
      html: html,
    }),
  });

  const resData = await res.json();
  if (!res.ok) {
    console.error('Resend error:', resData);
    throw new Error(resData.message || 'Failed to send email');
  }

  // Update last triggered
  await supabase
    .from('alert_configs')
    .update({ 
      last_triggered: new Date().toISOString(),
      trigger_count: (alertData.trigger_count || 0) + 1
    })
    .eq('id', alertId);

  revalidatePath('/alerts');
  return { success: true };
}
