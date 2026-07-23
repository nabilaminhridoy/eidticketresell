'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText, Plus, Search, Edit, Trash2, Eye, ArrowLeft, Globe, Settings
} from 'lucide-react';

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  lastUpdated: string;
  sections: number;
}

export default function AdminPagesPage({ pageSlug }: { pageSlug?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const mockPages: CmsPage[] = [
    { id: '1', title: 'About Us', slug: 'about-us', status: 'published', lastUpdated: '2024-01-15', sections: 4 },
    { id: '2', title: 'Contact Us', slug: 'contact-us', status: 'published', lastUpdated: '2024-01-10', sections: 3 },
    { id: '3', title: 'How It Works', slug: 'how-it-works', status: 'published', lastUpdated: '2024-01-20', sections: 5 },
    { id: '4', title: 'Privacy Policy', slug: 'privacy-policy', status: 'published', lastUpdated: '2024-01-05', sections: 8 },
    { id: '5', title: 'Terms of Service', slug: 'terms-of-service', status: 'published', lastUpdated: '2024-01-01', sections: 10 },
    { id: '6', title: 'Payment Policy', slug: 'payment-policy', status: 'published', lastUpdated: '2024-01-08', sections: 6 },
    { id: '7', title: 'Safety Guidelines', slug: 'safety-guidelines', status: 'published', lastUpdated: '2024-01-12', sections: 4 },
    { id: '8', title: 'Cookies Policy', slug: 'cookies-policy', status: 'published', lastUpdated: '2024-01-03', sections: 5 },
    { id: '9', title: 'Refund Policy', slug: 'refund-policy', status: 'draft', lastUpdated: '2024-02-01', sections: 3 },
  ];

  // View/edit specific page
  if (pageSlug) {
    const page = mockPages.find(p => p.slug === pageSlug) || mockPages[0];
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
            <div className="space-y-2"><label className="text-sm font-medium">Content</label><Textarea defaultValue={`Content for ${page.title} page...`} rows={12} /></div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button>Save Changes</Button>
          <Button variant="outline">Preview</Button>
        </div>
      </div>
    );
  }

  const filteredPages = mockPages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Sections</TableHead>
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
                  <TableCell className="hidden md:table-cell">{page.sections}</TableCell>
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
    </div>
  );
}
