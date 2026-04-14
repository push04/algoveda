'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changeP: number;
  name?: string;
  sector?: string;
}

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [expandedRationale, setExpandedRationale] = useState<string | null>(null);

  const POPULAR_STOCKS = [
    'RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ICICIBANK', 'SBIN', 'TITAN',
    'LTIM', 'WIPRO', 'HUL', 'BAJFINANCE', 'ASIANPAINT', 'KOTAKBANK', 'MARUTI',
  ];

  const fetchStockData = async (symbol: string): Promise<StockData | null> => {
    try {
      const res = await fetch(`/api/market/quote?symbol=${symbol}`, { next: { revalidate: 30 } });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        symbol: data.symbol || symbol,
        price: data.price || 0,
        change: data.change || 0,
        changeP: data.changeP || 0,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    async function loadStocks() {
      try {
        setLoading(true);
        const promises = POPULAR_STOCKS.map(s => fetchStockData(s));
        const results = await Promise.all(promises);
        const validStocks = results.filter((s): s is StockData => s !== null);
        
        // Sort by absolute change
        validStocks.sort((a, b) => Math.abs(b.changeP) - Math.abs(a.changeP));
        
        setStocks(validStocks);
      } catch (err) {
        setError('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    }
    
    loadStocks();
  }, []);

  const getStockName = (symbol: string): string => {
    const names: Record<string, string> = {
      'RELIANCE': 'Reliance Industries', 'HDFCBANK': 'HDFC Bank', 'INFY': 'Infosys',
      'TCS': 'Tata Consultancy', 'ICICIBANK': 'ICICI Bank', 'SBIN': 'State Bank of India',
      'TITAN': 'Titan Company', 'LTIM': 'LTIMindtree', 'WIPRO': 'Wipro', 'HUL': 'Hindustan Unilever',
    };
    return names[symbol] || symbol;
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] mt-16 overflow-hidden">
      {/* Filter Sidebar */}
      <aside className="w-[300px] h-full bg-[#f5f4f0] flex flex-col border-r border-stone-200/60 flex-shrink-0">
        <div className="p-6 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-xl text-[#0F1A14]">Filters</h2>
            <button className="text-[10px] font-data text-[#795900] hover:underline uppercase">RESET</button>
          </div>
        </div>
        
        <div className="flex-1 px-6 py-4 space-y-4">
          <div className="glass-panel p-4 rounded-xl">
            <h3 className="font-ui text-sm font-bold text-[#0F1A14] mb-4">Fundamental</h3>
            <div className="text-xs text-stone-500">P/E, ROE, Market Cap filters</div>
          </div>
          
          <div className="glass-panel p-4 rounded-xl">
            <h3 className="font-ui text-sm font-bold text-[#0F1A14] mb-4">Technical</h3>
            <div className="text-xs text-stone-500">RSI, MA, Volume filters</div>
          </div>
        </div>

        <div className="p-5 bg-[#f5f4f0] border-t">
          <button className="w-full bg-[#00361a] text-white py-4 rounded-xl font-ui font-bold text-sm">
            RUN SCREEN
          </button>
        </div>
      </aside>

      {/* Results */}
      <section className="flex-1 overflow-y-auto bg-[#faf9f5]">
        {/* Header */}
        <div className="px-6 mt-6 mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-ui text-lg font-bold text-[#0F1A14]">
              {loading ? 'Loading...' : stocks.length > 0 ? `${stocks.length} stocks` : 'No stocks found'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex border border-stone-200 rounded-lg">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-[#00361a] text-white' : 'bg-white text-stone-500'}`}>
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
              </button>
              <button onClick={() => setViewMode('table')} className={`px-3 py-2 ${viewMode === 'table' ? 'bg-[#00361a] text-white' : 'bg-white text-stone-500'}`}>
                <span className="material-symbols-outlined text-[16px]">table_rows</span>
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="px-6 grid grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-panel p-5 rounded-xl animate-pulse">
                <div className="h-4 bg-stone-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-stone-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="px-6 py-12 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && stocks.length > 0 && viewMode === 'grid' && (
          <div className="px-6 pb-8 grid grid-cols-3 gap-5">
            {stocks.map((s) => (
              <div key={s.symbol} className="glass-panel rounded-xl p-5 hover:shadow-elevated transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-data text-base font-bold text-[#0F1A14]">{s.symbol}</span>
                    <p className="font-body text-xs text-stone-500 mt-0.5">{getStockName(s.symbol)}</p>
                  </div>
                </div>

                <div className="flex items-end gap-2 mb-3">
                  <span className="font-data text-xl font-bold text-[#0F1A14]">{formatPrice(s.price)}</span>
                  <span className={`font-data text-xs font-bold ${s.changeP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {s.changeP >= 0 ? '+' : ''}{s.changeP.toFixed(2)}%
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link href={`/backtest/new?symbol=${s.symbol}`} className="flex-1 py-2 text-xs font-ui font-bold border border-[#00361a]/20 text-[#00361a] rounded-lg text-center hover:bg-[#00361a]/5">
                    Backtest
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && stocks.length > 0 && viewMode === 'table' && (
          <div className="px-6 pb-8">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-[10px] font-data uppercase text-stone-400">
                    <th className="p-4">Symbol</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-right">Change</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => (
                    <tr key={s.symbol} className="border-b hover:bg-[#f5f4f0]">
                      <td className="p-4">
                        <span className="font-data font-bold">{s.symbol}</span>
                        <span className="text-xs text-stone-500 ml-2">{getStockName(s.symbol)}</span>
                      </td>
                      <td className="p-4 text-right font-data">{formatPrice(s.price)}</td>
                      <td className={`p-4 text-right font-data ${s.changeP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {s.changeP >= 0 ? '+' : ''}{s.changeP.toFixed(2)}%
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/backtest/new?symbol=${s.symbol}`} className="text-xs font-ui font-bold text-[#00361a] border border-[#00361a]/20 px-3 py-1.5 rounded-lg hover:bg-[#00361a] hover:text-white">
                          Backtest
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && stocks.length === 0 && (
          <div className="px-6 py-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-stone-300 mb-2">search_off</span>
            <p className="text-stone-500">No stock data available</p>
          </div>
        )}
      </section>
    </div>
  );
}