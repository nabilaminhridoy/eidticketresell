'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { iconMap } from './admin-icons';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export default function AdminHeader({ onMobileMenuToggle, sidebarCollapsed }: { onMobileMenuToggle: () => void; sidebarCollapsed: boolean }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load admin from localStorage
    const stored = localStorage.getItem('etr_admin_info');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Schedule state update outside synchronous effect
        requestAnimationFrame(() => { setAdmin(parsed); });
      } catch { requestAnimationFrame(() => { setAdmin(null); }); }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('etr_admin_token');
    localStorage.removeItem('etr_admin_info');
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="p-2 rounded-lg hover:bg-muted/50 lg:hidden">
          <iconMap.Menu className="w-5 h-5" />
        </button>
        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1.5 max-w-xs">
          <iconMap.Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-muted/50 rounded">
              <iconMap.X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors relative">
          <iconMap.Bell className="w-5 h-5 text-muted-foreground" />
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold">3</div>
        </button>

        {/* User dropdown */}
        {admin ? (
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {admin.avatar ? (
                  <img src={admin.avatar} alt={admin.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <iconMap.User className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium leading-none">{admin.name}</p>
                <p className="text-xs text-muted-foreground">{admin.role}</p>
              </div>
              <iconMap.ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                <Link href="/admin/profile" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50" onClick={() => setShowUserMenu(false)}>
                  <iconMap.User className="w-4 h-4" />My Profile
                </Link>
                <Link href="/admin/settings/general" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50" onClick={() => setShowUserMenu(false)}>
                  <iconMap.Settings className="w-4 h-4" />Settings
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 text-red-600 w-full">
                  <iconMap.LogOut className="w-4 h-4" />Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/admin/login" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90">
            <iconMap.LogIn className="w-4 h-4" />Login
          </Link>
        )}
      </div>
    </header>
  );
}
