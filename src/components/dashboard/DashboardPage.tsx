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
  price: number;
  change: number;
  changeP: number;
  high: number;
  low: number;
  open: number;
  volume: number;
}

// Real API call to NSE India
async function fetchFromNSE(symbol: string): Promise<StockData | null> {
  try {
    const res = await fetch(`/api/market/quote?symbol=${symbol}`, { 
      next: { revalidate: 30 } 
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchIndices(): Promise<MarketIndex[]> {
  try {
    const res = await fetch('/api/market/indices', { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.indices || [];
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [aiPicks, setAiPicks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch indices from API
      const indexData = await fetchIndices();
      setIndices(indexData);
      
      // Fetch stock quotes from API
      const stocks = ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ICICIBANK', 'SBIN'];
      const stockPromises = stocks.map(s => fetchFromNSE(s));
      const stockResults = await Promise.all(stockPromises);
      
      const validStocks = stockResults
        .filter((s): s is StockData => s !== null)
        .sort((a, b) => Math.abs(b.changeP) - Math.abs(a.changeP))
        .slice(0, 3);
      
      setAiPicks(validStocks);
    } catch (err) {
      console.error('Error loading market data:', err);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const getStockName = (symbol: string): string => {
    const names: Record<string, string> = {
      'RELIANCE': 'Reliance Industries', 'HDFCBANK': 'HDFC Bank',
      'INFY': 'Infosys', 'TCS': 'Tata Consultancy', 'ICICIBANK': 'ICICI Bank',
      'SBIN': 'State Bank of India', 'TITAN': 'Titan Company',
      'LTIM': 'LTIMindtree', 'WIPRO': 'Wipro', 'HUL': 'Hindustan Unilever',
    };
    return names[symbol] || symbol;
  };

  const getSector = (symbol: string): string => {
    const sectors: Record<string, string> = {
      'RELIANCE': 'Energy', 'HDFCBANK': 'Banking', 'INFY': 'IT', 'TCS': 'IT',
      'ICICIBANK': 'Banking', 'SBIN': 'Banking', 'TITAN': 'Consumer', 'LTIM': 'IT',
    };
    return sectors[symbol] || 'Equity';
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <main className="pt-24 px-8 pb-12 space-y-8">
      {/* Welcome */}
      <section>
        <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Live Market Data</span>
        <h2 className="text-4xl font-headline text-[#00361a] mt-1">Market Intelligence</h2>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error} 
          <button onClick={loadData} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-panel p-5 rounded-xl animate-pulse">
              <div className="h-4 bg-stone-200 rounded w-20 mb-3"></div>
              <div className="h-8 bg-stone-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      )}

      {/* Indices Row */}
      {!loading && !error && indices.length > 0 && (
        <div className="grid grid-cols-5 gap-5">
          {indices.slice(0, 5).map((idx) => (
            <div key={idx.name} className="glass-panel p-5 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-ui font-bold text-stone-500">{idx.name}</span>
                <span className={`text-[10px] font-data font-bold ${idx.changeP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {idx.changeP >= 0 ? '+' : ''}{idx.changeP.toFixed(2)}%
                </span>
              </div>
              <p className="text-2xl font-data font-medium mb-2">
                {idx.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && indices.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[48px] text-stone-300 mb-2">cloud_off</span>
          <p className="text-stone-500">Unable to fetch market data</p>
          <button onClick={loadData} className="mt-2 text-[#1A4D2E] font-ui font-bold">Retry</button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Chart Area */}
        <div className="col-span-8 bg-white p-8 rounded-xl shadow-card">
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="text-[10px] font-data uppercase tracking-widest text-stone-400">Portfolio</span>
              <h3 className="text-2xl font-headline text-[#00361a] mt-1">Your Positions</h3>
            </div>
          </div>
          <div className="h-[280px] flex items-center justify-center text-center">
            <div>
              <span className="material-symbols-outlined text-[48px] text-stone-300 mb-2 block">account_balance_wallet</span>
              <p className="text-stone-500 mb-2">No portfolio connected</p>
              <Link href="/portfolio" className="text-[#1A4D2E] font-ui font-bold text-sm hover:underline">
                Add Portfolio →
              </Link>
            </div>
          </div>
        </div>

        {/* AI Picks */}
        <div className="col-span-4 glass-panel p-7 rounded-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#00361a] text-white rounded-lg">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
            <h3 className="text-lg font-headline text-[#00361a]">Live Market Movers</h3>
          </div>

          <div className="space-y-5 flex-1">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-lg"></div>)}
              </div>
            ) : aiPicks.length > 0 ? (
              aiPicks.map((pick) => (
                <div key={pick.symbol} className="border-b border-stone-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-ui font-bold text-sm">{pick.symbol}</h4>
                      <p className="text-[10px] font-data text-stone-500">{getStockName(pick.symbol)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-data font-bold">{formatPrice(pick.price)}</p>
                      <p className={`text-[10px] font-data ${pick.changeP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pick.changeP >= 0 ? '+' : ''}{pick.changeP.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <span className="text-[9px] bg-stone-100 px-2 py-0.5 rounded">{getSector(pick.symbol)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-stone-400 text-center">Loading stock data...</p>
            )}
          </div>

          <Link href="/screener" className="mt-6 w-full py-3 border-2 border-[#00361a] text-[#00361a] font-ui font-bold text-sm rounded-lg hover:bg-[#00361a] hover:text-white transition-colors text-center block">
            Open Stock Screener
          </Link>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-card text-center">
          <span className="material-symbols-outlined text-[32px] text-stone-300 mb-2 block">history_toggle_off</span>
          <h4 className="font-headline text-lg text-[#00361a] mb-2">Backtests</h4>
          <Link href="/backtest/new" className="text-[#1A4D2E] font-ui font-bold text-sm hover:underline">
            Run Backtest →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card text-center">
          <span className="material-symbols-outlined text-[32px] text-stone-300 mb-2 block">currency_exchange</span>
          <h4 className="font-headline text-lg text-[#00361a] mb-2">Paper Trading</h4>
          <Link href="/paper-trade" className="text-[#1A4D2E] font-ui font-bold text-sm hover:underline">
            Start Trading →
          </Link>
        </div>

        <div className="bg-[#00361a] text-white p-6 rounded-xl">
          <h4 className="font-headline text-lg mb-4">Market Digest</h4>
          <p className="text-sm opacity-70 mb-4">Daily market summary in your inbox</p>
          <Link href="/settings" className="text-xs font-ui font-bold text-white/70 hover:text-white border border-white/20 rounded-lg py-2 px-4 inline-block">
            Configure →
          </Link>
        </div>
      </div>
    </main>
  );
}