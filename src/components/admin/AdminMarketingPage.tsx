'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PenTool, Mail, Smartphone, Bell, Gift, UsersRound, Tag, Megaphone,
  Newspaper, Plus, Search, Edit, Trash2, Send, Eye, BarChart3, Calendar,
  ArrowLeft
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'completed' | 'draft' | 'scheduled';
  sent: number;
  opened: number;
  date: string;
}

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageCount: number;
  maxUsage: number;
  status: 'active' | 'expired';
  expiresAt: string;
}

export default function AdminMarketingPage({ section }: { section?: string }) {
  const currentSection = section || null;

  const mockCampaigns: Campaign[] = [
    { id: '1', name: 'Welcome Email Series', type: 'email', status: 'active', sent: 1200, opened: 840, date: '2024-01-15' },
    { id: '2', name: 'New Year SMS Blast', type: 'sms', status: 'completed', sent: 5000, opened: 0, date: '2024-01-01' },
    { id: '3', name: 'Push: Flash Sale Alert', type: 'push', status: 'scheduled', sent: 0, opened: 0, date: '2024-02-15' },
  ];

  const mockPromos: PromoCode[] = [
    { id: '1', code: 'WELCOME10', type: 'percentage', value: 10, usageCount: 150, maxUsage: 500, status: 'active', expiresAt: '2024-03-01' },
    { id: '2', code: 'BUS50BDT', type: 'fixed', value: 50, usageCount: 80, maxUsage: 200, status: 'active', expiresAt: '2024-02-28' },
    { id: '3', code: 'NEWYEAR20', type: 'percentage', value: 20, usageCount: 300, maxUsage: 300, status: 'expired', expiresAt: '2024-01-15' },
  ];

  // Sub-section views
  const renderSubSection = () => {
    if (currentSection === 'email-campaigns') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Email Campaigns</h2>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Campaign</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Sent</TableHead><TableHead className="hidden md:table-cell">Opened</TableHead><TableHead className="hidden md:table-cell">Open Rate</TableHead><TableHead className="hidden md:table-cell">Date</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {mockCampaigns.filter(c => c.type === 'email').map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell><Badge variant={c.status === 'active' ? 'default' : c.status === 'completed' ? 'secondary' : 'outline'}>{c.status}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell">{c.sent}</TableCell>
                      <TableCell className="hidden md:table-cell">{c.opened}</TableCell>
                      <TableCell className="hidden md:table-cell">{((c.opened / c.sent) * 100).toFixed(1)}%</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.date}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (currentSection === 'sms-campaigns') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">SMS Campaigns</h2>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Campaign</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Sent</TableHead><TableHead className="hidden md:table-cell">Date</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {mockCampaigns.filter(c => c.type === 'sms').map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell><Badge variant={c.status === 'active' ? 'default' : c.status === 'completed' ? 'secondary' : 'outline'}>{c.status}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell">{c.sent}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.date}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (currentSection === 'push-notifications') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Push Notifications</h2>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Send Notification</Button>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input placeholder="Notification title" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Message</label><Input placeholder="Notification message" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Target</label>
                <select className="w-full p-2 border rounded-lg text-sm"><option>All Users</option><option>Sellers Only</option><option>Buyers Only</option><option>New Users</option></select>
              </div>
              <Button className="gap-1"><Send className="w-4 h-4" />Send</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (currentSection === 'promo-codes') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Promo Codes</h2>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Code</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Usage</TableHead><TableHead className="hidden md:table-cell">Expires</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {mockPromos.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.code}</TableCell>
                      <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                      <TableCell>{p.type === 'percentage' ? `${p.value}%` : `৳${p.value}`}</TableCell>
                      <TableCell><Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell">{p.usageCount}/{p.maxUsage}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{p.expiresAt}</TableCell>
                      <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (currentSection === 'referrals') {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Referral Program</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Referral Reward (Referrer)</label><Input defaultValue="50" placeholder="BDT amount" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Referral Reward (Referee)</label><Input defaultValue="25" placeholder="BDT amount" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Minimum Order for Reward</label><Input defaultValue="100" placeholder="BDT amount" /></div>
              <Button>Update Settings</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (currentSection === 'coupons') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Coupons</h2>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Coupon</Button>
          </div>
          <Card>
            <CardContent className="p-6"><p className="text-muted-foreground text-sm">Coupon management interface. Create discount coupons for special promotions.</p></CardContent>
          </Card>
        </div>
      );
    }
    if (currentSection === 'announcements') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Announcements</h2>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Announcement</Button>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input placeholder="Announcement title" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Message</label><Input placeholder="Announcement message" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Type</label>
                <select className="w-full p-2 border rounded-lg text-sm"><option>Info</option><option>Warning</option><option>Success</option></select>
              </div>
              <Button>Create</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (currentSection === 'newsletters') {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Newsletter Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Subscribers</p><p className="text-2xl font-bold">2,450</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Sent This Month</p><p className="text-2xl font-bold">3</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Open Rate</p><p className="text-2xl font-bold">68%</p></CardContent></Card>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Subject</label><Input placeholder="Newsletter subject" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Content</label><textarea className="w-full p-3 border rounded-lg text-sm" rows={5} placeholder="Newsletter content..." /></div>
              <Button className="gap-1"><Send className="w-4 h-4" />Send Newsletter</Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  };

  // If a sub-section is specified, render it
  if (currentSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Marketing: {currentSection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
        </div>
        {renderSubSection()}
      </div>
    );
  }

  // Hub overview
  const marketingFeatures = [
    { key: 'email-campaigns', label: 'Email Campaigns', icon: Mail, desc: 'Create and manage email campaigns', count: 3 },
    { key: 'sms-campaigns', label: 'SMS Campaigns', icon: Smartphone, desc: 'Send bulk SMS notifications', count: 1 },
    { key: 'push-notifications', label: 'Push Notifications', icon: Bell, desc: 'Browser and mobile push alerts', count: 0 },
    { key: 'promo-codes', label: 'Promo Codes', icon: Gift, desc: 'Create and manage promotional codes', count: 3 },
    { key: 'referrals', label: 'Referral Program', icon: UsersRound, desc: 'Configure referral rewards', count: 0 },
    { key: 'coupons', label: 'Coupons', icon: Tag, desc: 'Discount coupon management', count: 0 },
    { key: 'announcements', label: 'Announcements', icon: Megaphone, desc: 'Site-wide announcements', count: 0 },
    { key: 'newsletters', label: 'Newsletters', icon: Newspaper, desc: 'Newsletter subscriber management', count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><PenTool className="w-6 h-6" />Marketing Hub</h1>
        <p className="text-sm text-muted-foreground">Manage campaigns, promotions, and communications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketingFeatures.map(feature => (
          <Link key={feature.key} href={`/admin/marketing/${feature.key}`}>
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.label}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
                {feature.count > 0 && <Badge variant="secondary" className="text-xs">{feature.count} active</Badge>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
