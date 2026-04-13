import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  // Use getSession() — local JWT validation, no network round-trip required
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check subscription FIRST — before any portfolio fetch
  // This ensures stale/old portfolio rows don't bypass the subscription gate
  const { data: subs } = await supabase
    .from('user_subscriptions')
    .select('status, plan_id')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing']);

  const hasPaidSub = !!(subs && subs.length > 0);

  if (!hasPaidSub) {
    // No active subscription — never show portfolio data
    return NextResponse.json({ portfolio: null, holdings: [], orders: [], requiresSubscription: true });
  }

  // User has subscription — fetch their portfolio
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'paper')
    .eq('is_active', true)
    .single();

  if (!portfolio) {
    // Has subscription but no portfolio yet — create one with ₹1,00,000 virtual capital
    const { data: newPort } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: 'My Paper Portfolio',
        type: 'paper',
        initial_capital: 100000,
        current_cash: 100000,
        is_active: true,
      })
      .select()
      .single();
    return NextResponse.json({ portfolio: newPort, holdings: [], orders: [] });
  }

  // Get holdings
  const { data: holdings } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('portfolio_id', portfolio.id);

  // Get last 50 orders
  const { data: orders } = await supabase
    .from('paper_orders')
    .select('*')
    .eq('portfolio_id', portfolio.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ portfolio, holdings: holdings ?? [], orders: orders ?? [] });
}
