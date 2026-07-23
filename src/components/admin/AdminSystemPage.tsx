'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Server, Database, FileText, Clock4, HardDrive, RefreshCw,
  ArrowLeft, Download, Trash2, RotateCcw, CheckCircle, AlertTriangle,
  Terminal, Calendar, ArrowUpCircle, Settings
} from 'lucide-react';

interface LogEntry {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source: string;
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

export default function AdminSystemPage({ section }: { section?: string }) {
  const currentSection = section || null;

  // Cache management
  if (currentSection === 'cache') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="w-6 h-6" />Cache Management</h1>
        <Card>
          <CardHeader><CardTitle>Cache Status</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center"><p className="text-sm text-muted-foreground">Application Cache</p><p className="text-lg font-bold">45 MB</p></div>
              <div className="p-4 rounded-lg bg-muted/30 text-center"><p className="text-sm text-muted-foreground">Route Cache</p><p className="text-lg font-bold">12 MB</p></div>
              <div className="p-4 rounded-lg bg-muted/30 text-center"><p className="text-sm text-muted-foreground">API Cache</p><p className="text-lg font-bold">8 MB</p></div>
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

  // Logs
  if (currentSection === 'logs') {
    const mockLogs: LogEntry[] = [
      { id: '1', level: 'error', message: 'Database connection timeout', timestamp: '2024-01-15 10:30:00', source: 'db' },
      { id: '2', level: 'warning', message: 'High memory usage detected (85%)', timestamp: '2024-01-15 09:00:00', source: 'system' },
      { id: '3', level: 'info', message: 'User login successful: admin@etr.com', timestamp: '2024-01-15 08:30:00', source: 'auth' },
      { id: '4', level: 'error', message: 'bKash webhook validation failed', timestamp: '2024-01-14 22:00:00', source: 'payment' },
      { id: '5', level: 'info', message: 'Backup completed successfully', timestamp: '2024-01-14 03:00:00', source: 'system' },
    ];

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" />System Logs</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Level</TableHead><TableHead>Message</TableHead><TableHead className="hidden md:table-cell">Source</TableHead><TableHead className="hidden md:table-cell">Timestamp</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={log.level === 'error' ? 'destructive' : log.level === 'warning' ? 'secondary' : 'default'}>
                        {log.level === 'error' ? <AlertTriangle className="w-3 h-3 mr-1" /> : log.level === 'warning' ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.message}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{log.source}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1"><Download className="w-4 h-4" />Download Logs</Button>
          <Button variant="destructive" className="gap-1"><Trash2 className="w-4 h-4" />Clear Logs</Button>
        </div>
      </div>
    );
  }

  // Cron Jobs
  if (currentSection === 'cron-jobs') {
    const mockCronJobs: CronJob[] = [
      { id: '1', name: 'Auto Backup', command: 'backup:run', schedule: '0 3 * * *', lastRun: '2024-01-15 03:00', nextRun: '2024-01-16 03:00', status: 'active' },
      { id: '2', name: 'Cache Cleanup', command: 'cache:cleanup', schedule: '0 */6 * * *', lastRun: '2024-01-15 06:00', nextRun: '2024-01-15 12:00', status: 'active' },
      { id: '3', name: 'Expired Tickets Cleanup', command: 'tickets:cleanup-expired', schedule: '0 2 * * *', lastRun: '2024-01-15 02:00', nextRun: '2024-01-16 02:00', status: 'active' },
      { id: '4', name: 'Email Queue Process', command: 'email:process-queue', schedule: '*/5 * * * *', lastRun: '2024-01-15 10:25', nextRun: '2024-01-15 10:30', status: 'active' },
      { id: '5', name: 'Revenue Report Generate', command: 'reports:generate', schedule: '0 9 * * 1', lastRun: '2024-01-08 09:00', nextRun: '2024-01-15 09:00', status: 'inactive' },
    ];

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock4 className="w-6 h-6" />Cron Jobs</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="hidden md:table-cell">Command</TableHead><TableHead className="hidden md:table-cell">Schedule</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Last Run</TableHead><TableHead className="hidden md:table-cell">Next Run</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockCronJobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-mono">{job.command}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{job.schedule}</TableCell>
                    <TableCell><Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{job.lastRun}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{job.nextRun}</TableCell>
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

  // Backups
  if (currentSection === 'backups') {
    const mockBackups: Backup[] = [
      { id: '1', name: 'auto-backup-2024-01-15', size: '45 MB', createdAt: '2024-01-15 03:00', type: 'auto' },
      { id: '2', name: 'auto-backup-2024-01-14', size: '44 MB', createdAt: '2024-01-14 03:00', type: 'auto' },
      { id: '3', name: 'manual-backup-2024-01-10', size: '43 MB', createdAt: '2024-01-10 15:30', type: 'manual' },
      { id: '4', name: 'auto-backup-2024-01-13', size: '44 MB', createdAt: '2024-01-13 03:00', type: 'auto' },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><HardDrive className="w-6 h-6" />Backups</h1>
          <Button size="sm" className="gap-1"><Download className="w-4 h-4" />Create Backup</Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Size</TableHead><TableHead className="hidden md:table-cell">Created</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockBackups.map(backup => (
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
                <p className="text-sm text-muted-foreground">Last updated: 2024-01-15</p>
              </div>
            </div>
            <Separator />
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm font-medium">Available Update: v1.1.0</p>
              <p className="text-xs text-muted-foreground mt-1">Bug fixes, performance improvements, new admin pages</p>
            </div>
            <div className="flex gap-2">
              <Button>Update Now</Button>
              <Button variant="outline">Check for Updates</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default - System Hub
  const systemFeatures = [
    { key: 'cache', label: 'Cache Management', icon: Database, desc: 'Clear and manage application caches', stats: '65 MB used' },
    { key: 'logs', label: 'System Logs', icon: FileText, desc: 'View and manage system logs', stats: '5 entries' },
    { key: 'cron-jobs', label: 'Cron Jobs', icon: Clock4, desc: 'Manage scheduled tasks', stats: '5 jobs' },
    { key: 'backups', label: 'Backups', icon: HardDrive, desc: 'Create and manage database backups', stats: '4 backups' },
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
              <Badge variant="secondary">{feature.stats}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Separator() {
  return <hr className="border-border my-4" />;
}
