'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, Lock, Key, Activity, User, Globe, Clock, AlertTriangle,
  Eye, Trash2, Plus, CheckCircle, XCircle, Fingerprint
} from 'lucide-react';

interface LoginEntry {
  id: string;
  user: string;
  ip: string;
  location: string;
  time: string;
  status: 'success' | 'failed';
}

interface BlockedIp {
  id: string;
  ip: string;
  reason: string;
  blockedAt: string;
  attempts: number;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

export default function AdminSecurityPage({ section }: { section?: string }) {
  const currentSection = section || null;

  const mockLoginHistory: LoginEntry[] = [
    { id: '1', user: 'admin@etr.com', ip: '192.168.1.1', location: 'Dhaka, BD', time: '2024-01-15 10:30', status: 'success' },
    { id: '2', user: 'admin@etr.com', ip: '103.45.67.89', location: 'Unknown', time: '2024-01-14 03:15', status: 'failed' },
    { id: '3', user: 'editor@etr.com', ip: '192.168.1.5', location: 'Dhaka, BD', time: '2024-01-13 09:00', status: 'success' },
    { id: '4', user: 'unknown@hack.com', ip: '45.33.32.156', location: 'Russia', time: '2024-01-12 22:00', status: 'failed' },
    { id: '5', user: 'admin@etr.com', ip: '192.168.1.1', location: 'Dhaka, BD', time: '2024-01-12 08:30', status: 'success' },
  ];

  const mockBlockedIps: BlockedIp[] = [
    { id: '1', ip: '45.33.32.156', reason: 'Multiple failed login attempts', blockedAt: '2024-01-12', attempts: 15 },
    { id: '2', ip: '103.45.67.89', reason: 'Suspicious activity', blockedAt: '2024-01-14', attempts: 5 },
  ];

  const mockApiKeys: ApiKey[] = [
    { id: '1', name: 'SMS Gateway API', key: 'etr_sms_xxxxxxxxxxxx', created: '2024-01-10', lastUsed: '2 hours ago', status: 'active' },
    { id: '2', name: 'Email Service API', key: 'etr_email_xxxxxxxxxxxx', created: '2024-01-05', lastUsed: '1 day ago', status: 'active' },
    { id: '3', name: 'Old Payment API', key: 'etr_pay_old_xxxxxxxx', created: '2023-12-01', lastUsed: '30 days ago', status: 'revoked' },
  ];

  // Login History
  if (currentSection === 'login-history') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6" />Login History</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>IP Address</TableHead><TableHead className="hidden md:table-cell">Location</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Time</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockLoginHistory.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.user}</TableCell>
                    <TableCell className="text-sm">{entry.ip}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{entry.location}</TableCell>
                    <TableCell>
                      <Badge variant={entry.status === 'success' ? 'default' : 'destructive'}>
                        {entry.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{entry.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Two-Factor Authentication
  if (currentSection === 'two-factor') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Fingerprint className="w-6 h-6" />Two-Factor Authentication</h1>
        <Card>
          <CardHeader><CardTitle>2FA Configuration</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2"><Switch /><label className="text-sm font-medium">Require 2FA for all admin accounts</label></div>
            <div className="space-y-2"><label className="text-sm font-medium">2FA Method</label>
              <Select defaultValue="otp"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="otp">OTP via Email/SMS</SelectItem><SelectItem value="totp">TOTP (Google Authenticator)</SelectItem><SelectItem value="both">Both Options</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">OTP Expiry Time (seconds)</label><Input type="number" defaultValue={120} /></div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-medium">Admin accounts with 2FA enabled: 2/3</p>
              <p className="text-xs text-muted-foreground">One admin account does not have 2FA enabled yet.</p>
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // IP Blocklist
  if (currentSection === 'ip-blocklist') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6" />IP Blocklist</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Blocked IPs</CardTitle>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Block IP</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>IP Address</TableHead><TableHead>Reason</TableHead><TableHead className="hidden md:table-cell">Attempts</TableHead><TableHead className="hidden md:table-cell">Blocked At</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockBlockedIps.map(ip => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-medium">{ip.ip}</TableCell>
                    <TableCell className="text-sm">{ip.reason}</TableCell>
                    <TableCell className="hidden md:table-cell"><Badge variant="destructive">{ip.attempts}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{ip.blockedAt}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // API Keys
  if (currentSection === 'api-keys') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Key className="w-6 h-6" />API Keys Management</h1>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">API Keys</CardTitle>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Generate Key</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Created</TableHead><TableHead className="hidden md:table-cell">Last Used</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockApiKeys.map(apiKey => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell className="text-sm font-mono">{apiKey.key.substring(0, 20)}...</TableCell>
                    <TableCell><Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>{apiKey.status}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{apiKey.created}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{apiKey.lastUsed}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3.5 h-3.5" /></Button>
                        {apiKey.status === 'active' ? <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600"><XCircle className="w-3.5 h-3.5" /></Button> : null}
                      </div>
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

  // Default - Security overview
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6" />Security Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'login-history', label: 'Login History', icon: Activity, desc: 'View all login attempts', stats: '5 entries' },
          { key: 'two-factor', label: 'Two-Factor Auth', icon: Fingerprint, desc: 'Configure 2FA settings', stats: '2/3 admins' },
          { key: 'ip-blocklist', label: 'IP Blocklist', icon: Globe, desc: 'Manage blocked IP addresses', stats: '2 blocked' },
          { key: 'api-keys', label: 'API Keys', icon: Key, desc: 'Manage API keys and access', stats: '3 keys' },
        ].map(item => (
          <Card key={item.key} className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Badge variant="secondary">{item.stats}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
