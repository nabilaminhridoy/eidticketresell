'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, Ticket, ShoppingBag, CreditCard, Wallet,
  RefreshCw, AlertTriangle, Users, ShieldCheck, MessageCircle, Star,
  ScanLine, FileText, HelpCircle, BookOpen, PenTool, Home, Megaphone,
  Search, Report, Image, Settings, Shield, Server, Clock, UserCog,
  Key, ChevronDown, ChevronLeft, Menu, X, Bell, LogOut, LogIn,
  Eye, Activity, FileBarChart2, Database, HardDrive, CalendarDays,
  Mail, Smartphone, Globe, Palette, Coins, Clock4, Browser, Lock,
  Hash, FolderOpen, Upload, Trash2, RotateCcw, Download, ArrowRight,
  Scissors, UsersRound, Scale, BadgeCheck, ClipboardCheck
} from 'lucide-react';

const sidebarSections = [
  {
    title: 'DASHBOARD',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
      { label: 'Activity Log', icon: Activity, path: '/admin/activity-log' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Tickets', icon: Ticket, path: '/admin/tickets' },
      { label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
      { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
      { label: 'Payouts', icon: Wallet, path: '/admin/payout/withdraws' },
      { label: 'Refunds', icon: RefreshCw, path: '/admin/refunds' },
      { label: 'Disputes', icon: AlertTriangle, path: '/admin/disputes' },
      { label: 'Users', icon: Users, path: '/admin/users' },
      { label: 'KYC Verification', icon: ShieldCheck, path: '/admin/kyc' },
      { label: 'Messages', icon: MessageCircle, path: '/admin/messages' },
      { label: 'Reviews', icon: Star, path: '/admin/reviews' },
      { label: 'Ticket Verify', icon: ScanLine, path: '/admin/verify-ticket' },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { label: 'Blog', icon: BookOpen, path: '/admin/blog' },
      { label: 'FAQs', icon: HelpCircle, path: '/admin/faqs' },
      { label: 'CMS Pages', icon: FileText, path: '/admin/pages' },
      { label: 'Homepage', icon: Home, path: '/admin/homepage' },
      { label: 'Internal Ads', icon: Megaphone, path: '/admin/ads' },
    ],
  },
  {
    title: 'MARKETING & SEO',
    items: [
      { label: 'Marketing', icon: PenTool, path: '/admin/marketing' },
      { label: 'SEO', icon: Search, path: '/admin/seo' },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { label: 'Reports', icon: FileBarChart2, path: '/admin/reports' },
    ],
  },
  {
    title: 'MEDIA',
    items: [
      { label: 'Media Library', icon: Image, path: '/admin/media' },
    ],
  },
  {
    title: 'SETTINGS',
    collapsible: true,
    items: [
      { label: 'General', icon: Settings, path: '/admin/settings/general' },
      { label: 'Localization', icon: Globe, path: '/admin/settings/localization' },
      { label: 'Email / SMTP', icon: Mail, path: '/admin/settings/email' },
      { label: 'SMS', icon: Smartphone, path: '/admin/settings/sms' },
      { label: 'Payment Gateway', icon: CreditCard, path: '/admin/settings/payments' },
      { label: 'Security', icon: Shield, path: '/admin/security' },
      { label: 'API Keys', icon: Key, path: '/admin/security/api-keys' },
    ],
  },
  {
    title: 'SYSTEM',
    collapsible: true,
    items: [
      { label: 'Administrators', icon: UserCog, path: '/admin/admins' },
      { label: 'Roles & Permissions', icon: Scale, path: '/admin/roles' },
      { label: 'Cache', icon: Database, path: '/admin/cache' },
      { label: 'Logs', icon: FileText, path: '/admin/logs' },
      { label: 'Backups', icon: HardDrive, path: '/admin/backups' },
      { label: 'Cron Jobs', icon: Clock4, path: '/admin/cron-jobs' },
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
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">ETR Admin</span>
          </Link>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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
                      <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
