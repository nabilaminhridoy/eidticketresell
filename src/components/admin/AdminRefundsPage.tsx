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
  RefreshCw, AlertTriangle, Eye, ChevronLeft, ChevronRight,
  Loader2, User, DollarSign, MessageSquare, Shield, CheckCircle, XCircle
} from 'lucide-react';

interface RefundRecord {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface DisputeRecord {
  id: string;
  orderId: string;
  initiatedBy: string;
  initiatorName: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

const REFUND_STATUS_TABS = ['all', 'pending', 'processing', 'completed', 'rejected'];
const DISPUTE_STATUS_TABS = ['all', 'open', 'investigating', 'resolved', 'closed'];

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminRefundsPage() {
  const [activeTab, setActiveTab] = useState('refunds');
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [refundStatusTab, setRefundStatusTab] = useState('all');
  const [disputeStatusTab, setDisputeStatusTab] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<RefundRecord | DisputeRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/refunds', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.refunds) setRefunds(d.refunds); setLoading(false); })
      .catch(() => { setError('Failed to load refunds'); setLoading(false); });

    fetch('/api/admin/disputes', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => { if (d.disputes) setDisputes(d.disputes); })
      .catch(() => {});
  }, []);

  const filteredRefunds = refunds.filter(r => refundStatusTab === 'all' || r.status === refundStatusTab);
  const filteredDisputes = disputes.filter(d => disputeStatusTab === 'all' || d.status === disputeStatusTab);

