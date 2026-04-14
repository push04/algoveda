'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface BacktestJob {
  id: string;
  symbol: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  status: string;
  parameters: Record<string, unknown>;
  created_at: string;
}

interface BacktestResult {
  job_id: string;
  total_return_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
}

export default function BacktestPage() {
  const [jobs, setJobs] = useState<BacktestJob[]>([]);
  const [results, setResults] = useState<Record<string, BacktestResult>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: jobsData } = await supabase
      .from('backtest_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (jobsData && jobsData.length > 0) {
      setJobs(jobsData);

      // Fetch results for completed jobs
      const completedIds = jobsData.filter(j => j.status === 'completed').map(j => j.id);
      if (completedIds.length > 0) {
        const { data: resultsData } = await supabase
          .from('backtest_results')
          .select('job_id, total_return_pct, sharpe_ratio, max_drawdown_pct, win_rate_pct')
          .in('job_id', completedIds);

        if (resultsData) {
          const map: Record<string, BacktestResult> = {};
          resultsData.forEach(r => { map[r.job_id] = r; });
          setResults(map);
        }
      }
    }
    setLoading(false);
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-700',
      running: 'bg-blue-100 text-blue-700',
      queued: 'bg-amber-100 text-amber-700',
      failed: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-stone-100 text-stone-600';
  };

  return (
    <main className="pt-6 px-8 pb-16 max-w-[1320px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Strategy Testing</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Backtest</h2>
        </div>
        <Link href="/backtest/new" className="px-6 py-3 bg-[#00361a] text-white rounded-xl font-ui font-bold text-sm hover:bg-[#1A4D2E] transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Backtest
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-xl skeleton" />)}
        </div>
      ) : jobs.length === 0 ? (
        <>
          <div className="glass-panel p-12 rounded-2xl text-center">
            <span className="material-symbols-outlined text-[64px] text-stone-300 mb-4 block">history_toggle_off</span>
            <h3 className="font-headline text-2xl text-[#00361a] mb-2">No Backtests Yet</h3>
            <p className="font-body text-stone-500 mb-6 max-w-md mx-auto">
              Run your first backtest to validate trading strategies on historical NSE/BSE data
            </p>
            <Link href="/backtest/new" className="inline-block px-8 py-4 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24]">
              Create Your First Backtest
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-12">
            {[
              { icon: 'speed', title: 'Fast Execution', desc: 'AI-simulated results based on historical data patterns in seconds' },
              { icon: 'analytics', title: 'Detailed Metrics', desc: 'CAGR, Sharpe, Drawdown, Win Rate, Alpha, Beta and more' },
              { icon: 'auto_awesome', title: 'AI Analysis', desc: 'Strategy insights and recommendations powered by Groq AI' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-xl shadow-card">
                <span className="material-symbols-outlined text-[24px] text-[#1A4D2E] mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                <h4 className="font-ui font-bold text-[#0F1A14] mb-2">{title}</h4>
                <p className="text-sm text-stone-500">{desc}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            const result = results[job.id];
            const params = job.parameters as any;
            return (
              <Link
                key={job.id}
                href={`/backtest/${job.id}`}
                className="bg-white rounded-xl shadow-card border border-stone-100 p-5 flex items-center gap-6 hover:shadow-elevated transition-all card-hover-lift block"
              >
                <div className="w-12 h-12 bg-[#1A4D2E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#1A4D2E] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>history_toggle_off</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-ui font-bold text-stone-800">{job.symbol}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusBadge(job.status)}`}>{job.status.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-stone-400 font-data mt-0.5">
                    {params?.strategy_name ?? 'Strategy'} · {job.start_date} → {job.end_date}
                  </p>
                </div>
                {result && (
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-[10px] font-data uppercase text-stone-400">Return</p>
                      <p className={`text-lg font-data font-bold ${result.total_return_pct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {result.total_return_pct >= 0 ? '+' : ''}{result.total_return_pct?.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-data uppercase text-stone-400">Sharpe</p>
                      <p className="text-lg font-data font-bold text-stone-700">{result.sharpe_ratio?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-data uppercase text-stone-400">Win Rate</p>
                      <p className="text-lg font-data font-bold text-stone-700">{result.win_rate_pct?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-data uppercase text-stone-400">Max DD</p>
                      <p className="text-lg font-data font-bold text-red-500">{result.max_drawdown_pct?.toFixed(1)}%</p>
                    </div>
                  </div>
                )}
                {job.status === 'queued' && (
                  <div className="text-xs text-amber-600 font-ui font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                    Click to run
                  </div>
                )}
                <span className="material-symbols-outlined text-stone-300 text-[20px]">chevron_right</span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
