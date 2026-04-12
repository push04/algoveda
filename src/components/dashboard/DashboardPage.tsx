'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changeP: number;
}

interface StockData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changeP: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

interface UserProfile {
  full_name?: string;
  email?: string;
  plan?: string;
  is_admin?: boolean;
}

// Reliable fallback data (shows when API is unavailable)
const FALLBACK_INDICES: MarketIndex[] = [
  { name: 'NIFTY 50', value: 24050.60, change: 182.45, changeP: 0.77 },
  { name: 'NIFTY BANK', value: 52286.40, change: -156.74, changeP: -0.30 },
  { name: 'NIFTY IT', value: 38678.90, change: 342.15, changeP: 0.89 },
  { name: 'NIFTY AUTO', value: 22678.45, change: 124.67, changeP: 0.55 },
  { name: 'NIFTY PHARMA', value: 21234.12, change: 89.34, changeP: 0.42 },
];

const FALLBACK_STOCKS: StockData[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 1350.20, change: 12.50, changeP: 0.94, high: 1362.00, low: 1340.00, open: 1342.00, volume: 8234567 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1842.75, change: -8.25, changeP: -0.45, high: 1858.00, low: 1838.00, open: 1850.00, volume: 5123456 },
  { symbol: 'TCS', name: 'Tata Consultancy', price: 3456.80, change: 45.20, changeP: 1.33, high: 3470.00, low: 3440.00, open: 3445.00, volume: 3456789 },
];

const STOCK_META: Record<string, { name: string; sector: string }> = {
  RELIANCE: { name: 'Reliance Industries', sector: 'Energy' },
  HDFCBANK: { name: 'HDFC Bank', sector: 'Banking' },
  INFY: { name: 'Infosys', sector: 'IT' },
  TCS: { name: 'Tata Consultancy', sector: 'IT' },
  ICICIBANK: { name: 'ICICI Bank', sector: 'Banking' },
  SBIN: { name: 'State Bank of India', sector: 'Banking' },
  TITAN: { name: 'Titan Company', sector: 'Consumer' },
  LTIM: { name: 'LTIMindtree', sector: 'IT' },
  WIPRO: { name: 'Wipro', sector: 'IT' },
  HUL: { name: 'Hindustan Unilever', sector: 'FMCG' },
};

function isMarketOpen(): boolean {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = ist.getDay();
  const h = ist.getHours();
  const m = ist.getMinutes();
  const mins = h * 60 + m;
  return day >= 1 && day <= 5 && mins >= 555 && mins < 930;
}

