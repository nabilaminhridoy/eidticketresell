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
import { Separator } from '@/components/ui/separator';
import {
  ShoppingBag, Eye, ChevronLeft, ChevronRight, Loader2,
  DollarSign, User, Truck, ShieldCheck, QrCode, MapPin, CheckCircle, AlertCircle
} from 'lucide-react';

interface OrderRecord {
  id: string;
  orderId: string;
  ticketId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  escrowStatus: string;
  paymentStatus: string;
  deliveryMethod: string;
  deliveryStatus: string;
  qrCode: string | null;
  isQrScanned: boolean;
  status: string;
  createdAt: string;
  buyer?: { id: string; name: string; username: string };
  seller?: { id: string; name: string; username: string };
  ticket?: { id: string; ticketId: string; transportType: string; routeFrom: string; routeTo: string };
  journeyVerification?: { status: string; submittedAt: string | null } | null;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const STATUS_TABS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusTab !== 'all') params.set('status', statusTab);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/admin/orders?${params.toString()}`, { headers: getAuthHeaders() })
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (d.error) {
          setError(d.error);
          setOrders([]);
        } else {
          setError(null);
          setOrders(d.orders || []);
          setTotalPages(d.pagination?.totalPages || 1);
          setTotal(d.pagination?.total || 0);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch orders');
        setOrders([]);
        setTotalPages(1);
        setTotal(0);
        setLoading(false);
      });
  }, [statusTab, search, page]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      pending: { bg: 'bg-yellow-500 text-white', label: 'Pending' },
      confirmed: { bg: 'bg-blue-500 text-white', label: 'Confirmed' },
      in_progress: { bg: 'bg-indigo-500 text-white', label: 'In Progress' },
      completed: { bg: 'bg-emerald-500 text-white', label: 'Completed' },
      cancelled: { bg: 'bg-red-500 text-white', label: 'Cancelled' },
      disputed: { bg: 'bg-orange text-white', label: 'Disputed' },
    };
    const info = map[status] || { bg: 'bg-muted', label: status };
    return <Badge className={info.bg}>{info.label}</Badge>;
  };

  const getEscrowBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      held: { bg: 'bg-yellow-500 text-white', label: 'Held' },
      released: { bg: 'bg-emerald-500 text-white', label: 'Released' },
      refunded: { bg: 'bg-red-500 text-white', label: 'Refunded' },
    };
    const info = map[status] || { bg: 'bg-muted', label: status };
    return <Badge className={info.bg}>{info.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      pending: { bg: 'bg-yellow-500 text-white', label: 'Pending' },
      paid: { bg: 'bg-emerald-500 text-white', label: 'Paid' },
      failed: { bg: 'bg-red-500 text-white', label: 'Failed' },
      refunded: { bg: 'bg-blue-500 text-white', label: 'Refunded' },
    };
    const info = map[status] || { bg: 'bg-muted', label: status };
    return <Badge className={info.bg}>{info.label}</Badge>;
  };

  const getDeliveryLabel = (method: string) => {
    const labels: Record<string, string> = { online_pdf: 'Online PDF', in_person: 'In Person', courier: 'Courier' };
    return labels[method] || method;
  };

  const handleView = (order: OrderRecord) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Order Management
          </h1>
          <p className="text-sm text-muted-foreground">{total} total orders</p>
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
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList className="flex-wrap h-auto">
              {STATUS_TABS.map(tab => (
                <TabsTrigger key={tab} value={tab} className="text-xs">
                  {tab === 'all' ? 'All' : tab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </TabsTrigger>
              ))}
            </TabsList>

            {STATUS_TABS.map(tab => (
              <TabsContent key={tab} value={tab}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No orders found for this filter</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead className="hidden md:table-cell">Seller</TableHead>
                          <TableHead className="hidden lg:table-cell">Ticket</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="hidden sm:table-cell">Escrow</TableHead>
                          <TableHead className="hidden md:table-cell">Payment</TableHead>
                          <TableHead className="hidden lg:table-cell">Delivery</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.orderId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {order.buyer?.name || 'Unknown'}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {order.seller?.name || 'Unknown'}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {order.ticket?.ticketId || 'N/A'}
                            </TableCell>
                            <TableCell>৳{order.totalAmount.toLocaleString()}</TableCell>
                            <TableCell className="hidden sm:table-cell">{getEscrowBadge(order.escrowStatus)}</TableCell>
                            <TableCell className="hidden md:table-cell">{getPaymentBadge(order.paymentStatus)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{getDeliveryLabel(order.deliveryMethod)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => handleView(order)}>
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
      {!loading && orders.length > 0 && totalPages > 1 && (
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

      {/* View Order Detail Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Order ID</Label><p className="font-medium">{selectedOrder.orderId}</p></div>
                <div><Label className="text-xs text-muted-foreground">Ticket ID</Label><p className="font-medium">{selectedOrder.ticket?.ticketId || selectedOrder.ticketId}</p></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Buyer</Label>
                  <p className="font-medium flex items-center gap-1"><User className="w-3 h-3" /> {selectedOrder.buyer?.name || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Seller</Label>
                  <p className="font-medium flex items-center gap-1"><User className="w-3 h-3" /> {selectedOrder.seller?.name || 'Unknown'}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-muted-foreground" /><Label className="text-xs text-muted-foreground">Amount</Label><p className="font-medium ml-1">৳{selectedOrder.amount}</p></div>
                <div><Label className="text-xs text-muted-foreground">Platform Fee</Label><p className="font-medium">৳{selectedOrder.platformFee}</p></div>
                <div><Label className="text-xs text-muted-foreground">Total</Label><p className="font-medium">৳{selectedOrder.totalAmount}</p></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Escrow Status</Label>
                  <div className="mt-1">{getEscrowBadge(selectedOrder.escrowStatus)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Status</Label>
                  <div className="mt-1">{getPaymentBadge(selectedOrder.paymentStatus)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Delivery Method</Label>
                  <p className="font-medium flex items-center gap-1"><Truck className="w-3 h-3" /> {getDeliveryLabel(selectedOrder.deliveryMethod)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Delivery Status</Label>
                  <p className="font-medium capitalize">{selectedOrder.deliveryStatus}</p>
                </div>
              </div>
              <Separator />
              {/* QR Code Section */}
              {selectedOrder.qrCode && (
                <div>
                  <Label className="text-xs text-muted-foreground">QR Code</Label>
                  <div className="mt-2 p-4 bg-muted/50 rounded-lg flex flex-col items-center">
                    <QrCode className="w-16 h-16 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">{selectedOrder.qrCode}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {selectedOrder.isQrScanned
                        ? <Badge className="bg-emerald-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Scanned</Badge>
                        : <Badge className="bg-yellow-500 text-white">Not Scanned</Badge>
                      }
                    </div>
                  </div>
                </div>
              )}
              <Separator />
              {/* Journey Verification */}
              <div>
                <Label className="text-xs text-muted-foreground">Journey Verification</Label>
                <div className="mt-1">
                  {selectedOrder.journeyVerification
                    ? <Badge className={
                        selectedOrder.journeyVerification.status === 'verified' ? 'bg-emerald-500 text-white' :
                        selectedOrder.journeyVerification.status === 'submitted' ? 'bg-blue-500 text-white' :
                        'bg-yellow-500 text-white'
                      }>
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {selectedOrder.journeyVerification.status.charAt(0).toUpperCase() + selectedOrder.journeyVerification.status.slice(1)}
                    </Badge>
                    : <Badge variant="outline">Not Submitted</Badge>
                  }
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Order Status</Label>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(selectedOrder.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
