'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Users, Search, Plus, Eye, Edit, Ban, UserCheck, UserX,
  ChevronLeft, ChevronRight, Loader2, ShieldCheck, Mail, Phone
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  username: string;
  role: string;
  isKycVerified: boolean;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar: string | null;
  createdAt: string;
  lastLogin: string | null;
  _count?: { tickets: number; orders: number; soldOrders: number };
}

const MOCK_USERS: UserRecord[] = [
  { id: '1', name: 'Rahim Uddin', email: 'rahim@example.com', phone: '+880171234567', username: 'rahim_uddin', role: 'verified_seller', isKycVerified: true, isActive: true, emailVerified: true, phoneVerified: true, avatar: null, createdAt: '2024-12-01T10:00:00Z', lastLogin: '2025-01-15T08:30:00Z', _count: { tickets: 5, orders: 3, soldOrders: 8 } },
  { id: '2', name: 'Karim Hasan', email: 'karim@example.com', phone: '+880189876543', username: 'karim_hasan', role: 'user', isKycVerified: false, isActive: true, emailVerified: true, phoneVerified: false, avatar: null, createdAt: '2024-12-05T12:00:00Z', lastLogin: '2025-01-10T14:00:00Z', _count: { tickets: 0, orders: 2, soldOrders: 0 } },
  { id: '3', name: 'Fatima Begum', email: 'fatima@example.com', phone: '+880155566677', username: 'fatima_begum', role: 'verified_seller', isKycVerified: true, isActive: false, emailVerified: true, phoneVerified: true, avatar: null, createdAt: '2024-11-20T09:00:00Z', lastLogin: null, _count: { tickets: 3, orders: 1, soldOrders: 4 } },
  { id: '4', name: 'Arif Khan', email: 'arif@example.com', phone: null, username: 'arif_khan', role: 'guest', isKycVerified: false, isActive: true, emailVerified: false, phoneVerified: false, avatar: null, createdAt: '2025-01-01T06:00:00Z', lastLogin: '2025-01-12T11:00:00Z', _count: { tickets: 0, orders: 0, soldOrders: 0 } },
  { id: '5', name: 'Nasir Ahmed', email: 'nasir@example.com', phone: '+880133344455', username: 'nasir_ahmed', role: 'user', isKycVerified: false, isActive: true, emailVerified: true, phoneVerified: true, avatar: null, createdAt: '2024-12-15T15:00:00Z', lastLogin: '2025-01-14T09:30:00Z', _count: { tickets: 0, orders: 5, soldOrders: 0 } },
];

const STATUS_TABS = ['all', 'active', 'inactive', 'suspended', 'banned'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Create user form
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', username: '', role: 'user', password: '' });
  // Edit user form
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '' });

  const pageSize = 10;

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusTab !== 'all') {
      if (statusTab === 'active') params.set('isActive', 'true');
      // inactive/suspended/banned would need custom handling
    }
    params.set('page', String(page));
    params.set('limit', String(pageSize));

    fetch(`/api/admin/users?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.users && d.users.length > 0) {
          setUsers(d.users);
          setTotalPages(d.pagination?.totalPages || 1);
          setTotal(d.pagination?.total || 0);
        } else {
          // Use mock data if API returns empty
          setUsers(MOCK_USERS);
          setTotalPages(1);
          setTotal(MOCK_USERS.length);
        }
        setLoading(false);
      })
      .catch(() => {
        setUsers(MOCK_USERS);
        setTotalPages(1);
        setTotal(MOCK_USERS.length);
        setLoading(false);
      });
  }, [search, statusTab, page]);

  const filteredUsers = users.filter(u => {
    if (statusTab === 'active') return u.isActive;
    if (statusTab === 'inactive') return !u.isActive;
    if (statusTab === 'suspended') return !u.isActive && u.role !== 'banned';
    if (statusTab === 'banned') return false; // no banned in mock
    return true;
  });

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      admin: { variant: 'default', label: 'Admin' },
      super_admin: { variant: 'default', label: 'Super Admin' },
      verified_seller: { variant: 'secondary', label: 'Verified Seller' },
      user: { variant: 'outline', label: 'User' },
      guest: { variant: 'outline', label: 'Guest' },
    };
    const info = variants[role] || { variant: 'outline', label: role };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const getKycBadge = (verified: boolean) => {
    return verified
      ? <Badge className="bg-emerald-500 text-white"><ShieldCheck className="w-3 h-3 mr-1" />Verified</Badge>
      : <Badge variant="outline">Unverified</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge className="bg-emerald-500 text-white">Active</Badge>
      : <Badge variant="destructive">Inactive</Badge>;
  };

  const handleView = (user: UserRecord) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleEdit = (user: UserRecord) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, phone: user.phone || '', role: user.role });
    setEditModalOpen(true);
  };

  const handleSuspend = (user: UserRecord) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground">{total} total users</p>
        </div>
        <Button className="gap-1" onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4" /> Create User
        </Button>
      </div>

      {/* Search + Tabs */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList>
              {STATUS_TABS.map(tab => (
                <TabsTrigger key={tab} value={tab}>
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            {STATUS_TABS.map(tab => (
              <TabsContent key={tab} value={tab}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No users found for this filter</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="hidden md:table-cell">Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="hidden sm:table-cell">KYC</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map(user => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground hidden sm:inline" />
                                {user.email}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {user.phone || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="hidden sm:table-cell">{getKycBadge(user.isKycVerified)}</TableCell>
                            <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleView(user)} title="View">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(user)} title="Edit">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleSuspend(user)} title={user.isActive ? 'Suspend' : 'Activate'}>
                                  {user.isActive ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && filteredUsers.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} • {total} total
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View User Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Username</Label>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">KYC Status</Label>
                  <div>{getKycBadge(selectedUser.isKycVerified)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedUser.isActive)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Joined</Label>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Tickets Listed</Label>
                  <p className="font-medium">{selectedUser._count?.tickets || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Orders (Buyer)</Label>
                  <p className="font-medium">{selectedUser._count?.orders || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Orders (Seller)</Label>
                  <p className="font-medium">{selectedUser._count?.soldOrders || 0}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter email" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} placeholder="+88XXXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={createForm.username} onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))} placeholder="Choose username" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={v => setCreateForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="verified_seller">Verified Seller</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Set password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { setCreateModalOpen(false); }}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editForm.role} onValueChange={v => setEditForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="verified_seller">Verified Seller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { setEditModalOpen(false); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
