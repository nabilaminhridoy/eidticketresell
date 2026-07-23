'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  FileText, Search, Edit, ArrowLeft, Loader2
} from 'lucide-react';

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  lastUpdated: string;
  content: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const defaultPages: CmsPage[] = [
  { id: 'about-us', title: 'About Us', slug: 'about-us', status: 'published', lastUpdated: '', content: '' },
  { id: 'contact-us', title: 'Contact Us', slug: 'contact-us', status: 'published', lastUpdated: '', content: '' },
  { id: 'how-it-works', title: 'How It Works', slug: 'how-it-works', status: 'published', lastUpdated: '', content: '' },
  { id: 'privacy-policy', title: 'Privacy Policy', slug: 'privacy-policy', status: 'published', lastUpdated: '', content: '' },
  { id: 'terms-of-service', title: 'Terms of Service', slug: 'terms-of-service', status: 'published', lastUpdated: '', content: '' },
  { id: 'payment-policy', title: 'Payment Policy', slug: 'payment-policy', status: 'published', lastUpdated: '', content: '' },
  { id: 'safety-guidelines', title: 'Safety Guidelines', slug: 'safety-guidelines', status: 'published', lastUpdated: '', content: '' },
  { id: 'cookies-policy', title: 'Cookies Policy', slug: 'cookies-policy', status: 'published', lastUpdated: '', content: '' },
  { id: 'refund-policy', title: 'Refund Policy', slug: 'refund-policy', status: 'draft', lastUpdated: '', content: '' },
];

export default function AdminPagesPage({ pageSlug }: { pageSlug?: string }) {
  const [pages, setPages] = useState<CmsPage[]>(defaultPages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch settings that may contain page content
      const settingsRes = await fetch('/api/admin/settings?group=pages', { headers: getAuthHeaders() });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        const pageSettings = (settingsData.settings || []) as { id: string; key: string; value: string; group: string }[];

        // Update pages with settings data where available
        const updatedPages = defaultPages.map(page => {
          const settingKey = `page_${page.slug}`;
          const setting = pageSettings.find(s => s.key === settingKey);
          return {
            ...page,
            content: setting?.value || '',
            lastUpdated: setting ? new Date().toLocaleDateString() : 'Not configured',
            status: setting?.value ? 'published' as const : 'draft' as const,
          };
        });
        setPages(updatedPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page settings');
    } finally {
      setLoading(false);
    }
  };

  // View/edit specific page
  if (pageSlug) {
    const page = pages.find(p => p.slug === pageSlug) || pages[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Edit: {page.title}</h1>
          <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>{page.status}</Badge>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Page Title</label><Input defaultValue={page.title} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Slug</label><Input defaultValue={page.slug} className="bg-muted/30" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label>
              <Select defaultValue={page.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Content</label><Textarea defaultValue={page.content || `Content for ${page.title} page...`} rows={12} /></div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button>Save Changes</Button>
          <Button variant="outline">Preview</Button>
        </div>
      </div>
    );
  }

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" />CMS Pages</h1>
          <p className="text-sm text-muted-foreground">Manage static content pages</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search pages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <Button variant="outline" onClick={fetchPages}>Try Again</Button>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map(page => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/pages/${page.slug}`} className="hover:text-primary">{page.title}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{page.slug}</TableCell>
                    <TableCell><Badge variant={page.status === 'published' ? 'default' : 'secondary'}>{page.status}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{page.lastUpdated}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/admin/pages/${page.slug}`}><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button></Link>
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
