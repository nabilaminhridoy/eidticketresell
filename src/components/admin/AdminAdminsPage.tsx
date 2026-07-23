'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  UserCog, Plus, Search, Edit, Trash2, ArrowLeft, Eye, Shield,
  Mail, Lock, CheckCircle, XCircle, MoreHorizontal, Key
} from 'lucide-react';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  twoFactor: boolean;
}

export default function AdminAdminsPage({ action, itemId }: { action?: 'list' | 'view' | 'create' | 'edit'; itemId?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const mockAdmins: Admin[] = [
    { id: '1', name: 'Super Admin', email: 'admin@etr.com', role: 'super_admin', status: 'active', lastLogin: '2024-01-15 10:30', twoFactor: true },
    { id: '2', name: 'Content Manager', email: 'editor@etr.com', role: 'content_manager', status: 'active', lastLogin: '2024-01-14 09:00', twoFactor: false },
    { id: '3', name: 'Support Agent', email: 'support@etr.com', role: 'support_agent', status: 'active', lastLogin: '2024-01-13 08:00', twoFactor: true },
    { id: '4', name: 'Finance Manager', email: 'finance@etr.com', role: 'finance_manager', status: 'inactive', lastLogin: '2024-01-01', twoFactor: false },
  ];

  const currentAction = action || 'list';

  // View admin
  if (currentAction === 'view' && itemId) {
    const admin = mockAdmins.find(a => a.id === itemId) || mockAdmins[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/admins"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">{admin.name}</h1>
          <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>{admin.status}</Badge>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{admin.name}</p></div>
              <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{admin.email}</p></div>
              <div><p className="text-sm text-muted-foreground">Role</p><Badge variant="outline">{admin.role}</Badge></div>
              <div><p className="text-sm text-muted-foreground">Status</p><Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>{admin.status}</Badge></div>
              <div><p className="text-sm text-muted-foreground">2FA</p>{admin.twoFactor ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}</div>
              <div><p className="text-sm text-muted-foreground">Last Login</p><p className="font-medium">{admin.lastLogin}</p></div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Link href={`/admin/admins/${itemId}/edit`}><Button size="sm"><Edit className="w-4 h-4" />Edit</Button></Link>
          <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4" />Deactivate</Button>
        </div>
      </div>
    );
  }

  // Edit admin
  if (currentAction === 'edit' && itemId) {
    const admin = mockAdmins.find(a => a.id === itemId) || mockAdmins[0];
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/admins"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Edit: {admin.name}</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input defaultValue={admin.name} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input defaultValue={admin.email} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Role</label>
              <Select defaultValue={admin.role}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="content_manager">Content Manager</SelectItem><SelectItem value="support_agent">Support Agent</SelectItem><SelectItem value="finance_manager">Finance Manager</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={admin.twoFactor} /><label className="text-sm">Enable Two-Factor Auth</label></div>
            <div className="space-y-2"><label className="text-sm font-medium">Status</label>
              <Select defaultValue={admin.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2"><Button>Save Changes</Button><Link href="/admin/admins"><Button variant="outline">Cancel</Button></Link></div>
      </div>
    );
  }

  // Create admin
  if (currentAction === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/admins"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Create New Admin</h1>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Name</label><Input placeholder="Full name" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input placeholder="admin@etr.com" type="email" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Password</label><Input placeholder="Strong password" type="password" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Role</label>
              <Select defaultValue="support_agent"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="content_manager">Content Manager</SelectItem><SelectItem value="support_agent">Support Agent</SelectItem><SelectItem value="finance_manager">Finance Manager</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="flex items-center gap-2"><Switch /><label className="text-sm">Enable Two-Factor Auth</label></div>
          </CardContent>
        </Card>
        <div className="flex gap-2"><Button>Create Admin</Button><Link href="/admin/admins"><Button variant="outline">Cancel</Button></Link></div>
      </div>
    );
  }

  // List view
  const filteredAdmins = mockAdmins.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><UserCog className="w-6 h-6" />Administrator Management</h1>
          <p className="text-sm text-muted-foreground">Manage admin accounts and roles</p>
        </div>
        <Link href="/admin/admins/create"><Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add Admin</Button></Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search admins..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">2FA</TableHead><TableHead className="hidden md:table-cell">Last Login</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredAdmins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium"><Link href={`/admin/admins/${admin.id}`} className="hover:text-primary">{admin.name}</Link></TableCell>
                  <TableCell className="text-sm">{admin.email}</TableCell>
                  <TableCell><Badge variant="outline">{admin.role}</Badge></TableCell>
                  <TableCell><Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>{admin.status}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">{admin.twoFactor ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{admin.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link href={`/admin/admins/${admin.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-3.5 h-3.5" /></Button></Link>
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
