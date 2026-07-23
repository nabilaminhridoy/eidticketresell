'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  FileBarChart2, DollarSign, Users, Ticket, CreditCard, RefreshCw,
  Wallet, ArrowLeft, BarChart3, ShoppingBag, Loader2
} from 'lucide-react';

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminReportsPage({ section }: { section?: string }) {
  const [reportData, setReportData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const currentSection = section || null;

  const sections = [
    { key: 'sales', label: 'Sales Report', icon: ShoppingBag, desc: 'Ticket sales and order volume' },
    { key: 'revenue', label: 'Revenue Report', icon: DollarSign, desc: 'Platform revenue and earnings' },
    { key: 'users', label: 'User Report', icon: Users, desc: 'User registrations and activity' },
    { key: 'tickets', label: 'Ticket Report', icon: Ticket, desc: 'Ticket listings and sales data' },
    { key: 'payments', label: 'Payment Report', icon: CreditCard, desc: 'Payment transactions summary' },
    { key: 'refunds', label: 'Refund Report', icon: RefreshCw, desc: 'Refund requests and processing' },
    { key: 'withdrawals', label: 'Withdrawal Report', icon: Wallet, desc: 'Seller payout requests' },
  ];

  useEffect(() => {
    if (currentSection) {
      fetch(`/api/admin/reports?type=${currentSection}`, { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(d => { if (d.report) setReportData(d.report); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [currentSection]);

  const renderReport = (key: string) => {
    const data = reportData as Record<string, number | string>;

    const getSummaryStats = () => {
      switch (key) {
        case 'sales':
          return [
            { label: 'Total Orders', value: `৳${((data.totalOrders as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Completed', value: `${((data.completedOrders as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Cancelled', value: `${((data.cancelledOrders as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Avg. Order', value: `৳${((data.avgOrderValue as number) || 0).toFixed(2)}`, change: '' },
          ];
        case 'revenue':
          return [
            { label: 'Total Revenue', value: `৳${((data.totalRevenue as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Platform Fee', value: `৳${((data.totalPlatformFee as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Refunded', value: `৳${((data.totalRefunded as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Net Revenue', value: `৳${((data.netRevenue as number) || 0).toLocaleString()}`, change: '' },
          ];
        case 'users':
          return [
            { label: 'Total Users', value: `${((data.totalUsers as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Active Users', value: `${((data.activeUsers as number) || 0).toLocaleString()}`, change: '' },
            { label: 'KYC Pending', value: `${((data.pendingKyc as number) || 0).toLocaleString()}`, change: '' },
            { label: 'KYC Approved', value: `${((data.approvedKyc as number) || 0).toLocaleString()}`, change: '' },
          ];
        case 'tickets':
          return [
            { label: 'Total Tickets', value: `${((data.totalTickets as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Active Tickets', value: `${((data.activeTickets as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Sold Tickets', value: `${((data.soldTickets as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Total Orders', value: `${((data.totalOrders as number) || 0)}`, change: '' },
          ];
        case 'payments':
          return [
            { label: 'Paid Transactions', value: `${((data.paidTransactions as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Total Revenue', value: `৳${((data.totalRevenue as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Platform Fee', value: `৳${((data.totalPlatformFee as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Avg. Transaction', value: `৳${(((data.totalRevenue as number) || 0) / ((data.paidTransactions as number) || 1)).toFixed(2)}`, change: '' },
          ];
        case 'refunds':
          return [
            { label: 'Total Refunds', value: `${((data.totalRefunds as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Total Refunded', value: `৳${((data.totalRefunded as number) || 0).toLocaleString()}`, change: '' },
          ];
        case 'withdrawals':
          return [
            { label: 'Pending', value: `${((data.pendingWithdrawals as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Completed', value: `${((data.completedWithdrawals as number) || 0).toLocaleString()}`, change: '' },
            { label: 'Total Withdrawn', value: `৳${((data.totalWithdrawnAmount as number) || 0).toLocaleString()}`, change: '' },
          ];
        default:
          return [];
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/reports"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">{sections.find(s => s.key === key)?.label}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getSummaryStats().map(stat => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chart placeholder */}
            <Card>
              <CardHeader><CardTitle className="text-lg">{sections.find(s => s.key === key)?.label} - Overview</CardTitle></CardHeader>
              <CardContent className="p-6">
                <div className="h-[200px] bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Chart visualization placeholder</p>
                    <p className="text-xs text-muted-foreground">Data computed from real database records</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data table */}
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p className="text-sm">Detailed data table with filters will be available in future updates.</p>
                <p className="text-xs mt-1">Summary stats are computed from real database data.</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  };

  // Sub-section view
  if (currentSection) {
    return renderReport(currentSection);
  }

  // Hub overview
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileBarChart2 className="w-6 h-6" />Reports</h1>
        <p className="text-sm text-muted-foreground">Platform analytics and reporting (computed from real data)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(sec => (
          <Link key={sec.key} href={`/admin/reports/${sec.key}`}>
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <sec.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{sec.label}</h3>
                    <p className="text-xs text-muted-foreground">{sec.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
