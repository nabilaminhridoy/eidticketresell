'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { iconMap } from './admin-icons';
import type { LucideIcon } from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface SidebarSection {
  title: string;
  collapsible?: boolean;
  items: SidebarItem[];
}

/* Resolve icon names → components at module init time (still tree-shakeable
   because admin-icons.ts only imports the icons we actually need) */
const sidebarSections: SidebarSection[] = [
  {
    title: 'DASHBOARD',
    items: [
      { label: 'Dashboard', icon: iconMap.LayoutDashboard, path: '/admin' },
      { label: 'Analytics', icon: iconMap.BarChart3, path: '/admin/analytics' },
      { label: 'Activity Log', icon: iconMap.Activity, path: '/admin/activity-log' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Tickets', icon: iconMap.Ticket, path: '/admin/tickets' },
      { label: 'Orders', icon: iconMap.ShoppingBag, path: '/admin/orders' },
      { label: 'Payments', icon: iconMap.CreditCard, path: '/admin/payments' },
      { label: 'Payouts', icon: iconMap.Wallet, path: '/admin/payout/withdraws' },
      { label: 'Refunds', icon: iconMap.RefreshCw, path: '/admin/refunds' },
      { label: 'Disputes', icon: iconMap.AlertTriangle, path: '/admin/disputes' },
      { label: 'Users', icon: iconMap.Users, path: '/admin/users' },
      { label: 'KYC Verification', icon: iconMap.ShieldCheck, path: '/admin/kyc' },
      { label: 'Messages', icon: iconMap.MessageCircle, path: '/admin/messages' },
      { label: 'Reviews', icon: iconMap.Star, path: '/admin/reviews' },
      { label: 'Ticket Verify', icon: iconMap.ScanLine, path: '/admin/verify-ticket' },
      { label: 'Journey Verify', icon: iconMap.ClipboardCheck, path: '/admin/journey-verify' },
      { label: 'Support Tickets', icon: iconMap.HelpCircle, path: '/admin/support-tickets' },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { label: 'Blog', icon: iconMap.BookOpen, path: '/admin/blog' },
      { label: 'FAQs', icon: iconMap.HelpCircle, path: '/admin/faqs' },
      { label: 'CMS Pages', icon: iconMap.FileText, path: '/admin/pages' },
      { label: 'Homepage', icon: iconMap.Home, path: '/admin/homepage' },
      { label: 'Internal Ads', icon: iconMap.Megaphone, path: '/admin/ads' },
    ],
  },
  {
    title: 'MARKETING & SEO',
    items: [
      { label: 'Marketing', icon: iconMap.PenTool, path: '/admin/marketing' },
      { label: 'SEO', icon: iconMap.Search, path: '/admin/seo' },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { label: 'Reports', icon: iconMap.FileBarChart2, path: '/admin/reports' },
    ],
  },
  {
    title: 'MEDIA',
    items: [
      { label: 'Media Library', icon: iconMap.Image, path: '/admin/media' },
    ],
  },
  {
    title: 'SETTINGS',
    collapsible: true,
    items: [
      { label: 'General', icon: iconMap.Settings, path: '/admin/settings/general' },
      { label: 'Localization', icon: iconMap.Globe, path: '/admin/settings/localization' },
      { label: 'Email / SMTP', icon: iconMap.Mail, path: '/admin/settings/email' },
      { label: 'SMS', icon: iconMap.Smartphone, path: '/admin/settings/sms' },
      { label: 'Payment Gateway', icon: iconMap.CreditCard, path: '/admin/settings/payments' },
      { label: 'Security', icon: iconMap.Shield, path: '/admin/security' },
      { label: 'API Keys', icon: iconMap.Key, path: '/admin/security/api-keys' },
    ],
  },
  {
    title: 'SYSTEM',
    collapsible: true,
    items: [
      { label: 'Administrators', icon: iconMap.UserCog, path: '/admin/admins' },
      { label: 'Roles & Permissions', icon: iconMap.Scale, path: '/admin/roles' },
      { label: 'Cache', icon: iconMap.Database, path: '/admin/cache' },
      { label: 'Logs', icon: iconMap.FileText, path: '/admin/logs' },
      { label: 'Backups', icon: iconMap.HardDrive, path: '/admin/backups' },
      { label: 'Cron Jobs', icon: iconMap.Clock4, path: '/admin/cron-jobs' },
    ],
  },
];

export default function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['SETTINGS', 'SYSTEM']);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className={`fixed top-0 left-0 h-full bg-card border-r border-border z-50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} overflow-y-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-16">
        {!collapsed ? (
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo-en.svg" alt="ETR Admin" width={28} height={28} className="w-7 h-7" priority />
            <span className="font-bold text-sm">ETR Admin</span>
          </Link>
        ) : (
          <Link href="/admin">
            <Image src="/logo-en.svg" alt="ETR" width={24} height={24} className="w-6 h-6" priority />
          </Link>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
          {collapsed ? <iconMap.Menu className="w-4 h-4" /> : <iconMap.ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {sidebarSections.map((section) => {
          const isCollapsible = section.collapsible;
          const isExpanded = expandedSections.includes(section.title);
          const shouldHide = isCollapsible && collapsed && !isExpanded;

          return (
            <div key={section.title}>
              {!collapsed && (
                <div className="flex items-center justify-between px-2 py-1.5 mt-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </span>
                  {isCollapsible && (
                    <button onClick={() => toggleSection(section.title)} className="p-0.5 hover:bg-muted/50 rounded">
                      <iconMap.ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              )}
              {collapsed && (
                <div className="px-1 py-1 mt-2 text-[8px] font-semibold text-muted-foreground uppercase text-center truncate">
                  {section.title.slice(0, 3)}
                </div>
              )}

              {(!isCollapsible || isExpanded || !collapsed) && section.items.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-sm ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
