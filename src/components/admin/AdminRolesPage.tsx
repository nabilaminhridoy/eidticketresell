'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Scale, Plus, Edit, Trash2, Key, Shield, CheckCircle, XCircle,
  Users, Search, Loader2
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  category: string;
  name: string;
  slug: string;
  description: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const configuredPermissions: Permission[] = [
  { id: 'perm_dashboard_view', category: 'Dashboard', name: 'View Dashboard', slug: 'dashboard', description: 'Access admin dashboard' },
  { id: 'perm_analytics_view', category: 'Dashboard', name: 'View Analytics', slug: 'analytics', description: 'Access analytics data' },
  { id: 'perm_tickets_manage', category: 'Management', name: 'Manage Tickets', slug: 'tickets', description: 'Create, edit, delete tickets' },
  { id: 'perm_orders_manage', category: 'Management', name: 'Manage Orders', slug: 'orders', description: 'View and manage orders' },
  { id: 'perm_users_manage', category: 'Management', name: 'Manage Users', slug: 'users', description: 'View and manage user accounts' },
  { id: 'perm_disputes_handle', category: 'Management', name: 'Handle Disputes', slug: 'disputes', description: 'Resolve disputes' },
  { id: 'perm_messages_view', category: 'Management', name: 'View Messages', slug: 'messages', description: 'Access support messages' },
  { id: 'perm_payments_manage', category: 'Finance', name: 'Manage Payments', slug: 'payments', description: 'View and manage payments' },
  { id: 'perm_payouts_process', category: 'Finance', name: 'Process Payouts', slug: 'payouts', description: 'Approve and process payouts' },
  { id: 'perm_refunds_handle', category: 'Finance', name: 'Handle Refunds', slug: 'refunds', description: 'Process refund requests' },
  { id: 'perm_reports_view', category: 'Finance', name: 'View Reports', slug: 'reports', description: 'Access financial reports' },
  { id: 'perm_blog_manage', category: 'Content', name: 'Manage Blog', slug: 'blog', description: 'Create and edit blog posts' },
  { id: 'perm_faqs_manage', category: 'Content', name: 'Manage FAQs', slug: 'faqs', description: 'Create and edit FAQs' },
  { id: 'perm_pages_manage', category: 'Content', name: 'Manage Pages', slug: 'pages', description: 'Edit CMS pages' },
  { id: 'perm_homepage_manage', category: 'Content', name: 'Manage Homepage', slug: 'homepage', description: 'Edit homepage sections' },
  { id: 'perm_ads_manage', category: 'Content', name: 'Manage Ads', slug: 'ads', description: 'Create and manage ads' },
  { id: 'perm_seo_manage', category: 'Content', name: 'Manage SEO', slug: 'seo', description: 'Edit SEO settings' },
  { id: 'perm_media_manage', category: 'Content', name: 'Manage Media', slug: 'media', description: 'Upload and manage media' },
  { id: 'perm_admins_manage', category: 'System', name: 'Manage Admins', slug: 'admins', description: 'Create and manage admin accounts' },
  { id: 'perm_roles_manage', category: 'System', name: 'Manage Roles', slug: 'roles', description: 'Create and edit roles' },
  { id: 'perm_settings_manage', category: 'System', name: 'Manage Settings', slug: 'settings', description: 'Edit platform settings' },
  { id: 'perm_activity_log_view', category: 'System', name: 'View Activity Log', slug: 'activity_log', description: 'Access activity logs' },
];

const permissionCategories = ['Dashboard', 'Management', 'Finance', 'Content', 'System'];

