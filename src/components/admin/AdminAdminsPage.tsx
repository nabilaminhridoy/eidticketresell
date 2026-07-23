'use client';

import { useState, useEffect } from 'react';
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
  Mail, Lock, CheckCircle, XCircle, Key, Loader2
} from 'lucide-react';

interface AdminRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  status: string;
  avatar: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminAdminsPage({ action, itemId }: { action?: 'list' | 'view' | 'create' | 'edit'; itemId?: string }) {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const currentAction = action || 'list';

  useEffect(() => {
    fetch('/api/admin/admins', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.admins) setAdmins(d.admins); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // View admin
  if (currentAction === 'view' && itemId) {
    const admin = admins.find(a => a.id === itemId);
    if (!admin) return <div className="text-center py-12 text-muted-foreground">Admin not found</div>;
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
              <div><p className="text-sm text-muted-foreground">Last Login</p><p className="font-medium">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}</p></div>
              <div><p className="text-sm text-muted-foreground">Created</p><p className="font-medium">{new Date(admin.createdAt).toLocaleDateString()}</p></div>
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
    const admin = admins.find(a => a.id === itemId);
    if (!admin) return <div className="text-center py-12 text-muted-foreground">Admin not found</div>;
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
                <SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="admin">Admin</SelectItem>
              </SelectContent></Select>
            </div>
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
              <Select defaultValue="admin"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="admin">Admin</SelectItem>
              </SelectContent></Select>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-2"><Button>Create Admin</Button><Link href="/admin/admins"><Button variant="outline">Cancel</Button></Link></div>
      </div>
    );
  }

  // List view
  const filteredAdmins = admins.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()));

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

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredAdmins.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <UserCog className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No admins found</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Last Login</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredAdmins.map(admin => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium"><Link href={`/admin/admins/${admin.id}`} className="hover:text-primary">{admin.name}</Link></TableCell>
                    <TableCell className="text-sm">{admin.email}</TableCell>
                    <TableCell><Badge variant="outline">{admin.role}</Badge></TableCell>
                    <TableCell><Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>{admin.status}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}</TableCell>
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
      )}
    </div>
  );
}
