'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/screener', icon: 'filter_alt', label: 'Screener' },
  { href: '/backtest', icon: 'history_toggle_off', label: 'Backtest' },
  { href: '/paper-trade', icon: 'currency_exchange', label: 'Paper Trade' },
  { href: '/portfolio', icon: 'pie_chart', label: 'Portfolio' },
  { href: '/alerts', icon: 'notifications_active', label: 'Alerts' },
  { href: '/research', icon: 'auto_awesome', label: 'AI Research' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
];

const ADMIN_ITEMS = [
  { href: '/admin/overview', icon: 'monitor_heart', label: 'System Overview' },
  { href: '/admin/plans', icon: 'workspace_premium', label: 'Manage Plans' },
  { href: '/admin/api-tester', icon: 'api', label: 'Live API Tester' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; plan: string; isAdmin: boolean } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, plan, is_admin')
        .eq('id', u.id)
        .single();
      setUser({
        name: profile?.full_name ?? u.email?.split('@')[0] ?? 'User',
        plan: profile?.plan ?? 'explorer',
        isAdmin: profile?.is_admin ?? false,
      });
    };
    load();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AV';

  const planLabel = (plan: string) => {
    const map: Record<string, string> = {
      explorer: 'Explorer',
      researcher: 'Researcher',
      pro: 'PRO',
      institution: 'Institutional',
    };
    return map[plan.toLowerCase()] ?? plan.toUpperCase();
  };

  const planColor = (plan: string) => plan.toLowerCase() === 'pro' || plan.toLowerCase() === 'institution'
    ? 'from-[#D4A843] to-[#F0C040] text-[#0F1A14]'
    : 'from-stone-300 to-stone-400 text-white';

  return (
    <aside className="w-[240px] h-screen fixed left-0 top-0 bg-stone-100 flex flex-col py-8 px-6 z-50 border-r border-stone-200/60">
      {/* Logo */}
      <div className="mb-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1A4D2E] flex items-center justify-center rounded-lg shadow-lg shadow-[#1A4D2E]/20">
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          </div>
          <div>
            <h1 className="text-xl font-headline italic text-[#1A4D2E] leading-none">AlgoVeda</h1>
            <p className="text-[9px] tracking-[0.2em] uppercase font-ui font-bold text-stone-500 mt-0.5">Institutional</p>
          </div>
        </Link>
      </div>

      {/* New Analysis CTA */}
      <Link
        href="/research"
        className="mb-6 w-full py-3 px-4 bg-[#00361a] text-white rounded-lg flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(26,77,46,0.2)] transition-all hover:bg-[#1A4D2E] hover:translate-y-[-1px] active:scale-95 text-sm font-ui font-semibold"
      >
        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
        AI Research
      </Link>

      {/* Main Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-gold">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 py-2.5 px-3 rounded transition-all duration-150 text-sm font-ui',
                isActive
                  ? 'text-[#00361a] font-bold bg-emerald-50 border-r-2 border-[#00361a]'
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

        {/* Admin Section */}
        {user?.isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[9px] font-ui font-bold uppercase tracking-widest text-stone-400">Admin</p>
            </div>
            {ADMIN_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 py-2.5 px-3 rounded transition-all duration-150 text-sm font-ui',
                    isActive
                      ? 'text-amber-700 font-bold bg-amber-50 border-r-2 border-amber-600'
                      : 'text-stone-500 hover:text-amber-700 hover:bg-amber-50/50'
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="mt-auto border-t border-stone-200 pt-5 space-y-0.5">
        <Link href="/auth/logout" className="flex items-center gap-3 px-3 py-2 text-stone-500 hover:text-red-600 transition-colors text-xs font-ui rounded">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </Link>

        {/* User Card */}
        <div className="mt-4 pt-4 border-t border-stone-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1A4D2E] flex items-center justify-center text-white text-xs font-bold font-ui shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold font-ui text-stone-700 truncate">{user?.name ?? '—'}</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r font-bold font-ui uppercase tracking-wide ${planColor(user?.plan ?? 'explorer')}`}>
              {planLabel(user?.plan ?? 'explorer')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
