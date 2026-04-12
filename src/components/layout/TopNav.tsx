'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function getISTTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
}

function isMarketOpen(): boolean {
  const now = getISTTime();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  if (day === 0 || day === 6) return false;
  if (hour < 9 || hour >= 15) return false;
  if (hour === 9 && minute < 15) return false;
  if (hour === 15 && minute > 30) return false;
  return true;
}

export default function TopNav() {
  const [search, setSearch] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);
  const [istTime, setIstTime] = useState('');
  const [userInfo, setUserInfo] = useState<{ initials: string; name: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const update = () => {
      const now = getISTTime();
      setIstTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setMarketOpen(isMarketOpen());
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      const name = profile?.full_name ?? user.email?.split('@')[0] ?? 'User';
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      setUserInfo({ initials, name: name.split(' ')[0] + (name.split(' ')[1] ? ' ' + name.split(' ')[1][0] + '.' : '') });
    };
    loadUser();
  }, []);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-white/65 backdrop-blur-xl flex justify-between items-center px-8 z-40 shadow-sm shadow-emerald-900/5 border-b border-white/85">
      <div className="flex items-center gap-8">
        {/* Market Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-ui ${marketOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className={`w-2 h-2 rounded-full ${marketOpen ? 'bg-green-600 animate-pulse' : 'bg-red-500'}`} />
          <span>{marketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}</span>
          <span className="text-stone-400">|</span>
          <span className="text-stone-600">{istTime} IST</span>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px] group-focus-within:text-[#00361a] transition-colors">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks, strategies..."
            className="pl-10 pr-4 py-1.5 bg-stone-100/60 border-none rounded-lg text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#00361a]/20 font-body text-stone-700 placeholder:text-stone-400"
          />
        </div>

        {/* Quick Nav */}
        <nav className="hidden md:flex gap-5">
          <Link href="/screener" className="text-sm font-ui font-bold text-amber-600 hover:text-amber-700 transition-colors">Screener</Link>
          <Link href="/research" className="text-sm font-ui text-stone-600 hover:text-[#00361a] transition-colors">Research</Link>
          <Link href="/backtest/new" className="text-sm font-ui text-stone-600 hover:text-[#00361a] transition-colors">Backtest</Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-data text-stone-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
          Live
        </div>

        {/* Upgrade */}
        <Link
          href="/pricing"
          className="bg-[#fece65] text-[#755700] px-3 py-1.5 rounded text-xs font-bold font-ui hover:brightness-105 transition-all"
        >
          Upgrade to PRO
        </Link>

        {/* Notifications */}
        <button className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        {/* User */}
        {userInfo && (
          <div className="flex items-center gap-2 ml-1 pl-3 border-l border-stone-200">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold font-ui text-stone-700">{userInfo.name}</p>
              <p className="text-[10px] text-stone-400 font-data">AlgoVeda</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#1A4D2E] flex items-center justify-center text-white text-xs font-bold">
              {userInfo.initials}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
