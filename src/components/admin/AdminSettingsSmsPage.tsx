'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Smartphone, Send, FileText, Clock, CheckCircle, AlertCircle, Loader2,
  Wallet, RefreshCw, Info, Save,
} from 'lucide-react';

interface SettingItem {
  id: string;
  key: string;
  value: string;
  group: string;
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('etr_admin_token') : '';
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export default function AdminSettingsSmsPage({ section }: { section?: string }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentSection = section || 'default';

  const [smsSettings, setSmsSettings] = useState({
    provider: 'alpha_sms',
    apiKey: '',
    senderId: 'ETRBD',
    apiUrl: '',
    enabled: false,
    otpViaSms: false,
  });

  // Test SMS state
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Test SMS from ETR Admin Panel');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Balance check state
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState('');
  const [checkingBalance, setCheckingBalance] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings?group=sms', { headers: getAuthHeaders() })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        if (d.settings) {
          const settingsMap: Record<string, string> = {};
          (d.settings as SettingItem[]).forEach(s => { settingsMap[s.key] = s.value; });
          setSmsSettings({
            provider: settingsMap['sms_provider'] || 'alpha_sms',
            apiKey: settingsMap['sms_api_key'] || '',
            senderId: settingsMap['sms_sender_id'] || 'ETRBD',
            apiUrl: settingsMap['sms_api_url'] || '',
            enabled: settingsMap['sms_enabled'] === 'true',
            otpViaSms: settingsMap['sms_otp_enabled'] === 'true',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
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
      } else {
        setError('Failed to save settings');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhone.trim() || !testMessage.trim()) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/sms/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ to: testPhone, message: testMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `SMS sent successfully! Request ID: ${data.requestId || 'N/A'}` });
      } else {
        setTestResult({ success: false, message: `Failed: ${data.error || 'Unknown error'}` });
      }
    } catch {
      setTestResult({ success: false, message: 'Network error' });
    } finally {
      setTestSending(false);
    }
  };

  const handleCheckBalance = async () => {
    setCheckingBalance(true);
    setBalanceError('');
    setBalance(null);
    try {
      const res = await fetch('/api/admin/sms/balance', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.error) {
        setBalanceError(data.error);
      } else {
        setBalance(data.balance);
      }
    } catch {
      setBalanceError('Network error');
    } finally {
      setCheckingBalance(false);
    }
  };

  // Provider-specific descriptions
  const providerInfo: Record<string, { name: string; description: string; apiDocs: string }> = {
    alpha_sms: {
      name: 'Alpha SMS (sms.net.bd)',
      description: 'Bangladesh SMS gateway with support for single/bulk SMS, sender ID, scheduling, and delivery reports.',
      apiDocs: 'https://api.sms.net.bd',
    },
    bulk_sms_bd: {
      name: 'BulkSMSBD',
      description: 'Popular Bangladesh bulk SMS service with affordable rates for mass messaging.',
      apiDocs: 'https://bulksmsbd.com/bulksms-api-bangladesh.php',
    },
    custom: {
      name: 'Custom Gateway',
      description: 'Use any SMS gateway by providing a custom API URL and key.',
      apiDocs: '',
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="w-6 h-6" />SMS Settings</h1>
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="w-6 h-6" />SMS Settings</h1>

      <Tabs defaultValue={currentSection === 'default' ? 'provider' : currentSection}>
        <TabsList>
          <TabsTrigger value="provider" className="gap-1"><Smartphone className="w-3.5 h-3.5" />Provider</TabsTrigger>
          <TabsTrigger value="test" className="gap-1"><Send className="w-3.5 h-3.5" />Test SMS</TabsTrigger>
          <TabsTrigger value="balance" className="gap-1"><Wallet className="w-3.5 h-3.5" />Balance</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1"><FileText className="w-3.5 h-3.5" />Templates</TabsTrigger>
        </TabsList>

        {/* ─── PROVIDER TAB ─── */}
        <TabsContent value="provider">
          <Card>
            <CardHeader>
              <CardTitle>SMS Gateway Configuration</CardTitle>
              <CardDescription>Select and configure your SMS provider for sending notifications and OTPs</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Enable SMS */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">SMS Service</p>
                    <p className="text-xs text-muted-foreground">Enable or disable the SMS gateway</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={smsSettings.enabled ? 'default' : 'secondary'}>
                    {smsSettings.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch checked={smsSettings.enabled} onCheckedChange={v => setSmsSettings(s => ({ ...s, enabled: v }))} />
                </div>
              </div>

              <Separator />

              {/* Provider selection */}
              <div className="space-y-2">
                <Label>SMS Provider</Label>
                <Select value={smsSettings.provider} onValueChange={v => setSmsSettings(s => ({ ...s, provider: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha_sms">Alpha SMS (sms.net.bd)</SelectItem>
                    <SelectItem value="bulk_sms_bd">BulkSMSBD</SelectItem>
                    <SelectItem value="custom">Custom Gateway</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Provider info card */}
              <Alert className="border-blue-200 dark:border-blue-900">
                <Info className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-medium">{providerInfo[smsSettings.provider]?.name}</p>
                  <p className="text-xs text-muted-foreground">{providerInfo[smsSettings.provider]?.description}</p>
                </AlertDescription>
              </Alert>

              {/* API Key */}
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  value={smsSettings.apiKey}
                  onChange={e => setSmsSettings(s => ({ ...s, apiKey: e.target.value }))}
                  placeholder={smsSettings.provider === 'alpha_sms' ? 'Your Alpha SMS API key' : smsSettings.provider === 'bulk_sms_bd' ? 'Your BulkSMSBD API key' : 'Your custom gateway API key'}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">Keep your API key secret — never share it publicly</p>
              </div>

              {/* Sender ID */}
              <div className="space-y-2">
                <Label>Sender ID / Mask</Label>
                <Input
                  value={smsSettings.senderId}
                  onChange={e => setSmsSettings(s => ({ ...s, senderId: e.target.value }))}
                  placeholder="ETRBD"
                />
                <p className="text-xs text-muted-foreground">
                  {smsSettings.provider === 'alpha_sms'
                    ? 'Approved Sender ID for Alpha SMS (optional parameter)'
                    : 'Sender ID or mask name for your SMS messages'}
                </p>
              </div>

              {/* Custom API URL (only for custom provider) */}
              {smsSettings.provider === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom API URL</Label>
                  <Input
                    value={smsSettings.apiUrl}
                    onChange={e => setSmsSettings(s => ({ ...s, apiUrl: e.target.value }))}
                    placeholder="https://your-sms-provider.com/api/send"
                  />
                  <p className="text-xs text-muted-foreground">The endpoint URL for sending SMS via your custom provider</p>
                </div>
              )}

              <Separator />

              {/* OTP via SMS */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium">Send OTP via SMS</p>
                  <p className="text-xs text-muted-foreground">Use SMS for one-time password verification instead of email</p>
                </div>
                <Switch checked={smsSettings.otpViaSms} onCheckedChange={v => setSmsSettings(s => ({ ...s, otpViaSms: v }))} />
              </div>

              {/* Alpha SMS specific info */}
              {smsSettings.provider === 'alpha_sms' && (
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm font-medium">Alpha SMS (sms.net.bd) — API Details</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Send SMS Endpoint:</strong> <code className="bg-muted/50 px-1 rounded">https://api.sms.net.bd/sendsms</code></p>
                      <p><strong>Parameters:</strong> api_key, msg, to, sender_id (optional), schedule (optional), content_id (optional for bulk)</p>
                      <p><strong>Phone Format:</strong> Numbers must start with country code (880) or standard 01X format</p>
                      <p><strong>Multiple Numbers:</strong> Separate with comma (e.g., 8801800000000,8801900000000)</p>
                      <p><strong>Check Balance:</strong> <code className="bg-muted/50 px-1 rounded">https://api.sms.net.bd/user/balance/?api_key={'{KEY}'}</code></p>
                      <p><strong>Delivery Report:</strong> <code className="bg-muted/50 px-1 rounded">https://api.sms.net.bd/report/request/{'{id}'}/?api_key={'{KEY}'}</code></p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* BulkSMSBD specific info */}
              {smsSettings.provider === 'bulk_sms_bd' && (
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm font-medium">BulkSMSBD — API Details</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>API Docs:</strong> <code className="bg-muted/50 px-1 rounded">https://bulksmsbd.com/bulksms-api-bangladesh.php</code></p>
                      <p><strong>Send SMS:</strong> POST to BulkSMSBD API with api_key, sender_id, mobile, message</p>
                      <p><strong>Check Balance:</strong> Uses BulkSMSBD balance API endpoint</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button onClick={handleSave} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TEST SMS TAB ─── */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Send Test SMS</CardTitle>
              <CardDescription>Verify your SMS gateway configuration by sending a test message</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!smsSettings.enabled && (
                <Alert className="border-yellow-200 dark:border-yellow-900">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>SMS service is currently disabled. Enable it in the Provider tab before testing.</AlertDescription>
                </Alert>
              )}

              {!smsSettings.apiKey && (
                <Alert className="border-yellow-200 dark:border-yellow-900">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>No API key configured. Add your API key in the Provider tab first.</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+880 1XXX-XXXXXX"
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {smsSettings.provider === 'alpha_sms'
                    ? 'Use 880 format (e.g., 8801800000000) or standard 01X format'
                    : 'Enter the recipient phone number'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  rows={3}
                  placeholder="Type your test message here"
                />
              </div>

              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Sending via: <strong>{providerInfo[smsSettings.provider]?.name || smsSettings.provider}</strong>
                </p>
              </div>

              {testResult && (
                <Alert className={testResult.success ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'}>
                  {testResult.success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleTestSms} disabled={testSending || !smsSettings.enabled || !smsSettings.apiKey || !testPhone.trim()} className="gap-1">
                {testSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Test SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── BALANCE TAB ─── */}
        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>SMS Balance</CardTitle>
              <CardDescription>Check your remaining SMS balance from your configured provider</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Checking balance for: <strong>{providerInfo[smsSettings.provider]?.name || smsSettings.provider}</strong>
                </p>
              </div>

              {!smsSettings.apiKey && (
                <Alert className="border-yellow-200 dark:border-yellow-900">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>No API key configured. Add your API key in the Provider tab first.</AlertDescription>
                </Alert>
              )}

              {balance !== null && (
                <Card className="border-green-200 dark:border-green-900">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Current Balance</p>
                        <p className="text-2xl font-bold">৳ {balance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {balanceError && (
                <Alert className="border-red-200 dark:border-red-900">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{balanceError}</AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCheckBalance} disabled={checkingBalance || !smsSettings.apiKey} className="gap-1">
                {checkingBalance ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Check Balance
              </Button>

              {/* Alpha SMS balance API info */}
              {smsSettings.provider === 'alpha_sms' && (
                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium">Alpha SMS Balance API</p>
                  <p className="text-xs text-muted-foreground">
                    <code className="bg-muted/50 px-1 rounded">GET https://api.sms.net.bd/user/balance/?api_key={'{YOUR_API_KEY}'}</code>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Returns: <code className="bg-muted/50 px-1 rounded">{`{"error": 0, "data": {"balance": "00.0000"}}`}</code>
                  </p>
                </div>
              )}

              {smsSettings.provider === 'bulk_sms_bd' && (
                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-medium">BulkSMSBD Balance API</p>
                  <p className="text-xs text-muted-foreground">
                    Uses BulkSMSBD API balance endpoint with your configured API key
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TEMPLATES TAB ─── */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>Pre-defined message templates for common notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead className="hidden md:table-cell">Message Template</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: 'OTP Verification', key: 'otp-verification', message: 'Your ETR verification code is {{otp}}' },
                    { name: 'Order Confirmation', key: 'order-confirmation', message: 'Your order {{order_id}} is confirmed. Ticket: {{ticket_name}}' },
                    { name: 'Ticket Sold', key: 'ticket-sold', message: 'Your ticket {{ticket_name}} has been sold for ৳{{price}}!' },
                    { name: 'Withdrawal Processed', key: 'withdrawal', message: 'Your withdrawal of ৳{{amount}} has been processed.' },
                  ].map(t => (
                    <TableRow key={t.key}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.key}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">{t.message}</TableCell>
                      <TableCell><Button variant="outline" size="sm">Edit</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


