'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PlatformStats {
  backtests: number;
  users: number;
  uptime: number;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  is_active: boolean;
  max_backtests: number;
}

interface ApiHealth {
  name: string;
  url: string;
  status: 'idle' | 'loading' | 'ok' | 'fail';
  ms: number | null;
  lastChecked: string | null;
}

const HEALTH_CHECKS: Array<{ name: string; url: string }> = [
  { name: 'Yahoo Finance v8', url: '/api/market/quote?symbol=RELIANCE' },
  { name: 'Market Indices', url: '/api/market/indices' },
  { name: 'Research Engine', url: '/api/groq/research?symbol=TCS' },
  { name: 'Platform Stats', url: '/api/stats' },
  { name: 'Admin Plans', url: '/api/admin/plans' },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [health, setHealth] = useState<ApiHealth[]>(
    HEALTH_CHECKS.map(h => ({ ...h, status: 'idle', ms: null, lastChecked: null }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [statsRes, plansRes] = await Promise.allSettled([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/admin/plans').then(r => r.json()),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.plans ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const runHealthCheck = async () => {
    setHealth(prev => prev.map(h => ({ ...h, status: 'loading' })));
    const results = await Promise.all(
      HEALTH_CHECKS.map(async (check) => {
        const start = performance.now();
        try {
          const res = await fetch(check.url);
          const ms = Math.round(performance.now() - start);
          return { ...check, status: (res.ok ? 'ok' : 'fail') as ApiHealth['status'], ms, lastChecked: new Date().toLocaleTimeString() };
        } catch {
          return { ...check, status: 'fail' as ApiHealth['status'], ms: Math.round(performance.now() - start), lastChecked: new Date().toLocaleTimeString() };
        }
      })
    );
    setHealth(results);
  };

  const overallHealth = health.every(h => h.status === 'idle') ? 'idle'
    : health.some(h => h.status === 'loading') ? 'loading'
    : health.every(h => h.status === 'ok') ? 'ok'
    : health.filter(h => h.status === 'ok').length > health.length / 2 ? 'partial'
    : 'fail';

  return (
    <main className="pt-24 pb-16 px-8 max-w-[1400px] mx-auto page-enter">
      <div className="mb-8">
        <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Admin Panel</span>
        <h2 className="text-4xl font-headline text-[#00361a] mt-1">System Overview</h2>
        <p className="text-stone-500 font-body text-sm mt-2">Platform health, metrics, and administration.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Users', value: loading ? '—' : stats?.users?.toLocaleString() ?? '0', icon: 'group', color: 'blue' },
          { label: 'Backtest Jobs', value: loading ? '—' : stats?.backtests?.toLocaleString() ?? '0', icon: 'history_toggle_off', color: 'green' },
          { label: 'Active Plans', value: plans.filter(p => p.is_active).length.toString(), icon: 'workspace_premium', color: 'amber' },
          { label: 'Uptime', value: `${stats?.uptime ?? 99.9}%`, icon: 'monitoring', color: 'emerald' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`bg-white rounded-xl border border-stone-100 shadow-card p-5 card-hover-lift`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              color === 'blue' ? 'bg-blue-50' :
              color === 'green' ? 'bg-emerald-50' :
              color === 'amber' ? 'bg-amber-50' :
              'bg-emerald-50'
            }`}>
              <span className={`material-symbols-outlined text-[20px] ${
                color === 'blue' ? 'text-blue-600' :
                color === 'green' ? 'text-emerald-600' :
                color === 'amber' ? 'text-amber-600' :
                'text-emerald-600'
              }`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <p className="text-2xl font-bold font-data text-stone-800">{value}</p>
            <p className="text-xs font-ui text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* API Health */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-xl border border-stone-100 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-ui font-bold text-sm text-stone-700">API Health Status</h3>
                {overallHealth === 'ok' && (
                  <span className="badge-live">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full live-dot" />
                    All Systems Go
                  </span>
                )}
                {overallHealth === 'partial' && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Partial</span>
                )}
                {overallHealth === 'fail' && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Issues Detected</span>
                )}
              </div>
              <button
                onClick={runHealthCheck}
                disabled={overallHealth === 'loading'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A4D2E] text-white text-xs font-ui font-bold rounded-lg hover:bg-[#143D24] transition-colors btn-press"
              >
                {overallHealth === 'loading' ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                )}
                Run Check
              </button>
            </div>
            <div className="divide-y divide-stone-50">
              {health.map((h) => (
                <div key={h.name} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      h.status === 'ok' ? 'bg-emerald-500' :
                      h.status === 'fail' ? 'bg-red-500' :
                      h.status === 'loading' ? 'bg-amber-400 animate-pulse' :
                      'bg-stone-300'
                    }`} />
                    <div>
                      <p className="text-sm font-ui font-bold text-stone-700">{h.name}</p>
                      <p className="text-[10px] font-data text-stone-400">{h.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    {h.ms !== null && (
                      <span className={`text-xs font-data font-bold ${
                        h.ms < 500 ? 'text-emerald-600' :
                        h.ms < 2000 ? 'text-amber-600' : 'text-red-600'
                      }`}>{h.ms}ms</span>
                    )}
                    <span className={`text-[10px] font-ui font-bold px-2 py-1 rounded ${
                      h.status === 'ok' ? 'bg-emerald-100 text-emerald-700' :
                      h.status === 'fail' ? 'bg-red-100 text-red-700' :
                      h.status === 'loading' ? 'bg-amber-100 text-amber-700' :
                      'bg-stone-100 text-stone-500'
                    }`}>
                      {h.status === 'ok' ? 'HEALTHY' :
                       h.status === 'fail' ? 'FAILED' :
                       h.status === 'loading' ? 'CHECKING' : 'IDLE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 space-y-5">
          {/* Plans Summary */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-ui font-bold text-sm text-stone-700">Subscription Plans</h3>
              <Link href="/admin/plans" className="text-[11px] font-ui font-bold text-[#1A4D2E] hover:underline">
                Manage →
              </Link>
            </div>
            <div className="divide-y divide-stone-50">
              {plans.length === 0 && (
                <p className="px-5 py-8 text-center text-stone-400 text-sm">No plans found</p>
              )}
              {plans.map(plan => (
                <div key={plan.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-ui font-bold text-stone-700">{plan.name}</p>
                    <p className="text-[10px] font-data text-stone-400">{plan.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-data font-bold text-[#00361a]">
                      {plan.price_monthly === 0 ? 'Free' : `₹${(plan.price_monthly / 100).toLocaleString('en-IN')}`}
                    </p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${plan.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-400'}`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-card p-5">
            <h3 className="font-ui font-bold text-sm text-stone-700 mb-4">Admin Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Manage Users', icon: 'group', href: '/admin/users', desc: 'View all users, toggle admin roles' },
                { label: 'Manage Subscription Plans', icon: 'workspace_premium', href: '/admin/plans', desc: 'Create, edit, delete plans' },
                { label: 'Live API Tester', icon: 'api', href: '/admin/api-tester', desc: 'Test all endpoints live' },
                { label: 'Market Indices', icon: 'monitoring', href: '/api/market/indices', desc: 'View live API response', external: true },
                { label: 'Platform Stats', icon: 'bar_chart', href: '/api/stats', desc: 'View stats JSON', external: true },
              ].map(({ label, icon, href, desc, external }) => (
                <a
                  key={href}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 p-3 rounded-lg border border-stone-100 hover:border-[#1A4D2E]/20 hover:bg-stone-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1A4D2E]/8 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px] text-[#1A4D2E]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-ui font-bold text-stone-700 group-hover:text-[#1A4D2E] transition-colors">{label}</p>
                    <p className="text-[10px] text-stone-400">{desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-[14px] text-stone-300 group-hover:text-[#1A4D2E] transition-colors">
                    {external ? 'open_in_new' : 'chevron_right'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
