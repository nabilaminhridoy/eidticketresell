'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports to prevent Turbopack from resolving the entire
// sidebar/header module graph at compile time, which causes OOM
// in the 4GB sandbox. Loading these client-only reduces peak memory.
const AdminSidebar = dynamic(() => import('./AdminSidebar'), { ssr: false });
const AdminHeader = dynamic(() => import('./AdminHeader'), { ssr: false });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - hidden on mobile by default */}
      <div className={`hidden lg:block`}>
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <AdminSidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} sidebarCollapsed={sidebarCollapsed} />
        <main className="p-4 md:p-6 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}
