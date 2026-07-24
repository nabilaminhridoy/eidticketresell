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
  BookOpen, Plus, Search, Edit, Trash2, Eye, Tag,
  ArrowLeft, Loader2
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string | null;
  categoryId: string | null;
  category: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  slug: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminBlogPage({ action, itemId, section }: {
  action?: 'list' | 'view' | 'create' | 'edit';
  itemId?: string;
  section?: 'posts' | 'categories' | 'tags';
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // New post state
  const [newPost, setNewPost] = useState({ title: '', content: '', excerpt: '', category: '', tags: '', status: 'draft' });

  // Edit post state
  const [editPost, setEditPost] = useState({ title: '', content: '', excerpt: '', category: '', status: 'draft' });

  // New category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');

  const currentAction = action || 'list';
  const currentSection = section || 'posts';

  const refreshData = async () => {
    const res = await fetch('/api/admin/blog', { headers: getAuthHeaders() });
    const d = await res.json();
    if (d.posts) setPosts(d.posts);
    if (d.categories) setCategories(d.categories);
    if (d.tags) setTags(d.tags);
  };

  useEffect(() => {
    fetch('/api/admin/blog', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.posts) setPosts(d.posts);
        if (d.categories) setCategories(d.categories);
        if (d.tags) setTags(d.tags);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Initialize edit form using "adjust state during render" pattern
  const [prevEditItemId, setPrevEditItemId] = useState<string | null>(null);
  if (currentAction === 'edit' && itemId && itemId !== prevEditItemId && posts.length > 0) {
    const post = posts.find(p => p.id === itemId);
    if (post) {
      setPrevEditItemId(itemId);
      setEditPost({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        category: post.categoryId || '',
        status: post.status,
      });
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // View single post
  if (currentAction === 'view' && itemId) {
    const post = posts.find(p => p.id === itemId) || posts[0];
    if (!post) return <div className="text-center py-12 text-muted-foreground">Post not found</div>;
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
              <div><span className="text-muted-foreground">Author:</span> <span className="font-medium">{post.author || 'N/A'}</span></div>
              <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{post.category || 'N/A'}</span></div>
              <div><span className="text-muted-foreground">Created:</span> <span className="font-medium">{new Date(post.createdAt).toLocaleDateString()}</span></div>
              <div><span className="text-muted-foreground">Updated:</span> <span className="font-medium">{new Date(post.updatedAt).toLocaleDateString()}</span></div>
            </div>
            {post.excerpt && <p className="text-sm text-muted-foreground italic">{post.excerpt}</p>}
            <div className="prose max-w-none">
              <p className="text-sm">{post.content}</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Link href={`/admin/blog/${itemId}/edit`}>
            <Button size="sm"><Edit className="w-4 h-4" />Edit Post</Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={() => { setSelectedPost(post); setShowDeleteDialog(true); }}><Trash2 className="w-4 h-4" />Delete</Button>
        </div>
      </div>
    );
  }

  // Create post
  if (currentAction === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button>
          </Link>
          <h1 className="text-xl font-bold">Create New Post</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Enter blog post title" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input placeholder="auto-generated-slug" value={newPost.title ? newPost.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-') : ''} className="bg-muted/30" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea placeholder="Brief summary of the post" rows={2} value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={newPost.category} onValueChange={v => setNewPost({...newPost, category: v})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
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
          <Button onClick={async () => {
            if (!newPost.title.trim() || !newPost.content.trim()) return;
            setSaving(true);
            try {
              const res = await fetch('/api/admin/blog', {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: newPost.title,
                  content: newPost.content,
                  excerpt: newPost.excerpt,
                  categoryId: newPost.category || null,
                  status: newPost.status,
                }),
              });
              if (res.ok) {
                await refreshData();
                // Reset form and go back to list
                setNewPost({ title: '', content: '', excerpt: '', category: '', tags: '', status: 'draft' });
                window.location.href = '/admin/blog';
              }
            } catch { /* silent */ }
            setSaving(false);
          }} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish'}</Button>
          <Link href="/admin/blog"><Button variant="outline">Cancel</Button></Link>
        </div>
      </div>
    );
  }

  // Edit post
  if (currentAction === 'edit' && itemId) {
    const post = posts.find(p => p.id === itemId);
    if (!post && !loading) return <div className="text-center py-12 text-muted-foreground">Post not found</div>;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button>
          </Link>
          <h1 className="text-xl font-bold">Edit Post</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={editPost.title} onChange={e => setEditPost({...editPost, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <Textarea value={editPost.excerpt} onChange={e => setEditPost({...editPost, excerpt: e.target.value})} rows={2} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={editPost.category} onValueChange={v => setEditPost({...editPost, category: v})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea value={editPost.content} onChange={e => setEditPost({...editPost, content: e.target.value})} rows={10} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={editPost.status} onValueChange={v => setEditPost({...editPost, status: v})}>
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
          <Button onClick={async () => {
            if (!editPost.title.trim() || !editPost.content.trim()) return;
            setSaving(true);
            try {
              const res = await fetch('/api/admin/blog', {
                method: 'PUT',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: itemId,
                  title: editPost.title,
                  content: editPost.content,
                  excerpt: editPost.excerpt,
                  categoryId: editPost.category || null,
                  status: editPost.status,
                }),
              });
              if (res.ok) {
                await refreshData();
                window.location.href = '/admin/blog';
              }
            } catch { /* silent */ }
            setSaving(false);
          }} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}</Button>
          <Link href="/admin/blog"><Button variant="outline">Cancel</Button></Link>
        </div>
      </div>
    );
  }

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog?id=${selectedPost.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await refreshData();
        setShowDeleteDialog(false);
        setSelectedPost(null);
      }
    } catch { /* silent */ }
    setDeleting(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_category', categoryName: newCategoryName, categorySlug: newCategorySlug || undefined }),
      });
      if (res.ok) {
        await refreshData();
        setShowCreateDialog(false);
        setNewCategoryName('');
        setNewCategorySlug('');
      }
    } catch { /* silent */ }
    setSaving(false);
  };

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
              </SelectContent>
            </Select>
          </div>

          {/* Posts table */}
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No blog posts found</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
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
                        <TableCell><Badge variant="outline" className="text-xs">{post.category || 'None'}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{post.author || 'N/A'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
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
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No categories found</p>
            </div>
          ) : (
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
                    {categories.map(cat => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                        <TableCell><Badge variant="secondary">{cat.count}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={async () => {
                              const res = await fetch(`/api/admin/blog?id=${cat.id}&action=delete_category`, {
                                method: 'DELETE',
                                headers: getAuthHeaders(),
                              });
                              if (res.ok) await refreshData();
                            }}><Trash2 className="w-3.5 h-3.5" /></Button>
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

        <TabsContent value="tags" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : tags.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No tags found</p>
            </div>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Blog Tags</CardTitle>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add Tag</Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-sm">{tag.name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="w-3 h-3 text-red-600" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete post dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete &quot;{selectedPost?.title}&quot;? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePost} disabled={deleting}>{deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}</Button>
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
              <Input placeholder="Category name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input placeholder="category-slug (auto-generated if empty)" value={newCategorySlug} onChange={e => setNewCategorySlug(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