export default function AdminRolesPage({ section }: { section?: string }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');
  const [editRolePermissions, setEditRolePermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const currentSection = section || null;

  useEffect(() => {
    fetch('/api/admin/roles', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.roles) setRoles(d.roles);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const refreshRoles = async () => {
    const res = await fetch('/api/admin/roles', { headers: getAuthHeaders() });
    const d = await res.json();
    if (d.roles) setRoles(d.roles);
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName, description: newRoleDescription, permissions: newRolePermissions }),
      });
      if (res.ok) {
        await refreshRoles();
        setShowCreateDialog(false);
        setNewRoleName('');
        setNewRoleDescription('');
        setNewRolePermissions([]);
      }
    } catch {
      // failed silently
    }
    setSaving(false);
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRole.id, name: editRoleName, description: editRoleDescription, permissions: editRolePermissions }),
      });
      if (res.ok) {
        await refreshRoles();
        setShowEditDialog(false);
        setSelectedRole(null);
      }
    } catch {
      // failed silently
    }
    setSaving(false);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/roles?id=${selectedRole.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await refreshRoles();
        setShowDeleteDialog(false);
        setSelectedRole(null);
      }
    } catch {
      // failed silently
    }
    setDeleting(false);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setEditRoleName(role.name);
    setEditRoleDescription(role.description || '');
    setEditRolePermissions(role.permissions);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  const togglePermission = (slug: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(slug)) {
      setList(list.filter(p => p !== slug));
    } else {
      setList([...list, slug]);
    }
  };

  // Permissions view
  if (currentSection === 'permissions') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Key className="w-6 h-6" />Permissions</h1>
          <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add Permission</Button>
        </div>

        {permissionCategories.map(category => (
          <Card key={category}>
            <CardHeader><CardTitle className="text-lg">{category} Permissions</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead className="hidden md:table-cell">Description</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {configuredPermissions.filter(p => p.category === category).map(perm => (
                    <TableRow key={perm.id}>
                      <TableCell className="font-medium">{perm.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{perm.slug}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{perm.description}</TableCell>
                      <TableCell>
                        <div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Default - Roles list
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Scale className="w-6 h-6" />Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">Manage admin roles and their permission sets</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/permissions"><Button variant="outline" size="sm" className="gap-1"><Key className="w-4 h-4" />Permissions</Button></Link>
          <Button size="sm" className="gap-1" onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4" />Add Role</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Description</TableHead><TableHead className="hidden md:table-cell">Default</TableHead><TableHead className="hidden md:table-cell">Permissions</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{role.description || 'No description'}</TableCell>
                    <TableCell className="hidden md:table-cell">{role.isDefault && <Badge variant="secondary">Default</Badge>}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap max-h-[60px] overflow-y-auto">
                        {role.permissions.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(role)}><Edit className="w-3.5 h-3.5" /></Button>
                        {!role.isDefault && <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => openDeleteDialog(role)}><Trash2 className="w-3.5 h-3.5" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create role dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Role Name</label><Input placeholder="Role name" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><Input placeholder="Role description" value={newRoleDescription} onChange={e => setNewRoleDescription(e.target.value)} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Permissions</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {configuredPermissions.map(perm => (
                  <div key={perm.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                    <Switch checked={newRolePermissions.includes(perm.slug)} onCheckedChange={() => togglePermission(perm.slug, newRolePermissions, setNewRolePermissions)} />
                    <div><p className="text-sm font-medium">{perm.name}</p><p className="text-xs text-muted-foreground">{perm.description}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateRole} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Role'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit role dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader><DialogTitle>Edit Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Role Name</label><Input value={editRoleName} onChange={e => setEditRoleName(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><Input value={editRoleDescription} onChange={e => setEditRoleDescription(e.target.value)} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Permissions</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {configuredPermissions.map(perm => (
                  <div key={perm.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                    <Switch checked={editRolePermissions.includes(perm.slug)} onCheckedChange={() => togglePermission(perm.slug, editRolePermissions, setEditRolePermissions)} />
                    <div><p className="text-sm font-medium">{perm.name}</p><p className="text-xs text-muted-foreground">{perm.description}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditRole} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete role dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Role</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete the role &quot;{selectedRole?.name}&quot;? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={deleting}>{deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
