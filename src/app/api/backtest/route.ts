import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, strategy, startDate, endDate, initialCapital, params } = body;

    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: job, error } = await supabase
      .from('backtest_jobs')
      .insert({
        user_id: user.id,
        symbol: symbol,
        exchange: 'NSE',
        start_date: startDate,
        end_date: endDate,
        initial_capital: initialCapital || 100000,
        status: 'queued',
        strategy_type: strategy,
        strategy_params: params,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Backtest queued successfully'
    });
  } catch (error) {
    console.error('Error creating backtest:', error);
    return NextResponse.json({ error: 'Failed to create backtest' }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: jobs } = await supabase
    .from('backtest_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ jobs });
}