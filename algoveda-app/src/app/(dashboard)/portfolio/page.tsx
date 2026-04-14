'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Portfolio {
  id: string;
  name: string;
  initial_capital: number;
  current_cash: number;
  is_active: boolean;
}

interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  average_price: number;
  current_price: number | null;
}

interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  order_type: string;
  executed_price: number;
  status: string;
  created_at: string;
}

interface LiveQuote {
  price: number;
  changeP: number;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [liveQuotes, setLiveQuotes] = useState<Record<string, LiveQuote>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'analytics'>('positions');

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (!res.ok) return;
      const data = await res.json();
      setPortfolio(data.portfolio);
      setHoldings(data.holdings ?? []);
      setOrders(data.orders ?? []);

      const syms = (data.holdings ?? []).map((h: Holding) => h.symbol);
      if (syms.length > 0) {
        const quotes: Record<string, LiveQuote> = {};
        await Promise.allSettled(syms.map(async (s: string) => {
          const r = await fetch(`/api/market/quote?symbol=${s}`);
          if (r.ok) {
            const q = await r.json();
            if (q.price) quotes[s] = { price: q.price, changeP: q.changeP };
          }
        }));
        setLiveQuotes(quotes);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const holdingsValue = holdings.reduce((sum, h) => {
    const price = liveQuotes[h.symbol]?.price ?? h.current_price ?? h.average_price;
    return sum + price * h.quantity;
  }, 0);
  const totalValue = (portfolio?.current_cash ?? 0) + holdingsValue;
  const initialCapital = portfolio?.initial_capital ?? 100000;
  const totalPnL = totalValue - initialCapital;
  const totalPnLPct = initialCapital > 0 ? (totalPnL / initialCapital) * 100 : 0;

  const winPositions = holdings.filter(h => {
    const ltp = liveQuotes[h.symbol]?.price ?? h.current_price ?? h.average_price;
    return ltp > h.average_price;
  });
  const lossPositions = holdings.filter(h => {
    const ltp = liveQuotes[h.symbol]?.price ?? h.current_price ?? h.average_price;
    return ltp <= h.average_price;
  });

  const executedOrders = orders.filter(o => o.status === 'EXECUTED');

  return (
    <main className="pt-6 px-8 pb-16 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start animate-fade-in-up">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900] bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">Paper Portfolio · Risk-Free</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-3">My Portfolio</h2>
          <p className="text-stone-500 font-body text-sm mt-1">Track your virtual investments and performance</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 rounded-lg text-xs font-ui text-stone-500 hover:bg-stone-50 transition-colors">
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            Refresh
          </button>
          <Link href="/paper-trade" className="px-5 py-2.5 bg-[#00361a] text-white rounded-xl font-ui font-bold text-sm shadow-lg shadow-[#1A4D2E]/20 hover:bg-[#1A4D2E] transition-all btn-press flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Place Order
          </Link>
        </div>
      </div>

      {/* Portfolio Summary */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl skeleton h-40" />
      ) : !portfolio ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <span className="material-symbols-outlined text-[64px] text-stone-300 mb-4 block">pie_chart</span>
          <h3 className="font-headline text-2xl text-[#00361a] mb-2">No Portfolio Found</h3>
          <p className="font-body text-stone-500 mb-6 text-sm max-w-sm mx-auto">
            Subscribe to the ₹2 Starter plan to get your ₹1,00,000 paper trading portfolio.
          </p>
          <Link href="/pricing" className="inline-block px-8 py-4 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24] transition-all">
            Get Starter Plan · ₹2
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-5 animate-fade-in-up">
            <div className="glass-panel p-6 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Total Value</p>
              <p className="font-data text-3xl font-bold text-[#00361a]">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              <p className={`text-xs mt-1 font-data font-bold ${totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%)
              </p>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Cash Available</p>
              <p className="font-data text-3xl font-bold text-[#00361a]">₹{(portfolio.current_cash).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              <p className="text-xs mt-1 font-data text-stone-400">{((portfolio.current_cash / totalValue) * 100).toFixed(1)}% of portfolio</p>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Invested</p>
              <p className="font-data text-3xl font-bold text-stone-800">₹{holdingsValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              <p className="text-xs mt-1 font-data text-stone-400">{holdings.length} positions</p>
            </div>
            <div className="glass-panel p-6 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Win/Loss Ratio</p>
              <p className="font-data text-3xl font-bold text-stone-800">
                <span className="text-emerald-600">{winPositions.length}</span>
                <span className="text-stone-300 mx-1">/</span>
                <span className="text-red-500">{lossPositions.length}</span>
              </p>
              <p className="text-xs mt-1 font-data text-stone-400">{executedOrders.length} total trades</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(['positions', 'orders', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg text-sm font-ui font-bold transition-all capitalize ${activeTab === tab ? 'bg-[#1A4D2E] text-white shadow-sm' : 'bg-white text-stone-500 hover:text-stone-700 border border-stone-200'}`}
              >
                {tab === 'positions' ? `Positions (${holdings.length})` : tab === 'orders' ? `Orders (${orders.length})` : 'Analytics'}
              </button>
            ))}
          </div>

          {/* Positions */}
          {activeTab === 'positions' && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in-up">
              {holdings.length === 0 ? (
                <div className="p-16 text-center">
                  <span className="material-symbols-outlined text-[64px] text-stone-200 mb-4 block">pie_chart</span>
                  <h3 className="font-headline text-xl text-[#00361a] mb-2">No Positions Yet</h3>
                  <p className="font-body text-stone-400 mb-6 text-sm">Start building your paper portfolio</p>
                  <Link href="/paper-trade" className="px-6 py-3 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold">
                    Go to Paper Trade
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-100 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400 bg-stone-50">
                        <th className="text-left p-4">Symbol</th>
                        <th className="text-right p-4">Qty</th>
                        <th className="text-right p-4">Avg Cost</th>
                        <th className="text-right p-4">LTP</th>
                        <th className="text-right p-4">Current Value</th>
                        <th className="text-right p-4">P&amp;L</th>
                        <th className="text-right p-4">Return %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h) => {
                        const ltp = liveQuotes[h.symbol]?.price ?? h.current_price ?? h.average_price;
                        const pnl = (ltp - h.average_price) * h.quantity;
                        const pnlP = h.average_price > 0 ? ((ltp - h.average_price) / h.average_price) * 100 : 0;
                        const currentVal = ltp * h.quantity;
                        return (
                          <tr key={h.id} className={`border-b border-stone-50 hover:bg-stone-50/60 transition-colors border-l-4 ${pnl >= 0 ? 'border-l-emerald-500' : 'border-l-red-400'}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#1A4D2E]/10 rounded-lg flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[#1A4D2E] text-[14px]">show_chart</span>
                                </div>
                                <div>
                                  <p className="font-ui font-bold text-[#0F1A14] text-sm">{h.symbol}</p>
                                  <p className="font-data text-[10px] text-stone-400">NSE</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right font-data text-sm">{h.quantity}</td>
                            <td className="p-4 text-right font-data text-sm">₹{h.average_price.toFixed(2)}</td>
                            <td className="p-4 text-right font-data text-sm font-bold">
                              ₹{ltp.toFixed(2)}
                              {liveQuotes[h.symbol] && (
                                <span className={`ml-1 text-[10px] ${liveQuotes[h.symbol].changeP >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  ({liveQuotes[h.symbol].changeP >= 0 ? '+' : ''}{liveQuotes[h.symbol].changeP.toFixed(2)}%)
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right font-data text-sm">₹{currentVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            <td className={`p-4 text-right font-data text-sm font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toFixed(2)}
                            </td>
                            <td className={`p-4 text-right font-data text-sm font-bold ${pnlP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {pnlP >= 0 ? '+' : ''}{pnlP.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in-up">
              {orders.length === 0 ? (
                <div className="p-16 text-center">
                  <span className="material-symbols-outlined text-[64px] text-stone-200 mb-4 block">receipt_long</span>
                  <p className="font-body text-stone-400">No orders placed yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-100 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400 bg-stone-50">
                        <th className="text-left p-4">Time</th>
                        <th className="text-left p-4">Symbol</th>
                        <th className="text-left p-4">Side</th>
                        <th className="text-right p-4">Qty</th>
                        <th className="text-right p-4">Price</th>
                        <th className="text-right p-4">Value</th>
                        <th className="text-right p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-stone-50 hover:bg-stone-50/60 transition-colors text-sm">
                          <td className="p-4 font-data text-stone-400 text-xs">
                            {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 font-ui font-bold text-[#0F1A14]">{o.symbol}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${o.side === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {o.side}
                            </span>
                          </td>
                          <td className="p-4 text-right font-data">{o.quantity}</td>
                          <td className="p-4 text-right font-data">₹{o.executed_price.toFixed(2)}</td>
                          <td className="p-4 text-right font-data font-bold">₹{(o.executed_price * o.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td className="p-4 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-2 gap-6 animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-headline text-lg text-[#00361a] mb-4">Portfolio Allocation</h3>
                {holdings.length === 0 ? (
                  <p className="text-stone-400 text-sm">No positions to show</p>
                ) : (
                  <div className="space-y-3">
                    {holdings.map(h => {
                      const ltp = liveQuotes[h.symbol]?.price ?? h.current_price ?? h.average_price;
                      const val = ltp * h.quantity;
                      const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
                      return (
                        <div key={h.id}>
                          <div className="flex justify-between text-xs font-data mb-1">
                            <span className="font-bold text-stone-700">{h.symbol}</span>
                            <span className="text-stone-500">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2">
                            <div
                              className="bg-[#1A4D2E] h-2 rounded-full"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <div>
                      <div className="flex justify-between text-xs font-data mb-1">
                        <span className="font-bold text-stone-400">Cash</span>
                        <span className="text-stone-500">{((portfolio.current_cash / totalValue) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div
                          className="bg-stone-300 h-2 rounded-full"
                          style={{ width: `${Math.min((portfolio.current_cash / totalValue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-headline text-lg text-[#00361a] mb-4">Performance Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Starting Capital', value: `₹${initialCapital.toLocaleString('en-IN')}`, color: 'text-stone-700' },
                    { label: 'Current Value', value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-stone-700' },
                    { label: 'Total Return', value: `${totalPnL >= 0 ? '+' : ''}₹${Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600' },
                    { label: 'Return %', value: `${totalPnLPct >= 0 ? '+' : ''}${totalPnLPct.toFixed(2)}%`, color: totalPnLPct >= 0 ? 'text-emerald-600' : 'text-red-600' },
                    { label: 'Open Positions', value: holdings.length.toString(), color: 'text-stone-700' },
                    { label: 'Total Trades', value: executedOrders.length.toString(), color: 'text-stone-700' },
                    { label: 'Winning Positions', value: winPositions.length.toString(), color: 'text-emerald-600' },
                    { label: 'Losing Positions', value: lossPositions.length.toString(), color: 'text-red-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-stone-50">
                      <span className="text-xs font-body text-stone-500">{label}</span>
                      <span className={`text-sm font-data font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
