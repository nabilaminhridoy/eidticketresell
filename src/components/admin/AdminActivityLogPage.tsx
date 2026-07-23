'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Search, Calendar, User, Filter, Download, Clock } from 'lucide-react';

interface ActivityEntry {
  id: string;
  action: string;
  user: string;
  details: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  ip: string;
}

export default function AdminActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const mockActivities: ActivityEntry[] = [
    { id: '1', action: 'User Registration', user: 'john_doe', details: 'New user account created', type: 'success', timestamp: '2024-01-15 10:30', ip: '192.168.1.1' },
    { id: '2', action: 'Ticket Approved', user: 'admin@etr.com', details: 'ETR-000042 verified by admin', type: 'success', timestamp: '2024-01-15 10:25', ip: '192.168.1.1' },
    { id: '3', action: 'Payment Received', user: 'system', details: '৳867 via bKash for order ORD-000015', type: 'info', timestamp: '2024-01-15 10:20', ip: 'system' },
    { id: '4', action: 'KYC Submitted', user: 'user_rahim', details: 'NID verification submitted', type: 'warning', timestamp: '2024-01-15 09:45', ip: '103.45.67.89' },
    { id: '5', action: 'Dispute Opened', user: 'buyer_karim', details: 'Buyer disputed order ORD-000008', type: 'error', timestamp: '2024-01-15 09:00', ip: '192.168.1.5' },
    { id: '6', action: 'Withdrawal Requested', user: 'seller_nayeem', details: '৳5,000 withdrawal via bKash', type: 'info', timestamp: '2024-01-15 08:30', ip: '192.168.1.10' },
    { id: '7', action: 'Blog Post Published', user: 'editor@etr.com', details: 'Post: "Top 10 Travel Destinations"', type: 'success', timestamp: '2024-01-15 08:00', ip: '192.168.1.3' },
    { id: '8', action: 'Settings Updated', user: 'admin@etr.com', details: 'Email SMTP configuration changed', type: 'info', timestamp: '2024-01-14 17:00', ip: '192.168.1.1' },
    { id: '9', action: 'Failed Login', user: 'unknown', details: 'Multiple failed login attempts from IP 45.33.32.156', type: 'error', timestamp: '2024-01-14 03:15', ip: '45.33.32.156' },
    { id: '10', action: 'Refund Processed', user: 'admin@etr.com', details: '৳500 refunded to buyer for order ORD-000005', type: 'success', timestamp: '2024-01-13 16:00', ip: '192.168.1.1' },
  ];

  const filteredActivities = mockActivities.filter(a => {
    const matchesSearch = a.action.toLowerCase().includes(searchQuery.toLowerCase()) || a.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6" />Activity Log</h1>
          <p className="text-sm text-muted-foreground">Track all platform activities and actions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1"><Download className="w-4 h-4" />Export</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search activities..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead className="hidden md:table-cell">IP</TableHead>
                <TableHead className="hidden md:table-cell">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Badge variant={entry.type === 'success' ? 'default' : entry.type === 'error' ? 'destructive' : entry.type === 'warning' ? 'secondary' : 'outline'}>
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{entry.action}</TableCell>
                  <TableCell className="text-sm">{entry.user}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[250px] truncate">{entry.details}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{entry.ip}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{entry.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
