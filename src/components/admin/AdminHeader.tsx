'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { iconMap } from './admin-icons';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminHeader({ onMobileMenuToggle, sidebarCollapsed }: { onMobileMenuToggle: () => void; sidebarCollapsed: boolean }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('etr_admin_info');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        requestAnimationFrame(() => { setAdmin(parsed); });
      } catch { requestAnimationFrame(() => { setAdmin(null); }); }
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!admin) return;
    const token = localStorage.getItem('etr_admin_token');
    if (!token) return;

    const fetchNotifications = () => {
      fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount || 0);
          }
        })
        .catch(() => {});
    };

    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [admin]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('etr_admin_token');
    localStorage.removeItem('etr_admin_info');
    router.push('/admin/login');
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('etr_admin_token');
    if (!token) return;
    try {
      await fetch('/api/admin/notifications/mark-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success': return <iconMap.CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <iconMap.AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <iconMap.AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <iconMap.Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-card border-b border-border flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button onClick={onMobileMenuToggle} className="p-2 rounded-lg hover:bg-muted/50 lg:hidden">
          <iconMap.Menu className="w-5 h-5" />
        </button>
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo-en.svg"
            alt="ETR Admin"
            width={28}
            height={28}
            className="w-7 h-7"
            priority
          />
          <span className="hidden md:block font-bold text-sm">ETR Admin</span>
        </Link>
        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1.5 max-w-xs ml-2">
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
      <div className="flex items-center gap-2">
        {/* Frontend website link */}
        <Link
          href="/en"
          target="_blank"
          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          title="Visit Frontend Website"
        >
          <iconMap.Home className="w-5 h-5 text-muted-foreground" />
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors relative"
          >
            <iconMap.Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-bold px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <iconMap.Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map(notif => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {getNotifIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.isRead ? 'font-medium' : ''}`}>{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleString('en-BD', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        {admin ? (
          <div className="relative" ref={userMenuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {admin.avatar ? (
                  <img src={admin.avatar} alt={admin.name} className="w-8 h-8 rounded-full object-cover" />
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
                <div className="border-t border-border my-1" />
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
