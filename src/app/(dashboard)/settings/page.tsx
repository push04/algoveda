'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function SettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    fullName: 'Pushpal S.',
    email: 'admin@algoveda.io',
    phone: '+91 98765 43210',
    timezone: 'Asia/Kolkata',
  });

  const [emailPrefs, setEmailPrefs] = useState({
    digestEnabled: true,
    digestFrequency: '4h',
    includeNifty50: true,
    includeWatchlist: true,
    includeAiPicks: true,
    includeNews: true,
    includeMacro: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'email', label: 'Email Preferences', icon: 'mail' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'billing', label: 'Billing', icon: 'credit_card' },
  ];

  return (
    <main className="pt-24 px-8 pb-16 max-w-[1320px] mx-auto">
      <div className="mb-8">
        <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Account</span>
        <h2 className="text-4xl font-headline text-[#00361a] mt-1">Settings</h2>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="glass-panel rounded-2xl p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-ui text-sm transition-all ${activeTab === tab.id ? 'bg-[#1A4D2E] text-white' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="col-span-9">
          {activeTab === 'profile' && (
            <div className="glass-panel p-8 rounded-2xl">
              <h3 className="font-headline text-2xl text-[#00361a] mb-6">Profile Settings</h3>
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={profile.email} disabled className="w-full px-4 py-3 bg-stone-100 border border-[#E8E6DF] rounded-lg text-stone-400" />
                </div>
                <div>
                  <label className="block text-xs font-ui font-bold text-[#4A5568] uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-[#E8E6DF] rounded-lg"
                  />
                </div>
                <button className="px-6 py-3 bg-[#1A4D2E] text-white rounded-lg font-ui font-bold hover:bg-[#143D24] transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-2xl">
                <h3 className="font-headline text-2xl text-[#00361a] mb-6">Digest Frequency</h3>
                <div className="flex flex-wrap gap-3">
                  {['1h', '2h', '3h', '4h', '6h', '12h', '24h'].map(freq => (
                    <button
                      key={freq}
                      onClick={() => setEmailPrefs({...emailPrefs, digestFrequency: freq})}
                      className={`px-6 py-3 rounded-xl font-ui text-sm font-bold border-2 transition-all ${emailPrefs.digestFrequency === freq ? 'bg-[#1A4D2E] text-white border-[#1A4D2E]' : 'border-[#E8E6DF] text-stone-500 hover:border-[#1A4D2E]'}`}
                    >
                      {freq === '24h' ? 'Daily' : `Every ${freq}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-8 rounded-2xl">
                <h3 className="font-headline text-2xl text-[#00361a] mb-6">What's Included</h3>
                <div className="space-y-4">
                  {[
                    { key: 'includeNifty50', label: 'Nifty 50 Snapshot', desc: 'Daily index performance and key levels' },
                    { key: 'includeWatchlist', label: 'Your Watchlist Movers', desc: 'Price changes for stocks you track' },
                    { key: 'includeAiPicks', label: 'AI Stock Picks', desc: 'Curated opportunities from our AI' },
                    { key: 'includeNews', label: 'Key Financial News', desc: 'Top stories from Indian markets' },
                    { key: 'includeMacro', label: 'Macro Indicators', desc: 'USD/INR, Bond yields, FII/DII data' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8E6DF]">
                      <div>
                        <p className="font-ui font-bold text-[#0F1A14]">{item.label}</p>
                        <p className="text-xs font-body text-stone-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setEmailPrefs({...emailPrefs, [item.key]: !emailPrefs[item.key as keyof typeof emailPrefs]})}
                        className={`w-12 h-6 rounded-full transition-all ${emailPrefs[item.key as keyof typeof emailPrefs] ? 'bg-emerald-500' : 'bg-stone-200'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${emailPrefs[item.key as keyof typeof emailPrefs] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="px-8 py-4 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24] transition-all shadow-lg shadow-[#1A4D2E]/20">
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-panel p-8 rounded-2xl">
              <h3 className="font-headline text-2xl text-[#00361a] mb-6">Security Settings</h3>
              <div className="space-y-6 max-w-lg">
                <div className="p-4 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    <span className="font-ui font-bold text-[#0F1A14]">Password</span>
                  </div>
                  <p className="text-sm font-body text-stone-500">Last changed 30 days ago</p>
                </div>
                <button className="px-6 py-3 border border-[#1A4D2E] text-[#1A4D2E] rounded-lg font-ui font-bold hover:bg-[#1A4D2E] hover:text-white transition-all">
                  Change Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="glass-panel p-8 rounded-2xl">
              <h3 className="font-headline text-2xl text-[#00361a] mb-6">Current Plan</h3>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#D4A843] to-[#F0C040] rounded-xl">
                <span className="material-symbols-outlined text-[#0F1A14]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                <span className="font-ui font-bold text-[#0F1A14]">PRO ANALYST</span>
              </div>
              <p className="mt-4 text-stone-500 font-body">₹1,499/month • Billed monthly</p>
              <button className="mt-6 px-6 py-3 bg-[#1A4D2E] text-white rounded-lg font-ui font-bold hover:bg-[#143D24] transition-all">
                Manage Subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}