'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Smartphone, Send, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SmsLog {
  id: string;
  to: string;
  message: string;
  status: 'sent' | 'failed' | 'queued';
  sentAt: string;
}

interface SmsTemplate {
  id: string;
  name: string;
  key: string;
  message: string;
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

const defaultTemplates: SmsTemplate[] = [
  { id: '1', name: 'OTP Verification', key: 'otp-verification', message: 'Your ETR verification code is {{otp}}', lastModified: '2024-01-10' },
  { id: '2', name: 'Order Confirmation', key: 'order-confirmation', message: 'Your order {{order_id}} is confirmed. Ticket: {{ticket_name}}', lastModified: '2024-01-12' },
  { id: '3', name: 'Ticket Sold', key: 'ticket-sold', message: 'Your ticket {{ticket_name}} has been sold for ৳{{price}}!', lastModified: '2024-01-08' },
  { id: '4', name: 'Withdrawal Processed', key: 'withdrawal', message: 'Your withdrawal of ৳{{amount}} has been processed.', lastModified: '2024-01-14' },
];

const defaultLogs: SmsLog[] = [
  { id: '1', to: '+880 1712-XXXXXX', message: 'Your ETR verification code is 123456', status: 'sent', sentAt: '2024-01-15 10:30' },
  { id: '2', to: '+880 1812-XXXXXX', message: 'Your ticket has been sold! Order #12345', status: 'sent', sentAt: '2024-01-14 15:45' },
  { id: '3', to: '+880 1912-XXXXXX', message: 'Welcome to ETR! Verify your account.', status: 'failed', sentAt: '2024-01-13 08:00' },
];

export default function AdminSettingsSmsPage({ section }: { section?: string }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentSection = section || 'provider';

  const [smsSettings, setSmsSettings] = useState({
    provider: 'bulk-sms',
    apiKey: '',
    senderId: 'ETRBD',
    apiUrl: 'https://bulksms.com/api/v1/send',
    enabled: true,
    otpViaSms: false,
  });

  const [templates, setTemplates] = useState<SmsTemplate[]>(defaultTemplates);
  const [logs] = useState<SmsLog[]>(defaultLogs);

  useEffect(() => {
    fetch('/api/admin/settings?group=sms', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          const settingsMap: Record<string, string> = {};
          (d.settings as SettingItem[]).forEach(s => { settingsMap[s.key] = s.value; });
          setSmsSettings({
            provider: settingsMap['sms_provider'] || 'bulk-sms',
            apiKey: settingsMap['sms_api_key'] || '',
            senderId: settingsMap['sms_sender_id'] || 'ETRBD',
            apiUrl: settingsMap['sms_api_url'] || 'https://bulksms.com/api/v1/send',
            enabled: settingsMap['sms_enabled'] === 'true',
            otpViaSms: settingsMap['sms_otp_enabled'] === 'true',
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
        { key: 'sms_provider', value: smsSettings.provider, group: 'sms' },
        { key: 'sms_api_key', value: smsSettings.apiKey, group: 'sms' },
        { key: 'sms_sender_id', value: smsSettings.senderId, group: 'sms' },
        { key: 'sms_api_url', value: smsSettings.apiUrl, group: 'sms' },
        { key: 'sms_enabled', value: String(smsSettings.enabled), group: 'sms' },
        { key: 'sms_otp_enabled', value: String(smsSettings.otpViaSms), group: 'sms' },
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

  // Provider settings
  if (currentSection === 'provider') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="w-6 h-6" />SMS Provider Settings</h1>
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardHeader><CardTitle>SMS Gateway Configuration</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SMS Provider</label>
                <Select value={smsSettings.provider} onValueChange={v => setSmsSettings(s => ({ ...s, provider: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulk-sms">BulkSMS BD</SelectItem>
                    <SelectItem value="ssl-wireless">SSL Wireless</SelectItem>
                    <SelectItem value="mim-sms">MimSMS</SelectItem>
                    <SelectItem value="custom">Custom Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <Input value={smsSettings.apiKey} onChange={e => setSmsSettings(s => ({ ...s, apiKey: e.target.value }))} placeholder="Enter SMS API key" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sender ID / Mask</label>
                <Input value={smsSettings.senderId} onChange={e => setSmsSettings(s => ({ ...s, senderId: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">API URL</label>
                <Input value={smsSettings.apiUrl} onChange={e => setSmsSettings(s => ({ ...s, apiUrl: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={smsSettings.enabled} onCheckedChange={v => setSmsSettings(s => ({ ...s, enabled: v }))} />
                <label className="text-sm">Enable SMS Service</label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={smsSettings.otpViaSms} onCheckedChange={v => setSmsSettings(s => ({ ...s, otpViaSms: v }))} />
                <label className="text-sm">Send OTP via SMS</label>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                {saved ? 'Saved!' : 'Save Settings'}
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
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" />SMS Templates</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead className="hidden md:table-cell">Message Template</TableHead>
                  <TableHead className="hidden md:table-cell">Modified</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.key}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{t.message}</TableCell>
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

  // Test SMS
  if (currentSection === 'test') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Send className="w-6 h-6" />Test SMS</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Phone Number</label><Input placeholder="+880 1XXX-XXXXXX" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Message</label><Textarea defaultValue="Test SMS from ETR platform" rows={3} /></div>
            <Button className="gap-1"><Send className="w-4 h-4" />Send Test SMS</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logs
  if (currentSection === 'logs') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6" />SMS Logs</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To</TableHead>
                  <TableHead className="hidden md:table-cell">Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.to}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{log.message}</TableCell>
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

  // Default - tab view
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="w-6 h-6" />SMS Settings</h1>
      <Tabs defaultValue="provider">
        <TabsList>
          <TabsTrigger value="provider">Provider</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="test">Test SMS</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="provider"><Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">Configure SMS gateway provider settings.</p><Button variant="outline" className="mt-4">Go to Provider Settings</Button></CardContent></Card></TabsContent>
        <TabsContent value="templates"><Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">{templates.length} SMS templates configured.</p><Button variant="outline" className="mt-4">Manage Templates</Button></CardContent></Card></TabsContent>
        <TabsContent value="test"><Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">Send a test SMS to verify your gateway configuration.</p><Button variant="outline" className="mt-4">Send Test SMS</Button></CardContent></Card></TabsContent>
        <TabsContent value="logs"><Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">View SMS delivery logs and status.</p><Button variant="outline" className="mt-4">View Logs</Button></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
