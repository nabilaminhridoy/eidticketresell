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
  ShieldCheck, Eye, CheckCircle, XCircle, MapPin, Calendar,
  ChevronLeft, ChevronRight, Loader2, User, FileText, Camera, AlertCircle
} from 'lucide-react';

interface KycApplication {
  id: string;
  kycId: string;
  userId: string;
  kycName: string;
  kycDob: string | null;
  kycGender: string | null;
  documentType: string;
  documentNumber: string;
  documentFront: string;
  documentBack: string | null;
  selfiePhoto: string;
  selfieRight: string | null;
  selfieLeft: string | null;
  selfieSmile: string | null;
  selfieBlink: string | null;
  houseRoadVillage: string | null;
  upazilaThana: string | null;
  district: string | null;
  division: string | null;
  postalCode: string | null;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  status: string;
  reviewNote: string | null;
  reviewedBy: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    username: string;
    avatar: string | null;
    createdAt: string;
  };
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminKycPage() {
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedKyc, setSelectedKyc] = useState<KycApplication | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('status', statusTab);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/admin/kyc?${params.toString()}`, { headers: getAuthHeaders() })
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (d.error) {
          setError(d.error);
          setApplications([]);
        } else {
          setError(null);
          setApplications(d.applications || []);
          setTotalPages(d.pagination?.totalPages || 1);
          setTotal(d.pagination?.total || 0);
          // Calculate pending count from data
          if (statusTab === 'pending') {
            setPendingCount(d.pagination?.total || (d.applications || []).length);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch KYC applications');
        setApplications([]);
        setTotalPages(1);
        setTotal(0);
        setLoading(false);
      });
  }, [statusTab, page]);

  // Fetch pending count separately when on non-pending tab
  useEffect(() => {
    if (statusTab !== 'pending') {
      fetch(`/api/admin/kyc?status=pending&limit=1`, { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(d => {
          setPendingCount(d.pagination?.total || 0);
        })
        .catch(() => {});
    }
  }, [statusTab]);

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-emerald-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = { nid: 'NID', driving_licence: 'Driving Licence', passport: 'Passport' };
    return labels[type] || type;
  };

  const handleReview = (kyc: KycApplication) => {
    setSelectedKyc(kyc);
    setReviewNote('');
    setReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedKyc) {
      // Call API to approve
      fetch(`/api/admin/kyc?id=${selectedKyc.id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', reviewNote }),
      })
        .then(r => r.json())
        .then(d => {
          if (!d.error) {
            setApplications(prev => prev.map(a =>
              a.id === selectedKyc.id ? { ...a, status: 'approved', reviewNote, reviewedAt: new Date().toISOString() } : a
            ));
          }
          setReviewModalOpen(false);
        })
        .catch(() => setReviewModalOpen(false));
    }
  };

  const handleReject = () => {
    if (selectedKyc) {
      // Call API to reject
      fetch(`/api/admin/kyc?id=${selectedKyc.id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reviewNote }),
      })
        .then(r => r.json())
        .then(d => {
          if (!d.error) {
            setApplications(prev => prev.map(a =>
              a.id === selectedKyc.id ? { ...a, status: 'rejected', reviewNote, reviewedAt: new Date().toISOString() } : a
            ));
          }
          setReviewModalOpen(false);
        })
        .catch(() => setReviewModalOpen(false));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> KYC Verification
          </h1>
          <p className="text-sm text-muted-foreground">{total} total applications</p>
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

      {/* Tabs + Table */}
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
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No KYC applications found for this filter</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead className="hidden md:table-cell">Document No.</TableHead>
                          <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map(app => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.kycId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{app.kycName}</p>
                                  <p className="text-xs text-muted-foreground">{app.user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getDocTypeLabel(app.documentType)}</TableCell>
                            <TableCell className="hidden md:table-cell">{app.documentNumber}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {new Date(app.submittedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => handleReview(app)} title="Review">
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
      {!loading && applications.length > 0 && totalPages > 1 && (
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

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Review - {selectedKyc?.kycId} ({selectedKyc?.kycName})</DialogTitle>
          </DialogHeader>
          {selectedKyc && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <User className="w-4 h-4" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">KYC ID</Label><p className="font-medium">{selectedKyc.kycId}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Name</Label><p className="font-medium">{selectedKyc.kycName}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Date of Birth</Label><p className="font-medium">{selectedKyc.kycDob || 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Gender</Label><p className="font-medium">{selectedKyc.kycGender || 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{selectedKyc.user.email}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="font-medium">{selectedKyc.user.phone || 'N/A'}</p></div>
                </div>
              </div>

              <Separator />

              {/* Document Info */}
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Document Information
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div><Label className="text-xs text-muted-foreground">Document Type</Label><p className="font-medium">{getDocTypeLabel(selectedKyc.documentType)}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Document Number</Label><p className="font-medium">{selectedKyc.documentNumber}</p></div>
                </div>
                {/* Document Images placeholder */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Front Side</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to view full image</p>
                  </div>
                  {selectedKyc.documentBack && (
                    <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Back Side</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to view full image</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Selfie */}
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <Camera className="w-4 h-4" /> Selfie Captures
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Selfie Photo', key: selectedKyc.selfiePhoto },
                    { label: 'Right View', key: selectedKyc.selfieRight },
                    { label: 'Left View', key: selectedKyc.selfieLeft },
                    { label: 'Smile', key: selectedKyc.selfieSmile },
                  ].filter(item => item.key).map(item => (
                    <div key={item.label} className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center">
                      <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Address + GPS */}
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Address & GPS
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">House/Road/Village</Label><p className="font-medium">{selectedKyc.houseRoadVillage || 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Upazila/Thana</Label><p className="font-medium">{selectedKyc.upazilaThana || 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">District</Label><p className="font-medium">{selectedKyc.district || 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Division</Label><p className="font-medium">{selectedKyc.division || 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Postal Code</Label><p className="font-medium">{selectedKyc.postalCode || 'N/A'}</p></div>
                  <div>
                    <Label className="text-xs text-muted-foreground">GPS Location</Label>
                    <p className="font-medium">
                      {selectedKyc.gpsLatitude && selectedKyc.gpsLongitude
                        ? `${selectedKyc.gpsLatitude.toFixed(4)}, ${selectedKyc.gpsLongitude.toFixed(4)}`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Review Section */}
              <div>
                <h3 className="font-semibold text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" /> Review Decision
                </h3>
                {selectedKyc.status !== 'pending' && (
                  <div className="mb-3 p-3 rounded-lg bg-muted/30">
                    <p className="text-sm">
                      <strong>Current Status:</strong> {getStatusBadge(selectedKyc.status)}
                    </p>
                    {selectedKyc.reviewNote && (
                      <p className="text-sm mt-1"><strong>Note:</strong> {selectedKyc.reviewNote}</p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Review Notes</Label>
                  <Input
                    placeholder="Enter review notes..."
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
            {selectedKyc?.status === 'pending' && (
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
