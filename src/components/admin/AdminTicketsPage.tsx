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
  Ticket, Eye, Bus, TrainFront, Plane, Ship, ChevronLeft,
  ChevronRight, Loader2, MapPin, Calendar, Clock, User, DollarSign, Tag
} from 'lucide-react';

interface TicketRecord {
  id: string;
  ticketId: string;
  sellerId: string;
  transportType: string;
  transportCompany: string;
  ticketType: string;
  pnrNumber: string | null;
  routeFrom: string;
  routeTo: string;
  departureDate: string;
  departureTime: string;
  seatClass: string | null;
  seatNumber: string | null;
  originalPrice: number;
  price: number;
  platformFee: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  seller?: { id: string; name: string; username: string; email: string };
}

const MOCK_TICKETS: TicketRecord[] = [
  { id: '1', ticketId: 'ETR-00000001', sellerId: '1', transportType: 'bus', transportCompany: 'Green Line Paribahan', ticketType: 'online_copy', pnrNumber: 'GL12345', routeFrom: 'Dhaka', routeTo: 'Chittagong', departureDate: '2025-01-20', departureTime: '08:00', seatClass: 'AC Business', seatNumber: 'A1', originalPrice: 850, price: 900, platformFee: 18, totalAmount: 918, status: 'active', createdAt: '2025-01-15T10:00:00Z', seller: { id: '1', name: 'Rahim Uddin', username: 'rahim_uddin', email: 'rahim@example.com' } },
  { id: '2', ticketId: 'ETR-00000002', sellerId: '1', transportType: 'train', transportCompany: 'Bangladesh Railway', ticketType: 'online_copy', pnrNumber: 'TR67890', routeFrom: 'Dhaka', routeTo: 'Sylhet', departureDate: '2025-01-22', departureTime: '06:30', seatClass: 'AC Sleeper', seatNumber: 'S2-4', originalPrice: 1200, price: 1300, platformFee: 26, totalAmount: 1326, status: 'active', createdAt: '2025-01-16T11:00:00Z', seller: { id: '1', name: 'Rahim Uddin', username: 'rahim_uddin', email: 'rahim@example.com' } },
  { id: '3', ticketId: 'ETR-00000003', sellerId: '2', transportType: 'flight', transportCompany: 'Biman Bangladesh', ticketType: 'online_copy', pnrNumber: 'BG11111', routeFrom: 'Dhaka', routeTo: 'Cox Bazar', departureDate: '2025-01-25', departureTime: '10:00', seatClass: 'Economy', seatNumber: '12A', originalPrice: 4500, price: 5000, platformFee: 100, totalAmount: 5100, status: 'pending_review', createdAt: '2025-01-18T09:00:00Z', seller: { id: '2', name: 'Karim Hasan', username: 'karim_hasan', email: 'karim@example.com' } },
  { id: '4', ticketId: 'ETR-00000004', sellerId: '3', transportType: 'launch', transportCompany: 'BIWTA Launch Service', ticketType: 'counter_copy', pnrNumber: null, routeFrom: 'Dhaka', routeTo: 'Barisal', departureDate: '2025-01-18', departureTime: '18:00', seatClass: 'AC Double Decker', seatNumber: null, originalPrice: 600, price: 700, platformFee: 21, totalAmount: 721, status: 'sold', createdAt: '2025-01-10T15:00:00Z', seller: { id: '3', name: 'Fatima Begum', username: 'fatima_begum', email: 'fatima@example.com' } },
  { id: '5', ticketId: 'ETR-00000005', sellerId: '1', transportType: 'bus', transportCompany: 'Shyamoli Paribahan', ticketType: 'counter_copy', pnrNumber: null, routeFrom: 'Dhaka', routeTo: 'Rangpur', departureDate: '2025-01-14', departureTime: '22:00', seatClass: 'Non AC', seatNumber: null, originalPrice: 500, price: 550, platformFee: 16.5, totalAmount: 566.5, status: 'expired', createdAt: '2025-01-08T12:00:00Z', seller: { id: '1', name: 'Rahim Uddin', username: 'rahim_uddin', email: 'rahim@example.com' } },
];

