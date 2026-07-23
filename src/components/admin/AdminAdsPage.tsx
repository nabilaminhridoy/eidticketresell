'use client';

import { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';

interface AdRecord {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  link: string | null;
  placement: string;
  type: string;
  isActive: boolean;
  status: string;
  startDate: string | null;
  endDate: string | null;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminAdsPage({ action, itemId }: { action?: 'list' | 'view' | 'create'; itemId?: string }) {
  const [ads, setAds] = useState<AdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const currentAction = action || 'list';

  useEffect(() => {
    fetch('/api/admin/ads', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.ads) setAds(d.ads); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
                <SelectItem value="homepage">Homepage</SelectItem><SelectItem value="sidebar">Sidebar</SelectItem><SelectItem value="header">Header</SelectItem><SelectItem value="footer">Footer</SelectItem><SelectItem value="buy-tickets">Buy Tickets</SelectItem><SelectItem value="dashboard">Dashboard</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Type</label>
              <Select defaultValue="banner"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="banner">Banner</SelectItem><SelectItem value="popup">Popup</SelectItem><SelectItem value="text">Text</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><Textarea placeholder="Ad description" rows={3} /></div>
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
    const ad = ads.find(a => a.id === itemId);
    if (!ad) return <div className="text-center py-12 text-muted-foreground">Ad not found</div>;
    const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0';
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/ads"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">{ad.title}</h1>
          <Badge variant={ad.isActive ? 'default' : 'secondary'}>{ad.status}</Badge>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-sm text-muted-foreground">Placement</p><p className="font-medium">{ad.placement}</p></div>
              <div><p className="text-sm text-muted-foreground">Type</p><Badge variant="outline">{ad.type}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Impressions</p><p className="font-medium">{ad.impressions.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Clicks</p><p className="font-medium">{ad.clicks.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">CTR</p><p className="font-medium">{ctr}%</p></div>
              <div><p className="text-sm text-muted-foreground">Start Date</p><p className="font-medium">{ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'N/A'}</p></div>
              <div><p className="text-sm text-muted-foreground">End Date</p><p className="font-medium">{ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'N/A'}</p></div>
            </div>
            {ad.description && <p className="text-sm">{ad.description}</p>}
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
  const filteredAds = ads.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

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

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No ads found</p>
        </div>
      ) : (
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
                    <TableCell><Badge variant={ad.isActive ? 'default' : 'secondary'}>{ad.status}</Badge></TableCell>
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
      )}
    </div>
  );
}
