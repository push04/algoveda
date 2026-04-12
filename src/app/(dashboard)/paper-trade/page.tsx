'use client';

import { useState, useEffect, useCallback } from 'react';

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

const POPULAR = ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'SBIN', 'ICICIBANK', 'TITAN', 'WIPRO', 'BAJFINANCE', 'MARUTI'];

export default function PaperTradePage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [liveQuotes, setLiveQuotes] = useState<Record<string, LiveQuote>>({});
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'positions' | 'orders'>('positions');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Order form
  const [sym, setSym] = useState('');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [qty, setQty] = useState('');
  const [orderType, setOrderType] = useState('MARKET');
  const [limitPrice, setLimitPrice] = useState('');
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPortfolio = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (!res.ok) return;
      const data = await res.json();
      setPortfolio(data.portfolio);
      setHoldings(data.holdings ?? []);
      setOrders(data.orders ?? []);

      // Fetch live quotes for all holdings
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

  useEffect(() => { loadPortfolio(); }, [loadPortfolio]);

  const fetchLivePrice = async (symbol: string) => {
    if (!symbol || symbol.length < 2) { setLivePrice(null); return; }
    setQuoteLoading(true);
    try {
      const r = await fetch(`/api/market/quote?symbol=${symbol.toUpperCase()}`);
      if (r.ok) {
        const q = await r.json();
        setLivePrice(q.price ?? null);
      }
    } finally {
      setQuoteLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sym || !qty) return;
    setPlacing(true);
    try {
      const res = await fetch('/api/portfolio/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: sym.toUpperCase(),
          side,
          quantity: parseInt(qty),
          order_type: orderType,
          limit_price: orderType === 'LIMIT' ? limitPrice : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        setOrderModal(false);
        setSym(''); setQty(''); setLimitPrice(''); setLivePrice(null);
        await loadPortfolio();
      } else {
        showToast(data.error ?? 'Order failed', false);
      }
    } catch {
      showToast('Network error placing order', false);
    }
    setPlacing(false);
  };

  // Compute portfolio stats
  const holdingsValue = holdings.reduce((sum, h) => {
    const price = liveQuotes[h.symbol]?.price ?? h.current_price ?? h.average_price;
    return sum + (price * h.quantity);
  }, 0);
  const totalValue = (portfolio?.current_cash ?? 0) + holdingsValue;
  const initialCapital = portfolio?.initial_capital ?? 100000;
  const totalPnL = totalValue - initialCapital;
  const totalPnLPct = initialCapital > 0 ? (totalPnL / initialCapital) * 100 : 0;

  const estimatedTotal = livePrice && qty ? livePrice * parseInt(qty || '0') : 0;

  return (
    <main className="pt-24 px-8 pb-16 space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-ui text-sm text-white flex items-center gap-2 animate-fade-in-down ${toast.ok ? 'bg-emerald-700' : 'bg-red-600'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start animate-fade-in-up">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900] bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">Virtual Trading · Risk-Free</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-3">Paper Portfolio</h2>
          <p className="text-stone-500 font-body text-sm mt-1">Practice strategies with ₹1,00,000 virtual capital</p>
        </div>
        <button
          onClick={() => setOrderModal(true)}
          className="px-6 py-3 bg-[#00361a] text-white rounded-xl font-ui font-bold text-sm shadow-lg shadow-[#1A4D2E]/20 hover:bg-[#1A4D2E] transition-all btn-press flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Place Order
        </button>
      </div>

      {/* Portfolio Summary */}
      {loading ? (
        <div className="glass-panel p-8 rounded-2xl skeleton h-40" />
      ) : (
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden animate-fade-in-up" style={{ background: 'linear-gradient(135deg, rgba(232,240,233,0.8) 0%, rgba(253,248,238,0.8) 100%)' }}>
          <div className="absolute top-0 right-0 p-16 opacity-[0.04]">
            <span className="material-symbols-outlined text-[140px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <div className="relative z-10 grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <p className="font-ui text-xs text-stone-500 uppercase tracking-wider mb-2">Total Portfolio Value</p>
              <p className="font-data text-5xl font-bold text-[#00361a]">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`font-data text-lg font-bold ${totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  {' '}({totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%)
                </span>
                <span className="text-xs font-data text-stone-400">overall</span>
              </div>
            </div>
            <div className="col-span-8 grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/60 rounded-xl border border-stone-100/60">
                <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Virtual Cash</p>
                <p className="font-data text-2xl font-bold text-[#00361a]">
                  ₹{(portfolio?.current_cash ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">Available to invest</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-xl border border-stone-100/60">
                <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Invested Value</p>
                <p className="font-data text-2xl font-bold text-[#00361a]">
                  ₹{holdingsValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-stone-400 mt-1">{holdings.length} positions</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-xl border border-stone-100/60">
                <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Total Orders</p>
                <p className="font-data text-2xl font-bold text-[#00361a]">{orders.length}</p>
                <p className="text-[10px] text-stone-400 mt-1">All time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['positions', 'orders'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-ui font-bold transition-all ${activeTab === tab ? 'bg-[#1A4D2E] text-white shadow-sm' : 'bg-white text-stone-500 hover:text-stone-700 border border-stone-200'}`}
          >
            {tab === 'positions' ? `Open Positions (${holdings.length})` : `Order History (${orders.length})`}
          </button>
        ))}
      </div>

      {/* Positions Table */}
      {activeTab === 'positions' && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in-up">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-headline text-xl text-[#00361a]">Open Positions</h3>
            {holdings.length > 0 && (
              <span className="text-xs font-ui text-stone-400">Prices update on page load</span>
            )}
          </div>
          {holdings.length === 0 ? (
            <div className="p-16 text-center">
              <span className="material-symbols-outlined text-[64px] text-stone-200 mb-4 block">currency_exchange</span>
              <h3 className="font-headline text-xl text-[#00361a] mb-2">No Open Positions</h3>
              <p className="font-body text-stone-400 mb-6 text-sm max-w-sm mx-auto">
                Start trading with your ₹1,00,000 virtual capital. Place your first order above.
              </p>
              <button onClick={() => setOrderModal(true)} className="px-6 py-3 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold text-sm btn-press">
                Place Your First Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">
                    <th className="text-left p-4">Symbol</th>
                    <th className="text-right p-4">Qty</th>
                    <th className="text-right p-4">Avg Cost</th>
                    <th className="text-right p-4">LTP</th>
                    <th className="text-right p-4">P&amp;L</th>
                    <th className="text-right p-4">P&amp;L %</th>
                    <th className="text-right p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const ltp = liveQuotes[h.symbol]?.price ?? h.current_price ?? h.average_price;
                    const pnl = (ltp - h.average_price) * h.quantity;
                    const pnlP = h.average_price > 0 ? ((ltp - h.average_price) / h.average_price) * 100 : 0;
                    return (
                      <tr key={h.id} className={`border-b border-stone-50 hover:bg-[#f5f4f0] transition-colors border-l-4 ${pnl >= 0 ? 'border-l-emerald-500' : 'border-l-red-400'}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#1A4D2E]/10 rounded-lg flex items-center justify-center">
                              <span className="material-symbols-outlined text-[#1A4D2E] text-[16px]">show_chart</span>
                            </div>
                            <div>
                              <p className="font-ui font-bold text-[#0F1A14]">{h.symbol}</p>
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
                        <td className={`p-4 text-right font-data text-sm font-bold ${pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {pnl >= 0 ? '+' : ''}₹{Math.abs(pnl).toFixed(2)}
                        </td>
                        <td className={`p-4 text-right font-data text-sm font-bold ${pnlP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {pnlP >= 0 ? '+' : ''}{pnlP.toFixed(2)}%
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => { setSym(h.symbol); setSide('SELL'); setOrderModal(true); fetchLivePrice(h.symbol); }}
                            className="px-4 py-1.5 border border-red-300 text-red-600 rounded-lg font-ui text-xs font-bold hover:bg-red-600 hover:text-white transition-colors"
                          >
                            SELL
                          </button>
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

      {/* Orders History */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in-up">
          <div className="p-6 border-b border-stone-100">
            <h3 className="font-headline text-xl text-[#00361a]">Order History</h3>
          </div>
          {orders.length === 0 ? (
            <div className="p-16 text-center">
              <span className="material-symbols-outlined text-[64px] text-stone-200 mb-4 block">receipt_long</span>
              <p className="font-body text-stone-400">No orders placed yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">
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
                    <tr key={o.id} className="border-b border-stone-50 hover:bg-[#f5f4f0] transition-colors text-sm">
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

      {/* Quick Buy Suggestions */}
      <div className="bg-white rounded-2xl shadow-card p-6 border border-stone-100 animate-fade-in-up">
        <h3 className="font-headline text-lg text-[#00361a] mb-4">Quick Trade</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR.map(s => (
            <button
              key={s}
              onClick={() => { setSym(s); setSide('BUY'); setOrderModal(true); fetchLivePrice(s); }}
              className="px-4 py-2 bg-stone-50 border border-stone-200 text-stone-700 font-ui font-bold text-xs rounded-lg hover:border-[#1A4D2E] hover:text-[#1A4D2E] hover:bg-[#1A4D2E]/5 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-[#0F1A14]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline text-2xl text-[#00361a]">Place Paper Order</h3>
                <p className="text-xs text-stone-400 font-body mt-0.5">Risk-free · Virtual capital only</p>
              </div>
              <button onClick={() => { setOrderModal(false); setSym(''); setQty(''); setLivePrice(null); }} className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Symbol */}
              <div>
                <label className="block text-xs font-ui font-bold text-stone-500 uppercase tracking-wider mb-2">Stock Symbol (NSE)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sym}
                    onChange={(e) => setSym(e.target.value.toUpperCase())}
                    placeholder="e.g. RELIANCE"
                    className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl font-data text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                  <button
                    type="button"
                    onClick={() => fetchLivePrice(sym)}
                    disabled={quoteLoading || !sym}
                    className="px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-xs font-ui font-bold text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50"
                  >
                    {quoteLoading ? <span className="w-3 h-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin inline-block" /> : 'Get Price'}
                  </button>
                </div>
                {livePrice && (
                  <p className="text-xs text-emerald-600 font-data font-bold mt-1.5">
                    Live: ₹{livePrice.toFixed(2)} · Cash available: ₹{(portfolio?.current_cash ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                )}
              </div>

              {/* BUY / SELL */}
              <div className="flex gap-3">
                {(['BUY', 'SELL'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`flex-1 py-4 rounded-xl font-ui font-bold text-lg transition-all ${
                      side === s
                        ? s === 'BUY' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Order Type */}
              <div className="flex gap-2">
                {['MARKET', 'LIMIT'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrderType(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-ui font-bold border transition-all ${orderType === t ? 'bg-[#1A4D2E] text-white border-[#1A4D2E]' : 'border-stone-200 text-stone-500 hover:border-[#1A4D2E]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Qty + Limit Price */}
              <div className={`grid gap-4 ${orderType === 'LIMIT' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div>
                  <label className="block text-xs font-ui font-bold text-stone-500 uppercase mb-2">Quantity (Shares)</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-data text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                  />
                </div>
                {orderType === 'LIMIT' && (
                  <div>
                    <label className="block text-xs font-ui font-bold text-stone-500 uppercase mb-2">Limit Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.05"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl font-data text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20"
                    />
                  </div>
                )}
              </div>

              {/* Order Summary */}
              {estimatedTotal > 0 && (
                <div className="p-4 bg-stone-50 rounded-xl flex justify-between items-center border border-stone-100">
                  <div>
                    <p className="text-xs text-stone-500 font-body">Estimated {side === 'BUY' ? 'Cost' : 'Proceeds'}</p>
                    <p className="font-data text-xl font-bold text-[#00361a]">₹{estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                  {side === 'BUY' && portfolio && (
                    <div className="text-right">
                      <p className="text-xs text-stone-500 font-body">Cash after</p>
                      <p className={`font-data font-bold ${portfolio.current_cash - estimatedTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ₹{(portfolio.current_cash - estimatedTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={placing || !sym || !qty}
                className={`w-full py-4 rounded-xl font-ui font-bold text-white transition-all btn-press disabled:opacity-50 flex items-center justify-center gap-2 ${
                  side === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {placing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">swap_horiz</span> {side} {qty && `${qty}×`} {sym || 'Stock'}</>
                )}
              </button>
              <p className="text-[10px] font-data text-stone-400 text-center">
                Orders execute at live market price. This is virtual trading — no real money involved.
              </p>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