const STATUS_TABS = ['all', 'pending_review', 'active', 'sold', 'expired', 'cancelled'];
const TRANSPORT_TYPES = ['all', 'bus', 'train', 'flight', 'launch'];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('all');
  const [transportFilter, setTransportFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusTab !== 'all') params.set('status', statusTab);
    if (transportFilter !== 'all') params.set('transportType', transportFilter);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', '20');

    fetch(`/api/admin/tickets?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.tickets && d.tickets.length > 0) {
          setTickets(d.tickets);
          setTotalPages(d.pagination?.totalPages || 1);
          setTotal(d.pagination?.total || 0);
        } else {
          setTickets(MOCK_TICKETS);
          setTotalPages(1);
          setTotal(MOCK_TICKETS.length);
        }
        setLoading(false);
      })
      .catch(() => {
        setTickets(MOCK_TICKETS);
        setTotalPages(1);
        setTotal(MOCK_TICKETS.length);
        setLoading(false);
      });
  }, [statusTab, transportFilter, search, page]);

  const filteredTickets = tickets.filter(t => {
    if (statusTab !== 'all' && t.status !== statusTab) return false;
    if (transportFilter !== 'all' && t.transportType !== transportFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      pending_review: { bg: 'bg-yellow-500 text-white', label: 'Pending Review' },
      active: { bg: 'bg-emerald-500 text-white', label: 'Active' },
      sold: { bg: 'bg-blue-500 text-white', label: 'Sold' },
      expired: { bg: 'bg-gray-500 text-white', label: 'Expired' },
      cancelled: { bg: 'bg-red-500 text-white', label: 'Cancelled' },
    };
    const info = map[status] || { bg: 'bg-muted text-muted-foreground', label: status };
    return <Badge className={info.bg}>{info.label}</Badge>;
  };

  const getTransportIcon = (type: string) => {
    if (type === 'bus') return <Bus className="w-4 h-4" />;
    if (type === 'train') return <TrainFront className="w-4 h-4" />;
    if (type === 'flight') return <Plane className="w-4 h-4" />;
    if (type === 'launch') return <Ship className="w-4 h-4" />;
    return <Ticket className="w-4 h-4" />;
  };

  const getTicketTypeBadge = (type: string) => {
    if (type === 'online_copy') return <Badge className="bg-primary text-primary-foreground">Online</Badge>;
    return <Badge className="bg-orange text-white">Counter</Badge>;
  };

  const handleView = (ticket: TicketRecord) => {
    setSelectedTicket(ticket);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6" /> Ticket Management
          </h1>
          <p className="text-sm text-muted-foreground">{total} total tickets</p>
        </div>
      </div>

      {/* Filters + Table */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={transportFilter} onValueChange={setTransportFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Transport" /></SelectTrigger>
              <SelectContent>
                {TRANSPORT_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={statusTab} onValueChange={setStatusTab}>
            <TabsList className="flex-wrap">
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
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tickets found for this filter</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket ID</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead>Transport</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead className="hidden md:table-cell">Price</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTickets.map(ticket => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.ticketId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {ticket.seller?.name || 'Unknown'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {getTransportIcon(ticket.transportType)}
                                <span className="hidden sm:inline text-xs">{ticket.transportCompany}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                {ticket.routeFrom} → {ticket.routeTo}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              ৳{ticket.price.toLocaleString()}
                            </TableCell>
                            <TableCell>{getTicketTypeBadge(ticket.ticketType)}</TableCell>
                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => handleView(ticket)}>
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
      {!loading && filteredTickets.length > 0 && totalPages > 1 && (
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

      {/* View Ticket Detail Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details - {selectedTicket?.ticketId}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Ticket ID</Label><p className="font-medium">{selectedTicket.ticketId}</p></div>
                <div><Label className="text-xs text-muted-foreground">Seller</Label><p className="font-medium">{selectedTicket.seller?.name || 'Unknown'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Transport Type</Label><p className="font-medium capitalize">{selectedTicket.transportType}</p></div>
                <div><Label className="text-xs text-muted-foreground">Company</Label><p className="font-medium">{selectedTicket.transportCompany}</p></div>
                <div><Label className="text-xs text-muted-foreground">Ticket Type</Label><div>{getTicketTypeBadge(selectedTicket.ticketType)}</div></div>
                <div><Label className="text-xs text-muted-foreground">PNR Number</Label><p className="font-medium">{selectedTicket.pnrNumber || 'N/A'}</p></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-muted-foreground" /><Label className="text-xs text-muted-foreground">From</Label><p className="font-medium ml-1">{selectedTicket.routeFrom}</p></div>
                <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-muted-foreground" /><Label className="text-xs text-muted-foreground">To</Label><p className="font-medium ml-1">{selectedTicket.routeTo}</p></div>
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-muted-foreground" /><Label className="text-xs text-muted-foreground">Date</Label><p className="font-medium ml-1">{selectedTicket.departureDate}</p></div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-muted-foreground" /><Label className="text-xs text-muted-foreground">Time</Label><p className="font-medium ml-1">{selectedTicket.departureTime}</p></div>
                <div><Label className="text-xs text-muted-foreground">Seat Class</Label><p className="font-medium">{selectedTicket.seatClass || 'N/A'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Seat Number</Label><p className="font-medium">{selectedTicket.seatNumber || 'N/A'}</p></div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-muted-foreground" /><Label className="text-xs text-muted-foreground">Original Price</Label><p className="font-medium ml-1">৳{selectedTicket.originalPrice}</p></div>
                <div className="flex items-center gap-1"><Tag className="w-4 h-4 text-muted-foreground" /><Label className="text-xs text-muted-foreground">Selling Price</Label><p className="font-medium ml-1">৳{selectedTicket.price}</p></div>
                <div><Label className="text-xs text-muted-foreground">Platform Fee</Label><p className="font-medium">৳{selectedTicket.platformFee}</p></div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
