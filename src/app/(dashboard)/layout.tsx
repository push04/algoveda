import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <Sidebar />
      <div className="ml-[240px] min-h-screen">
        <TopNav />
        {children}
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
