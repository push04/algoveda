'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface BacktestJob {
  id: string;
  symbol: string;
  exchange: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  parameters: Record<string, unknown>;
  status: string;
  created_at: string;
}

interface BacktestResult {
  id: string;
  job_id: string;
  total_return_pct: number;
  cagr_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  profit_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  benchmark_return: number;
  alpha: number;
  beta: number;
  ai_analysis: string;
  equity_curve: Array<{ date: string; value: number }>;
  trades_log: Array<{ date: string; action: string; price: number; qty: number; pnl?: number }>;
}

export default function BacktestResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<BacktestJob | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadJobAndResult();
  }, [id]);

  async function loadJobAndResult() {
    setLoading(true);
    const { data: jobData } = await supabase
      .from('backtest_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (!jobData) {
      setError('Backtest job not found');
      setLoading(false);
      return;
    }
    setJob(jobData);

    const { data: resultData } = await supabase
      .from('backtest_results')
      .select('*')
      .eq('job_id', id)
      .maybeSingle();

    if (resultData) {
      setResult(resultData as BacktestResult);
      setLoading(false);
    } else if (jobData.status === 'queued' || jobData.status === 'running') {
      // Auto-run the backtest
      await runBacktest(jobData);
    }
    setLoading(false);
  }

  async function runBacktest(jobData: BacktestJob) {
    setRunning(true);
    setError(null);

    try {
      // Update status to running
      await supabase.from('backtest_jobs').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', jobData.id);

      // Always use the server-side API (which has the Groq key securely)
      // Never call Groq directly from the client — API key is server-only
      const serverRes = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: jobData.id }),
      });

      if (serverRes.ok) {
        const savedResult = await serverRes.json();
        // Reload the job result from DB to get the cleaned/typed version
        const { data: resultData } = await supabase
          .from('backtest_results')
          .select('*')
          .eq('job_id', jobData.id)
          .maybeSingle();
        if (resultData) {
          setResult(resultData as BacktestResult);
        } else {
          // Use what the API returned directly as fallback
          setResult(savedResult as BacktestResult);
        }
      } else {
        const errData = await serverRes.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errData.error ?? `Server returned ${serverRes.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to run backtest. Please try again.';
      console.error('Backtest run error:', err);
      setError(msg);
      await supabase.from('backtest_jobs').update({ status: 'failed' }).eq('id', jobData.id);
    }
    setRunning(false);
  }

  const fmt = (n: number | undefined | null, suffix = '') => {
    if (n === null || n === undefined) return '—';
    return `${n > 0 && suffix === '%' ? '+' : ''}${n.toFixed(2)}${suffix}`;
  };

  const fmtRupee = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  if (loading || running) {
    return (
      <main className="pt-6 px-8 pb-16 max-w-[1320px] mx-auto">
        <div className="glass-panel p-12 rounded-2xl text-center animate-fade-in-up">
          <div className="w-16 h-16 border-4 border-[#1A4D2E]/20 border-t-[#1A4D2E] rounded-full animate-spin mx-auto mb-6" />
          <h3 className="font-headline text-2xl text-[#00361a] mb-2">{running ? 'Running Backtest...' : 'Loading Results...'}</h3>
          <p className="text-stone-500 text-sm">
            {running ? 'AI is analyzing historical market data and simulating trades. This takes 10-20 seconds.' : 'Fetching backtest data...'}
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-6 px-8 pb-16 max-w-[1320px] mx-auto">
        <div className="glass-panel p-12 rounded-2xl text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 mb-4 block">error</span>
          <h3 className="font-headline text-2xl text-red-700 mb-2">Error</h3>
          <p className="text-stone-500 mb-6">{error}</p>
          <Link href="/backtest/new" className="px-6 py-3 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold">New Backtest</Link>
        </div>
      </main>
    );
  }

  if (!result || !job) return null;

  const totalReturn = result.total_return_pct ?? 0;
  const finalValue = job.initial_capital * (1 + totalReturn / 100);

  const metrics = [
    { label: 'Total Return', value: fmt(result.total_return_pct, '%'), positive: (result.total_return_pct ?? 0) > 0 },
    { label: 'CAGR', value: fmt(result.cagr_pct, '%'), positive: (result.cagr_pct ?? 0) > 0 },
    { label: 'Sharpe Ratio', value: fmt(result.sharpe_ratio), positive: (result.sharpe_ratio ?? 0) > 1 },
    { label: 'Max Drawdown', value: fmt(result.max_drawdown_pct, '%'), positive: false },
    { label: 'Win Rate', value: fmt(result.win_rate_pct, '%'), positive: (result.win_rate_pct ?? 0) > 50 },
    { label: 'Profit Factor', value: fmt(result.profit_factor), positive: (result.profit_factor ?? 0) > 1 },
    { label: 'Total Trades', value: String(result.total_trades ?? 0), positive: null },
    { label: 'Vs Benchmark', value: fmt((result.total_return_pct ?? 0) - (result.benchmark_return ?? 0), '%'), positive: (result.total_return_pct ?? 0) > (result.benchmark_return ?? 0) },
  ] as const;

  return (
    <main className="pt-6 px-8 pb-16 max-w-[1320px] mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-ui text-stone-400">
        <Link href="/backtest" className="hover:text-[#00361a]">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#00361a] font-bold">Backtest Results</span>
        <span className="text-stone-300">·</span>
        <span>{job.symbol}</span>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between animate-fade-in-up">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Strategy Performance</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">{job.symbol} Backtest</h2>
          <p className="text-stone-500 text-sm mt-1">
            {(job.parameters as any)?.strategy_name ?? 'Strategy'} · {job.start_date} → {job.end_date}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-data text-stone-400 uppercase tracking-wider">Final Portfolio Value</p>
          <p className={`text-3xl font-data font-bold ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {fmtRupee(finalValue)}
          </p>
          <p className="text-xs font-data text-stone-400">Started with {fmtRupee(job.initial_capital)}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-5 animate-fade-in-up">
        {metrics.map(({ label, value, positive }) => (
          <div key={label} className="glass-panel p-5 rounded-xl">
            <p className="text-xs font-ui text-stone-500 uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-2xl font-data font-bold ${positive === true ? 'text-emerald-600' : positive === false ? 'text-red-500' : 'text-stone-800'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-12 gap-6 animate-fade-in-up">
        {/* Trade Stats */}
        <div className="col-span-4 bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-headline text-lg text-[#00361a] mb-4">Trade Statistics</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Trades', value: result.total_trades ?? 0 },
              { label: 'Winning Trades', value: result.winning_trades ?? 0, color: 'text-emerald-600' },
              { label: 'Losing Trades', value: result.losing_trades ?? 0, color: 'text-red-500' },
              { label: 'Alpha', value: fmt(result.alpha, '%') },
              { label: 'Beta', value: fmt(result.beta) },
              { label: 'Benchmark (Nifty)', value: fmt(result.benchmark_return, '%') },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-stone-50">
                <span className="text-xs font-body text-stone-500">{label}</span>
                <span className={`text-sm font-data font-bold ${color ?? 'text-stone-700'}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Visual win/loss bar */}
          <div className="mt-4">
            <p className="text-xs font-ui text-stone-400 mb-2">Win/Loss Distribution</p>
            <div className="flex rounded-full overflow-hidden h-4">
              <div
                className="bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold"
                style={{ width: `${result.win_rate_pct ?? 50}%` }}
              >
                {Math.round(result.win_rate_pct ?? 0)}%
              </div>
              <div
                className="bg-red-400 flex items-center justify-center text-[9px] text-white font-bold"
                style={{ width: `${100 - (result.win_rate_pct ?? 50)}%` }}
              >
                {Math.round(100 - (result.win_rate_pct ?? 0))}%
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="col-span-8 bg-[#00361a] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#D4A843] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h3 className="font-headline text-lg">AI Strategy Analysis</h3>
          </div>
          <p className="text-white/80 text-sm font-body leading-relaxed mb-4">{result.ai_analysis}</p>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Strategy Rating</p>
              <p className="text-xl font-data font-bold text-[#D4A843]">
                {(result.sharpe_ratio ?? 0) > 1.5 ? 'A' : (result.sharpe_ratio ?? 0) > 1 ? 'B' : (result.sharpe_ratio ?? 0) > 0.5 ? 'C' : 'D'}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Risk Level</p>
              <p className="text-xl font-data font-bold text-white">
                {Math.abs(result.max_drawdown_pct ?? 0) > 25 ? 'High' : Math.abs(result.max_drawdown_pct ?? 0) > 15 ? 'Medium' : 'Low'}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Beat Market</p>
              <p className="text-xl font-data font-bold text-white">
                {(result.total_return_pct ?? 0) > (result.benchmark_return ?? 0) ? '✅ Yes' : '❌ No'}
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/30 rounded-xl">
            <p className="text-xs text-amber-200 font-body">⚠️ Disclaimer: Backtested results are hypothetical. Past performance does not guarantee future returns. This is for educational purposes only.</p>
          </div>
        </div>
      </div>

      {/* Trades Log */}
      {Array.isArray(result.trades_log) && result.trades_log.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in-up">
          <div className="p-5 border-b border-stone-100">
            <h3 className="font-headline text-lg text-[#00361a]">Sample Trades Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-[10px] font-data uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Action</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">Quantity</th>
                  <th className="text-right p-4">P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {(result.trades_log as any[]).slice(0, 15).map((trade: any, i: number) => (
                  <tr key={i} className="border-b border-stone-50 hover:bg-stone-50/60">
                    <td className="p-4 font-data text-stone-500">{trade.date}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${trade.action === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="p-4 text-right font-data">₹{parseFloat(trade.price ?? 0).toFixed(2)}</td>
                    <td className="p-4 text-right font-data">{trade.qty}</td>
                    <td className={`p-4 text-right font-data font-bold ${trade.pnl > 0 ? 'text-emerald-600' : trade.pnl < 0 ? 'text-red-500' : 'text-stone-400'}`}>
                      {trade.pnl !== undefined ? `${trade.pnl > 0 ? '+' : ''}₹${parseFloat(trade.pnl).toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/backtest/new" className="px-6 py-3 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24] transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Backtest
        </Link>
        <Link href={`/research?symbol=${job.symbol}`} className="px-6 py-3 border border-[#1A4D2E] text-[#1A4D2E] rounded-xl font-ui font-bold hover:bg-[#1A4D2E]/5 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          Research {job.symbol}
        </Link>
      </div>
    </main>
  );
}