export default function DashboardPage() {
  const [indices, setIndices] = useState<MarketIndex[]>(FALLBACK_INDICES);
  const [stocks, setStocks] = useState<StockData[]>(FALLBACK_STOCKS);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'fallback'>('fallback');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const marketOpen = isMarketOpen();

  const loadData = useCallback(async () => {
    setLoading(true);
    let usedFallback = false;

    // Load user profile
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name, email, plan, is_admin').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    } catch { /* ignore */ }

    // Load market indices
    try {
      const res = await fetch('/api/market/indices');
      if (res.ok) {
        const data = await res.json();
        if (data.indices && data.indices.length > 0) {
          setIndices(data.indices);
          setDataSource(data.source === 'fallback' ? 'fallback' : 'live');
        } else {
          usedFallback = true;
        }
      } else {
        usedFallback = true;
      }
    } catch {
      usedFallback = true;
    }

    // Load stock quotes
    try {
      const stockSymbols = ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'ICICIBANK', 'SBIN'];
      const results = await Promise.allSettled(
        stockSymbols.map(s => fetch(`/api/market/quote?symbol=${s}`).then(r => r.ok ? r.json() : null))
      );
      const valid: StockData[] = results
        .map(r => r.status === 'fulfilled' ? r.value : null)
        .filter((d): d is StockData => d !== null && d.price > 0)
        .sort((a, b) => Math.abs(b.changeP) - Math.abs(a.changeP));
      if (valid.length > 0) {
        setStocks(valid);
        if (!usedFallback) setDataSource('live');
      }
    } catch { /* use fallback */ }

    if (usedFallback) setDataSource('fallback');
    setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const fmtPrice = (p: number) => `₹${p.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtNum = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <main className="pt-24 px-8 pb-12 space-y-8 page-enter">
      {/* Header */}
      <section className="flex items-end justify-between">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">
            {dataSource === 'live' ? '● Live Data' : '◌ Delayed Data'}
            {lastUpdated && ` · Updated ${lastUpdated}`}
          </span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">
            {greeting()}{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-sm font-body text-stone-500 mt-1">
            {marketOpen ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot inline-block" />
                Market is open · NSE/BSE · Tue–Sat 9:15 AM – 3:30 PM IST
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
                Market is closed · Opens next trading day at 9:15 AM IST
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-lg text-xs font-ui text-stone-500 hover:bg-stone-50 transition-colors btn-press">
            <span className={`material-symbols-outlined text-[14px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            {loading ? 'Updating...' : 'Refresh'}
          </button>
          <Link href="/research" className="flex items-center gap-1.5 px-4 py-2 bg-[#1A4D2E] text-white rounded-lg text-xs font-ui font-bold hover:bg-[#143D24] transition-colors btn-press">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            AI Research
          </Link>
        </div>
      </section>

      {/* Indices Row */}
      <div className="grid grid-cols-5 gap-4">
        {(loading ? FALLBACK_INDICES : indices).slice(0, 5).map((idx, i) => (
          <div
            key={idx.name}
            className="glass-panel p-5 rounded-xl card-hover-lift animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-ui font-bold text-stone-500 leading-tight">{idx.name}</span>
              <span className={`text-[10px] font-data font-bold px-1.5 py-0.5 rounded ${idx.changeP >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {idx.changeP >= 0 ? '+' : ''}{fmtNum(idx.changeP)}%
              </span>
            </div>
            <p className={`text-2xl font-data font-medium ${loading ? 'skeleton h-8 rounded w-24' : ''}`}>
              {!loading && fmtNum(idx.value)}
            </p>
            <p className={`text-xs mt-1 font-data ${idx.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {!loading && `${idx.change >= 0 ? '+' : ''}${fmtNum(idx.change)}`}
            </p>
            {loading && <div className="mt-1 skeleton h-3 rounded w-16" />}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Panel */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: 'history_toggle_off', title: 'Backtest Strategy', desc: 'Validate your ideas on historical data', href: '/backtest/new', color: 'green' },
              { icon: 'currency_exchange', title: 'Paper Trade', desc: '₹1,00,000 virtual capital', href: '/paper-trade', color: 'blue' },
              { icon: 'auto_awesome', title: 'AI Research', desc: 'Institutional-grade stock analysis', href: '/research', color: 'gold' },
            ].map(({ icon, title, desc, href, color }, i) => (
              <Link key={href} href={href}
                className="bento-card card-hover-lift animate-fade-in-up"
                style={{ animationDelay: `${200 + i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  color === 'green' ? 'bg-emerald-100' :
                  color === 'blue' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  <span className={`material-symbols-outlined text-[20px] ${
                    color === 'green' ? 'text-emerald-600' :
                    color === 'blue' ? 'text-blue-600' : 'text-amber-600'
                  }`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <h4 className="font-ui font-bold text-sm text-stone-800">{title}</h4>
                <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>

          {/* Stocks Table */}
          <div className="bg-white rounded-xl shadow-card border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-ui font-bold text-sm text-stone-700">Market Movers</h3>
              <Link href="/screener" className="text-xs font-ui font-bold text-[#1A4D2E] hover:underline">
                Full Screener →
              </Link>
            </div>
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  {['Symbol', 'Price', 'Change', 'Volume', 'Action'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[10px] font-ui font-bold uppercase tracking-widest text-stone-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 stagger-children">
                {(loading ? FALLBACK_STOCKS : stocks).slice(0, 6).map((stock) => {
                  const meta = STOCK_META[stock.symbol] ?? { name: stock.name ?? stock.symbol, sector: 'Equity' };
                  return (
                    <tr key={stock.symbol} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-ui font-bold text-sm text-stone-800">{stock.symbol}</div>
                        <div className="text-[10px] text-stone-400 font-body">{meta.sector}</div>
                      </td>
                      <td className="px-6 py-4 font-data font-bold text-stone-800">{fmtPrice(stock.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`stat-pill ${stock.changeP >= 0 ? 'stat-pill-up' : 'stat-pill-down'}`}>
                          {stock.changeP >= 0 ? '+' : ''}{fmtNum(stock.changeP)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 font-data text-xs text-stone-500">
                        {stock.volume > 0 ? `${(stock.volume / 1_000_000).toFixed(2)}M` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/research?symbol=${stock.symbol}`}
                          className="text-[10px] font-ui font-bold text-[#1A4D2E] hover:underline mr-2">
                          Research
                        </Link>
                        <Link href={`/backtest/new?symbol=${stock.symbol}`}
                          className="text-[10px] font-ui font-bold text-stone-400 hover:text-stone-700">
                          Backtest
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          {/* Account Summary */}
          <div className="glass-panel p-6 rounded-xl animate-fade-in-right">
            <h3 className="font-ui font-bold text-sm text-stone-700 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#1A4D2E]">account_circle</span>
              Your Account
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-body text-stone-500">Plan</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                  profile?.plan === 'pro' || profile?.plan === 'institution'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-stone-100 text-stone-600'
                }`}>{profile?.plan ?? 'explorer'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-body text-stone-500">Paper Balance</span>
                <span className="text-sm font-data font-bold text-[#00361a]">₹1,00,000</span>
              </div>
            </div>
            {(!profile?.plan || profile.plan === 'explorer') && (
              <Link href="/pricing" className="mt-4 w-full py-2.5 bg-gradient-to-r from-[#D4A843] to-[#F0C040] text-[#0F1A14] text-xs font-ui font-bold rounded-lg flex items-center justify-center gap-1.5 hover:brightness-105 transition-all btn-press block text-center">
                <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                Upgrade Plan
              </Link>
            )}
          </div>

          {/* Market Digest */}
          <div className="bg-[#00361a] text-white p-6 rounded-xl animate-fade-in-right" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-[#D4A843]">mail</span>
              <h3 className="font-ui font-bold text-sm">Market Digest</h3>
            </div>
            <p className="text-xs text-white/70 mb-4">Get AI-curated market intelligence in your inbox</p>
            <Link href="/settings?tab=email" className="text-xs font-ui font-bold text-[#D4A843] border border-[#D4A843]/30 rounded-lg py-2 px-4 inline-block hover:bg-[#D4A843]/10 transition-colors">
              Configure →
            </Link>
          </div>

          {/* AI Research CTA */}
          <div className="glass-green p-6 rounded-xl animate-fade-in-right" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[18px] text-[#1A4D2E]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h3 className="font-ui font-bold text-sm text-[#1A4D2E]">AI Research Engine</h3>
            </div>
            <p className="text-xs text-stone-600 mb-4">Institutional-grade equity analysis with live price data and market intelligence</p>
            <Link href="/research" className="w-full py-2.5 bg-[#1A4D2E] text-white text-xs font-ui font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#143D24] transition-colors btn-press">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              Analyze Stock
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="gradient-divider" />
      <div className="flex items-center justify-between text-xs font-body text-stone-400">
        <span>Data powered by Yahoo Finance · {dataSource === 'live' ? 'Live' : 'Delayed'} · Updated {lastUpdated || 'now'}</span>
        <span>NSE/BSE · Indian Equity Markets</span>
      </div>
    </main>
  );
}
