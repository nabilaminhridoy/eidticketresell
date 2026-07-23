'use client';

import { useState } from 'react';
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
  Users, Search
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  usersCount: number;
  permissions: string[];
}

interface Permission {
  id: string;
  category: string;
  name: string;
  slug: string;
  description: string;
}

// Configurable roles - managed through admin configuration
const configuredRoles: Role[] = [
  { id: 'role_super_admin', name: 'Super Admin', slug: 'super_admin', description: 'Full access to all features', usersCount: 1, permissions: ['all'] },
  { id: 'role_content_manager', name: 'Content Manager', slug: 'content_manager', description: 'Manage content, blog, FAQs, pages', usersCount: 1, permissions: ['blog', 'faqs', 'pages', 'homepage', 'ads', 'seo', 'media'] },
  { id: 'role_support_agent', name: 'Support Agent', slug: 'support_agent', description: 'Handle tickets, users, disputes', usersCount: 1, permissions: ['tickets', 'orders', 'users', 'disputes', 'messages'] },
  { id: 'role_finance_manager', name: 'Finance Manager', slug: 'finance_manager', description: 'Handle payments, payouts, refunds', usersCount: 1, permissions: ['payments', 'payouts', 'refunds', 'reports'] },
  { id: 'role_viewer', name: 'Viewer', slug: 'viewer', description: 'Read-only access to dashboard', usersCount: 0, permissions: ['dashboard', 'analytics'] },
];

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const currentSection = section || null;

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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Description</TableHead><TableHead>Users</TableHead><TableHead className="hidden md:table-cell">Permissions</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {configuredRoles.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{role.description}</TableCell>
                  <TableCell><Badge variant="secondary">{role.usersCount}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {role.permissions.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button>
                      {role.slug !== 'super_admin' && <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create role dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader><DialogTitle>Create New Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Role Name</label><Input placeholder="Role name" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Description</label><Input placeholder="Role description" /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Permissions</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {configuredPermissions.map(perm => (
                  <div key={perm.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                    <Switch />
                    <div><p className="text-sm font-medium">{perm.name}</p><p className="text-xs text-muted-foreground">{perm.description}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowCreateDialog(false)}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
