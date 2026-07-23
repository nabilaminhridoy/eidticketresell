'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Ticket, ShoppingBag, CreditCard, Wallet, ShieldCheck,
  TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Eye, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalTickets: number;
  totalOrders: number;
  totalRevenue: number;
  pendingKyc: number;
  pendingWithdrawals: number;
  activeTickets: number;
  disputesOpen: number;
}

interface RecentActivity {
  id: string;
  action: string;
  details: string;
  time: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalTickets: 0, totalOrders: 0, totalRevenue: 0,
    pendingKyc: 0, pendingWithdrawals: 0, activeTickets: 0, disputesOpen: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d.stats || d); setLoading(false); })
      .catch(() => setLoading(false));

    fetch('/api/admin/activity-log?limit=10')
      .then(r => r.json())
      .then(d => { setRecentActivities(Array.isArray(d) ? d : d.activities || []); })
      .catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10', change: '+12%', up: true, link: '/admin/users' },
    { label: 'Active Tickets', value: stats.activeTickets, icon: Ticket, color: 'text-orange', bgColor: 'bg-orange/10', change: '+8%', up: true, link: '/admin/tickets' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue', bgColor: 'bg-blue/10', change: '+15%', up: true, link: '/admin/orders' },
    { label: 'Revenue (BDT)', value: stats.totalRevenue, icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50', change: '+23%', up: true, link: '/admin/reports/revenue' },
    { label: 'Pending KYC', value: stats.pendingKyc, icon: ShieldCheck, color: 'text-yellow-600', bgColor: 'bg-yellow-50', change: '5 new', up: false, link: '/admin/kyc?status=pending' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: Wallet, color: 'text-purple-600', bgColor: 'bg-purple-50', change: '2 new', up: false, link: '/admin/payout/withdraws?status=pending' },
    { label: 'Open Disputes', value: stats.disputesOpen, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', change: '-3', up: true, link: '/admin/disputes?status=open' },
    { label: 'Platform Fee Earned', value: stats.totalRevenue * 0.05, icon: CreditCard, color: 'text-primary', bgColor: 'bg-primary/10', change: '+5%', up: true, link: '/admin/reports/revenue' },
  ];

  const quickActions = [
    { label: 'Review KYC', icon: ShieldCheck, path: '/admin/kyc?status=pending', color: 'bg-yellow-500' },
    { label: 'Manage Tickets', icon: Ticket, path: '/admin/tickets', color: 'bg-primary' },
    { label: 'Process Withdrawals', icon: Wallet, path: '/admin/payout/withdraws?status=pending', color: 'bg-purple-500' },
    { label: 'View Disputes', icon: AlertTriangle, path: '/admin/disputes', color: 'bg-red-500' },
    { label: 'User Management', icon: Users, path: '/admin/users', color: 'bg-blue' },
    { label: 'View Reports', icon: BarChart3, path: '/admin/reports', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your platform performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.link}>
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.path}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 hover:shadow-sm transition-all cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-center">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Link href="/admin/activity-log" className="text-xs text-primary hover:underline">View All</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {recentActivities.length === 0 ? (
                <div className="space-y-2">
                  {[
                    { action: 'New user registered', details: 'john_doe created account', type: 'success', time: '2 min ago' },
                    { action: 'Ticket approved', details: 'ETR-000042 verified by admin', type: 'success', time: '5 min ago' },
                    { action: 'Payment received', details: '৳867 via bKash for order ORD-000015', type: 'info', time: '12 min ago' },
                    { action: 'KYC submitted', details: 'user_rahim submitted NID verification', type: 'warning', time: '25 min ago' },
                    { action: 'Dispute opened', details: 'Buyer disputed order ORD-000008', type: 'error', time: '1 hour ago' },
                    { action: 'Withdrawal requested', details: '৳5,000 by seller_karim via bKash', type: 'info', time: '2 hours ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        activity.type === 'success' ? 'bg-emerald-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        activity.type === 'error' ? 'bg-red-500' : 'bg-primary'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      activity.type === 'success' ? 'bg-emerald-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      activity.type === 'error' ? 'bg-red-500' : 'bg-primary'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Fee Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Platform Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-primary">Online Copy</Badge>
              </div>
              <p className="text-2xl font-bold text-primary">2%</p>
              <p className="text-sm text-muted-foreground">Deducted from ticket selling price</p>
              <p className="text-xs text-muted-foreground mt-1">Buyer pays full price. Seller receives price minus 2% platform fee.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-orange text-white">Counter Copy</Badge>
              </div>
              <p className="text-2xl font-bold text-orange">3%</p>
              <p className="text-sm text-muted-foreground">Deducted from ticket selling price</p>
              <p className="text-xs text-muted-foreground mt-1">Buyer pays platform fee only. Rest paid in person or COD to seller.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
