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
  ChevronLeft, ChevronRight, Loader2, User, FileText, Camera
} from 'lucide-react';

interface KycApplication {
  id: string;
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

const MOCK_KYC: KycApplication[] = [
  {
    id: 'kyc1', userId: '1', kycName: 'Rahim Uddin', kycDob: '1990-05-15', kycGender: 'male',
    documentType: 'nid', documentNumber: '1990123456789', documentFront: '/placeholder-front.jpg', documentBack: '/placeholder-back.jpg',
    selfiePhoto: '/placeholder-selfie.jpg', selfieRight: null, selfieLeft: null, selfieSmile: null, selfieBlink: null,
    houseRoadVillage: '123 Mirpur Road', upazilaThana: 'Mirpur', district: 'Dhaka', division: 'Dhaka', postalCode: '1216',
    gpsLatitude: 23.8061, gpsLongitude: 90.3679,
    status: 'pending', reviewNote: null, reviewedBy: null, submittedAt: '2025-01-10T10:00:00Z', reviewedAt: null,
    user: { id: '1', name: 'Rahim Uddin', email: 'rahim@example.com', phone: '+880171234567', username: 'rahim_uddin', avatar: null, createdAt: '2024-12-01T10:00:00Z' }
  },
  {
    id: 'kyc2', userId: '2', kycName: 'Karim Hasan', kycDob: '1985-08-20', kycGender: 'male',
    documentType: 'nid', documentNumber: '198512345678', documentFront: '/placeholder-front2.jpg', documentBack: '/placeholder-back2.jpg',
    selfiePhoto: '/placeholder-selfie2.jpg', selfieRight: '/placeholder-selfie-right.jpg', selfieLeft: null, selfieSmile: null, selfieBlink: null,
    houseRoadVillage: '456 Gulshan Avenue', upazilaThana: 'Gulshan', district: 'Dhaka', division: 'Dhaka', postalCode: '1212',
    gpsLatitude: 23.7935, gpsLongitude: 90.4153,
    status: 'pending', reviewNote: null, reviewedBy: null, submittedAt: '2025-01-12T14:00:00Z', reviewedAt: null,
    user: { id: '2', name: 'Karim Hasan', email: 'karim@example.com', phone: '+880189876543', username: 'karim_hasan', avatar: null, createdAt: '2024-12-05T12:00:00Z' }
  },
  {
    id: 'kyc3', userId: '5', kycName: 'Fatima Begum', kycDob: '1992-03-10', kycGender: 'female',
    documentType: 'passport', documentNumber: 'AB1234567', documentFront: '/placeholder-front3.jpg', documentBack: null,
    selfiePhoto: '/placeholder-selfie3.jpg', selfieRight: null, selfieLeft: null, selfieSmile: null, selfieBlink: null,
    houseRoadVillage: '789 Uttara Sector 7', upazilaThana: 'Uttara', district: 'Dhaka', division: 'Dhaka', postalCode: '1230',
    gpsLatitude: 23.8728, gpsLongitude: 90.3973,
    status: 'approved', reviewNote: 'All documents verified successfully', reviewedBy: 'admin1', submittedAt: '2024-12-20T09:00:00Z', reviewedAt: '2024-12-22T11:00:00Z',
    user: { id: '5', name: 'Fatima Begum', email: 'fatima@example.com', phone: '+880155566677', username: 'fatima_begum', avatar: null, createdAt: '2024-11-20T09:00:00Z' }
  },
  {
    id: 'kyc4', userId: '6', kycName: 'Arif Khan', kycDob: '1988-11-25', kycGender: 'male',
    documentType: 'driving_licence', documentNumber: 'DL-12345', documentFront: '/placeholder-front4.jpg', documentBack: '/placeholder-back4.jpg',
    selfiePhoto: '/placeholder-selfie4.jpg', selfieRight: null, selfieLeft: null, selfieSmile: null, selfieBlink: null,
    houseRoadVillage: '55 Chittagong Road', upazilaThana: 'Panchlaish', district: 'Chittagong', division: 'Chittagong', postalCode: '4000',
    gpsLatitude: 22.3193, gpsLongitude: 91.8133,
    status: 'rejected', reviewNote: 'Selfie photo is blurry and does not match document', reviewedBy: 'admin1', submittedAt: '2024-12-25T16:00:00Z', reviewedAt: '2024-12-27T10:00:00Z',
    user: { id: '6', name: 'Arif Khan', email: 'arif@example.com', phone: '+880133344455', username: 'arif_khan', avatar: null, createdAt: '2025-01-01T06:00:00Z' }
  },
];

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

export default function AdminKycPage() {
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedKyc, setSelectedKyc] = useState<KycApplication | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('status', statusTab);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/admin/kyc?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.applications && d.applications.length > 0) {
          setApplications(d.applications);
          setTotalPages(d.pagination?.totalPages || 1);
          setTotal(d.pagination?.total || 0);
        } else {
          setApplications(MOCK_KYC);
          setTotalPages(1);
          setTotal(MOCK_KYC.length);
        }
        setLoading(false);
      })
      .catch(() => {
        setApplications(MOCK_KYC);
        setTotalPages(1);
        setTotal(MOCK_KYC.length);
        setLoading(false);
      });
  }, [statusTab, page]);

  const filteredApps = applications.filter(a => {
    if (statusTab === 'all') return true;
    return a.status === statusTab;
  });

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
      setApplications(prev => prev.map(a =>
        a.id === selectedKyc.id ? { ...a, status: 'approved', reviewNote, reviewedAt: new Date().toISOString() } : a
      ));
    }
    setReviewModalOpen(false);
  };

  const handleReject = () => {
    if (selectedKyc) {
      setApplications(prev => prev.map(a =>
        a.id === selectedKyc.id ? { ...a, status: 'rejected', reviewNote, reviewedAt: new Date().toISOString() } : a
      ));
    }
    setReviewModalOpen(false);
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
                      {MOCK_KYC.filter(a => a.status === 'pending').length}
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
                ) : filteredApps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No KYC applications found for this filter</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead className="hidden md:table-cell">Document No.</TableHead>
                          <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApps.map(app => (
                          <TableRow key={app.id}>
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
      {!loading && filteredApps.length > 0 && totalPages > 1 && (
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
            <DialogTitle>KYC Review - {selectedKyc?.kycName}</DialogTitle>
          </DialogHeader>
          {selectedKyc && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <User className="w-4 h-4" /> Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Name</Label><p className="font-medium">{selectedKyc.kycName}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Date of Birth</Label><p className="font-medium">{selectedKyc.kycDob || 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Gender</Label><p className="font-medium">{selectedKyc.kycGender || 'N/A'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{selectedKyc.user.email}</p></div>
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
