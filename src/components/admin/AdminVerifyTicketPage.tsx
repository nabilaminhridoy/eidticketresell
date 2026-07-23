'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ScanLine, ShieldCheck, AlertTriangle, Search, Eye, CheckCircle,
  XCircle, Clock, Fingerprint, User, Flag
} from 'lucide-react';

interface VerificationResult {
  ticketId: string;
  status: 'valid' | 'invalid' | 'expired' | 'used';
  seller: string;
  buyer: string;
  route: string;
  date: string;
  price: string;
}

interface FraudReport {
  id: string;
  type: string;
  ticketId: string;
  reporter: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  reportedAt: string;
}

export default function AdminVerifyTicketPage({ section }: { section?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const currentSection = section || null;

  const mockFraudReports: FraudReport[] = [
    { id: '1', type: 'Duplicate Ticket', ticketId: 'ETR-000042', reporter: 'buyer_karim', description: 'Same ticket sold to multiple buyers', status: 'open', reportedAt: '2024-01-15' },
    { id: '2', type: 'Fake Ticket', ticketId: 'ETR-000035', reporter: 'buyer_rahim', description: 'Ticket details do not match actual ticket', status: 'investigating', reportedAt: '2024-01-14' },
    { id: '3', type: 'Price Manipulation', ticketId: 'ETR-000050', reporter: 'admin', description: 'Seller selling ticket above face value + allowed margin', status: 'resolved', reportedAt: '2024-01-10' },
    { id: '4', type: 'Unauthorized Resale', ticketId: 'ETR-000028', reporter: 'transport_operator', description: 'Ticket resale not authorized by operator', status: 'dismissed', reportedAt: '2024-01-05' },
  ];

  const handleVerify = () => {
    if (searchQuery) {
      setVerificationResult({
        ticketId: searchQuery,
        status: searchQuery.toUpperCase().startsWith('ETR') ? 'valid' : 'invalid',
        seller: 'seller_user',
        buyer: 'buyer_user',
        route: 'Dhaka → Chittagong',
        date: '2024-01-20',
        price: '৳850',
      });
    }
  };

  // Fraud reports section
  if (currentSection === 'fraud-reports') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="w-6 h-6" />Fraud Reports</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Ticket</TableHead><TableHead className="hidden md:table-cell">Reporter</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Description</TableHead><TableHead className="hidden md:table-cell">Reported</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockFraudReports.map(report => (
                  <TableRow key={report.id}>
                    <TableCell><Badge variant="outline">{report.type}</Badge></TableCell>
                    <TableCell className="font-medium">{report.ticketId}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{report.reporter}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'open' ? 'destructive' : report.status === 'investigating' ? 'secondary' : report.status === 'resolved' ? 'default' : 'outline'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{report.description}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{report.reportedAt}</TableCell>
                    <TableCell><Button variant="outline" size="sm">Review</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default - Ticket Verification
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ScanLine className="w-6 h-6" />Ticket Verification</h1>

      <Tabs defaultValue="verify">
        <TabsList>
          <TabsTrigger value="verify">Verify Ticket</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Search className="w-5 h-5" />Quick Verification</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-3">
                <Input placeholder="Enter ticket ID (e.g., ETR-000042)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1" />
                <Button onClick={handleVerify} className="gap-1"><ScanLine className="w-4 h-4" />Verify</Button>
              </div>

              {verificationResult && (
                <Card className={verificationResult.status === 'valid' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      {verificationResult.status === 'valid' ? (
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{verificationResult.ticketId}</h3>
                        <Badge variant={verificationResult.status === 'valid' ? 'default' : 'destructive'}>{verificationResult.status}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div><p className="text-xs text-muted-foreground">Route</p><p className="font-medium">{verificationResult.route}</p></div>
                      <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{verificationResult.date}</p></div>
                      <div><p className="text-xs text-muted-foreground">Price</p><p className="font-medium">{verificationResult.price}</p></div>
                      <div><p className="text-xs text-muted-foreground">Seller</p><p className="font-medium">{verificationResult.seller}</p></div>
                      <div><p className="text-xs text-muted-foreground">Buyer</p><p className="font-medium">{verificationResult.buyer}</p></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Open Fraud Reports</h3>
                <Badge variant="destructive">{mockFraudReports.filter(r => r.status === 'open').length} open</Badge>
              </div>
              <div className="space-y-3">
                {mockFraudReports.filter(r => r.status === 'open' || r.status === 'investigating').map(report => (
                  <div key={report.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{report.type} - {report.ticketId}</p>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                    </div>
                    <Badge variant={report.status === 'open' ? 'destructive' : 'secondary'}>{report.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
