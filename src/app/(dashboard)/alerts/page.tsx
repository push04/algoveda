'use client';

import { useState } from 'react';

const ALERTS = [
  { symbol: 'RELIANCE', type: 'Price Above', threshold: '₹3,000', status: 'active', lastTriggered: null },
  { symbol: 'HDFCBANK', type: 'RSI Oversold', threshold: 'RSI < 30', status: 'active', lastTriggered: '2024-01-10' },
  { symbol: 'INFY', type: 'MA Crossover', threshold: 'Golden Cross', status: 'paused', lastTriggered: null },
  { symbol: 'TITAN', type: 'Volume Spike', threshold: '> 2x Avg', status: 'active', lastTriggered: null },
];

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<'price' | 'technical' | 'news'>('price');

  return (
    <main className="pt-24 px-8 pb-16 max-w-[1320px] mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Notifications</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Alerts</h2>
        </div>
        <button className="px-6 py-3 bg-[#00361a] text-white rounded-lg font-ui font-bold text-sm shadow-[0_4px_12px_rgba(26,77,46,0.2)] hover:bg-[#1A4D2E] transition-all">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Alert
          </span>
        </button>
      </div>

      <div className="glass-panel p-8 rounded-2xl mb-8">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'price', label: 'Price Alerts', icon: 'attach_money' },
            { id: 'technical', label: 'Technical Alerts', icon: 'show_chart' },
            { id: 'news', label: 'News Alerts', icon: 'article' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#1A4D2E] text-white' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {ALERTS.map((alert, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8E6DF]">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${alert.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                <div>
                  <p className="font-ui font-bold text-[#0F1A14]">{alert.symbol}</p>
                  <p className="text-xs font-body text-stone-500">{alert.type} · {alert.threshold}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {alert.lastTriggered && (
                  <span className="text-[10px] font-data text-stone-400">Last: {alert.lastTriggered}</span>
                )}
                <button className="p-2 text-stone-400 hover:text-[#00361a] hover:bg-stone-100 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {ALERTS.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-stone-300 mb-4">notifications_off</span>
            <p className="font-ui text-lg text-stone-500 mb-2">No alerts configured</p>
            <p className="text-sm font-body text-stone-400">Create your first alert to get notified</p>
          </div>
        )}
      </div>
    </main>
  );
}