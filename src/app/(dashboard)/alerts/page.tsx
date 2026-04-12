'use client';

import { useState, useEffect, useTransition } from 'react';
import { AlertConfig } from '@/lib/supabase/types';
import { getAlerts, createAlert, deleteAlert, testTriggerAlert } from './actions';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<'price' | 'technical' | 'news'>('price');
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleCreate = async (formData: FormData) => {
    startTransition(async () => {
      await createAlert(null, formData);
      await loadAlerts();
      setIsModalOpen(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    startTransition(async () => {
      await deleteAlert(id);
      await loadAlerts();
    });
  };

  const handleTestTrigger = async (id: string) => {
    try {
      alert('Triggering simulated email via Resend...');
      await testTriggerAlert(id);
      alert('Email sent successfully! Check your inbox.');
      await loadAlerts();
    } catch (error: any) {
      alert(error.message || 'Failed to trigger test email');
    }
  };

  return (
    <main className="pt-24 px-8 pb-16 max-w-[1320px] mx-auto relative">
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Notifications</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Alerts</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#00361a] text-white rounded-lg font-ui font-bold text-sm shadow-[0_4px_12px_rgba(26,77,46,0.2)] hover:bg-[#1A4D2E] transition-all"
        >
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

        {isLoading ? (
          <div className="text-center py-12 text-stone-500">Loading alerts...</div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8E6DF]">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${alert.is_active ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                  <div>
                    <p className="font-ui font-bold text-[#0F1A14]">{alert.symbol}</p>
                    <p className="text-xs font-body text-stone-500">{alert.alert_type} · {alert.threshold}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {alert.last_triggered && (
                    <span className="text-[10px] font-data text-stone-400">Last: {new Date(alert.last_triggered).toLocaleDateString()}</span>
                  )}
                  <button 
                    onClick={() => handleTestTrigger(alert.id)}
                    title="Test Trigger (Send Email)"
                    className="flex items-center gap-1 font-ui text-xs px-2 py-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                    Test
                  </button>
                  <button 
                    onClick={() => handleDelete(alert.id)}
                    title="Delete Alert"
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && alerts.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-stone-300 mb-4">notifications_off</span>
            <p className="font-ui text-lg text-stone-500 mb-2">No alerts configured</p>
            <p className="text-sm font-body text-stone-400">Create your first alert to get notified</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#00361a]">Create Alert</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Symbol</label>
                <input 
                  required
                  name="symbol"
                  type="text" 
                  placeholder="e.g. RELIANCE"
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg uppercase"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Condition</label>
                <select name="alert_type" className="w-full px-4 py-2 border border-stone-200 rounded-lg bg-white">
                  <option value="price_above">Price goes above</option>
                  <option value="price_below">Price goes below</option>
                  <option value="rsi_overbought">RSI Overbought</option>
                  <option value="rsi_oversold">RSI Oversold</option>
                  <option value="volume_spike">Volume Spike</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Threshold (Value)</label>
                <input 
                  required
                  name="threshold"
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 3000"
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg font-bold hover:bg-stone-200">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-1 py-2 bg-[#00361a] text-white rounded-lg font-bold hover:bg-[#1A4D2E] disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}