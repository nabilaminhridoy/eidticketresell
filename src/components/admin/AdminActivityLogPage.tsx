'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Search, Download, Loader2 } from 'lucide-react';

interface ActivityEntry {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  admin: { name: string } | null;
  adminId: string | null;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

function classifyAction(action: string): 'success' | 'warning' | 'error' | 'info' {
  const lower = action.toLowerCase();
  if (lower.includes('fail') || lower.includes('error') || lower.includes('delete') || lower.includes('cancel')) return 'error';
  if (lower.includes('approve') || lower.includes('verify') || lower.includes('publish') || lower.includes('success') || lower.includes('register') || lower.includes('create')) return 'success';
  if (lower.includes('warn') || lower.includes('flag') || lower.includes('dispute') || lower.includes('pending')) return 'warning';
  return 'info';
}

export default function AdminActivityLogPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/activity-log?limit=100', { headers: getAuthHeaders() });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch activities');
      }
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(a => {
    const matchesSearch = a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.details && a.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const entryType = classifyAction(a.action);
    const matchesType = typeFilter === 'all' || entryType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6" />Activity Log</h1>
          <p className="text-sm text-muted-foreground">Track all platform activities and actions</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1" onClick={fetchActivities}><Download className="w-4 h-4" />Refresh</Button>
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
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <Button variant="outline" onClick={fetchActivities}>Try Again</Button>
        </Card>
      ) : filteredActivities.length === 0 ? (
        <Card className="p-8 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {activities.length === 0 ? 'No activity log entries found.' : 'No activities match your filters.'}
          </p>
        </Card>
      ) : (
        /* Activity table */
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
                {filteredActivities.map(entry => {
                  const entryType = classifyAction(entry.action);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge variant={entryType === 'success' ? 'default' : entryType === 'error' ? 'destructive' : entryType === 'warning' ? 'secondary' : 'outline'}>
                          {entryType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.action}</TableCell>
                      <TableCell className="text-sm">{entry.admin?.name || entry.adminId || 'system'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[250px] truncate">{entry.details || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{entry.ipAddress || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
