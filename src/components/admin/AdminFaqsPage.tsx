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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HelpCircle, Plus, Search, Edit, Trash2, ArrowLeft,
  Loader2
} from 'lucide-react';

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
  count: number;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminFaqsPage({ action, itemId, section }: {
  action?: 'list' | 'view' | 'create' | 'edit';
  itemId?: string;
  section?: 'faqs' | 'categories';
}) {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);

  const currentAction = action || 'list';
  const currentSection = section || 'faqs';

  useEffect(() => {
    fetch('/api/admin/faqs', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.categories) setCategories(d.categories); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Edit/Create view remains admin-editable (FAQ items don't have a Prisma model)
  if (currentAction === 'edit' && itemId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/faqs"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Edit FAQ</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Question</label><Input placeholder="Enter the question" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Answer</label><Textarea placeholder="Enter the answer" rows={4} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Display Order</label><Input type="number" defaultValue={10} /></div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue="active"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2"><Button>Update FAQ</Button><Link href="/admin/faqs"><Button variant="outline">Cancel</Button></Link></div>
      </div>
    );
  }

  if (currentAction === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/faqs"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Create FAQ</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Question</label><Input placeholder="Enter the question" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Answer</label><Textarea placeholder="Enter the answer" rows={4} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">Display Order</label><Input type="number" defaultValue={10} /></div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue="active"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2"><Button>Create FAQ</Button><Link href="/admin/faqs"><Button variant="outline">Cancel</Button></Link></div>
      </div>
    );
  }

  // List view - categories are fetched from database
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="w-6 h-6" />FAQ Management</h1>
          <p className="text-sm text-muted-foreground">Manage FAQs and their categories</p>
        </div>
        <Link href="/admin/faqs/create"><Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add FAQ</Button></Link>
      </div>

      <Tabs defaultValue={currentSection}>
        <TabsList>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search FAQs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>FAQ items management - categories are loaded from database.</p>
                  <p className="text-xs mt-1">Create individual FAQ items and assign to categories.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No FAQ categories found. Create one to start organizing FAQs.</p>
            </div>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">FAQ Categories</CardTitle>
                <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4" />Add Category</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Order</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {categories.map(cat => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                        <TableCell><Badge variant="secondary">{cat.order}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
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
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete FAQ</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this FAQ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add FAQ Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input placeholder="Category name" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Slug</label><Input placeholder="category-slug" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowCreateDialog(false)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
