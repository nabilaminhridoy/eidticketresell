'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ScanLine, ShieldCheck, AlertTriangle, Search, Eye, CheckCircle,
  XCircle, Loader2
} from 'lucide-react';

interface TicketRecord {
  id: string;
  ticketId: string;
  transportType: string;
  transportCompany: string;
  ticketType: string;
  pnrNumber: string | null;
  routeFrom: string;
  routeTo: string;
  departureDate: string;
  departureTime: string;
  seatClass: string | null;
  originalPrice: number;
  price: number;
  status: string;
  createdAt: string;
  seller: { id: string; name: string; username: string; email: string } | null;
}

interface VerificationResult {
  ticketId: string;
  status: 'valid' | 'invalid' | 'expired' | 'used';
  seller: string;
  buyer: string;
  route: string;
  date: string;
  price: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminVerifyTicketPage({ section }: { section?: string }) {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const currentSection = section || null;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/tickets?limit=50', { headers: getAuthHeaders() });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch tickets');
      }
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyQuery) return;
    setVerifyLoading(true);
    setVerificationResult(null);
    try {
      const res = await fetch(`/api/admin/tickets?search=${verifyQuery}&limit=1`, { headers: getAuthHeaders() });
      if (!res.ok) {
        setVerificationResult({ ticketId: verifyQuery, status: 'invalid', seller: '-', buyer: '-', route: '-', date: '-', price: '-' });
        return;
      }
      const data = await res.json();
      const found = data.tickets?.[0];
      if (found) {
        const statusMap: Record<string, 'valid' | 'invalid' | 'expired' | 'used'> = {
          active: 'valid',
          sold: 'used',
          expired: 'expired',
          cancelled: 'invalid',
          pending_review: 'invalid',
        };
        setVerificationResult({
          ticketId: found.ticketId,
          status: statusMap[found.status] || 'invalid',
          seller: found.seller?.name || found.seller?.username || '-',
          buyer: '-',
          route: `${found.routeFrom} → ${found.routeTo}`,
          date: found.departureDate,
          price: `৳${found.price}`,
        });
      } else {
        setVerificationResult({ ticketId: verifyQuery, status: 'invalid', seller: '-', buyer: '-', route: '-', date: '-', price: '-' });
      }
    } catch {
      setVerificationResult({ ticketId: verifyQuery, status: 'invalid', seller: '-', buyer: '-', route: '-', date: '-', price: '-' });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Suspicious tickets - those with status issues or flagged
  const flaggedTickets = tickets.filter(t =>
    t.status === 'pending_review' || t.status === 'cancelled' || t.ticketType === 'online_copy'
  );

  // Fraud reports section
  if (currentSection === 'fraud-reports') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="w-6 h-6" />Fraud Reports</h1>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-500 mb-2">Error: {error}</p>
            <Button variant="outline" onClick={fetchTickets}>Try Again</Button>
          </Card>
        ) : flaggedTickets.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No flagged or suspicious tickets found.</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Seller</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedTickets.map(ticket => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.ticketId}</TableCell>
                      <TableCell><Badge variant="outline">{ticket.ticketType}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{ticket.routeFrom} → {ticket.routeTo}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === 'cancelled' ? 'destructive' : ticket.status === 'pending_review' ? 'secondary' : 'default'}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{ticket.seller?.name || ticket.seller?.username || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell><Button variant="outline" size="sm">Review</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
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
                <Input placeholder="Enter ticket ID (e.g., ETR-000042)" value={verifyQuery} onChange={e => setVerifyQuery(e.target.value)} className="flex-1" />
                <Button onClick={handleVerify} disabled={verifyLoading} className="gap-1">
                  {verifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                  Verify
                </Button>
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
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-500 mb-2">Error: {error}</p>
              <Button variant="outline" onClick={fetchTickets}>Try Again</Button>
            </Card>
          ) : flaggedTickets.length === 0 ? (
            <Card className="p-8 text-center">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No flagged or suspicious tickets found.</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Flagged Tickets</h3>
                  <Badge variant="destructive">{flaggedTickets.filter(t => t.status === 'pending_review').length} pending review</Badge>
                </div>
                <div className="space-y-3">
                  {flaggedTickets.map(ticket => (
                    <div key={ticket.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{ticket.ticketId} — {ticket.routeFrom} → {ticket.routeTo}</p>
                        <p className="text-xs text-muted-foreground">Type: {ticket.ticketType} | Seller: {ticket.seller?.name || '-'}</p>
                      </div>
                      <Badge variant={ticket.status === 'pending_review' ? 'secondary' : ticket.status === 'cancelled' ? 'destructive' : 'default'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
