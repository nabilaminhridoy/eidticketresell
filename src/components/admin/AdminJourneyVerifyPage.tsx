'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  ClipboardCheck, Clock, CheckCircle, XCircle, MapPin, Camera, Video,
  Search, Eye, RefreshCw, AlertTriangle, ShieldCheck, Timer, ArrowRight
} from 'lucide-react';

interface JourneyVerification {
  id: string;
  orderId: string;
  buyerId: string;
  photo: string | null;
  video: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
  status: string;
  submittedAt: string | null;
  verifiedAt: string | null;
  escrowReleaseTime: string | null;
  hoursUntilRelease: number | null;
  buyer: { id: string; name: string; username: string; avatar: string | null; phone: string | null };
  order: {
    id: string; orderId: string; status: string; deliveryMethod: string;
    buyer: { id: string; name: string; username: string; avatar: string | null };
    seller: { id: string; name: string; username: string; avatar: string | null };
    ticket: { ticketId: string; transportType: string; routeFrom: string; routeTo: string; departureDate: string; price: number };
  };
}

export default function AdminJourneyVerifyPage() {
  const [verifications, setVerifications] = useState<JourneyVerification[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, submitted: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submitted');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<JourneyVerification | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, [activeTab]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('etr_admin_token');
      const res = await fetch(`/api/admin/journey-verifications?status=${activeTab}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVerifications(data.verifications || []);
        setStats(data.stats || { total: 0, pending: 0, submitted: 0, verified: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Fetch journey verifications error:', err);
      // Mock data fallback
      setVerifications([]);
      setStats({ total: 3, pending: 1, submitted: 1, verified: 1, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (verificationId: string, action: 'approve' | 'reject') => {
    setActionLoading(verificationId);
    try {
      const token = localStorage.getItem('etr_admin_token');
      const res = await fetch('/api/orders/journey-verify', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, action }),
      });
      if (res.ok) {
        await fetchVerifications();
        setSelectedVerification(null);
      }
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVerifications = verifications.filter(v =>
    !searchQuery || v.order?.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.buyer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.order?.ticket?.routeFrom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.order?.ticket?.routeTo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journey Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Online Copy buyer journey verifications. Escrow releases automatically after 12 hours.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchVerifications}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><ClipboardCheck className="w-3 h-3" />Submitted</div>
          <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="w-3 h-3" />Verified</div>
          <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </Card>
      </div>

      {/* Platform Fee Info */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm">Online Copy Verification Process</h3>
            <div className="text-xs text-muted-foreground mt-1 space-y-1">
              <p>• Buyer must upload <strong>photo + video</strong> of journey with <strong>GPS ON</strong>, on journey date</p>
              <p>• After submission, <strong>escrow held for 12 hours</strong> before automatic release to seller</p>
              <p>• Admin can <strong>approve early</strong> to release escrow immediately, or <strong>reject</strong> if verification fails</p>
              <p>• Platform fee: <strong className="text-primary">2%</strong> deducted from seller&apos;s share for Online Copy tickets</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs & Search */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <div className="flex-1">
            <Input
              placeholder="Search by order ID, buyer, or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredVerifications.length === 0 ? (
            <Card className="p-8 text-center">
              <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No journey verifications found for this filter.</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>GPS</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Escrow Release</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVerifications.map((v) => (
                      <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedVerification(v)}>
                        <TableCell className="font-medium">{v.order?.orderId || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              {v.buyer?.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm">{v.buyer?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <span>{v.order?.ticket?.routeFrom || '?'}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span>{v.order?.ticket?.routeTo || '?'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {v.gpsLat && v.gpsLng ? (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1 text-green-500" />
                              {v.gpsLat.toFixed(4)}, {v.gpsLng.toFixed(4)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No GPS</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadgeColor(v.status)}>{v.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {v.hoursUntilRelease !== null && v.hoursUntilRelease > 0 ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Timer className="w-3 h-3 text-orange-500" />
                              <span className="text-orange-600 font-medium">{v.hoursUntilRelease}h left</span>
                            </div>
                          ) : v.status === 'verified' ? (
                            <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Released</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {v.status === 'submitted' ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="default" className="h-7 text-xs"
                                disabled={actionLoading === v.id}
                                onClick={(e) => { e.stopPropagation(); handleAction(v.id, 'approve'); }}>
                                <CheckCircle className="w-3 h-3 mr-1" />Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs"
                                disabled={actionLoading === v.id}
                                onClick={(e) => { e.stopPropagation(); handleAction(v.id, 'reject'); }}>
                                <XCircle className="w-3 h-3 mr-1" />Reject
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={(e) => { e.stopPropagation(); setSelectedVerification(v); }}>
                              <Eye className="w-3 h-3 mr-1" />View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      {selectedVerification && (
        <Card className="mt-4 border-2 border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Verification Details — {selectedVerification.order?.orderId}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedVerification(null)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Buyer</div>
                <div className="font-medium">{selectedVerification.buyer?.name}</div>
                <div className="text-xs text-muted-foreground">{selectedVerification.buyer?.phone || 'No phone'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Seller</div>
                <div className="font-medium">{selectedVerification.order?.seller?.name || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Route</div>
                <div className="font-medium">{selectedVerification.order?.ticket?.routeFrom} → {selectedVerification.order?.ticket?.routeTo}</div>
                <div className="text-xs text-muted-foreground">{selectedVerification.order?.ticket?.departureDate}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="font-medium">৳{selectedVerification.order?.ticket?.price}</div>
                <div className="text-xs text-muted-foreground">2% fee = ৳{Math.round(selectedVerification.order?.ticket?.price * 0.02)}</div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-green-500" />GPS Location
                </div>
                {selectedVerification.gpsLat && selectedVerification.gpsLng ? (
                  <div className="text-sm font-medium">
                    {selectedVerification.gpsLat.toFixed(6)}, {selectedVerification.gpsLng.toFixed(6)}
                  </div>
                ) : (
                  <div className="text-sm text-red-500">Not provided</div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Camera className="w-3 h-3" />Photo
                </div>
                {selectedVerification.photo ? (
                  <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Uploaded</Badge>
                ) : (
                  <Badge variant="outline">Not uploaded</Badge>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Video className="w-3 h-3" />Video
                </div>
                {selectedVerification.video ? (
                  <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Uploaded</Badge>
                ) : (
                  <Badge variant="outline">Not uploaded</Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Badge className={statusBadgeColor(selectedVerification.status)}>
                  {selectedVerification.status.toUpperCase()}
                </Badge>
                {selectedVerification.submittedAt && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Submitted: {new Date(selectedVerification.submittedAt).toLocaleString()}
                  </span>
                )}
              </div>
              {selectedVerification.status === 'submitted' && (
                <div className="flex gap-2">
                  <Button onClick={() => handleAction(selectedVerification.id, 'approve')} disabled={actionLoading === selectedVerification.id}>
                    <CheckCircle className="w-4 h-4 mr-1" />Approve & Release Escrow
                  </Button>
                  <Button variant="destructive" onClick={() => handleAction(selectedVerification.id, 'reject')} disabled={actionLoading === selectedVerification.id}>
                    <XCircle className="w-4 h-4 mr-1" />Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
