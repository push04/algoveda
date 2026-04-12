'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TopNavProps {
  breadcrumb?: string[];
}

export default function TopNav({ breadcrumb }: TopNavProps) {
  const [search, setSearch] = useState('');

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-240px)] h-16 bg-white/65 backdrop-blur-xl flex justify-between items-center px-8 z-40 shadow-sm shadow-emerald-900/5 border-b border-white/85">
      <div className="flex items-center gap-8">
        {/* Breadcrumb */}
        {breadcrumb && (
          <div className="flex items-center gap-2 text-xs font-ui text-stone-500">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="material-symbols-outlined text-[14px]">chevron_right</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-[#00361a] font-bold' : ''}>{crumb}</span>
              </span>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px] group-focus-within:text-[#00361a] transition-colors">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks, strategies, reports..."
            className="pl-10 pr-10 py-1.5 bg-stone-100/60 border-none rounded-lg text-sm w-64 focus:outline-none focus:ring-1 focus:ring-[#00361a]/20 font-body text-stone-700 placeholder:text-stone-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-data text-stone-400 bg-stone-200 px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>

        {/* Quick Nav */}
        <nav className="hidden md:flex gap-5">
          <a href="#" className="text-sm font-ui font-bold text-amber-600 hover:text-amber-700 transition-colors">Markets</a>
          <a href="#" className="text-sm font-ui text-stone-600 hover:text-[#00361a] transition-colors">Indices</a>
          <a href="#" className="text-sm font-ui text-stone-600 hover:text-[#00361a] transition-colors">Sectors</a>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Market Status */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-data text-stone-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot"></div>
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
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2 ml-1 pl-3 border-l border-stone-200">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold font-ui text-stone-700">Pushpal S.</p>
            <p className="text-[10px] text-stone-400 font-data">AV-8829</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1A4D2E] flex items-center justify-center text-white text-xs font-bold">
            PS
          </div>
        </div>
      </div>
    </header>
  );
}
