'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3, Users, TrendingUp, DollarSign, Ticket, ShoppingBag,
  Eye, ArrowUpRight, ArrowDownRight, Calendar, Download
} from 'lucide-react';

interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('7d');

  const metrics: AnalyticsMetric[] = [
    { label: 'Page Views', value: '12,450', change: '+15%', trend: 'up' },
    { label: 'Unique Visitors', value: '3,200', change: '+8%', trend: 'up' },
    { label: 'Ticket Listings', value: '450', change: '+12%', trend: 'up' },
    { label: 'Orders Placed', value: '180', change: '+23%', trend: 'up' },
    { label: 'Conversion Rate', value: '5.6%', change: '-0.3%', trend: 'down' },
    { label: 'Avg. Session Duration', value: '4m 30s', change: '+10%', trend: 'up' },
    { label: 'Bounce Rate', value: '35%', change: '-5%', trend: 'up' },
    { label: 'Revenue', value: '৳125,000', change: '+18%', trend: 'up' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6" />Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform traffic, user behavior, and performance insights</p>
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
          <Button variant="outline" size="sm" className="gap-1"><Download className="w-4 h-4" />Export</Button>
        </div>
      </div>

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

      {/* Charts placeholder */}
      <Tabs defaultValue="traffic">
        <TabsList>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <Card>
            <CardHeader><CardTitle className="text-lg">Traffic Overview</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">Traffic Chart Placeholder</p>
                  <p className="text-sm text-muted-foreground">Daily page views and unique visitors trend</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader><CardTitle className="text-lg">Ticket Analytics</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">Ticket Sales Chart Placeholder</p>
                  <p className="text-sm text-muted-foreground">Ticket listing and sales volume over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader><CardTitle className="text-lg">Revenue Analytics</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">Revenue Chart Placeholder</p>
                  <p className="text-sm text-muted-foreground">Platform revenue and fee earnings over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle className="text-lg">User Analytics</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">User Growth Chart Placeholder</p>
                  <p className="text-sm text-muted-foreground">User registrations and activity over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top pages */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Top Pages</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[
              { page: '/', views: '5,200', avgTime: '3m 15s' },
              { page: '/buy-tickets', views: '2,800', avgTime: '5m 30s' },
              { page: '/blog', views: '1,500', avgTime: '2m 45s' },
              { page: '/sell-tickets', views: '1,200', avgTime: '4m 00s' },
              { page: '/faqs', views: '800', avgTime: '1m 30s' },
            ].map(item => (
              <div key={item.page} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div><p className="font-medium text-sm">{item.page}</p><p className="text-xs text-muted-foreground">Avg. time: {item.avgTime}</p></div>
                <Badge variant="secondary">{item.views} views</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
