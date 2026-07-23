'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  PenTool, Mail, Smartphone, Bell, Gift, UsersRound, Tag, Megaphone,
  Newspaper, Plus, Search, Edit, Trash2, Send, ArrowLeft, Loader2
} from 'lucide-react';

interface PromoRecord {
  id: string;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  status: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminMarketingPage({ section }: { section?: string }) {
  const [promos, setPromos] = useState<PromoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const currentSection = section || null;

  useEffect(() => {
    if (!currentSection || currentSection === 'promo-codes' || currentSection === 'coupons') {
      fetch('/api/admin/marketing', { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(d => { if (d.promos) setPromos(d.promos); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [currentSection]);

  // Sub-section views
  const renderSubSection = () => {
    if (currentSection === 'promo-codes' || currentSection === 'coupons') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Promo Codes / Coupons</h2>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Code</Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : promos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No promo codes found</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Usage</TableHead><TableHead className="hidden md:table-cell">Expires</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {promos.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.code}</TableCell>
                        <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                        <TableCell>{p.type === 'percentage' ? `${p.value}%` : `৳${p.value}`}</TableCell>
                        <TableCell><Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{p.usedCount}/{p.usageLimit || '∞'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{new Date(p.validUntil).toLocaleDateString()}</TableCell>
                        <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }
    if (currentSection === 'email-campaigns') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Email Campaigns</h2>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Campaign</Button>
          </div>
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Email campaigns management coming soon.</p>
              <p className="text-xs mt-1">Create and manage email marketing campaigns.</p>
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
            <CardContent className="p-6 text-center text-muted-foreground">
              <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>SMS campaigns management coming soon.</p>
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
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Newsletter management coming soon.</p>
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
    { key: 'email-campaigns', label: 'Email Campaigns', icon: Mail, desc: 'Create and manage email campaigns' },
    { key: 'sms-campaigns', label: 'SMS Campaigns', icon: Smartphone, desc: 'Send bulk SMS notifications' },
    { key: 'push-notifications', label: 'Push Notifications', icon: Bell, desc: 'Browser and mobile push alerts' },
    { key: 'promo-codes', label: 'Promo Codes', icon: Gift, desc: 'Create and manage promotional codes', count: promos.filter(p => p.status === 'active').length },
    { key: 'referrals', label: 'Referral Program', icon: UsersRound, desc: 'Configure referral rewards' },
    { key: 'coupons', label: 'Coupons', icon: Tag, desc: 'Discount coupon management', count: promos.length },
    { key: 'announcements', label: 'Announcements', icon: Megaphone, desc: 'Site-wide announcements' },
    { key: 'newsletters', label: 'Newsletters', icon: Newspaper, desc: 'Newsletter subscriber management' },
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
