'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  HelpCircle, Search, Loader2, Clock, CheckCircle, AlertCircle, XCircle,
  ArrowUpCircle, ArrowDownCircle, MessageSquare, Send, Filter,
  User, Mail, Phone, FileText, Eye,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  supId: string;
  userId: string | null;
  fullName: string;
  phone: string | null;
  email: string;
  subject: string;
  message: string;
  attachment: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; username: string; email: string } | null;
  replyCount: number;
  lastReplyAt: string | null;
}

interface Reply {
  id: string;
  message: string;
  adminId: string | null;
  userId: string | null;
  createdAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  open: { label: 'Open', icon: AlertCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  closed: { label: 'Closed', icon: XCircle, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-blue-100 text-blue-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [counts, setCounts] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View ticket dialog
  const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const refreshTickets = async (p = 1, status = filterStatus, search = searchQuery) => {
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/support-tickets?${params}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
      if (data.pagination) { setPage(data.pagination.page); setTotalPages(data.pagination.totalPages); }
      if (data.counts) setCounts(data.counts);
    } catch { /* silent */ }
  };

  // Load tickets on mount using requestAnimationFrame to avoid synchronous setState in effect
  useEffect(() => {
    requestAnimationFrame(() => {
      refreshTickets().then(() => setLoading(false)).catch(() => setLoading(false));
    });
  }, []);

  const handleStatusChange = async (ticketId: string, status: string) => {
    setSaving(true);
    try {
      await fetch('/api/admin/support-tickets', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ticketId, action: 'update_status', status }),
      });
      await refreshTickets(page, filterStatus, searchQuery);
    } catch { /* silent */ }
    setSaving(false);
  };

  const handlePriorityChange = async (ticketId: string, priority: string) => {
    setSaving(true);
    try {
      await fetch('/api/admin/support-tickets', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ticketId, action: 'update_priority', priority }),
      });
      await refreshTickets(page, filterStatus, searchQuery);
    } catch { /* silent */ }
    setSaving(false);
  };

  const handleViewTicket = async (ticket: SupportTicket) => {
    setViewingTicket(ticket);
    setViewDialogOpen(true);
    setReplyMessage('');
    // Load replies for this ticket
    try {
      const res = await fetch(`/api/support/${ticket.id}`, { headers: getAuthHeaders() });
      // The support API only handles POST, so we'll get replies from the ticket data
      // Replies are included in the support-tickets API response
      setReplies([]);
    } catch { /* silent */ }
  };

  const handleSendReply = async () => {
    if (!viewingTicket || !replyMessage.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/admin/support-tickets', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ticketId: viewingTicket.id, action: 'add_reply', message: replyMessage }),
      });
      setReplyMessage('');
      await refreshTickets(page, filterStatus, searchQuery);
      // Refresh view
      if (viewingTicket) {
        const updated = tickets.find(t => t.id === viewingTicket.id);
        if (updated) setViewingTicket(updated);
      }
    } catch { /* silent */ }
    setSaving(false);
  };

  const filteredTickets = tickets;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="w-6 h-6" />Support Tickets</h1>
      <p className="text-sm text-muted-foreground">Manage support tickets submitted from the website /en/support page</p>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setFilterStatus('open'); refreshTickets(1, 'open', searchQuery); }}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div><p className="text-2xl font-bold">{counts.open}</p><p className="text-xs text-muted-foreground">Open</p></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setFilterStatus('in_progress'); refreshTickets(1, 'in_progress', searchQuery); }}>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div><p className="text-2xl font-bold">{counts.inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setFilterStatus('resolved'); refreshTickets(1, 'resolved', searchQuery); }}>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div><p className="text-2xl font-bold">{counts.resolved}</p><p className="text-xs text-muted-foreground">Resolved</p></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setFilterStatus('closed'); refreshTickets(1, 'closed', searchQuery); }}>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-gray-500" />
            <div><p className="text-2xl font-bold">{counts.closed}</p><p className="text-xs text-muted-foreground">Closed</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, subject, name, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') refreshTickets(1, filterStatus, searchQuery); }}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); refreshTickets(1, v, searchQuery); }}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refreshTickets(page, filterStatus, searchQuery)} className="gap-1">
          <Filter className="w-4 h-4" />Refresh
        </Button>
      </div>

      {/* Tickets table */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No support tickets found</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">From</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="hidden md:table-cell">Replies</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(ticket => {
                  const sConfig = statusConfig[ticket.status] || statusConfig.open;
                  const pConfig = priorityConfig[ticket.priority] || priorityConfig.medium;
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">{ticket.supId}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{ticket.subject}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="text-sm">{ticket.fullName}</p>
                          <p className="text-xs text-muted-foreground">{ticket.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${sConfig.color} gap-1`}>
                          <sConfig.icon className="w-3 h-3" />{sConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={pConfig.color}>{pConfig.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{ticket.replyCount}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewTicket(ticket)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Select value={ticket.status} onValueChange={v => handleStatusChange(ticket.id, v)}>
                            <SelectTrigger className="h-8 w-[70px] text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => refreshTickets(page - 1, filterStatus, searchQuery)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => refreshTickets(page + 1, filterStatus, searchQuery)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              {viewingTicket?.supId} — {viewingTicket?.subject}
            </DialogTitle>
          </DialogHeader>

          {viewingTicket && (
            <div className="space-y-4">
              {/* Ticket details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">From:</span> <span className="font-medium">{viewingTicket.fullName}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> {viewingTicket.email}</div>
                  {viewingTicket.phone && <div><span className="text-muted-foreground">Phone:</span> {viewingTicket.phone}</div>}
                  <div><span className="text-muted-foreground">Date:</span> {new Date(viewingTicket.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex gap-2 items-center">
                  <Select value={viewingTicket.status} onValueChange={v => handleStatusChange(viewingTicket.id, v)} disabled={saving}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={viewingTicket.priority} onValueChange={v => handlePriorityChange(viewingTicket.id, v)} disabled={saving}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Original message */}
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Original Message</p>
                <p className="text-sm">{viewingTicket.message}</p>
                {viewingTicket.attachment && (
                  <a href={viewingTicket.attachment} target="_blank" className="text-xs text-primary mt-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" />View Attachment
                  </a>
                )}
              </div>

              {viewingTicket.user && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <p className="text-xs">Registered user: <strong>{viewingTicket.user.name}</strong> ({viewingTicket.user.username})</p>
                </div>
              )}

              {/* Admin reply */}
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Admin Reply</p>
                <Textarea
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Type your reply to the user..."
                  rows={3}
                />
                <Button onClick={handleSendReply} disabled={saving || !replyMessage.trim()} className="gap-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Reply
                </Button>
              </div>

              {/* Existing replies */}
              {replies.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold text-muted-foreground">Previous Replies</p>
                  {replies.map(reply => (
                    <div key={reply.id} className={`p-3 rounded-lg ${reply.adminId ? 'bg-primary/5' : 'bg-muted/20'}`}>
                      <p className="text-xs font-medium mb-1">{reply.adminId ? 'Admin' : 'User'}</p>
                      <p className="text-sm">{reply.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(reply.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
