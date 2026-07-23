'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard, Eye, ChevronLeft, ChevronRight, Loader2,
  DollarSign, User, Calendar, Smartphone, AlertCircle
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  txnId: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  amount: number;
  gateway: string;
  gatewayTransactionId: string;
  status: string;
  createdAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const STATUS_TABS = ['all', 'pending', 'success', 'cancelled', 'failed', 'refunded'];
const GATEWAY_OPTIONS = ['all', 'bkash', 'sslcommerz'];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusTab !== 'all') params.set('status', statusTab);
    if (gatewayFilter !== 'all') params.set('gateway', gatewayFilter);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/admin/payments?${params.toString()}`, { headers: getAuthHeaders() })
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (d.error) {
          setError(d.error);
          setPayments([]);
        } else {
          setError(null);
          setPayments(d.payments || []);
          setTotalPages(d.pagination?.totalPages || 1);
          setTotal(d.pagination?.total || 0);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch payments');
        setPayments([]);
        setTotalPages(1);
        setTotal(0);
        setLoading(false);
      });
  }, [statusTab, gatewayFilter, search, page]);

  const filteredPayments = payments.filter(p => {
    if (statusTab !== 'all' && p.status !== statusTab) return false;
    if (gatewayFilter !== 'all' && p.gateway !== gatewayFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      pending: { bg: 'bg-yellow-500 text-white', label: 'Pending' },
      success: { bg: 'bg-emerald-500 text-white', label: 'Success' },
      cancelled: { bg: 'bg-gray-500 text-white', label: 'Cancelled' },
      failed: { bg: 'bg-red-500 text-white', label: 'Failed' },
      refunded: { bg: 'bg-blue-500 text-white', label: 'Refunded' },
    };
    const info = map[status] || { bg: 'bg-muted', label: status };
    return <Badge className={info.bg}>{info.label}</Badge>;
  };

  const getGatewayLabel = (gateway: string) => {
    if (gateway === 'bkash') return 'bKash';
    if (gateway === 'sslcommerz') return 'SSLCommerz';
    return gateway;
  };

  const handleView = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" /> Payment Management
          </h1>
          <p className="text-sm text-muted-foreground">{total} total payments</p>
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Gateway" /></SelectTrigger>
              <SelectContent>
                {GATEWAY_OPTIONS.map(g => (
                  <SelectItem key={g} value={g}>{g === 'all' ? 'All Gateways' : getGatewayLabel(g)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList className="flex-wrap h-auto">
              {STATUS_TABS.map(tab => (
                <TabsTrigger key={tab} value={tab} className="text-xs">
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
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No payments found for this filter</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Gateway</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map(payment => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.txnId}</TableCell>
                            <TableCell>{payment.orderId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {payment.buyerName || 'Unknown'}
                              </div>
                            </TableCell>
                            <TableCell>৳{payment.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Smartphone className="w-3 h-3 text-muted-foreground" />
                                {getGatewayLabel(payment.gateway)}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => handleView(payment)}>
                                <Eye className="w-4 h-4" />
                              </Button>
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
      {!loading && filteredPayments.length > 0 && totalPages > 1 && (
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

      {/* View Payment Detail Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Payment ID</Label><p className="font-medium">{selectedPayment.txnId}</p></div>
                <div><Label className="text-xs text-muted-foreground">Order ID</Label><p className="font-medium">{selectedPayment.orderId}</p></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Buyer</Label>
                  <p className="font-medium flex items-center gap-1"><User className="w-3 h-3" /> {selectedPayment.buyerName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="font-medium flex items-center gap-1"><DollarSign className="w-3 h-3" /> ৳{selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Gateway</Label>
                  <p className="font-medium flex items-center gap-1"><Smartphone className="w-3 h-3" /> {getGatewayLabel(selectedPayment.gateway)}</p>
                </div>
                <div><Label className="text-xs text-muted-foreground">Transaction ID</Label><p className="font-medium">{selectedPayment.gatewayTransactionId}</p></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(selectedPayment.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
