'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Server, Database, FileText, Clock4, HardDrive, RefreshCw,
  Download, Trash2, RotateCcw, CheckCircle, AlertTriangle, Loader2,
  ArrowUpCircle
} from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  admin: { name: string } | null;
  adminId: string | null;
}

interface CronJob {
  id: string;
  name: string;
  command: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'active' | 'inactive';
}

interface Backup {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  type: 'auto' | 'manual';
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

// Cron job configuration - admin-only feature
const configuredCronJobs: CronJob[] = [
  { id: 'cron_auto_backup', name: 'Auto Backup', command: 'backup:run', schedule: '0 3 * * *', lastRun: '-', nextRun: '-', status: 'active' },
  { id: 'cron_cache_cleanup', name: 'Cache Cleanup', command: 'cache:cleanup', schedule: '0 */6 * * *', lastRun: '-', nextRun: '-', status: 'active' },
  { id: 'cron_expired_tickets', name: 'Expired Tickets Cleanup', command: 'tickets:cleanup-expired', schedule: '0 2 * * *', lastRun: '-', nextRun: '-', status: 'active' },
  { id: 'cron_email_queue', name: 'Email Queue Process', command: 'email:process-queue', schedule: '*/5 * * * *', lastRun: '-', nextRun: '-', status: 'active' },
  { id: 'cron_revenue_report', name: 'Revenue Report Generate', command: 'reports:generate', schedule: '0 9 * * 1', lastRun: '-', nextRun: '-', status: 'inactive' },
];

// Backup configuration - admin-only feature
const configuredBackups: Backup[] = [];

const classifyLogLevel = (action: string): 'info' | 'warning' | 'error' => {
  const lower = action.toLowerCase();
  if (lower.includes('fail') || lower.includes('error') || lower.includes('delete')) return 'error';
  if (lower.includes('warn') || lower.includes('flag') || lower.includes('dispute')) return 'warning';
  return 'info';
};

export default function AdminSystemPage({ section }: { section?: string }) {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const currentSection = section || null;

  // Fetch logs when logs section is viewed
  useEffect(() => {
    if (currentSection !== 'logs') return;
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/activity-log?limit=20', { headers: getAuthHeaders() });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch logs');
        }
        const data = await res.json();
        setLogs(data.activities || []);
      } catch (err) {
        setLogsError(err instanceof Error ? err.message : 'Failed to load system logs');
      } finally {
        setLogsLoading(false);
      }
    };
    fetchLogs();
  }, [currentSection]);

  const refreshLogs = async () => {
    try {
      const res = await fetch('/api/admin/activity-log?limit=20', { headers: getAuthHeaders() });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch logs');
      }
      const data = await res.json();
      setLogs(data.activities || []);
      setLogsError(null);
    } catch (err) {
      setLogsError(err instanceof Error ? err.message : 'Failed to load system logs');
    }
  };

  // Cache management
  if (currentSection === 'cache') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="w-6 h-6" />Cache Management</h1>
        <Card>
          <CardHeader><CardTitle>Cache Status</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center"><p className="text-sm text-muted-foreground">Application Cache</p><p className="text-lg font-bold">-</p></div>
              <div className="p-4 rounded-lg bg-muted/30 text-center"><p className="text-sm text-muted-foreground">Route Cache</p><p className="text-lg font-bold">-</p></div>
              <div className="p-4 rounded-lg bg-muted/30 text-center"><p className="text-sm text-muted-foreground">API Cache</p><p className="text-lg font-bold">-</p></div>
            </div>
            <Separator />
            <div className="space-y-3">
              {['Application Cache', 'Route Cache', 'API Response Cache', 'Static Pages Cache', 'Search Results Cache'].map(cache => (
                <div key={cache} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">{cache}</span>
                  <Button variant="outline" size="sm" className="gap-1"><Trash2 className="w-3 h-3" />Clear</Button>
                </div>
              ))}
            </div>
            <Button className="gap-1"><RotateCcw className="w-4 h-4" />Clear All Cache</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logs - fetched from activity-log API
  if (currentSection === 'logs') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" />System Logs</h1>
          <Button variant="outline" size="sm" onClick={refreshLogs} className="gap-1"><RefreshCw className="w-4 h-4" />Refresh</Button>
        </div>
        {logsLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : logsError ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-500 mb-2">Error: {logsError}</p>
            <Button variant="outline" onClick={refreshLogs}>Try Again</Button>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No system logs found.</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Level</TableHead><TableHead>Action</TableHead><TableHead className="hidden md:table-cell">Details</TableHead><TableHead className="hidden md:table-cell">User</TableHead><TableHead className="hidden md:table-cell">Timestamp</TableHead></TableRow></TableHeader>
                <TableBody>
                  {logs.map(log => {
                    const level = classifyLogLevel(log.action);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant={level === 'error' ? 'destructive' : level === 'warning' ? 'secondary' : 'default'}>
                            {level === 'error' ? <AlertTriangle className="w-3 h-3 mr-1" /> : level === 'warning' ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                            {level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.action}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[250px] truncate">{log.details || '-'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{log.admin?.name || log.adminId || 'system'}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1"><Download className="w-4 h-4" />Download Logs</Button>
          <Button variant="destructive" className="gap-1"><Trash2 className="w-4 h-4" />Clear Logs</Button>
        </div>
      </div>
    );
  }

  // Cron Jobs - configuration placeholder
  if (currentSection === 'cron-jobs') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock4 className="w-6 h-6" />Cron Jobs</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Command</TableHead><TableHead className="hidden md:table-cell">Schedule</TableHead><TableHead>Status</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {configuredCronJobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-mono">{job.command}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{job.schedule}</TableCell>
                    <TableCell><Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge></TableCell>
                    <TableCell><Button variant="outline" size="sm">Run</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Backups - configuration placeholder
  if (currentSection === 'backups') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><HardDrive className="w-6 h-6" />Backups</h1>
          <Button size="sm" className="gap-1"><Download className="w-4 h-4" />Create Backup</Button>
        </div>
        {configuredBackups.length === 0 ? (
          <Card className="p-8 text-center">
            <HardDrive className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No backups found. Create a backup to safeguard your data.</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Size</TableHead><TableHead className="hidden md:table-cell">Created</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {configuredBackups.map(backup => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.name}</TableCell>
                      <TableCell><Badge variant={backup.type === 'auto' ? 'default' : 'secondary'}>{backup.type}</Badge></TableCell>
                      <TableCell className="text-sm">{backup.size}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{backup.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1"><Button variant="outline" size="sm">Download</Button><Button variant="destructive" size="sm">Delete</Button></div>
                      </TableCell>
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

  // System Update
  if (currentSection === 'update') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ArrowUpCircle className="w-6 h-6" />System Update</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="font-medium">Current Version: v1.0.0</p>
                <p className="text-sm text-muted-foreground">System is up to date</p>
              </div>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button>Check for Updates</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default - System Hub
  const systemFeatures = [
    { key: 'cache', label: 'Cache Management', icon: Database, desc: 'Clear and manage application caches' },
    { key: 'logs', label: 'System Logs', icon: FileText, desc: 'View activity logs and system events' },
    { key: 'cron-jobs', label: 'Cron Jobs', icon: Clock4, desc: 'Manage scheduled tasks', stats: `${configuredCronJobs.length} jobs` },
    { key: 'backups', label: 'Backups', icon: HardDrive, desc: 'Create and manage database backups' },
    { key: 'update', label: 'System Update', icon: ArrowUpCircle, desc: 'Check and apply system updates', stats: 'v1.0.0' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Server className="w-6 h-6" />System Management</h1>
        <p className="text-sm text-muted-foreground">Cache, logs, cron jobs, backups, and updates</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemFeatures.map(feature => (
          <Card key={feature.key} className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.label}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
              {feature.stats && <Badge variant="secondary">{feature.stats}</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
