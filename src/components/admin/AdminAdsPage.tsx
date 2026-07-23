'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Megaphone, Plus, Search, Edit, Trash2, ArrowLeft, Eye, Target,
  LayoutDashboard, ToggleLeft, Calendar, BarChart3, Image
} from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  placement: string;
  type: 'banner' | 'popup' | 'inline' | 'notification';
  status: 'active' | 'paused' | 'expired';
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
}

export default function AdminAdsPage({ action, itemId }: { action?: 'list' | 'view' | 'create'; itemId?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const mockAds: Ad[] = [
    { id: '1', title: 'Summer Sale Banner', placement: 'Homepage Hero', type: 'banner', status: 'active', impressions: 15200, clicks: 340, startDate: '2024-01-15', endDate: '2024-03-15' },
    { id: '2', title: 'New User Discount Popup', placement: 'Login Page', type: 'popup', status: 'paused', impressions: 8000, clicks: 120, startDate: '2024-01-01', endDate: '2024-02-01' },
    { id: '3', title: 'Bus Ticket Promo Inline', placement: 'Search Results', type: 'inline', status: 'active', impressions: 22000, clicks: 670, startDate: '2024-01-20', endDate: '2024-04-20' },
    { id: '4', title: 'Flight Deals Notification', placement: 'Dashboard', type: 'notification', status: 'expired', impressions: 5000, clicks: 90, startDate: '2023-12-01', endDate: '2024-01-01' },
    { id: '5', title: 'Launch Service Banner', placement: 'Category Page', type: 'banner', status: 'active', impressions: 9800, clicks: 210, startDate: '2024-02-01', endDate: '2024-05-01' },
  ];

  const currentAction = action || 'list';

  // Create ad
  if (currentAction === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/ads"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Create New Ad</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Title</label><Input placeholder="Ad title" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Placement</label>
              <Select><SelectTrigger><SelectValue placeholder="Select placement" /></SelectTrigger><SelectContent>
                <SelectItem value="homepage-hero">Homepage Hero</SelectItem><SelectItem value="search-results">Search Results</SelectItem><SelectItem value="category-page">Category Page</SelectItem><SelectItem value="login-page">Login Page</SelectItem><SelectItem value="dashboard">Dashboard</SelectItem><SelectItem value="blog-sidebar">Blog Sidebar</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Type</label>
              <Select defaultValue="banner"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="banner">Banner</SelectItem><SelectItem value="popup">Popup</SelectItem><SelectItem value="inline">Inline</SelectItem><SelectItem value="notification">Notification</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Content / HTML</label><Textarea placeholder="Ad content or HTML code" rows={5} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Link URL</label><Input placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Start Date</label><Input type="date" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">End Date</label><Input type="date" /></div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button>Create Ad</Button>
          <Link href="/admin/ads"><Button variant="outline">Cancel</Button></Link>
        </div>
      </div>
    );
  }

  // View ad detail
  if (currentAction === 'view' && itemId) {
    const ad = mockAds.find(a => a.id === itemId) || mockAds[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/ads"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">{ad.title}</h1>
          <Badge variant={ad.status === 'active' ? 'default' : ad.status === 'paused' ? 'secondary' : 'outline'}>{ad.status}</Badge>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-sm text-muted-foreground">Placement</p><p className="font-medium">{ad.placement}</p></div>
              <div><p className="text-sm text-muted-foreground">Type</p><Badge variant="outline">{ad.type}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Impressions</p><p className="font-medium">{ad.impressions.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Clicks</p><p className="font-medium">{ad.clicks.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">CTR</p><p className="font-medium">{((ad.clicks / ad.impressions) * 100).toFixed(2)}%</p></div>
              <div><p className="text-sm text-muted-foreground">Start Date</p><p className="font-medium">{ad.startDate}</p></div>
              <div><p className="text-sm text-muted-foreground">End Date</p><p className="font-medium">{ad.endDate}</p></div>
              <div><p className="text-sm text-muted-foreground">Duration</p><p className="font-medium">Active</p></div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button size="sm">Edit Ad</Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>Delete</Button>
        </div>
      </div>
    );
  }

  // List view
  const filteredAds = mockAds.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6" />Internal Ads</h1>
          <p className="text-sm text-muted-foreground">Manage internal advertisements and placements</p>
        </div>
        <Link href="/admin/ads/create"><Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Create Ad</Button></Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search ads..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Impressions</TableHead>
                <TableHead className="hidden md:table-cell">Clicks</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAds.map(ad => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/ads/${ad.id}`} className="hover:text-primary">{ad.title}</Link>
                  </TableCell>
                  <TableCell className="text-sm">{ad.placement}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{ad.type}</Badge></TableCell>
                  <TableCell><Badge variant={ad.status === 'active' ? 'default' : ad.status === 'paused' ? 'secondary' : 'outline'}>{ad.status}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">{ad.impressions.toLocaleString()}</TableCell>
                  <TableCell className="hidden md:table-cell">{ad.clicks.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link href={`/admin/ads/${ad.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button></Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
