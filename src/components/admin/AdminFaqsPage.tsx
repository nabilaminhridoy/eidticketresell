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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  HelpCircle, Plus, Search, Edit, Trash2, ArrowLeft, Pencil,
  FolderOpen, ChevronUp, ChevronDown, Eye
} from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: 'active' | 'inactive';
  order: number;
  createdAt: string;
}

interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export default function AdminFaqsPage({ action, itemId, section }: {
  action?: 'list' | 'view' | 'create' | 'edit';
  itemId?: string;
  section?: 'faqs' | 'categories';
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);

  const currentAction = action || 'list';
  const currentSection = section || 'faqs';

  const mockFaqs: Faq[] = [
    { id: '1', question: 'How do I buy tickets?', answer: 'Search for your route, select a ticket, and complete the checkout process.', category: 'Buying', status: 'active', order: 1, createdAt: '2024-01-10' },
    { id: '2', question: 'What payment methods are available?', answer: 'We support bKash, SSLCommerz (Visa/Mastercard), and cash on delivery.', category: 'Payments', status: 'active', order: 2, createdAt: '2024-01-12' },
    { id: '3', question: 'How to sell tickets?', answer: 'Register, verify KYC, and list your tickets for sale.', category: 'Selling', status: 'active', order: 3, createdAt: '2024-01-15' },
    { id: '4', question: 'What is the platform fee?', answer: 'Online Copy: 2% deducted from seller price. Counter Copy: 3% buyer pays to platform.', category: 'Payments', status: 'active', order: 4, createdAt: '2024-01-18' },
    { id: '5', question: 'How do refunds work?', answer: 'Refunds are processed within 3-5 business days depending on payment method.', category: 'Refunds', status: 'active', order: 5, createdAt: '2024-01-20' },
    { id: '6', question: 'Is my data safe?', answer: 'We use industry-standard encryption and never share your personal data.', category: 'Safety', status: 'inactive', order: 6, createdAt: '2024-01-22' },
  ];

  const mockCategories: FaqCategory[] = [
    { id: '1', name: 'Buying', slug: 'buying', count: 2 },
    { id: '2', name: 'Selling', slug: 'selling', count: 1 },
    { id: '3', name: 'Payments', slug: 'payments', count: 2 },
    { id: '4', name: 'Refunds', slug: 'refunds', count: 1 },
    { id: '5', name: 'Safety', slug: 'safety', count: 1 },
  ];

  // Edit view
  if (currentAction === 'edit' && itemId) {
    const faq = mockFaqs.find(f => f.id === itemId) || mockFaqs[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/faqs"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Edit FAQ</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <Input defaultValue={faq.question} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer</label>
              <Textarea defaultValue={faq.answer} rows={4} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select defaultValue={faq.category.toLowerCase()}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockCategories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input type="number" defaultValue={faq.order} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue={faq.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button>Update FAQ</Button>
          <Link href="/admin/faqs"><Button variant="outline">Cancel</Button></Link>
        </div>
      </div>
    );
  }

  // Create view
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
                  {mockCategories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
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
        <div className="flex gap-2">
          <Button>Create FAQ</Button>
          <Link href="/admin/faqs"><Button variant="outline">Cancel</Button></Link>
        </div>
      </div>
    );
  }

  // List view
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
                {mockCategories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFaqs.map(faq => (
                    <TableRow key={faq.id}>
                      <TableCell className="text-muted-foreground">{faq.order}</TableCell>
                      <TableCell className="font-medium max-w-[300px] truncate">{faq.question}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{faq.category}</Badge></TableCell>
                      <TableCell><Badge variant={faq.status === 'active' ? 'default' : 'secondary'}>{faq.status}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{faq.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link href={`/admin/faqs/${faq.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button></Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setSelectedFaq(faq); setShowDeleteDialog(true); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">FAQ Categories</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4" />Add Category</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>FAQs</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {mockCategories.map(cat => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell><Badge variant="secondary">{cat.count}</Badge></TableCell>
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
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete FAQ</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete "{selectedFaq?.question}"?</p>
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
