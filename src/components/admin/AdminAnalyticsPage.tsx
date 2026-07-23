'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// No tabs needed in this simplified analytics page
import {
  BarChart3, Users, DollarSign, Ticket,
  Eye, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

interface AnalyticsData {
  metrics: {
    totalUsers: number;
    totalTickets: number;
    activeTickets: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    platformFeeRevenue: number;
    pendingKyc: number;
    pendingOrders: number;
    disputedOrders: number;
    recentUsers: number;
    recentOrders: number;
  };
  breakdowns: {
    transportTypes: { bus: number; train: number; flight: number; launch: number };
    userRoles: { regular: number; verifiedSeller: number; admin: number };
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetch('/api/admin/analytics', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.metrics) setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const metrics = analytics ? [
    { label: 'Total Users', value: analytics.metrics.totalUsers.toLocaleString(), trend: 'up' as const, change: `${analytics.metrics.recentUsers} new (7d)` },
    { label: 'Active Tickets', value: analytics.metrics.activeTickets.toLocaleString(), trend: 'up' as const, change: `${analytics.metrics.totalTickets} total` },
    { label: 'Total Orders', value: analytics.metrics.totalOrders.toLocaleString(), trend: 'up' as const, change: `${analytics.metrics.recentOrders} new (7d)` },
    { label: 'Completed Orders', value: analytics.metrics.completedOrders.toLocaleString(), trend: 'up' as const, change: `${analytics.metrics.pendingOrders} pending` },
    { label: 'Total Revenue', value: `৳${analytics.metrics.totalRevenue.toLocaleString()}`, trend: 'up' as const, change: `Fee: ৳${analytics.metrics.platformFeeRevenue.toLocaleString()}` },
    { label: 'Pending KYC', value: analytics.metrics.pendingKyc.toLocaleString(), trend: 'down' as const, change: 'needs review' },
    { label: 'Disputed Orders', value: analytics.metrics.disputedOrders.toLocaleString(), trend: 'down' as const, change: 'open disputes' },
    { label: 'Recent Users (7d)', value: analytics.metrics.recentUsers.toLocaleString(), trend: 'up' as const, change: `${analytics.metrics.recentOrders} orders` },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6" />Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform data computed from real database records</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1"><Eye className="w-4 h-4" />Refresh</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map(metric => (
              <Card key={metric.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <div className={`flex items-center gap-1 text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {metric.change}
                    </div>
                  </div>
                  <p className="text-xl font-bold">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Breakdowns */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg">Transport Type Breakdown</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {Object.entries(analytics.breakdowns.transportTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm capitalize">{type}</span>
                        </div>
                        <Badge variant="secondary">{count} tickets</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">User Role Breakdown</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {Object.entries(analytics.breakdowns.userRoles).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm capitalize">{role === 'verifiedSeller' ? 'Verified Seller' : role === 'regular' ? 'User' : 'Admin'}</span>
                        </div>
                        <Badge variant="secondary">{count} users</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts placeholder */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Trend Charts</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">Chart Visualization Placeholder</p>
                  <p className="text-sm text-muted-foreground">Data computed from real database records</p>
                  <p className="text-xs text-muted-foreground">Chart library integration coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
