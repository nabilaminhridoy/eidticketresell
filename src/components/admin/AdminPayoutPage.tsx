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
  ChevronRight, Loader2, User, DollarSign, Smartphone, Banknote
} from 'lucide-react';

interface WithdrawalRecord {
  id: string;
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

const MOCK_WITHDRAWALS: WithdrawalRecord[] = [
  { id: 'w1', walletId: 'wallet1', amount: 5000, method: 'bkash', accountDetails: 'bkash: +880171234567 (Rahim Uddin)', status: 'pending', reviewedBy: null, reviewNote: null, createdAt: '2025-01-15T09:00:00Z', updatedAt: '2025-01-15T09:00:00Z', seller: { id: '1', name: 'Rahim Uddin', username: 'rahim_uddin', email: 'rahim@example.com' } },
  { id: 'w2', walletId: 'wallet3', amount: 3500, method: 'bkash', accountDetails: 'bkash: +880155566677 (Fatima Begum)', status: 'pending', reviewedBy: null, reviewNote: null, createdAt: '2025-01-16T10:00:00Z', updatedAt: '2025-01-16T10:00:00Z', seller: { id: '3', name: 'Fatima Begum', username: 'fatima_begum', email: 'fatima@example.com' } },
  { id: 'w3', walletId: 'wallet1', amount: 2000, method: 'bank_transfer', accountDetails: 'Bank: Dutch-Bangla Bank, A/C: 1234567890, Name: Rahim Uddin', status: 'approved', reviewedBy: 'admin1', reviewNote: 'Verified and processed', createdAt: '2025-01-10T08:00:00Z', updatedAt: '2025-01-11T12:00:00Z', seller: { id: '1', name: 'Rahim Uddin', username: 'rahim_uddin', email: 'rahim@example.com' } },
  { id: 'w4', walletId: 'wallet2', amount: 1000, method: 'bkash', accountDetails: 'bkash: +880189876543 (Karim Hasan)', status: 'rejected', reviewedBy: 'admin1', reviewNote: 'Insufficient escrow balance verification needed', createdAt: '2025-01-12T14:00:00Z', updatedAt: '2025-01-13T09:00:00Z', seller: { id: '2', name: 'Karim Hasan', username: 'karim_hasan', email: 'karim@example.com' } },
  { id: 'w5', walletId: 'wallet1', amount: 8000, method: 'bank_transfer', accountDetails: 'Bank: Sonali Bank, A/C: 9876543210, Name: Rahim Uddin', status: 'completed', reviewedBy: 'admin1', reviewNote: 'Transfer completed', createdAt: '2025-01-08T06:00:00Z', updatedAt: '2025-01-09T15:00:00Z', seller: { id: '1', name: 'Rahim Uddin', username: 'rahim_uddin', email: 'rahim@example.com' } },
];

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'completed'];

export default function AdminPayoutPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRecord | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusTab !== 'all') params.set('status', statusTab);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/admin/payout?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.withdrawals && d.withdrawals.length > 0) {
          setWithdrawals(d.withdrawals);
          setTotalPages(d.pagination?.totalPages || 1);
          setTotal(d.pagination?.total || 0);
        } else {
          setWithdrawals(MOCK_WITHDRAWALS);
          setTotalPages(1);
          setTotal(MOCK_WITHDRAWALS.length);
        }
        setLoading(false);
      })
      .catch(() => {
        setWithdrawals(MOCK_WITHDRAWALS);
        setTotalPages(1);
        setTotal(MOCK_WITHDRAWALS.length);
        setLoading(false);
      });
  }, [statusTab, page]);

  const filteredWithdrawals = withdrawals.filter(w => {
    if (statusTab !== 'all' && w.status !== statusTab) return false;
    return true;
  });

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
      setWithdrawals(prev => prev.map(w =>
        w.id === selectedWithdrawal.id ? { ...w, status: 'approved', reviewNote, reviewedAt: new Date().toISOString() } : w
      ));
    }
    setReviewModalOpen(false);
  };

  const handleReject = () => {
    if (selectedWithdrawal) {
      setWithdrawals(prev => prev.map(w =>
        w.id === selectedWithdrawal.id ? { ...w, status: 'rejected', reviewNote, reviewedAt: new Date().toISOString() } : w
      ));
    }
    setReviewModalOpen(false);
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

      <Card>
        <CardContent className="p-4 space-y-4">
          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList>
              {STATUS_TABS.map(tab => (
                <TabsTrigger key={tab} value={tab}>
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'pending' && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {MOCK_WITHDRAWALS.filter(w => w.status === 'pending').length}
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
                ) : filteredWithdrawals.length === 0 ? (
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
                        {filteredWithdrawals.map(w => (
                          <TableRow key={w.id}>
                            <TableCell className="font-medium">{w.id.slice(0, 8)}</TableCell>
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
      {!loading && filteredWithdrawals.length > 0 && totalPages > 1 && (
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
            <DialogTitle>Withdrawal Review</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Withdrawal ID</Label><p className="font-medium">{selectedWithdrawal.id}</p></div>
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
