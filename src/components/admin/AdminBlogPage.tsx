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
  BookOpen, Plus, Search, Edit, Trash2, Eye, Calendar, Tag, FolderOpen,
  ArrowLeft, FileText, TrendingUp, MoreHorizontal, Pencil, Clock, User
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface BlogTag {
  id: string;
  name: string;
  count: number;
}

export default function AdminBlogPage({ action, itemId, section }: {
  action?: 'list' | 'view' | 'create' | 'edit';
  itemId?: string;
  section?: 'posts' | 'categories' | 'tags';
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', tags: '', status: 'draft' });

  const currentAction = action || 'list';
  const currentSection = section || 'posts';

  const mockPosts: BlogPost[] = [
    { id: '1', title: 'How to Buy Bus Tickets Online', slug: 'how-to-buy-bus-tickets', category: 'Guides', tags: ['bus', 'tickets', 'guide'], status: 'published', author: 'Admin', createdAt: '2024-01-15', updatedAt: '2024-01-20', views: 1520 },
    { id: '2', title: 'Top 10 Travel Destinations in Bangladesh', slug: 'top-10-destinations', category: 'Travel', tags: ['travel', 'destinations'], status: 'published', author: 'Editor', createdAt: '2024-01-10', updatedAt: '2024-01-12', views: 3200 },
    { id: '3', title: 'Train Ticket Booking Guide', slug: 'train-ticket-guide', category: 'Guides', tags: ['train', 'guide'], status: 'draft', author: 'Admin', createdAt: '2024-02-01', updatedAt: '2024-02-01', views: 0 },
    { id: '4', title: 'Launch Services in Barishal', slug: 'launch-services-barishal', category: 'Travel', tags: ['launch', 'barishal'], status: 'published', author: 'Editor', createdAt: '2024-01-25', updatedAt: '2024-01-28', views: 890 },
    { id: '5', title: 'Safety Tips for Travelers', slug: 'safety-tips-travelers', category: 'Safety', tags: ['safety', 'tips'], status: 'archived', author: 'Admin', createdAt: '2023-12-15', updatedAt: '2024-01-01', views: 450 },
  ];

  const mockCategories: BlogCategory[] = [
    { id: '1', name: 'Guides', slug: 'guides', count: 12 },
    { id: '2', name: 'Travel', slug: 'travel', count: 8 },
    { id: '3', name: 'Safety', slug: 'safety', count: 3 },
    { id: '4', name: 'News', slug: 'news', count: 5 },
    { id: '5', name: 'Updates', slug: 'updates', count: 2 },
  ];

  const mockTags: BlogTag[] = [
    { id: '1', name: 'bus', count: 8 },
    { id: '2', name: 'train', count: 6 },
    { id: '3', name: 'launch', count: 4 },
    { id: '4', name: 'flight', count: 3 },
    { id: '5', name: 'guide', count: 10 },
    { id: '6', name: 'safety', count: 3 },
    { id: '7', name: 'destinations', count: 5 },
    { id: '8', name: 'tips', count: 7 },
  ];

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // View single post
  if (currentAction === 'view' && itemId) {
    const post = mockPosts.find(p => p.id === itemId) || mockPosts[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button>
          </Link>
          <h1 className="text-xl font-bold">{post.title}</h1>
          <Badge variant={post.status === 'published' ? 'default' : post.status === 'draft' ? 'secondary' : 'outline'}>
            {post.status}
          </Badge>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-muted-foreground">Author:</span> <span className="font-medium">{post.author}</span></div>
              <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{post.category}</span></div>
              <div><span className="text-muted-foreground">Views:</span> <span className="font-medium">{post.views}</span></div>
              <div><span className="text-muted-foreground">Created:</span> <span className="font-medium">{post.createdAt}</span></div>
            </div>
            <div className="flex gap-2">
              {post.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
            </div>
            <div className="prose max-w-none">
              <p className="text-muted-foreground">Blog content would be displayed here. This is a placeholder view.</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Link href={`/admin/blog/${itemId}/edit`}>
            <Button size="sm"><Pencil className="w-4 h-4" />Edit Post</Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}><Trash2 className="w-4 h-4" />Delete</Button>
        </div>
      </div>
    );
  }

  // Create/Edit post
  if (currentAction === 'create' || currentAction === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button>
          </Link>
          <h1 className="text-xl font-bold">{currentAction === 'create' ? 'Create New Post' : 'Edit Post'}</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Enter blog post title" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input placeholder="auto-generated-slug" className="bg-muted/30" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={newPost.category} onValueChange={v => setNewPost({...newPost, category: v})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {mockCategories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input placeholder="Enter tags separated by commas" value={newPost.tags} onChange={e => setNewPost({...newPost, tags: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea placeholder="Write your blog post content..." rows={10} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newPost.status} onValueChange={v => setNewPost({...newPost, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button>{currentAction === 'create' ? 'Publish' : 'Update'}</Button>
          <Link href="/admin/blog"><Button variant="outline">Cancel</Button></Link>
        </div>
      </div>
    );
  }

  // Main list view with tabs
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" />Blog Management</h1>
          <p className="text-sm text-muted-foreground">Manage blog posts, categories, and tags</p>
        </div>
        <Link href="/admin/blog/create">
          <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />New Post</Button>
        </Link>
      </div>

      <Tabs defaultValue={currentSection}>
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search posts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posts table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="hidden md:table-cell">Views</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/blog/${post.id}`} className="hover:text-primary">{post.title}</Link>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{post.category}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={post.status === 'published' ? 'default' : post.status === 'draft' ? 'secondary' : 'outline'}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{post.author}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="flex items-center gap-1 text-sm"><Eye className="w-3 h-3" />{post.views}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{post.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link href={`/admin/blog/${post.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setSelectedPost(post); setShowDeleteDialog(true); }}>
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Blog Categories</CardTitle>
              <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4" />Add Category</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
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

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Blog Tags</CardTitle>
              <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add Tag</Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {mockTags.map(tag => (
                  <div key={tag.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium text-sm">{tag.name}</span>
                    <Badge variant="secondary" className="text-xs">{tag.count}</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="w-3 h-3 text-red-600" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete "{selectedPost?.title}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create category dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Category name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input placeholder="category-slug" />
            </div>
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
