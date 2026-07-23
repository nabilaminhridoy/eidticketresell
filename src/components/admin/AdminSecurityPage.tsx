'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Shield, Lock, Key, Activity, User, Globe, Clock,
  Eye, Trash2, Plus, CheckCircle, XCircle, Fingerprint, Loader2
} from 'lucide-react';

interface LoginEntry {
  id: string;
  user: string;
  ip: string;
  time: string;
  status: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminSecurityPage({ section }: { section?: string }) {
  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const currentSection = section || null;

  useEffect(() => {
    if (currentSection === 'login-history' || !currentSection) {
      fetch('/api/admin/security?section=login-history', { headers: getAuthHeaders() })
        .then(r => r.json())
        .then(d => { if (d.loginHistory) setLoginHistory(d.loginHistory); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [currentSection]);

  // Login History
  if (currentSection === 'login-history') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-6 h-6" />Login History</h1>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : loginHistory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No login history found</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>IP Address</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Time</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loginHistory.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.user}</TableCell>
                      <TableCell className="text-sm">{entry.ip}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === 'success' ? 'default' : 'destructive'}>
                          {entry.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(entry.time).toLocaleString()}</TableCell>
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

  // Two-Factor Authentication
  if (currentSection === 'two-factor') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Fingerprint className="w-6 h-6" />Two-Factor Authentication</h1>
        <Card>
          <CardHeader><CardTitle>2FA Configuration</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4" /><label className="text-sm font-medium">Require 2FA for all admin accounts</label></div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm font-medium">2FA is currently managed via OTP verification at login.</p>
              <p className="text-xs text-muted-foreground">Admin login requires OTP verification by default.</p>
            </div>
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
          <CardContent className="p-6 text-center text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No blocked IPs currently.</p>
            <p className="text-xs mt-1">IP blocking feature will be added in future updates.</p>
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
          <CardContent className="p-6 text-center text-muted-foreground">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No API keys configured yet.</p>
            <p className="text-xs mt-1">API key management will be added in future updates.</p>
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
          { key: 'login-history', label: 'Login History', icon: Activity, desc: 'View all login attempts', stats: `${loginHistory.length} entries` },
          { key: 'two-factor', label: 'Two-Factor Auth', icon: Fingerprint, desc: 'Configure 2FA settings', stats: 'OTP enabled' },
          { key: 'ip-blocklist', label: 'IP Blocklist', icon: Globe, desc: 'Manage blocked IP addresses', stats: '0 blocked' },
          { key: 'api-keys', label: 'API Keys', icon: Key, desc: 'Manage API keys and access', stats: '0 keys' },
        ].map(item => (
          <Card key={item.key} className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer" onClick={() => window.location.href = `/admin/security/${item.key}`}>
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
