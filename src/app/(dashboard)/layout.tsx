import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth guard — backup in case middleware misses edge cases
  const supabase = await createClient();
  const { data: jwtData } = await supabase.auth.getClaims();

  if (!jwtData?.claims) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <Sidebar />
      <div className="ml-[240px] min-h-screen">
        <TopNav />
        <div className="pt-16">
          {children}
        </div>
      </div>
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] -z-10 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="global-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A4D2E" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#global-grid)"/>
        </svg>
      </div>
    </div>
  );
}
