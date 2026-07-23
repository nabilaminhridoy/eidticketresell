'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CreditCard, Wallet, Shield, Coins, Settings, Webhook, ArrowRight,
  AlertTriangle, CheckCircle2, Info, DollarSign, Banknote
} from 'lucide-react';

export default function AdminSettingsPaymentsPage({ section }: { section?: string }) {
  const [saved, setSaved] = useState(false);
  const currentSection = section || 'overview';

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // bKash settings
  if (currentSection === 'bkash') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="w-6 h-6" />bKash Configuration</h1>
        <Card>
          <CardHeader><CardTitle>bKash Payment Gateway</CardTitle><CardDescription>Configure bKash integration for online payments</CardDescription></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm font-medium">Enable bKash</label></div>
            <Separator />
            <div className="space-y-2"><label className="text-sm font-medium">bKash Merchant Number</label><Input defaultValue="017XXXXXXXX" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">bKash App Key</label><Input defaultValue="bkash_app_key_xxxx" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">bKash App Secret</label><Input type="password" defaultValue="bkash_app_secret_xxxx" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">bKash Username</label><Input defaultValue="bkash_merchant" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">bKash Password</label><Input type="password" defaultValue="bkash_password_xxxx" /></div>
            <Separator />
            <div className="space-y-2"><label className="text-sm font-medium">Mode</label>
              <Select defaultValue="sandbox"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sandbox">Sandbox (Test)</SelectItem><SelectItem value="live">Live</SelectItem></SelectContent></Select>
            </div>
            <div className="flex items-center gap-2"><Switch /><label className="text-sm">Auto-verify payments</label></div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save bKash Settings'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SSLCommerz settings
  if (currentSection === 'sslcommerz') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6" />SSLCommerz Configuration</h1>
        <Card>
          <CardHeader><CardTitle>SSLCommerz Payment Gateway</CardTitle><CardDescription>Configure SSLCommerz for Visa/Mastercard payments</CardDescription></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm font-medium">Enable SSLCommerz</label></div>
            <Separator />
            <div className="space-y-2"><label className="text-sm font-medium">Store ID</label><Input defaultValue="etr_store_id" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Store Password</label><Input type="password" defaultValue="ssl_store_pass_xxxx" /></div>
            <Separator />
            <div className="space-y-2"><label className="text-sm font-medium">Mode</label>
              <Select defaultValue="sandbox"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sandbox">Sandbox (Test)</SelectItem><SelectItem value="live">Live</SelectItem></SelectContent></Select>
            </div>
            <div className="flex items-center gap-2"><Switch /><label className="text-sm">Enable EMI option</label></div>
            <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Enable international cards</label></div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save SSLCommerz Settings'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Platform Fee - CRITICAL SECTION
  if (currentSection === 'platform-fee') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Coins className="w-6 h-6" />Platform Fee Settings</h1>

        {/* Prominent Fee Structure Display */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Platform Fee Structure
            </CardTitle>
            <CardDescription>Current fee configuration for the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-card border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default" className="bg-primary text-lg px-3 py-1">Online Copy</Badge>
                </div>
                <p className="text-4xl font-bold text-primary">2%</p>
                <p className="text-sm font-medium mt-2">Deducted from seller&apos;s selling price</p>
                <div className="mt-4 p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /><span className="text-sm">Buyer pays full listed price</span></div>
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /><span className="text-sm">Seller receives price minus 2% fee</span></div>
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /><span className="text-sm">Platform collects 2% from each sale</span></div>
                </div>
                <div className="mt-3 p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Example: Ticket ৳1,000 → Seller gets ৳980, Platform gets ৳20
                </div>
              </div>
              <div className="p-6 rounded-xl bg-card border-2 border-orange/20">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-orange text-white text-lg px-3 py-1">Counter Copy</Badge>
                </div>
                <p className="text-4xl font-bold text-orange">3%</p>
                <p className="text-sm font-medium mt-2">Buyer pays to platform directly</p>
                <div className="mt-4 p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange" /><span className="text-sm">Buyer pays 3% platform fee online</span></div>
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange" /><span className="text-sm">Remaining amount paid in person/COD</span></div>
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange" /><span className="text-sm">Platform collects 3% from buyer upfront</span></div>
                </div>
                <div className="mt-3 p-2 rounded-lg bg-orange/10 text-orange text-xs flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Example: Ticket ৳1,000 → Buyer pays ৳30 fee online, ৳970 to seller in person
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Configuration Form */}
        <Card>
          <CardHeader><CardTitle>Fee Configuration</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Badge variant="default" className="bg-primary">Online</Badge>Platform Fee (%)
                </label>
                <Input type="number" defaultValue={2} step={0.1} min={0} max={10} />
                <p className="text-xs text-muted-foreground">Percentage deducted from seller&apos;s price for Online Copy tickets</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Badge className="bg-orange text-white">Counter</Badge>Platform Fee (%)
                </label>
                <Input type="number" defaultValue={3} step={0.1} min={0} max={10} />
                <p className="text-xs text-muted-foreground">Percentage buyer pays to platform for Counter Copy tickets</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Fee Amount (BDT)</label>
              <Input type="number" defaultValue={5} />
              <p className="text-xs text-muted-foreground">Minimum platform fee per transaction, regardless of percentage calculation</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fee Calculation Method</label>
              <Select defaultValue="percentage"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="percentage">Percentage only</SelectItem>
                <SelectItem value="percentage-min">Percentage with minimum fee</SelectItem>
                <SelectItem value="fixed">Fixed amount per ticket</SelectItem>
              </SelectContent></Select>
            </div>
            <Separator />
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Important: Changing fee structure affects all future transactions</p>
                <p className="text-xs text-yellow-700">Existing orders will continue with the fee rate at the time of purchase. Only new orders will use the updated rate.</p>
              </div>
            </div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Update Fee Structure'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payout settings
  if (currentSection === 'payout-settings') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Banknote className="w-6 h-6" />Payout Settings</h1>
        <Card>
          <CardHeader><CardTitle>Payout Configuration</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Minimum Payout Amount (BDT)</label><Input type="number" defaultValue={500} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Payout Processing Time</label>
              <Select defaultValue="3-days"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="instant">Instant</SelectItem><SelectItem value="1-day">1 Business Day</SelectItem><SelectItem value="3-days">3 Business Days</SelectItem><SelectItem value="7-days">7 Business Days</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Auto Payout Threshold (BDT)</label><Input type="number" defaultValue={5000} /></div>
            <div className="flex items-center gap-2"><Switch /><label className="text-sm">Enable auto-payout when threshold reached</label></div>
            <Separator />
            <div className="space-y-2"><label className="text-sm font-medium">Supported Payout Methods</label>
              <div className="space-y-2">
                {['bKash', 'Nagad', 'Bank Transfer'].map(method => (
                  <div key={method} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">{method}</span>
                    <Switch defaultChecked={method === 'bKash'} />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Payout Settings'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Webhooks
  if (currentSection === 'webhooks') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Webhook className="w-6 h-6" />Payment Webhooks</h1>
        <Card>
          <CardHeader><CardTitle>Webhook Configuration</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {[
                { name: 'bKash Payment Success', url: '/api/webhooks/bkash/success', active: true },
                { name: 'bKash Payment Failed', url: '/api/webhooks/bkash/failed', active: true },
                { name: 'SSLCommerz IPN', url: '/api/webhooks/sslcommerz/ipn', active: true },
                { name: 'SSLCommerz Validation', url: '/api/webhooks/sslcommerz/validate', active: true },
              ].map(wh => (
                <div key={wh.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">{wh.name}</p>
                    <p className="text-xs text-muted-foreground">{wh.url}</p>
                  </div>
                  <div className="flex items-center gap-2"><Switch checked={wh.active} /><Button variant="outline" size="sm">Test</Button></div>
                </div>
              ))}
            </div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Webhook Settings'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default - overview with tabs
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6" />Payment Gateway Settings</h1>

      {/* Platform Fee Highlight */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-primary">Online: 2%</Badge>
              <span className="text-sm text-muted-foreground">From seller price</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange text-white">Counter: 3%</Badge>
              <span className="text-sm text-muted-foreground">Buyer pays to platform</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bkash">
        <TabsList>
          <TabsTrigger value="bkash">bKash</TabsTrigger>
          <TabsTrigger value="sslcommerz">SSLCommerz</TabsTrigger>
          <TabsTrigger value="platform-fee">Platform Fee</TabsTrigger>
          <TabsTrigger value="payout">Payout</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>
        <TabsContent value="bkash"><Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">Configure bKash mobile payment gateway.</p></CardContent></Card></TabsContent>
        <TabsContent value="sslcommerz"><Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">Configure SSLCommerz for card payments.</p></CardContent></Card></TabsContent>
        <TabsContent value="platform-fee"><Card><CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10"><p className="text-lg font-bold text-primary">2% Online</p><p className="text-xs text-muted-foreground">Seller fee</p></div>
            <div className="p-3 rounded-lg bg-orange/10"><p className="text-lg font-bold text-orange">3% Counter</p><p className="text-xs text-muted-foreground">Buyer fee</p></div>
          </div>
        </CardContent></Card></TabsContent>
        <TabsContent value="payout"><Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">Configure payout methods and thresholds.</p></CardContent></Card></TabsContent>
        <TabsContent value="webhooks"><Card><CardContent className="p-6"><p className="text-muted-foreground text-sm">Configure payment webhook endpoints.</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