  const getRefundStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      pending: { bg: 'bg-yellow-500 text-white', label: 'Pending' },
      processing: { bg: 'bg-blue-500 text-white', label: 'Processing' },
      completed: { bg: 'bg-emerald-500 text-white', label: 'Completed' },
      rejected: { bg: 'bg-red-500 text-white', label: 'Rejected' },
    };
    const info = map[status] || { bg: 'bg-muted', label: status };
    return <Badge className={info.bg}>{info.label}</Badge>;
  };

  const getDisputeStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      open: { bg: 'bg-red-500 text-white', label: 'Open' },
      investigating: { bg: 'bg-yellow-500 text-white', label: 'Investigating' },
      resolved: { bg: 'bg-emerald-500 text-white', label: 'Resolved' },
      closed: { bg: 'bg-gray-500 text-white', label: 'Closed' },
    };
    const info = map[status] || { bg: 'bg-muted', label: status };
    return <Badge className={info.bg}>{info.label}</Badge>;
  };

  const handleViewRefund = (refund: RefundRecord) => {
    setSelectedItem(refund);
    setViewModalOpen(true);
  };

  const handleViewDispute = (dispute: DisputeRecord) => {
    setSelectedItem(dispute);
    setViewModalOpen(true);
  };

  const isRefund = (item: RefundRecord | DisputeRecord): item is RefundRecord => {
    return 'buyerName' in item;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {activeTab === 'refunds' ? <RefreshCw className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            Refunds & Disputes
          </h1>
          <p className="text-sm text-muted-foreground">Manage refunds and dispute resolutions</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <Card>
        <CardContent className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="refunds" className="gap-1">
                <RefreshCw className="w-3 h-3" /> Refunds ({refunds.length})
              </TabsTrigger>
              <TabsTrigger value="disputes" className="gap-1">
                <AlertTriangle className="w-3 h-3" /> Disputes ({disputes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="refunds">
              <Tabs value={refundStatusTab} onValueChange={setRefundStatusTab}>
                <TabsList className="flex-wrap h-auto">
                  {REFUND_STATUS_TABS.map(tab => (
                    <TabsTrigger key={tab} value={tab} className="text-xs">
                      {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {loading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : filteredRefunds.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No refunds found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead className="hidden md:table-cell">Seller</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="hidden sm:table-cell">Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRefunds.map(refund => (
                          <TableRow key={refund.id}>
                            <TableCell className="font-medium">REF-{refund.id.slice(-6)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1"><User className="w-3 h-3 text-muted-foreground" />{refund.buyerName}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1"><User className="w-3 h-3 text-muted-foreground" />{refund.sellerName}</div>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />৳{refund.amount}</span>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <p className="text-xs truncate max-w-[200px]">{refund.reason}</p>
                            </TableCell>
                            <TableCell>{getRefundStatusBadge(refund.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => handleViewRefund(refund)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Tabs>
            </TabsContent>

            <TabsContent value="disputes">
              <Tabs value={disputeStatusTab} onValueChange={setDisputeStatusTab}>
                <TabsList className="flex-wrap h-auto">
                  {DISPUTE_STATUS_TABS.map(tab => (
                    <TabsTrigger key={tab} value={tab} className="text-xs">
                      {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {filteredDisputes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No disputes found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Initiator</TableHead>
                          <TableHead className="hidden sm:table-cell">Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden md:table-cell">Resolution</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDisputes.map(dispute => (
                          <TableRow key={dispute.id}>
                            <TableCell className="font-medium">DSP-{dispute.id.slice(-6)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {dispute.initiatorName}
                                <Badge variant="outline" className="text-xs ml-1">{dispute.initiatedBy}</Badge>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <p className="text-xs truncate max-w-[200px]">{dispute.reason}</p>
                            </TableCell>
                            <TableCell>{getDisputeStatusBadge(dispute.status)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <p className="text-xs truncate max-w-[150px]">{dispute.resolution || 'Pending'}</p>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => handleViewDispute(dispute)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page} of 1</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* View Detail Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedItem && isRefund(selectedItem) ? 'Refund Details' : 'Dispute Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && isRefund(selectedItem) && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Refund ID</Label><p className="font-medium">REF-{selectedItem.id.slice(-6)}</p></div>
                <div><Label className="text-xs text-muted-foreground">Order</Label><p className="font-medium">{selectedItem.orderId}</p></div>
                <div><Label className="text-xs text-muted-foreground">Buyer</Label><p className="font-medium">{selectedItem.buyerName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Seller</Label><p className="font-medium">{selectedItem.sellerName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Amount</Label><p className="font-semibold">৳{selectedItem.amount}</p></div>
                <div><Label className="text-xs text-muted-foreground">Status</Label><div>{getRefundStatusBadge(selectedItem.status)}</div></div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <p className="text-sm mt-1">{selectedItem.reason}</p>
              </div>
              <div><Label className="text-xs text-muted-foreground">Created</Label><p className="text-sm">{new Date(selectedItem.createdAt).toLocaleString()}</p></div>
            </div>
          )}
          {selectedItem && !isRefund(selectedItem) && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Dispute ID</Label><p className="font-medium">DSP-{selectedItem.id.slice(-6)}</p></div>
                <div><Label className="text-xs text-muted-foreground">Order</Label><p className="font-medium">{selectedItem.orderId}</p></div>
                <div><Label className="text-xs text-muted-foreground">Initiator</Label><p className="font-medium">{selectedItem.initiatorName} ({selectedItem.initiatedBy})</p></div>
                <div><Label className="text-xs text-muted-foreground">Status</Label><div>{getDisputeStatusBadge(selectedItem.status)}</div></div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Reason</Label>
                <p className="text-sm mt-1">{selectedItem.reason}</p>
              </div>
              {selectedItem.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{selectedItem.description}</p>
                </div>
              )}
              <Separator />
              {selectedItem.resolution && (
                <div>
                  <Label className="text-xs text-muted-foreground">Resolution</Label>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    {selectedItem.status === 'resolved' || selectedItem.status === 'closed'
                      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : <XCircle className="w-4 h-4 text-red-500" />
                    }
                    {selectedItem.resolution}
                  </p>
                </div>
              )}
              <div><Label className="text-xs text-muted-foreground">Created</Label><p className="text-sm">{new Date(selectedItem.createdAt).toLocaleString()}</p></div>
              <div><Label className="text-xs text-muted-foreground">Last Updated</Label><p className="text-sm">{new Date(selectedItem.updatedAt).toLocaleString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
