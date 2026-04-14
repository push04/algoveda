import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const revalidate = 300; // 5 min cache

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [backtestRes, usersRes] = await Promise.all([
      supabase.from('backtest_jobs').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    const backtests = backtestRes.count ?? 0;
    const users = usersRes.count ?? 0;

    return NextResponse.json(
      {
        backtests,
        users,
        uptime: 99.9,
        timestamp: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' } }
    );
  } catch (err: any) {
    console.error('Stats error:', err);
    return NextResponse.json({ backtests: 0, users: 0, uptime: 0 });
  }
}
