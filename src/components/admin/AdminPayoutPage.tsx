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
import { Separator } from '@/components/ui/separator';
import {
  Wallet, Eye, CheckCircle, XCircle, ChevronLeft,
  ChevronRight, Loader2, User, DollarSign, Smartphone, Banknote, AlertCircle
} from 'lucide-react';

interface WithdrawalRecord {
  id: string;
  wdrId: string;
  payId: string | null;
  walletId: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  seller?: { id: string; name: string; username: string; email: string };
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'completed'];

export default function AdminPayoutPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRecord | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusTab !== 'all') params.set('status', statusTab);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/admin/payout?${params.toString()}`, { headers: getAuthHeaders() })
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (d.error) {
          setError(d.error);
          setWithdrawals([]);
        } else {
          setError(null);
          setWithdrawals(d.withdrawals || []);
          setTotalPages(d.pagination?.totalPages || 1);
          setTotal(d.pagination?.total || 0);
          if (statusTab === 'pending') {
            setPendingCount(d.pagination?.total || (d.withdrawals || []).length);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch withdrawals');
        setWithdrawals([]);
        setTotalPages(1);
        setTotal(0);
        setLoading(false);
      });
  }, [statusTab, page]);

  // Fetch pending count separately when on non-pending tab
  useEffect(() => {
    if (statusTab !== 'pending') {
      fetch(`/api/admin/payout?status=pending&limit=1`, { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(d => {
          setPendingCount(d.pagination?.total || 0);
        })
        .catch(() => {});
    }
  }, [statusTab]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      pending: { bg: 'bg-yellow-500 text-white', label: 'Pending' },
      approved: { bg: 'bg-emerald-500 text-white', label: 'Approved' },
      rejected: { bg: 'bg-red-500 text-white', label: 'Rejected' },
      completed: { bg: 'bg-blue-500 text-white', label: 'Completed' },
    };
    const info = map[status] || { bg: 'bg-muted', label: status };
    return <Badge className={info.bg}>{info.label}</Badge>;
  };

  const getMethodIcon = (method: string) => {
    if (method === 'bkash') return <Smartphone className="w-3 h-3" />;
    return <Banknote className="w-3 h-3" />;
  };

  const handleReview = (withdrawal: WithdrawalRecord) => {
    setSelectedWithdrawal(withdrawal);
    setReviewNote('');
    setReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedWithdrawal) {
      fetch(`/api/admin/payout?id=${selectedWithdrawal.id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', reviewNote }),
      })
        .then(r => r.json())
        .then(d => {
          if (!d.error) {
            setWithdrawals(prev => prev.map(w =>
              w.id === selectedWithdrawal.id ? { ...w, status: 'approved', reviewNote } : w
            ));
          }
          setReviewModalOpen(false);
        })
        .catch(() => setReviewModalOpen(false));
    }
  };

  const handleReject = () => {
    if (selectedWithdrawal) {
      fetch(`/api/admin/payout?id=${selectedWithdrawal.id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reviewNote }),
      })
        .then(r => r.json())
        .then(d => {
          if (!d.error) {
            setWithdrawals(prev => prev.map(w =>
              w.id === selectedWithdrawal.id ? { ...w, status: 'rejected', reviewNote } : w
            ));
          }
          setReviewModalOpen(false);
        })
        .catch(() => setReviewModalOpen(false));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6" /> Payout / Withdrawals
          </h1>
          <p className="text-sm text-muted-foreground">{total} total withdrawals</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
            <Button size="sm" variant="outline" onClick={() => { setError(null); setPage(1); }}>Retry</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-4">
          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList>
              {STATUS_TABS.map(tab => (
                <TabsTrigger key={tab} value={tab}>
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'pending' && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {STATUS_TABS.map(tab => (
              <TabsContent key={tab} value={tab}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No withdrawals found for this filter</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="hidden md:table-cell">Account Details</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.map(w => (
                          <TableRow key={w.id}>
                            <TableCell className="font-medium">{w.wdrId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {w.seller?.name || 'Unknown'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1 font-semibold">
                                <DollarSign className="w-3 h-3" />৳{w.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getMethodIcon(w.method)}
                                {w.method === 'bkash' ? 'bKash' : 'Bank Transfer'}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <p className="text-xs truncate max-w-[200px]">{w.accountDetails}</p>
                            </TableCell>
                            <TableCell>{getStatusBadge(w.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleReview(w)} title="Review">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {w.status === 'pending' && (
                                  <>
                                    <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => handleReview(w)} title="Approve">
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleReview(w)} title="Reject">
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
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
      {!loading && withdrawals.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Withdrawal Review - {selectedWithdrawal?.wdrId}</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Withdrawal ID</Label><p className="font-medium">{selectedWithdrawal.wdrId}</p></div>
                <div><Label className="text-xs text-muted-foreground">Seller</Label><p className="font-medium">{selectedWithdrawal.seller?.name || 'Unknown'}</p></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="font-semibold flex items-center gap-1"><DollarSign className="w-3 h-3" />৳{selectedWithdrawal.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Method</Label>
                  <p className="font-medium">{selectedWithdrawal.method === 'bkash' ? 'bKash' : 'Bank Transfer'}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Account Details</Label>
                <p className="font-medium text-sm">{selectedWithdrawal.accountDetails}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Current Status</Label>
                <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
              </div>
              {selectedWithdrawal.status !== 'pending' && selectedWithdrawal.reviewNote && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <Label className="text-xs text-muted-foreground">Review Note</Label>
                  <p className="text-sm mt-1">{selectedWithdrawal.reviewNote}</p>
                </div>
              )}
              <Separator />
              {selectedWithdrawal.status === 'pending' && (
                <div className="space-y-2">
                  <Label>Review Notes</Label>
                  <Input
                    placeholder="Enter review notes..."
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
            {selectedWithdrawal?.status === 'pending' && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
