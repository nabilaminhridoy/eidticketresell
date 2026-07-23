'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Send, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'queued';
  sentAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  key: string;
  subject: string;
  lastModified: string;
}

interface SettingItem {
  id: string;
  key: string;
  value: string;
  group: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

const defaultTemplates: EmailTemplate[] = [
  { id: '1', name: 'Welcome Email', key: 'welcome', subject: 'Welcome to ETR!', lastModified: '2024-01-10' },
  { id: '2', name: 'Order Confirmation', key: 'order-confirmation', subject: 'Your order has been confirmed', lastModified: '2024-01-12' },
  { id: '3', name: 'Ticket Sold Notification', key: 'ticket-sold', subject: 'Your ticket has been sold!', lastModified: '2024-01-08' },
  { id: '4', name: 'KYC Verification', key: 'kyc-verification', subject: 'KYC verification result', lastModified: '2024-01-15' },
  { id: '5', name: 'Password Reset', key: 'password-reset', subject: 'Reset your password', lastModified: '2024-01-05' },
  { id: '6', name: 'Withdrawal Processed', key: 'withdrawal-processed', subject: 'Your withdrawal has been processed', lastModified: '2024-01-14' },
];

const defaultLogs: EmailLog[] = [
  { id: '1', to: 'user@example.com', subject: 'Welcome to ETR', status: 'sent', sentAt: '2024-01-15 10:30' },
  { id: '2', to: 'seller@example.com', subject: 'Your ticket was sold', status: 'sent', sentAt: '2024-01-14 15:45' },
  { id: '3', to: 'buyer@example.com', subject: 'Order confirmation', status: 'failed', sentAt: '2024-01-13 08:00' },
  { id: '4', to: 'admin@etr.com', subject: 'New KYC submission', status: 'queued', sentAt: '2024-01-15 11:00' },
];

export default function AdminSettingsEmailPage({ section }: { section?: string }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const currentSection = section || 'smtp';

  const [smtpSettings, setSmtpSettings] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    encryption: 'tls',
    username: 'noreply@etr.com.bd',
    password: '',
    fromName: 'ETR Platform',
    fromEmail: 'noreply@etr.com.bd',
    enabled: true,
  });

  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [logs] = useState<EmailLog[]>(defaultLogs);

  useEffect(() => {
    fetch('/api/admin/settings?group=email', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          const settingsMap: Record<string, string> = {};
          (d.settings as SettingItem[]).forEach(s => { settingsMap[s.key] = s.value; });
          setSmtpSettings({
            host: settingsMap['smtp_host'] || 'smtp.gmail.com',
            port: settingsMap['smtp_port'] || '587',
            encryption: settingsMap['smtp_encryption'] || 'tls',
            username: settingsMap['smtp_username'] || 'noreply@etr.com.bd',
            password: settingsMap['smtp_password'] || '',
            fromName: settingsMap['smtp_from_name'] || 'ETR Platform',
            fromEmail: settingsMap['smtp_from_email'] || 'noreply@etr.com.bd',
            enabled: settingsMap['smtp_enabled'] === 'true',
          });
        }
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = [
        { key: 'smtp_host', value: smtpSettings.host, group: 'email' },
        { key: 'smtp_port', value: smtpSettings.port, group: 'email' },
        { key: 'smtp_encryption', value: smtpSettings.encryption, group: 'email' },
        { key: 'smtp_username', value: smtpSettings.username, group: 'email' },
        { key: 'smtp_password', value: smtpSettings.password, group: 'email' },
        { key: 'smtp_from_name', value: smtpSettings.fromName, group: 'email' },
        { key: 'smtp_from_email', value: smtpSettings.fromEmail, group: 'email' },
        { key: 'smtp_enabled', value: String(smtpSettings.enabled), group: 'email' },
      ];

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  };

  // SMTP settings
  if (currentSection === 'smtp') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="w-6 h-6" />Email / SMTP Settings</h1>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardHeader><CardTitle>SMTP Configuration</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP Host</label>
                <Input value={smtpSettings.host} onChange={e => setSmtpSettings(s => ({ ...s, host: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Port</label>
                  <Input value={smtpSettings.port} onChange={e => setSmtpSettings(s => ({ ...s, port: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Encryption</label>
                  <Select value={smtpSettings.encryption} onValueChange={v => setSmtpSettings(s => ({ ...s, encryption: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP Username</label>
                <Input value={smtpSettings.username} onChange={e => setSmtpSettings(s => ({ ...s, username: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SMTP Password</label>
                <Input type="password" value={smtpSettings.password} onChange={e => setSmtpSettings(s => ({ ...s, password: e.target.value }))} placeholder="Enter SMTP password" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">From Name</label>
                <Input value={smtpSettings.fromName} onChange={e => setSmtpSettings(s => ({ ...s, fromName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">From Email</label>
                <Input value={smtpSettings.fromEmail} onChange={e => setSmtpSettings(s => ({ ...s, fromEmail: e.target.value }))} />
              </div>
              <Separator className="my-4" />
              <div className="flex items-center gap-2">
                <Switch checked={smtpSettings.enabled} onCheckedChange={v => setSmtpSettings(s => ({ ...s, enabled: v }))} />
                <label className="text-sm">Enable SMTP</label>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                {saved ? 'Saved!' : 'Save SMTP Settings'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Templates
  if (currentSection === 'templates') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" />Email Templates</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.key}</TableCell>
                    <TableCell className="text-sm">{t.subject}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{t.lastModified}</TableCell>
                    <TableCell><Button variant="outline" size="sm">Edit</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test email
  if (currentSection === 'test') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Send className="w-6 h-6" />Test Email</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Email</label>
              <Input placeholder="test@example.com" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input defaultValue="Test Email from ETR" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea defaultValue="This is a test email from the ETR platform." rows={4} />
            </div>
            <Button className="gap-1"><Send className="w-4 h-4" />Send Test Email</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logs
  if (currentSection === 'logs') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6" />Email Logs</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.to}</TableCell>
                    <TableCell className="text-sm">{log.subject}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'sent' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                        {log.status === 'sent' ? <CheckCircle className="w-3 h-3 mr-1" /> : log.status === 'failed' ? <AlertCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{log.sentAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default - tabs view
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="w-6 h-6" />Email Settings</h1>
      <Tabs defaultValue="smtp">
        <TabsList>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="test">Test Email</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="smtp">
          <Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">Configure your SMTP server settings for sending emails.</p><Button variant="outline" className="mt-4">Go to SMTP Settings</Button></CardContent></Card>
        </TabsContent>
        <TabsContent value="templates">
          <Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">{templates.length} email templates configured.</p><Button variant="outline" className="mt-4">Manage Templates</Button></CardContent></Card>
        </TabsContent>
        <TabsContent value="test">
          <Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">Send a test email to verify your SMTP configuration.</p><Button variant="outline" className="mt-4">Send Test Email</Button></CardContent></Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">View recent email delivery logs.</p><Button variant="outline" className="mt-4">View Logs</Button></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
