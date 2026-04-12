'use client';

import { useState, useEffect } from 'react';

interface PaperPosition {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlP: number;
}

export default function PaperTradePage() {
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <main className="pt-24 px-8 pb-16 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Virtual Trading</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Paper Portfolio</h2>
        </div>
        <button onClick={() => setOrderModal(true)} className="px-6 py-3 bg-[#00361a] text-white rounded-lg font-ui font-bold text-sm">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Place Order
          </span>
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="glass-panel p-8 rounded-2xl">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-4">
            <p className="font-ui text-xs text-stone-500 uppercase tracking-wider mb-2">Virtual Cash</p>
            <p className="font-data text-5xl font-bold text-[#00361a]">₹1,00,000</p>
            <p className="text-sm text-stone-500 mt-2">Starting capital</p>
          </div>
          <div className="col-span-8 grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-stone-50 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase mb-1">Today's P&L</p>
              <p className="font-data text-2xl font-bold text-stone-400">--</p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase mb-1">Open Positions</p>
              <p className="font-data text-2xl font-bold text-[#00361a]">0</p>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-xl">
              <p className="font-data text-xs text-stone-500 uppercase mb-1">Total Orders</p>
              <p className="font-data text-2xl font-bold text-[#00361a]">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl shadow-card p-12 text-center">
        <span className="material-symbols-outlined text-[64px] text-stone-300 mb-4 block">currency_exchange</span>
        <h3 className="font-headline text-2xl text-[#00361a] mb-2">No Open Positions</h3>
        <p className="font-body text-stone-500 mb-6 max-w-md mx-auto">Start paper trading to practice strategies with virtual money</p>
        <button onClick={() => setOrderModal(true)} className="px-8 py-4 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold">
          Place Your First Order
        </button>
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
            <form className="space-y-6">
              <div className="flex gap-2">
                {['BUY', 'SELL'].map(side => (
                  <button key={side} type="button" className={`flex-1 py-4 rounded-lg font-ui font-bold ${side === 'BUY' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    {side}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOrderModal(false)} className="flex-1 py-3 border border-[#1A4D2E]/30 text-[#1A4D2E] rounded-lg font-ui font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#1A4D2E] text-white rounded-lg font-ui font-bold">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}