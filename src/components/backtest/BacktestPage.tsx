'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BacktestPage() {
  const [activeTab, setActiveTab] = useState('1Y');
  const [jobId, setJobId] = useState<string | null>(null);

  return (
    <main className="pt-24 px-8 pb-16 max-w-[1320px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Strategy Testing</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Backtest</h2>
        </div>
        <Link href="/backtest/new" className="px-6 py-3 bg-[#00361a] text-white rounded-lg font-ui font-bold text-sm hover:bg-[#1A4D2E]">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Backtest
          </span>
        </Link>
      </div>

      {/* No Jobs State */}
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

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-xl shadow-card">
          <span className="material-symbols-outlined text-[24px] text-[#1A4D2E] mb-4 block">speed</span>
          <h4 className="font-ui font-bold text-[#0F1A14] mb-2">Fast Execution</h4>
          <p className="text-sm text-stone-500">Run 10+ years of historical data in seconds</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-card">
          <span className="material-symbols-outlined text-[24px] text-[#1A4D2E] mb-4 block">analytics</span>
          <h4 className="font-ui font-bold text-[#0F1A14] mb-2">Detailed Metrics</h4>
          <p className="text-sm text-stone-500">CAGR, Sharpe, Drawdown, Win Rate & more</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-card">
          <span className="material-symbols-outlined text-[24px] text-[#1A4D2E] mb-4 block">auto_awesome</span>
          <h4 className="font-ui font-bold text-[#0F1A14] mb-2">AI Analysis</h4>
          <p className="text-sm text-stone-500">Strategy insights powered by advanced analytics</p>
        </div>
      </div>
    </main>
  );
}