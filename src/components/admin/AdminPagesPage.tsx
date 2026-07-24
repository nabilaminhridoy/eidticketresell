'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  FileText, Search, Edit, ArrowLeft, Loader2, Plus, Trash2, ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CmsPage {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminPagesPage({ pageSlug }: { pageSlug?: string }) {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Editor state for editing/creating a page
  const [editTitle, setEditTitle] = useState('');
  const [editTitleBn, setEditTitleBn] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editContentBn, setEditContentBn] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Create dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pages', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      } else {
        toast({ title: 'Error', description: 'Failed to load pages', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error while loading pages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // When viewing a specific page, populate edit fields
  useEffect(() => {
    if (pageSlug && pages.length > 0) {
      const page = pages.find(p => p.slug === pageSlug);
      if (page) {
        setEditTitle(page.title);
        setEditTitleBn(page.titleBn);
        setEditSlug(page.slug);
        setEditContent(page.content);
        setEditContentBn(page.contentBn);
        setEditIsActive(page.isActive);
      } else {
        // New page with this slug
        setEditTitle('');
        setEditTitleBn('');
        setEditSlug(pageSlug);
        setEditContent(JSON.stringify([{ title: 'Section Title', body: 'Section body text...' }], null, 2));
        setEditContentBn(JSON.stringify([{ title: 'বিভাগ শিরোনাম', body: 'বিভাগের বিষয়বস্তু...' }], null, 2));
        setEditIsActive(true);
      }
    }
  }, [pageSlug, pages]);

  const savePage = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editSlug,
          title: editTitle,
          titleBn: editTitleBn,
          content: editContent,
          contentBn: editContentBn,
          isActive: editIsActive,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: 'Success', description: `Page "${editTitle}" saved successfully` });
        // Update local state
        if (data.page) {
          setPages(prev => {
            const existing = prev.find(p => p.slug === editSlug);
            if (existing) {
              return prev.map(p => p.slug === editSlug ? { ...p, ...data.page } : p);
            }
            return [...prev, data.page];
          });
        }
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to save page', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error while saving', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string, slug: string) => {
    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: 'Success', description: `Page "${slug}" deleted` });
        setPages(prev => prev.filter(p => p.id !== id));
      } else {
        toast({ title: 'Error', description: 'Failed to delete page', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
  };

  const handleCreateNew = () => {
    setEditTitle('');
    setEditTitleBn('');
    setEditSlug('');
    setEditContent(JSON.stringify([{ title: 'Section Title', body: 'Section body text...' }], null, 2));
    setEditContentBn(JSON.stringify([{ title: 'বিভাগ শিরোনাম', body: 'বিভাগের বিষয়বস্তু...' }], null, 2));
    setEditIsActive(true);
    setShowCreateDialog(true);
  };

  const handleCreateFromDialog = async () => {
    if (!editSlug || !editTitle) {
      toast({ title: 'Error', description: 'Slug and title are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editSlug,
          title: editTitle,
          titleBn: editTitleBn,
          content: editContent,
          contentBn: editContentBn,
          isActive: editIsActive,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: 'Success', description: `Page "${editTitle}" created` });
        setShowCreateDialog(false);
        if (data.page) {
          setPages(prev => [...prev, data.page]);
        }
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to create page', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // View/edit specific page
  if (pageSlug) {
    const page = pages.find(p => p.slug === pageSlug);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Edit: {editTitle || pageSlug}</h1>
          <Badge variant={editIsActive ? 'default' : 'secondary'}>
            {editIsActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Page Editor</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Title (English)</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Page title" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Title (Bengali)</label>
                <Input value={editTitleBn} onChange={(e) => setEditTitleBn(e.target.value)} placeholder="বাংলা শিরোনাম" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="bg-muted/30" />
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">Content (JSON) - English</label>
              <p className="text-xs text-muted-foreground">Format: [{'{'}"title": "Section Title", "body": "Section body text..."{'}'}]</p>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={10} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content (JSON) - Bengali</label>
              <p className="text-xs text-muted-foreground">Format: [{'{'}"title": "বিভাগ শিরোনাম", "body": "বিভাগের বিষয়বস্তু..."{'}'}]</p>
              <Textarea value={editContentBn} onChange={(e) => setEditContentBn(e.target.value)} rows={10} />
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
              <label className="text-sm font-medium">Active (visible to public)</label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={savePage} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
          {page && (
            <Button variant="outline" className="gap-1" onClick={() => window.open(`/page/${editSlug}`, '_blank')}>
              <ExternalLink className="w-3.5 h-3.5" />Preview
            </Button>
          )}
        </div>
      </div>
    );
  }

  const filteredPages = pages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" />CMS Pages</h1>
          <p className="text-sm text-muted-foreground">Manage static content pages</p>
        </div>
        <Button size="sm" className="gap-1" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />Create New Page
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search pages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredPages.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No pages found. Create a new page to get started.</p>
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
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map(page => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/pages/${page.slug}`} className="hover:text-primary">{page.title}</Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{page.slug}</TableCell>
                    <TableCell><Badge variant={page.isActive ? 'default' : 'secondary'}>{page.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/admin/pages/${page.slug}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => deletePage(page.id, page.slug)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create New Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Create New Page</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Title (English)</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Page title" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Title (Bengali)</label>
                <Input value={editTitleBn} onChange={(e) => setEditTitleBn(e.target.value)} placeholder="বাংলা শিরোনাম" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="page-slug" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content (JSON)</label>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content (Bengali JSON)</label>
              <Textarea value={editContentBn} onChange={(e) => setEditContentBn(e.target.value)} rows={6} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
              <label className="text-sm">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFromDialog} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
