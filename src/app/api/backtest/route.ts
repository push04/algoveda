import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, strategy, startDate, endDate, initialCapital, params } = body;

    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
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
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: jobs } = await supabase
    .from('backtest_jobs')
    .select('*, strategies(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ jobs });
}