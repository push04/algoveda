'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaperTradePage() {
  const router = useRouter();
  const supabase = createClient();
  const [orderModal, setOrderModal] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [orderType, setOrderType] = useState('MARKET');
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for order logic
    setOrderModal(false);
  };

  const PAPER_POSITIONS = [
    { symbol: 'RELIANCE', qty: 50, avgCost: 2850.40, cmp: 2942.45, pnl: 4602.50, pnlP: 3.24 },
    { symbol: 'HDFCBANK', qty: 100, avgCost: 1680.25, cmp: 1698.10, pnl: 1785.00, pnlP: 1.06 },
    { symbol: 'INFY', qty: 25, avgCost: 1520.00, cmp: 1542.30, pnl: 557.50, pnlP: 1.47 },
    { symbol: 'TCS', qty: 15, avgCost: 3850.00, cmp: 4120.50, pnl: 4057.50, pnlP: 7.03 },
  ];

  return (
    <main className="pt-24 px-8 pb-16 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Virtual Trading</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Paper Portfolio</h2>
        </div>
        <button
          onClick={() => setOrderModal(true)}
          className="px-6 py-3 bg-[#00361a] text-white rounded-lg font-ui font-bold text-sm shadow-[0_4px_12px_rgba(26,77,46,0.2)] hover:bg-[#1A4D2E] transition-all"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Place Order
          </span>
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(232,240,233,0.8) 0%, rgba(253,248,238,0.8) 100%)' }}>
        <div className="absolute top-0 right-0 p-20 opacity-5">
          <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
        </div>
        <div className="relative z-10 grid grid-cols-12 gap-8">
          <div className="col-span-4">
            <p className="font-ui text-xs text-stone-500 uppercase tracking-wider mb-2">Virtual Cash Balance</p>
            <p className="font-data text-5xl font-bold text-[#00361a]">₹98,430</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-lg font-data text-emerald-600 font-bold">+₹8,430 (+9.4%)</span>
              <span className="text-xs font-data text-stone-400">since inception</span>
            </div>
          </div>
          <div className="col-span-8 grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Today's P&L</p>
              <p className="font-data text-2xl font-bold text-emerald-600">+₹1,240</p>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Open Positions</p>
              <p className="font-data text-2xl font-bold text-[#00361a]">8</p>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase tracking-wider mb-1">Total Orders</p>
              <p className="font-data text-2xl font-bold text-[#00361a]">34</p>
            </div>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h3 className="font-headline text-xl text-[#00361a]">Open Positions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] font-data uppercase tracking-[0.2em] text-stone-400">
                <th className="text-left p-4">Symbol</th>
                <th className="text-right p-4">Qty</th>
                <th className="text-right p-4">Avg Cost</th>
                <th className="text-right p-4">CMP</th>
                <th className="text-right p-4">P&L</th>
                <th className="text-right p-4">P&L %</th>
                <th className="text-right p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {PAPER_POSITIONS.map((pos, i) => (
                <tr key={i} className={`border-b border-stone-50 hover:bg-[#f5f4f0] transition-colors ${pos.pnl > 0 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-400'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1A4D2E]/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#1A4D2E] text-[16px]">show_chart</span>
                      </div>
                      <div>
                        <p className="font-ui font-bold text-[#0F1A14]">{pos.symbol}</p>
                        <p className="font-data text-[10px] text-stone-400">NSE</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-data text-sm">{pos.qty}</td>
                  <td className="p-4 text-right font-data text-sm">₹{pos.avgCost.toFixed(2)}</td>
                  <td className="p-4 text-right font-data text-sm font-bold">₹{pos.cmp.toFixed(2)}</td>
                  <td className={`p-4 text-right font-data text-sm font-bold ${pos.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toFixed(2)}
                  </td>
                  <td className={`p-4 text-right font-data text-sm font-bold ${pos.pnlP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {pos.pnlP >= 0 ? '+' : ''}{pos.pnlP.toFixed(2)}%
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-4 py-1.5 border border-[#1A4D2E]/30 text-[#1A4D2E] rounded font-ui text-xs font-bold hover:bg-[#1A4D2E] hover:text-white transition-colors">
                      SELL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-[#0F1A14]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-2xl text-[#00361a]">Place Paper Order</h3>
              <button onClick={() => setOrderModal(false)} className="text-stone-400 hover:text-[#00361a]">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="RELIANCE"
                  className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-data"
                />
              </div>

              <div className="flex gap-2">
                {['MARKET', 'LIMIT', 'SL', 'SL-M'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`flex-1 py-2 text-xs font-ui font-bold rounded-lg border transition-all ${orderType === type ? 'bg-[#1A4D2E] text-white border-[#1A4D2E]' : 'border-[#E8E6DF] text-stone-500 hover:border-[#1A4D2E]'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`flex-1 py-4 rounded-lg font-ui font-bold text-lg transition-all ${side === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`flex-1 py-4 rounded-lg font-ui font-bold text-lg transition-all ${side === 'SELL' ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-500'}`}
                >
                  SELL
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-data"
                  />
                </div>
                {orderType === 'LIMIT' && (
                  <div>
                    <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase mb-2">Limit Price</label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-data"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-stone-50 rounded-xl flex justify-between items-center">
                <span className="font-body text-sm text-stone-500">Estimated Value</span>
                <span className="font-data text-xl font-bold text-[#00361a]">₹0.00</span>
              </div>

              <div className="flex gap-3">
                <button type="button" className="flex-1 py-3 border border-[#1A4D2E]/30 text-[#1A4D2E] rounded-lg font-ui font-bold hover:bg-stone-50 transition-colors">
                  Validate Order
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#1A4D2E] text-white rounded-lg font-ui font-bold hover:bg-[#143D24] transition-colors">
                  Place Order
                </button>
              </div>

              <p className="text-[10px] font-data text-stone-400 text-center">
                Paper trading simulates real market conditions. Orders execute at current market price.
              </p>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}