'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileBarChart2, DollarSign, Users, Ticket, CreditCard, RefreshCw,
  Wallet, ArrowLeft, BarChart3, TrendingUp, ShoppingBag, Calendar
} from 'lucide-react';

interface ReportData {
  date: string;
  metric: string;
  value: string;
  change: string;
}

export default function AdminReportsPage({ section }: { section?: string }) {
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

  const renderReport = (key: string) => {
    const mockData: ReportData[] = [
      { date: 'Jan 2024', metric: 'Total', value: '৳125,000', change: '+12%' },
      { date: 'Dec 2023', metric: 'Total', value: '৳110,000', change: '+8%' },
      { date: 'Nov 2023', metric: 'Total', value: '৳102,000', change: '+15%' },
      { date: 'Oct 2023', metric: 'Total', value: '৳89,000', change: '+5%' },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/reports"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">{sections.find(s => s.key === key)?.label}</h1>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'This Month', value: '৳125,000', change: '+12%' },
            { label: 'Last Month', value: '৳110,000', change: '+8%' },
            { label: 'This Year', value: '৳1,500,000', change: '+25%' },
            { label: key === 'sales' ? 'Avg. Order' : 'Avg. Transaction', value: '৳850', change: '+3%' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
                <Badge variant="secondary" className="text-xs">{stat.change}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart placeholder */}
        <Card>
          <CardHeader><CardTitle className="text-lg">{sections.find(s => s.key === key)?.label} - Monthly Trend</CardTitle></CardHeader>
          <CardContent className="p-6">
            <div className="h-[200px] bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chart visualization placeholder</p>
                <p className="text-xs text-muted-foreground">Data will be rendered with chart library</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Metric</TableHead><TableHead>Value</TableHead><TableHead>Change</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockData.map(row => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    <TableCell>{row.metric}</TableCell>
                    <TableCell>{row.value}</TableCell>
                    <TableCell><Badge variant="secondary">{row.change}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
        <p className="text-sm text-muted-foreground">Platform analytics and reporting</p>
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
