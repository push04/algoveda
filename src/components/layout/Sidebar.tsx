'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/screener', icon: 'filter_alt', label: 'Screener' },
  { href: '/backtest', icon: 'history_toggle_off', label: 'Backtest' },
  { href: '/paper-trade', icon: 'currency_exchange', label: 'Paper Trade' },
  { href: '/portfolio', icon: 'pie_chart', label: 'Portfolio' },
  { href: '/alerts', icon: 'notifications_active', label: 'Alerts' },
  { href: '/research', icon: 'menu_book', label: 'Research' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 bg-stone-100 flex flex-col py-8 px-6 z-50 border-r border-stone-200/60">
      {/* Logo */}
      <div className="mb-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1A4D2E] flex items-center justify-center rounded-lg">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          </div>
          <div>
            <h1 className="text-xl font-headline italic text-[#1A4D2E] leading-none">AlgoVeda</h1>
            <p className="text-[9px] tracking-[0.2em] uppercase font-ui font-bold text-stone-500 mt-0.5">Institutional Grade</p>
          </div>
        </Link>
      </div>

      {/* New Analysis Button */}
      <Link
        href="/backtest/new"
        className="mb-6 w-full py-3 px-4 bg-[#00361a] text-white rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(26,77,46,0.2)] transition-all hover:bg-[#1A4D2E] active:scale-95 text-sm font-ui font-semibold"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        New Analysis
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 py-2.5 px-3 rounded transition-all duration-150 text-sm font-ui',
                isActive
                  ? 'text-[#00361a] font-bold bg-stone-200/60 border-r-2 border-[#00361a]'
                  : 'text-stone-500 hover:text-[#00361a] hover:bg-stone-200/50'
              )}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto border-t border-stone-200 pt-5 space-y-0.5">
        <Link href="/support" className="flex items-center gap-3 px-3 py-2 text-stone-500 hover:text-[#00361a] transition-colors text-xs font-ui">
          <span className="material-symbols-outlined text-[18px]">help</span>
          Support
        </Link>
        <Link href="/auth/logout" className="flex items-center gap-3 px-3 py-2 text-stone-500 hover:text-red-600 transition-colors text-xs font-ui">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </Link>
        {/* User Card */}
        <div className="mt-4 pt-4 border-t border-stone-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1A4D2E] flex items-center justify-center text-white text-xs font-bold font-ui">
            PS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold font-ui text-stone-700 truncate">Pushpal S.</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-[#D4A843] to-[#F0C040] text-[#0F1A14] font-bold font-ui uppercase tracking-wide">
              PRO
            </span>
          </div>
        </div>
      </div>

      {/* Grid Background Pattern */}
      <div className="fixed left-0 top-0 w-[240px] h-screen pointer-events-none opacity-[0.025] -z-10 overflow-hidden">
        <svg className="w-full h-full">
          <defs>
            <pattern id="sidebar-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A4D2E" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sidebar-grid)"/>
        </svg>
      </div>
    </aside>
  );
}
