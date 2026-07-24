'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  HelpCircle, Plus, Search, Edit, Trash2, ArrowLeft, Loader2, ChevronUp, ChevronDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FaqCategoryWithItems {
  id: string;
  name: string;
  slug: string;
  order: number;
  items: FaqItemData[];
}

interface FaqItemData {
  id: string;
  categoryId: string;
  question: string;
  questionBn: string;
  answer: string;
  answerBn: string;
  order: number;
  isActive: boolean;
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
  const [categories, setCategories] = useState<FaqCategoryWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Edit/Create FAQ form state
  const [editQuestion, setEditQuestion] = useState('');
  const [editQuestionBn, setEditQuestionBn] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editAnswerBn, setEditAnswerBn] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

  // Category create dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');

  const currentAction = action || 'list';
  const currentSection = section || 'faqs';

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/faqs', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        // API now returns categories with items included
        setCategories(data.categories || []);
      } else {
        toast({ title: 'Error', description: 'Failed to load FAQs', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Populate edit form when editing existing FAQ
  useEffect(() => {
    if (currentAction === 'edit' && itemId) {
      for (const cat of categories) {
        const item = cat.items.find(i => i.id === itemId);
        if (item) {
          setEditQuestion(item.question);
          setEditQuestionBn(item.questionBn || '');
          setEditAnswer(item.answer);
          setEditAnswerBn(item.answerBn || '');
          setEditCategoryId(item.categoryId);
          setEditOrder(item.order);
          setEditIsActive(item.isActive);
          break;
        }
      }
    }
    if (currentAction === 'create') {
      setEditQuestion('');
      setEditQuestionBn('');
      setEditAnswer('');
      setEditAnswerBn('');
      setEditCategoryId('');
      setEditOrder(0);
      setEditIsActive(true);
    }
  }, [currentAction, itemId, categories]);

  const createFaq = async () => {
    if (!editCategoryId || !editQuestion || !editAnswer) {
      toast({ title: 'Error', description: 'Category, question, and answer are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: editCategoryId,
          question: editQuestion,
          questionBn: editQuestionBn,
          answer: editAnswer,
          answerBn: editAnswerBn,
          order: editOrder,
          isActive: editIsActive,
        }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'FAQ created successfully' });
        await fetchFaqs();
        window.location.href = '/admin/faqs';
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to create FAQ', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateFaq = async () => {
    if (!itemId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          question: editQuestion,
          questionBn: editQuestionBn,
          answer: editAnswer,
          answerBn: editAnswerBn,
          order: editOrder,
          isActive: editIsActive,
        }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'FAQ updated successfully' });
        await fetchFaqs();
        window.location.href = '/admin/faqs';
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to update FAQ', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (faqId: string) => {
    try {
      const res = await fetch(`/api/admin/faqs?id=${faqId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'FAQ deleted' });
        setCategories(prev => prev.map(cat => ({
          ...cat,
          items: cat.items.filter(i => i.id !== faqId),
        })));
        setShowDeleteDialog(false);
        setDeleteTargetId(null);
      } else {
        toast({ title: 'Error', description: 'Failed to delete FAQ', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
  };

  const reorderFaq = async (faqId: string, direction: 'up' | 'down') => {
    // Find current item and its neighbor
    for (const cat of categories) {
      const sortedItems = [...cat.items].sort((a, b) => a.order - b.order);
      const currentIndex = sortedItems.findIndex(i => i.id === faqId);
      if (currentIndex === -1) continue;

      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= sortedItems.length) continue;

      const currentItem = sortedItems[currentIndex];
      const swapItem = sortedItems[swapIndex];

      // Swap order values via API
      try {
        await fetch('/api/admin/faqs', {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentItem.id, order: swapItem.order }),
        });
        await fetch('/api/admin/faqs', {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: swapItem.id, order: currentItem.order }),
        });
        toast({ title: 'Success', description: 'FAQ reordered' });
        await fetchFaqs();
      } catch {
        toast({ title: 'Error', description: 'Failed to reorder FAQ', variant: 'destructive' });
      }
      break;
    }
  };

  // Edit/Create FAQ view
  if (currentAction === 'edit' && itemId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/faqs"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Edit FAQ</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question (English)</label>
                <Input value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Question (Bengali)</label>
                <Input value={editQuestionBn} onChange={(e) => setEditQuestionBn(e.target.value)} placeholder="বাংলা প্রশ্ন" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer (English)</label>
                <Textarea value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer (Bengali)</label>
                <Textarea value={editAnswerBn} onChange={(e) => setEditAnswerBn(e.target.value)} rows={4} placeholder="বাংলা উত্তর" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input type="number" value={editOrder} onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Active</label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                  <span className="text-sm">{editIsActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button onClick={updateFaq} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Update FAQ
          </Button>
          <Link href="/admin/faqs"><Button variant="outline">Cancel</Button></Link>
        </div>
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
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question (English)</label>
                <Input value={editQuestion} onChange={(e) => setEditQuestion(e.target.value)} placeholder="Enter the question" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Question (Bengali)</label>
                <Input value={editQuestionBn} onChange={(e) => setEditQuestionBn(e.target.value)} placeholder="বাংলা প্রশ্ন" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer (English)</label>
                <Textarea value={editAnswer} onChange={(e) => setEditAnswer(e.target.value)} rows={4} placeholder="Enter the answer" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer (Bengali)</label>
                <Textarea value={editAnswerBn} onChange={(e) => setEditAnswerBn(e.target.value)} rows={4} placeholder="বাংলা উত্তর" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Order</label>
                <Input type="number" value={editOrder} onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Active</label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                  <span className="text-sm">{editIsActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button onClick={createFaq} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create FAQ
          </Button>
          <Link href="/admin/faqs"><Button variant="outline">Cancel</Button></Link>
        </div>
      </div>
    );
  }

  // List view - show FAQs grouped by category
  const allFaqItems = categories.flatMap(cat => cat.items.map(item => ({ ...item, categoryName: cat.name })));
  const filteredItems = allFaqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="w-6 h-6" />FAQ Management</h1>
          <p className="text-sm text-muted-foreground">Manage FAQs and their categories</p>
        </div>
        <Link href="/admin/faqs/create"><Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add FAQ</Button></Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search FAQs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* FAQ Items grouped by category */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No FAQ items found. Create one to get started.</p>
        </Card>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {categories
            .filter(cat => categoryFilter === 'all' || cat.id === categoryFilter)
            .map(cat => {
              const catItems = cat.items
                .sort((a, b) => a.order - b.order)
                .filter(item =>
                  item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.answer.toLowerCase().includes(searchQuery.toLowerCase())
                );
              if (catItems.length === 0) return null;

              return (
                <Card key={cat.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="secondary">{cat.name}</Badge>
                      <span className="text-sm text-muted-foreground">{catItems.length} items</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">Order</TableHead>
                          <TableHead>Question</TableHead>
                          <TableHead className="hidden md:table-cell">Answer</TableHead>
                          <TableHead className="w-[60px]">Active</TableHead>
                          <TableHead className="w-[140px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {catItems.map(item => (
                          <TableRow key={item.id}>
                            <TableCell><Badge variant="outline">{item.order}</Badge></TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">{item.question}</TableCell>
                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[300px] truncate">{item.answer}</TableCell>
                            <TableCell>
                              <Badge variant={item.isActive ? 'default' : 'secondary'}>
                                {item.isActive ? '✓' : '✗'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => reorderFaq(item.id, 'up')}>
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => reorderFaq(item.id, 'down')}>
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                                <Link href={`/admin/faqs/edit/${item.id}`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="w-3 h-3" /></Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => {
                                  setDeleteTargetId(item.id);
                                  setShowDeleteDialog(true);
                                }}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Categories Section */}
      {currentSection === 'categories' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">FAQ Categories</CardTitle>
            <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4" />Add Category</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Items</TableHead><TableHead>Order</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {categories.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell><Badge variant="secondary">{cat.items.length}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{cat.order}</Badge></TableCell>
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

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete FAQ</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this FAQ? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTargetId && deleteFaq(deleteTargetId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create category dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add FAQ Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Slug</label><Input value={newCategorySlug} onChange={(e) => setNewCategorySlug(e.target.value)} placeholder="category-slug" /></div>
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
