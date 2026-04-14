'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STRATEGIES = [
  { id: 'ma_crossover', name: 'MA Crossover', params: ['fast_period', 'slow_period'] },
  { id: 'rsi', name: 'RSI Mean Reversion', params: ['rsi_period', 'oversold', 'overbought'] },
  { id: 'macd', name: 'MACD Signal', params: ['fast', 'slow', 'signal'] },
  { id: 'bollinger', name: 'Bollinger Breakout', params: ['period', 'std_dev'] },
  { id: 'momentum', name: 'Momentum', params: ['lookback', 'threshold'] },
  { id: 'mean_reversion', name: 'Mean Reversion', params: ['lookback', 'z_threshold'] },
];

const POPULAR_STOCKS = ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ICICIBANK', 'SBIN', 'TITAN', 'LTIM', 'WIPRO', 'HUL'];

export default function NewBacktestPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [strategy, setStrategy] = useState('rsi');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [initialCapital, setInitialCapital] = useState('100000');
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    rsi_period: '14',
    oversold: '30',
    overbought: '70',
    fast_period: '20',
    slow_period: '50',
  });

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const strategyConfig = STRATEGIES.find(s => s.id === strategy);
      
      const { data: job, error } = await supabase
        .from('backtest_jobs')
        .insert({
          user_id: user.id,
          symbol: symbol,
          exchange: 'NSE',
          start_date: startDate,
          end_date: endDate,
          initial_capital: parseFloat(initialCapital),
          status: 'queued',
          parameters: {
            strategy_type: strategy,
            strategy_name: strategyConfig?.name,
            ...params,
          },
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/backtest/${job.id}`);
    } catch (err) {
      console.error('Error creating backtest:', err);
      setLoading(false);
    }
  };

  return (
    <main className="pt-24 px-8 pb-16 max-w-[1320px] mx-auto">
      <div className="flex items-center gap-2 text-xs font-ui text-stone-400 mb-8">
        <button onClick={() => router.back()} className="hover:text-[#00361a]">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
        </button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#00361a] font-bold">New Backtest</span>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <div className="glass-panel p-8 rounded-2xl">
            <h1 className="font-headline text-3xl text-[#0F1A14] mb-2">Create New Backtest</h1>
            <p className="font-body text-[#4A5568] mb-8">Configure your strategy parameters and historical data range</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                    Symbol
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-data text-[#0F1A14] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                      placeholder="RELIANCE"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-data text-xs text-stone-400">NSE</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {POPULAR_STOCKS.map(stock => (
                      <button
                        key={stock}
                        type="button"
                        onClick={() => setSymbol(stock)}
                        className={`text-[10px] px-2 py-0.5 rounded font-data ${symbol === stock ? 'bg-[#1A4D2E] text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                      >
                        {stock}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                    Strategy
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-ui text-[#0F1A14] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                  >
                    {STRATEGIES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-data text-[#0F1A14] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-data text-[#0F1A14] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">
                  Initial Capital (₹)
                </label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-data text-[#0F1A14] focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                  placeholder="100000"
                />
              </div>

              {strategy === 'rsi' && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-[#f5f4f0] rounded-xl">
                  <div>
                    <label className="block text-[10px] font-ui font-bold text-[#4A5568] uppercase mb-1">RSI Period</label>
                    <input
                      type="number"
                      value={params.rsi_period}
                      onChange={(e) => setParams({...params, rsi_period: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded font-data text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-ui font-bold text-[#4A5568] uppercase mb-1">Oversold</label>
                    <input
                      type="number"
                      value={params.oversold}
                      onChange={(e) => setParams({...params, oversold: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded font-data text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-ui font-bold text-[#4A5568] uppercase mb-1">Overbought</label>
                    <input
                      type="number"
                      value={params.overbought}
                      onChange={(e) => setParams({...params, overbought: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded font-data text-sm"
                    />
                  </div>
                </div>
              )}

              {strategy === 'ma_crossover' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#f5f4f0] rounded-xl">
                  <div>
                    <label className="block text-[10px] font-ui font-bold text-[#4A5568] uppercase mb-1">Fast MA Period</label>
                    <input
                      type="number"
                      value={params.fast_period}
                      onChange={(e) => setParams({...params, fast_period: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded font-data text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-ui font-bold text-[#4A5568] uppercase mb-1">Slow MA Period</label>
                    <input
                      type="number"
                      value={params.slow_period}
                      onChange={(e) => setParams({...params, slow_period: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-[#E8E6DF] rounded font-data text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1A4D2E] text-white font-ui font-bold rounded-xl hover:bg-[#143D24] transition-all shadow-lg shadow-[#1A4D2E]/20 disabled:opacity-50"
              >
                {loading ? 'Queuing Backtest...' : 'Run Backtest'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-[#1A4D2E] text-[22px]">info</span>
              <h3 className="font-ui font-bold text-[#0F1A14]">How it works</h3>
            </div>
            <ol className="space-y-3 text-sm font-body text-[#4A5568]">
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1A4D2E] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Select a stock symbol and strategy
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1A4D2E] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Configure strategy parameters
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1A4D2E] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Choose historical date range
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1A4D2E] text-white text-[10px] flex items-center justify-center font-bold">4</span>
                Run backtest and analyze results
              </li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
              <h3 className="font-ui font-bold text-amber-800 text-sm">Disclaimer</h3>
            </div>
            <p className="text-xs font-body text-amber-700 leading-relaxed">
              Past performance does not guarantee future results. Backtested returns are hypothetical and do not account for slippage, brokerage, or taxes. This is for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}