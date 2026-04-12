'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  timezone: string;
  plan: string;
  avatar_url?: string;
}

interface EmailPrefs {
  digest_enabled: boolean;
  digest_frequency: string;
  include_nifty50: boolean;
  include_watchlist: boolean;
  include_ai_picks: boolean;
  include_news: boolean;
  include_macro: boolean;
}

interface ApiResult {
  name: string;
  status: 'pending' | 'ok' | 'fail';
  ms?: number;
  detail?: string;
}

const TABS = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'email', label: 'Email Digest', icon: 'mail' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'billing', label: 'Billing & Plans', icon: 'credit_card' },
  { id: 'diagnostics', label: 'API Diagnostics', icon: 'api' },
];

export default function SettingsPage() {
  const supabase = createClient();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState<Profile>({ full_name: '', email: '', phone: '', timezone: 'Asia/Kolkata', plan: 'explorer' });
  const [emailPrefs, setEmailPrefs] = useState<EmailPrefs>({
    digest_enabled: true, digest_frequency: '6h',
    include_nifty50: true, include_watchlist: true,
    include_ai_picks: true, include_news: true, include_macro: false,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);
  const [testing, setTesting] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    // Load profile
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (p) setProfile({
      full_name: p.full_name ?? '',
      email: p.email ?? user.email ?? '',
      phone: p.phone ?? '',
      timezone: p.timezone ?? 'Asia/Kolkata',
      plan: p.plan ?? 'explorer',
      avatar_url: p.avatar_url,
    });

    // Load email prefs
    const { data: ep } = await supabase.from('email_preferences').select('*').eq('user_id', user.id).maybeSingle();
    if (ep) setEmailPrefs({
      digest_enabled: ep.digest_enabled ?? true,
      digest_frequency: ep.digest_frequency ?? '6h',
      include_nifty50: ep.include_nifty50 ?? true,
      include_watchlist: ep.include_watchlist ?? true,
      include_ai_picks: ep.include_ai_picks ?? true,
      include_news: ep.include_news ?? true,
      include_macro: ep.include_macro ?? false,
    });

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      phone: profile.phone,
      timezone: profile.timezone,
    }).eq('id', userId);
    showToast(error ? error.message : 'Profile saved!', !error);
    setSaving(false);
  };

  const saveEmailPrefs = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('email_preferences').upsert({
      user_id: userId,
      id: userId,
      ...emailPrefs,
    });
    showToast(error ? error.message : 'Email preferences saved!', !error);
    setSaving(false);
  };

  const testAllAPIs = async () => {
    setTesting(true);
    const checks = [
      { name: 'Yahoo Finance v8 (RELIANCE)', url: '/api/market/quote?symbol=RELIANCE' },
      { name: 'Market Indices (NIFTY 50)', url: '/api/market/indices' },
      { name: 'Groq AI Research', url: '/api/groq/research?symbol=TCS' },
      { name: 'Platform Stats', url: '/api/stats' },
      { name: 'Admin Plans', url: '/api/admin/plans' },
    ];
    setApiResults(checks.map(c => ({ name: c.name, status: 'pending' })));

    for (let i = 0; i < checks.length; i++) {
      const start = performance.now();
      try {
        const res = await fetch(checks[i].url);
        const ms = Math.round(performance.now() - start);
        const json = await res.json();
        let detail = res.ok ? '✓ OK' : 'HTTP ' + res.status;
        if (json.price) detail = `₹${json.price}`;
        else if (json.indices) detail = `${json.indices.length} indices (${json.source})`;
        else if (json.backtests !== undefined) detail = `${json.users} users · ${json.backtests} backtests`;
        else if (json.plans) detail = `${json.plans.length} plans`;
        else if (json.symbol) detail = `${json.symbol} report ready`;
        setApiResults(prev => prev.map((r, j) => j === i ? { ...r, status: res.ok ? 'ok' : 'fail', ms, detail } : r));
      } catch (e: unknown) {
        const ms = Math.round(performance.now() - start);
        const msg = e instanceof Error ? e.message : 'Network error';
        setApiResults(prev => prev.map((r, j) => j === i ? { ...r, status: 'fail', ms, detail: msg } : r));
      }
    }
    setTesting(false);
  };

  return (
    <main className="pt-24 px-8 pb-16 max-w-[1320px] mx-auto page-enter">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl font-ui text-sm text-white flex items-center gap-2 animate-fade-in-down ${toast.ok ? 'bg-emerald-700' : 'bg-red-600'}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.ok ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Account</span>
        <h2 className="text-4xl font-headline text-[#00361a] mt-1">Settings</h2>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="glass-panel rounded-2xl p-2">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-ui text-sm transition-all ${tab === t.id ? 'bg-[#1A4D2E] text-white' : 'text-stone-500 hover:bg-stone-100'}`}>
                <span className="material-symbols-outlined text-[18px]" style={tab === t.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-9">
          {loading ? (
            <div className="glass-panel p-8 rounded-2xl">
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
              </div>
            </div>
          ) : (
            <>
              {/* ── Profile ── */}
              {tab === 'profile' && (
                <div className="glass-panel p-8 rounded-2xl animate-fade-in">
                  <h3 className="font-headline text-2xl text-[#00361a] mb-6">Profile Settings</h3>
                  <div className="space-y-5 max-w-lg">
                    <div>
                      <label className="block text-xs font-ui font-bold text-stone-500 uppercase tracking-wider mb-2">Full Name</label>
                      <input type="text" value={profile.full_name}
                        onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-body focus:outline-none input-glow transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-ui font-bold text-stone-500 uppercase tracking-wider mb-2">Email</label>
                      <input type="email" value={profile.email} disabled
                        className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-lg text-stone-400 cursor-not-allowed" />
                      <p className="text-[10px] text-stone-400 mt-1">Email is managed by authentication and cannot be changed here</p>
                    </div>
                    <div>
                      <label className="block text-xs font-ui font-bold text-stone-500 uppercase tracking-wider mb-2">Phone Number</label>
                      <input type="tel" value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-body focus:outline-none input-glow transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-ui font-bold text-stone-500 uppercase tracking-wider mb-2">Timezone</label>
                      <select value={profile.timezone}
                        onChange={e => setProfile({ ...profile, timezone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg font-body focus:outline-none input-glow transition-all">
                        <option value="Asia/Kolkata">IST — Asia/Kolkata (UTC+5:30)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">EST — New York</option>
                        <option value="Europe/London">GMT — London</option>
                      </select>
                    </div>
                    <button onClick={saveProfile} disabled={saving}
                      className="px-6 py-3 bg-[#1A4D2E] text-white rounded-lg font-ui font-bold hover:bg-[#143D24] transition-all disabled:opacity-50 btn-press">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Email Prefs ── */}
              {tab === 'email' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="font-headline text-2xl text-[#00361a] mb-2">Email Digest Settings</h3>
                    <p className="text-sm text-stone-500 mb-6">Configure AI-curated market intelligence delivered to your inbox</p>

                    {/* Master toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#1A4D2E]/5 rounded-xl border border-[#1A4D2E]/10 mb-6">
                      <div>
                        <p className="font-ui font-bold text-stone-800">Email Digest</p>
                        <p className="text-xs text-stone-500">Receive regular market summaries via email</p>
                      </div>
                      <button onClick={() => setEmailPrefs(p => ({ ...p, digest_enabled: !p.digest_enabled }))}
                        className={`w-12 h-6 rounded-full transition-all ${emailPrefs.digest_enabled ? 'bg-[#1A4D2E]' : 'bg-stone-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${emailPrefs.digest_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Frequency */}
                    <div className="mb-6">
                      <label className="block text-xs font-ui font-bold text-stone-500 uppercase tracking-wider mb-3">Digest Frequency</label>
                      <div className="flex flex-wrap gap-2">
                        {['1h', '2h', '4h', '6h', '12h', '24h'].map(freq => (
                          <button key={freq}
                            onClick={() => setEmailPrefs(p => ({ ...p, digest_frequency: freq }))}
                            className={`px-4 py-2 rounded-lg text-sm font-ui font-bold transition-all border-2 ${emailPrefs.digest_frequency === freq ? 'bg-[#1A4D2E] text-white border-[#1A4D2E]' : 'border-stone-200 text-stone-500 hover:border-[#1A4D2E]/40'}`}>
                            {freq === '24h' ? 'Daily' : `Every ${freq}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content toggles */}
                    <div className="space-y-3">
                      {[
                        { key: 'include_nifty50', label: 'Nifty 50 Snapshot', desc: 'Daily index performance and key resistance/support levels' },
                        { key: 'include_watchlist', label: 'Watchlist Movers', desc: 'Price changes for stocks you follow' },
                        { key: 'include_ai_picks', label: 'AI Stock Picks', desc: 'Algorithmic opportunities identified by our research engine' },
                        { key: 'include_news', label: 'Market News', desc: 'Top financial stories from NSE, BSE, and corporate actions' },
                        { key: 'include_macro', label: 'Macro Indicators', desc: 'USD/INR, bond yields, FII/DII flows, RBI data' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 hover:border-stone-200 transition-all">
                          <div>
                            <p className="font-ui font-bold text-sm text-stone-800">{item.label}</p>
                            <p className="text-xs text-stone-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setEmailPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof EmailPrefs] }))}
                            className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${emailPrefs[item.key as keyof EmailPrefs] ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${emailPrefs[item.key as keyof EmailPrefs] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button onClick={saveEmailPrefs} disabled={saving}
                      className="mt-6 px-8 py-3 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24] transition-all shadow-lg shadow-[#1A4D2E]/20 disabled:opacity-50 btn-press">
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Security ── */}
              {tab === 'security' && (
                <div className="glass-panel p-8 rounded-2xl animate-fade-in">
                  <h3 className="font-headline text-2xl text-[#00361a] mb-6">Security</h3>
                  <div className="space-y-4 max-w-lg">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                      <div>
                        <p className="font-ui font-bold text-emerald-800">Email verified</p>
                        <p className="text-xs text-emerald-700">{profile.email}</p>
                      </div>
                    </div>
                    <Link href="/auth/update-password"
                      className="flex items-center justify-between w-full p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-stone-500">lock</span>
                        <div>
                          <p className="font-ui font-bold text-sm text-stone-800">Change Password</p>
                          <p className="text-xs text-stone-500">Update your account password</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-stone-400 group-hover:text-stone-600 transition-colors">chevron_right</span>
                    </Link>
                    <Link href="/auth/logout"
                      className="flex items-center justify-between w-full p-4 border border-red-200 rounded-xl hover:bg-red-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-400">logout</span>
                        <div>
                          <p className="font-ui font-bold text-sm text-red-600">Sign Out</p>
                          <p className="text-xs text-stone-500">Sign out from all devices</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-red-300 group-hover:text-red-500 transition-colors">chevron_right</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* ── Billing ── */}
              {tab === 'billing' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="glass-panel p-8 rounded-2xl">
                    <h3 className="font-headline text-2xl text-[#00361a] mb-6">Current Plan</h3>
                    <div className={`p-5 rounded-xl border-2 inline-flex items-center gap-4 mb-6 ${
                      profile.plan === 'pro' || profile.plan === 'institution'
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-stone-200 bg-stone-50'
                    }`}>
                      <span className={`material-symbols-outlined text-[32px] ${
                        profile.plan === 'pro' || profile.plan === 'institution' ? 'text-amber-600' : 'text-stone-400'
                      }`} style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      <div>
                        <p className="font-headline text-xl text-[#00361a]">{profile.plan?.toUpperCase() ?? 'EXPLORER'}</p>
                        <p className="text-xs text-stone-500">
                          {profile.plan === 'explorer' ? 'Free plan — 5 backtests/month' :
                           profile.plan === 'researcher' ? '₹499/month · 50 backtests' :
                           profile.plan === 'pro' ? '₹1,499/month · Unlimited backtests' :
                           '₹4,999/month · Enterprise'}
                        </p>
                      </div>
                    </div>
                    <Link href="/pricing"
                      className="flex items-center gap-2 w-fit px-6 py-3 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24] transition-all shadow-lg shadow-[#1A4D2E]/20 btn-press">
                      <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                      {profile.plan === 'explorer' ? 'Upgrade Plan' : 'Manage Subscription'}
                    </Link>
                  </div>
                </div>
              )}

              {/* ── Diagnostics ── */}
              {tab === 'diagnostics' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="glass-panel p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-headline text-2xl text-[#00361a]">API Diagnostics</h3>
                        <p className="text-sm text-stone-500 mt-1">Test all platform APIs and external services</p>
                      </div>
                      <button onClick={testAllAPIs} disabled={testing}
                        className="px-5 py-2.5 bg-[#1A4D2E] text-white rounded-lg font-ui font-bold hover:bg-[#143D24] transition-all disabled:opacity-50 flex items-center gap-2 btn-press">
                        <span className={`material-symbols-outlined text-[18px] ${testing ? 'animate-spin' : ''}`}>
                          {testing ? 'sync' : 'play_arrow'}
                        </span>
                        {testing ? 'Running...' : 'Run All Tests'}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {apiResults.length === 0 && (
                        <div className="text-center py-8">
                          <span className="material-symbols-outlined text-[36px] text-stone-300 block mb-2">api</span>
                          <p className="text-stone-400 text-sm">Click "Run All Tests" to check API health</p>
                        </div>
                      )}
                      {apiResults.map((api, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              api.status === 'ok' ? 'bg-emerald-500' :
                              api.status === 'fail' ? 'bg-red-500' : 'bg-amber-400 animate-pulse'
                            }`} />
                            <div>
                              <p className="font-ui font-bold text-sm text-stone-800">{api.name}</p>
                              {api.detail && <p className={`text-xs mt-0.5 ${api.status === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>{api.detail}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {api.ms && <span className={`text-xs font-data font-bold ${api.ms < 1000 ? 'text-emerald-600' : api.ms < 3000 ? 'text-amber-600' : 'text-red-600'}`}>{api.ms}ms</span>}
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                              api.status === 'ok' ? 'bg-emerald-100 text-emerald-700' :
                              api.status === 'fail' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>{api.status === 'ok' ? 'HEALTHY' : api.status === 'fail' ? 'FAILED' : 'RUNNING'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Link href="/admin/api-tester" className="text-xs font-ui font-bold text-[#1A4D2E] hover:underline">
                        Advanced API Tester (Admin) →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
