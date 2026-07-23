'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Send, Settings, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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

export default function AdminSettingsEmailPage({ section }: { section?: string }) {
  const [saved, setSaved] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const currentSection = section || 'smtp';

  const mockLogs: EmailLog[] = [
    { id: '1', to: 'user@example.com', subject: 'Welcome to ETR', status: 'sent', sentAt: '2024-01-15 10:30' },
    { id: '2', to: 'seller@example.com', subject: 'Your ticket was sold', status: 'sent', sentAt: '2024-01-14 15:45' },
    { id: '3', to: 'buyer@example.com', subject: 'Order confirmation', status: 'failed', sentAt: '2024-01-13 08:00' },
    { id: '4', to: 'admin@etr.com', subject: 'New KYC submission', status: 'queued', sentAt: '2024-01-15 11:00' },
  ];

  const mockTemplates: EmailTemplate[] = [
    { id: '1', name: 'Welcome Email', key: 'welcome', subject: 'Welcome to ETR!', lastModified: '2024-01-10' },
    { id: '2', name: 'Order Confirmation', key: 'order-confirmation', subject: 'Your order has been confirmed', lastModified: '2024-01-12' },
    { id: '3', name: 'Ticket Sold Notification', key: 'ticket-sold', subject: 'Your ticket has been sold!', lastModified: '2024-01-08' },
    { id: '4', name: 'KYC Verification', key: 'kyc-verification', subject: 'KYC verification result', lastModified: '2024-01-15' },
    { id: '5', name: 'Password Reset', key: 'password-reset', subject: 'Reset your password', lastModified: '2024-01-05' },
    { id: '6', name: 'Withdrawal Processed', key: 'withdrawal-processed', subject: 'Your withdrawal has been processed', lastModified: '2024-01-14' },
  ];

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // SMTP settings
  if (currentSection === 'smtp') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="w-6 h-6" />Email / SMTP Settings</h1>
        <Card>
          <CardHeader><CardTitle>SMTP Configuration</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">SMTP Host</label><Input defaultValue="smtp.gmail.com" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-sm font-medium">SMTP Port</label><Input defaultValue="587" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Encryption</label>
                <Select defaultValue="tls"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tls">TLS</SelectItem><SelectItem value="ssl">SSL</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">SMTP Username</label><Input defaultValue="noreply@etr.com.bd" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">SMTP Password</label><Input type="password" defaultValue="********" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">From Name</label><Input defaultValue="ETR Platform" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">From Email</label><Input defaultValue="noreply@etr.com.bd" /></div>
            <Separator className="my-4" />
            <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Enable SMTP</label></div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save SMTP Settings'}</Button>
          </CardContent>
        </Card>
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
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Key</TableHead><TableHead>Subject</TableHead><TableHead className="hidden md:table-cell">Last Modified</TableHead><TableHead className="w-[80px]">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockTemplates.map(t => (
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
            <div className="space-y-2"><label className="text-sm font-medium">Recipient Email</label><Input placeholder="test@example.com" value={testEmail} onChange={e => setTestEmail(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Subject</label><Input defaultValue="Test Email from ETR" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Message</label><Textarea defaultValue="This is a test email from the ETR platform." rows={4} /></div>
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
              <TableHeader><TableRow><TableHead>To</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Sent At</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockLogs.map(log => (
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
          <Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">{mockTemplates.length} email templates configured.</p><Button variant="outline" className="mt-4">Manage Templates</Button></CardContent></Card>
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

function Separator({ className }: { className?: string }) {
  return <hr className={`border-border ${className || ''}`} />;
}
