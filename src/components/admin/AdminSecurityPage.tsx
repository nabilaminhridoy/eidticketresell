'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Shield, Lock, Key, Activity, Globe, Clock,
  CheckCircle, XCircle, Fingerprint, Loader2, Plus, Trash2, Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LoginEntry {
  id: string;
  user: string;
  ip: string;
  time: string;
  status: string;
}

interface BlockedIp {
  id: string;
  ipAddress: string;
  reason: string;
  blockedBy: string;
  createdAt: string;
}

interface ApiKeyData {
  id: string;
  name: string;
  key: string;
  permissions: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminSecurityPage({ section }: { section?: string }) {
  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIp[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // IP block form
  const [blockIp, setBlockIp] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  // API key form
  const [keyName, setKeyName] = useState('');
  const [keyPermissions, setKeyPermissions] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  // Overview stats
  const [overviewStats, setOverviewStats] = useState({ loginHistoryCount: 0, blockedIpCount: 0, apiKeyCount: 0 });

  const currentSection = section || null;

  useEffect(() => {
    if (currentSection) {
      loadSection(currentSection);
    } else {
      loadOverview();
    }
  }, [currentSection]);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/security?section=overview', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOverviewStats(data.overview || { loginHistoryCount: 0, blockedIpCount: 0, apiKeyCount: 0 });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load security overview', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadSection = async (sectionName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/security?section=${sectionName}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (sectionName === 'login-history') setLoginHistory(data.loginHistory || []);
        if (sectionName === 'ip-blocklist') setBlockedIps(data.blockedIps || []);
        if (sectionName === 'api-keys') setApiKeys(data.apiKeys || []);
      } else {
        toast({ title: 'Error', description: 'Failed to load section data', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const blockIpAddress = async () => {
    if (!blockIp) {
      toast({ title: 'Error', description: 'IP address is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block-ip', ipAddress: blockIp, reason: blockReason }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: `IP ${blockIp} blocked successfully` });
        setShowBlockDialog(false);
        setBlockIp('');
        setBlockReason('');
        loadSection('ip-blocklist');
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to block IP', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const unblockIpAddress = async (id: string) => {
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock-ip', id }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'IP unblocked successfully' });
        setBlockedIps(prev => prev.filter(ip => ip.id !== id));
      } else {
        toast({ title: 'Error', description: 'Failed to unblock IP', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
  };

  const generateApiKey = async () => {
    if (!keyName) {
      toast({ title: 'Error', description: 'Key name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-api-key', name: keyName, permissions: keyPermissions }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: 'Success', description: `API key "${keyName}" generated successfully` });
        setShowApiKeyDialog(false);
        setKeyName('');
        setKeyPermissions('');
        loadSection('api-keys');
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to generate API key', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const revokeApiKey = async (id: string) => {
    try {
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke-api-key', id }),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'API key revoked successfully' });
        setApiKeys(prev => prev.map(k => k.id === id ? { ...k, isActive: false } : k));
      } else {
        toast({ title: 'Error', description: 'Failed to revoke API key', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied', description: 'Copied to clipboard' });
    }).catch(() => {
      toast({ title: 'Error', description: 'Failed to copy', variant: 'destructive' });
    });
  };

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
            <Button size="sm" className="gap-1" onClick={() => setShowBlockDialog(true)}><Plus className="w-4 h-4" />Block IP</Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : blockedIps.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No blocked IPs currently.</p>
                <p className="text-xs mt-1">Use the "Block IP" button to add an IP address to the blocklist.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="hidden md:table-cell">Blocked By</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIps.map(ip => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-medium">{ip.ipAddress}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ip.reason || 'No reason specified'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{ip.blockedBy || 'Admin'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(ip.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => unblockIpAddress(ip.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Block IP Dialog */}
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Block IP Address</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">IP Address</label>
                <Input value={blockIp} onChange={(e) => setBlockIp(e.target.value)} placeholder="e.g. 192.168.1.1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason (optional)</label>
                <Input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Reason for blocking" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockDialog(false)}>Cancel</Button>
              <Button onClick={blockIpAddress} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Block IP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            <Button size="sm" className="gap-1" onClick={() => setShowApiKeyDialog(true)}><Plus className="w-4 h-4" />Generate Key</Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No API keys configured yet.</p>
                <p className="text-xs mt-1">Use the "Generate Key" button to create a new API key.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead className="hidden md:table-cell">Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last Used</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map(k => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted/30 px-2 py-1 rounded max-w-[200px] truncate">{k.key}</code>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(k.key)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {k.permissions || 'All permissions'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={k.isActive ? 'default' : 'destructive'}>
                          {k.isActive ? 'Active' : 'Revoked'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : 'Never used'}
                      </TableCell>
                      <TableCell>
                        {k.isActive && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => revokeApiKey(k.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Generate API Key Dialog */}
        <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate New API Key</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Name</label>
                <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="e.g. Integration Key" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Permissions (JSON array, optional)</label>
                <Input value={keyPermissions} onChange={(e) => setKeyPermissions(e.target.value)} placeholder='["read", "write"]' />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>Cancel</Button>
              <Button onClick={generateApiKey} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Default - Security overview
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6" />Security Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'login-history', label: 'Login History', icon: Activity, desc: 'View all login attempts', stats: `${overviewStats.loginHistoryCount} entries` },
          { key: 'two-factor', label: 'Two-Factor Auth', icon: Fingerprint, desc: 'Configure 2FA settings', stats: 'OTP enabled' },
          { key: 'ip-blocklist', label: 'IP Blocklist', icon: Globe, desc: 'Manage blocked IP addresses', stats: `${overviewStats.blockedIpCount} blocked` },
          { key: 'api-keys', label: 'API Keys', icon: Key, desc: 'Manage API keys and access', stats: `${overviewStats.apiCount} keys` },
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
