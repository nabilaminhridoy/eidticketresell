'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  CreditCard, Wallet, Shield, Coins, Settings, Webhook, ArrowRight,
  AlertTriangle, CheckCircle2, Info, DollarSign, Banknote, Loader2,
  Landmark, Smartphone, FileText, Eye, Zap, Globe, QrCode, Mail, MessageSquare
} from 'lucide-react';

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const SSLCOMMERZ_PAYMENT_METHODS = [
  { id: 'brac_visa', label: 'BRAC Visa', group: 'visa' },
  { id: 'dbbl_visa', label: 'DBBL Visa', group: 'visa' },
  { id: 'city_visa', label: 'City Visa', group: 'visa' },
  { id: 'ebl_visa', label: 'EBL Visa', group: 'visa' },
  { id: 'sbl_visa', label: 'SBL Visa', group: 'visa' },
  { id: 'brac_master', label: 'BRAC Master', group: 'master' },
  { id: 'dbbl_master', label: 'DBBL Master', group: 'master' },
  { id: 'city_master', label: 'City Master', group: 'master' },
  { id: 'ebl_master', label: 'EBL Master', group: 'master' },
  { id: 'sbl_master', label: 'SBL Master', group: 'master' },
  { id: 'city_amex', label: 'City AMEX', group: 'amex' },
  { id: 'qcash', label: 'QCash', group: 'other' },
  { id: 'dbbl_nexus', label: 'DBBL Nexus', group: 'internet_banking' },
  { id: 'bankasia', label: 'Bank Asia', group: 'internet_banking' },
  { id: 'abbank', label: 'AB Bank', group: 'internet_banking' },
  { id: 'ibbl', label: 'IBBL', group: 'internet_banking' },
  { id: 'mtbl', label: 'MTBL', group: 'internet_banking' },
  { id: 'bkash', label: 'bKash', group: 'mobile_banking' },
  { id: 'dbblmobilebanking', label: 'DBBL Mobile', group: 'mobile_banking' },
  { id: 'city', label: 'City Bank', group: 'mobile_banking' },
  { id: 'upay', label: 'UPay', group: 'mobile_banking' },
  { id: 'tapnpay', label: 'Tap & Pay', group: 'mobile_banking' },
];

const PAYMENT_METHOD_GROUPS = [
  { id: 'visa', label: 'Visa Cards', methods: SSLCOMMERZ_PAYMENT_METHODS.filter(m => m.group === 'visa') },
  { id: 'master', label: 'Master Cards', methods: SSLCOMMERZ_PAYMENT_METHODS.filter(m => m.group === 'master') },
  { id: 'amex', label: 'AMEX', methods: SSLCOMMERZ_PAYMENT_METHODS.filter(m => m.group === 'amex') },
  { id: 'internet_banking', label: 'Internet Banking', methods: SSLCOMMERZ_PAYMENT_METHODS.filter(m => m.group === 'internet_banking') },
  { id: 'mobile_banking', label: 'Mobile Banking', methods: SSLCOMMERZ_PAYMENT_METHODS.filter(m => m.group === 'mobile_banking') },
  { id: 'other', label: 'Other Cards', methods: SSLCOMMERZ_PAYMENT_METHODS.filter(m => m.group === 'other') },
];

export default function AdminSettingsPaymentsPage({ section }: { section?: string }) {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(section || 'overview');

  useEffect(() => {
    fetch('/api/admin/settings?group=payments', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          const map: Record<string, string> = {};
          d.settings.forEach((s: { key: string; value: string }) => {
            map[s.key] = s.value;
          });
          setSettingsMap(map);
          setFormValues(map);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (section) setActiveTab(section);
  }, [section]);

  const updateFormValue = useCallback((key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async (settingsToSave: { key: string; value: string }[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: settingsToSave.map(s => ({ key: s.key, value: s.value, group: 'payments' })),
        }),
      });
      if (res.ok) {
        setSaved(true);
        // Update settingsMap to reflect saved values
        const newMap = { ...settingsMap };
        settingsToSave.forEach(s => { newMap[s.key] = s.value; });
        setSettingsMap(newMap);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const getChangedSettings = (): { key: string; value: string }[] => {
    const changed: { key: string; value: string }[] = [];
    for (const [key, value] of Object.entries(formValues)) {
      if (settingsMap[key] !== value) {
        changed.push({ key, value });
      }
    }
    // Also include new keys that weren't in original settingsMap
    return changed;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const sslMode = formValues['sslcommerz_mode'] || settingsMap['sslcommerz_mode'] || 'sandbox';
  const sslEnabled = formValues['sslcommerz_enabled'] === 'true';
  const bkashEnabled = formValues['bkash_enabled'] === 'true';
  const qbpEnabled = formValues['sslcommerz_qbp_enabled'] === 'true';
  const gpEnabled = formValues['sslcommerz_gp_enabled'] === 'true';
  const invoiceEnabled = formValues['sslcommerz_invoice_enabled'] === 'true';
  const ipnEnabled = formValues['sslcommerz_ipn_enabled'] === 'true';

  // Parse allowed payment methods
  const allowedMethods = (formValues['sslcommerz_allowed_payment_methods'] || '').split(',').filter(Boolean);

  const togglePaymentMethod = (methodId: string) => {
    const current = allowedMethods;
    const updated = current.includes(methodId)
      ? current.filter(m => m !== methodId)
      : [...current, methodId];
    updateFormValue('sslcommerz_allowed_payment_methods', updated.join(','));
  };

  const toggleGroup = (groupMethods: typeof SSLCOMMERZ_PAYMENT_METHODS) => {
    const groupIds = groupMethods.map(m => m.id);
    const allSelected = groupIds.every(id => allowedMethods.includes(id));
    const current = allowedMethods;
    if (allSelected) {
      // Remove all from this group
      const updated = current.filter(m => !groupIds.includes(m));
      updateFormValue('sslcommerz_allowed_payment_methods', updated.join(','));
    } else {
      // Add all from this group
      const updated = [...new Set([...current, ...groupIds])];
      updateFormValue('sslcommerz_allowed_payment_methods', updated.join(','));
    }
  };

  // Payment Methods Overview Dashboard
  const PaymentMethodsOverview = () => {
    const onlineFee = parseFloat(formValues['platform_fee_online'] || '2');
    const counterFee = parseFloat(formValues['platform_fee_counter'] || '3');
    const methods = [
      {
        name: 'bKash',
        icon: <Wallet className="w-5 h-5" />,
        enabled: bkashEnabled,
        mode: formValues['bkash_mode'] || 'sandbox',
        color: 'bg-pink-50 border-pink-200',
        description: 'Mobile banking payment via bKash',
        configKeys: ['bkash_enabled', 'bkash_app_key', 'bkash_mode'],
      },
      {
        name: 'SSLCommerz',
        icon: <CreditCard className="w-5 h-5" />,
        enabled: sslEnabled,
        mode: sslMode,
        color: 'bg-green-50 border-green-200',
        description: 'Visa, Mastercard, AMEX & bank payments',
        configKeys: ['sslcommerz_enabled', 'sslcommerz_store_id', 'sslcommerz_mode'],
      },
      {
        name: 'Quick Bank Pay',
        icon: <Landmark className="w-5 h-5" />,
        enabled: qbpEnabled,
        mode: sslMode,
        color: 'bg-blue-50 border-blue-200',
        description: 'Direct bank payment via SSLCommerz QBP',
        configKeys: ['sslcommerz_qbp_enabled', 'sslcommerz_qbp_api_key', 'sslcommerz_qbp_stk_code'],
      },
      {
        name: 'Google Pay',
        icon: <Globe className="w-5 h-5" />,
        enabled: gpEnabled,
        mode: sslMode,
        color: 'bg-purple-50 border-purple-200',
        description: 'Google Pay through SSLCommerz gateway',
        configKeys: ['sslcommerz_gp_enabled', 'sslcommerz_gp_merchant_id'],
      },
      {
        name: 'Invoice',
        icon: <FileText className="w-5 h-5" />,
        enabled: invoiceEnabled,
        mode: sslMode,
        color: 'bg-orange-50 border-orange-200',
        description: 'SSLCommerz invoice & Bangla QR payments',
        configKeys: ['sslcommerz_invoice_enabled', 'sslcommerz_invoice_auto_email'],
      },
    ];

    return (
      <div className="space-y-6">
        {/* Platform Fee Highlight */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-primary">Online: {onlineFee}%</Badge>
                <span className="text-sm text-muted-foreground">From seller price</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange text-white">Counter: {counterFee}%</Badge>
                <span className="text-sm text-muted-foreground">Buyer pays to platform</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Method Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map(method => (
            <Card key={method.name} className={`${method.color} border`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {method.icon}
                    <CardTitle className="text-base">{method.name}</CardTitle>
                  </div>
                  <Badge variant={method.enabled ? 'default' : 'secondary'}>
                    {method.enabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{method.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {method.mode === 'sandbox' ? 'Sandbox' : 'Live'} Mode
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab(method.name.toLowerCase().replace(/\s+/g, '-'))}
                  >
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* IPN Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5" />IPN & Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={ipnEnabled ? 'default' : 'secondary'}>IPN: {ipnEnabled ? 'Enabled' : 'Disabled'}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={formValues['sslcommerz_ipn_verify_hash'] === 'true' ? 'default' : 'secondary'}>
                  Hash Verify: {formValues['sslcommerz_ipn_verify_hash'] === 'true' ? 'On' : 'Off'}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('sslcommerz')}>
                Configure IPN
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // bKash Configuration
  const BkashConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5" />bKash Payment Gateway</CardTitle>
          <CardDescription>Configure bKash integration for mobile banking payments</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={formValues['bkash_enabled'] === 'true'}
                onCheckedChange={(checked) => updateFormValue('bkash_enabled', checked ? 'true' : 'false')}
              />
              <Label className="font-medium">Enable bKash</Label>
            </div>
            <Badge variant={formValues['bkash_enabled'] === 'true' ? 'default' : 'secondary'}>
              {formValues['bkash_enabled'] === 'true' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="font-medium">bKash Merchant Number</Label>
            <Input
              value={formValues['bkash_merchant_number'] || ''}
              onChange={(e) => updateFormValue('bkash_merchant_number', e.target.value)}
              placeholder="e.g., 017XXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">The merchant number registered with bKash</p>
          </div>
          <div className="space-y-2">
            <Label className="font-medium">bKash App Key</Label>
            <Input
              value={formValues['bkash_app_key'] || ''}
              onChange={(e) => updateFormValue('bkash_app_key', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">bKash App Secret</Label>
            <Input
              type="password"
              value={formValues['bkash_app_secret'] || ''}
              onChange={(e) => updateFormValue('bkash_app_secret', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Keep this secret. Never expose it in client-side code.</p>
          </div>
          <div className="space-y-2">
            <Label className="font-medium">bKash Username</Label>
            <Input
              value={formValues['bkash_username'] || ''}
              onChange={(e) => updateFormValue('bkash_username', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-medium">bKash Password</Label>
            <Input
              type="password"
              value={formValues['bkash_password'] || ''}
              onChange={(e) => updateFormValue('bkash_password', e.target.value)}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="font-medium">Mode</Label>
            <Select
              value={formValues['bkash_mode'] || 'sandbox'}
              onValueChange={(v) => updateFormValue('bkash_mode', v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Use Sandbox for testing, Live for real transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={formValues['bkash_auto_verify'] === 'true'}
              onCheckedChange={(checked) => updateFormValue('bkash_auto_verify', checked ? 'true' : 'false')}
            />
            <Label>Auto-verify payments</Label>
            <p className="text-xs text-muted-foreground ml-auto">Automatically verify payment status with bKash API</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // SSLCommerz Configuration - Core
  const SSLCommerzCoreConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />SSLCommerz Payment Gateway</CardTitle>
              <CardDescription>Configure SSLCommerz for Visa, Mastercard, AMEX and bank payments</CardDescription>
            </div>
            <Badge variant={sslMode === 'sandbox' ? 'secondary' : 'default'}>
              {sslMode === 'sandbox' ? 'Sandbox' : 'Live'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={sslEnabled}
                onCheckedChange={(checked) => updateFormValue('sslcommerz_enabled', checked ? 'true' : 'false')}
              />
              <Label className="font-medium">Enable SSLCommerz</Label>
            </div>
            <Badge variant={sslEnabled ? 'default' : 'secondary'}>
              {sslEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <Separator />

          {/* Core Payment Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Core Payment Settings</h3>
            <div className="space-y-2">
              <Label className="font-medium">Store ID</Label>
              <Input
                value={formValues['sslcommerz_store_id'] || ''}
                onChange={(e) => updateFormValue('sslcommerz_store_id', e.target.value)}
                placeholder="e.g., test_store_id"
              />
              <p className="text-xs text-muted-foreground">Your SSLCommerz store identifier provided during registration</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Store Password</Label>
              <Input
                type="password"
                value={formValues['sslcommerz_store_password'] || ''}
                onChange={(e) => updateFormValue('sslcommerz_store_password', e.target.value)}
                placeholder="Your store password"
              />
              <p className="text-xs text-muted-foreground">Secret password for your SSLCommerz store. Keep this secure.</p>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Mode</Label>
              <Select
                value={sslMode}
                onValueChange={(v) => updateFormValue('sslcommerz_mode', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {sslMode === 'sandbox'
                  ? 'Sandbox mode for testing. No real transactions will be processed.'
                  : 'Live mode — real money transactions will be processed!'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Gateway Control - Allowed Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gateway Control — Allowed Payment Methods</h3>
            <p className="text-xs text-muted-foreground">Select which payment methods are available to customers at checkout. Unchecked methods will be hidden from the payment page.</p>

            {/* Group Toggles */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PAYMENT_METHOD_GROUPS.map(group => {
                const allSelected = group.methods.every(m => allowedMethods.includes(m.id));
                return (
                  <Button
                    key={group.id}
                    variant={allSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleGroup(group.methods)}
                    className="justify-start"
                  >
                    <Checkbox checked={allSelected} className="mr-2 pointer-events-none" />
                    {group.label}
                  </Button>
                );
              })}
            </div>

            <Separator />

            {/* Individual Payment Methods */}
            <div className="space-y-3">
              {PAYMENT_METHOD_GROUPS.map(group => (
                <Card key={group.id} className="border-dashed">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm">{group.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {group.methods.map(method => (
                        <div key={method.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={allowedMethods.includes(method.id)}
                            onCheckedChange={() => togglePaymentMethod(method.id)}
                          />
                          <Label className="text-xs cursor-pointer">{method.label}</Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Core Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                checked={formValues['sslcommerz_emi_enabled'] === 'true'}
                onCheckedChange={(checked) => updateFormValue('sslcommerz_emi_enabled', checked ? 'true' : 'false')}
              />
              <Label>Enable EMI option</Label>
              <p className="text-xs text-muted-foreground ml-auto">Allow customers to pay in installments via EMI</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formValues['sslcommerz_international'] === 'true'}
                onCheckedChange={(checked) => updateFormValue('sslcommerz_international', checked ? 'true' : 'false')}
              />
              <Label>Enable international cards</Label>
              <p className="text-xs text-muted-foreground ml-auto">Allow payments from international Visa/Mastercard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IPN Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />IPN (Instant Payment Notification) Settings</CardTitle>
          <CardDescription>Configure how SSLCommerz sends real-time payment notifications to your server</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={ipnEnabled}
              onCheckedChange={(checked) => updateFormValue('sslcommerz_ipn_enabled', checked ? 'true' : 'false')}
            />
            <Label className="font-medium">Enable IPN</Label>
            <p className="text-xs text-muted-foreground ml-auto">Receive instant notifications when payments are processed</p>
          </div>

          <div className="space-y-2">
            <Label className="font-medium">IPN URL</Label>
            <div className="flex items-center gap-2">
              <Input
                value={formValues['sslcommerz_ipn_url'] || `${window.location?.origin || ''}/api/payment/sslcommerz/ipn`}
                onChange={(e) => updateFormValue('sslcommerz_ipn_url', e.target.value)}
                className="flex-1"
              />
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                <Eye className="w-3 h-3 mr-1" />Configure in SSLCommerz Panel
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              This URL must also be configured in your SSLCommerz merchant dashboard under IPN settings.
              The IPN handler receives payment status updates directly from SSLCommerz servers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formValues['sslcommerz_ipn_verify_hash'] === 'true'}
              onCheckedChange={(checked) => updateFormValue('sslcommerz_ipn_verify_hash', checked ? 'true' : 'false')}
            />
            <Label className="font-medium">Verify IPN Hash</Label>
            <p className="text-xs text-muted-foreground ml-auto">Verify the verify_sign hash on each IPN request to prevent spoofing</p>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Security Recommendation</p>
              <p className="text-xs text-yellow-700">Always enable IPN hash verification to ensure payment notifications are authentic and not spoofed. Disabling this increases the risk of fraudulent payment confirmations.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Quick Bank Pay Configuration
  const QuickBankPayConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Landmark className="w-5 h-5" />Quick Bank Pay Settings</CardTitle>
              <CardDescription>Configure SSLCommerz Quick Bank Pay for direct bank payment integration</CardDescription>
            </div>
            <Badge variant={qbpEnabled ? 'default' : 'secondary'}>
              {qbpEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={qbpEnabled}
                onCheckedChange={(checked) => updateFormValue('sslcommerz_qbp_enabled', checked ? 'true' : 'false')}
              />
              <Label className="font-medium">Enable Quick Bank Pay</Label>
            </div>
          </div>

          <Separator />

          {/* Quick Bank Pay Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Bank Pay Credentials</h3>

            <div className="space-y-2">
              <Label className="font-medium">API Key</Label>
              <Input
                value={formValues['sslcommerz_qbp_api_key'] || ''}
                onChange={(e) => updateFormValue('sslcommerz_qbp_api_key', e.target.value)}
                placeholder="Your QBP API key from SSLCommerz"
              />
              <p className="text-xs text-muted-foreground">API key provided by SSLCommerz for Quick Bank Pay authentication. Used in the API-KEY header for token generation.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">STK Code</Label>
              <Input
                value={formValues['sslcommerz_qbp_stk_code'] || 'SSLC'}
                onChange={(e) => updateFormValue('sslcommerz_qbp_stk_code', e.target.value)}
                placeholder="SSLC"
              />
              <p className="text-xs text-muted-foreground">Stock code identifier for Quick Bank Pay. Default value is &quot;SSLC&quot;. Used in the STK-CODE header for service list queries.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">AUTH Key</Label>
              <Input
                type="password"
                value={formValues['sslcommerz_qbp_auth_key'] || ''}
                onChange={(e) => updateFormValue('sslcommerz_qbp_auth_key', e.target.value)}
                placeholder="Your QBP authentication key"
              />
              <p className="text-xs text-muted-foreground">Authentication key for Quick Bank Pay. Used in the AUTH-KEY header for service list and bill queries.</p>
            </div>
          </div>

          <Separator />

          {/* Quick Bank Pay Info */}
          <div className="p-4 rounded-lg bg-muted/30 flex items-start gap-2">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Quick Bank Pay Overview</p>
              <p className="text-xs text-muted-foreground">Quick Bank Pay allows customers to pay bills directly through their bank accounts. It supports bill querying, payment confirmation, and status tracking. Contact SSLCommerz to obtain your QBP credentials.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Google Pay Configuration
  const GooglePayConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Google Pay Settings</CardTitle>
              <CardDescription>Configure Google Pay integration through SSLCommerz gateway</CardDescription>
            </div>
            <Badge variant={gpEnabled ? 'default' : 'secondary'}>
              {gpEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={gpEnabled}
                onCheckedChange={(checked) => updateFormValue('sslcommerz_gp_enabled', checked ? 'true' : 'false')}
              />
              <Label className="font-medium">Enable Google Pay</Label>
            </div>
          </div>

          <Separator />

          {/* Google Pay Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Google Pay Credentials</h3>

            <div className="space-y-2">
              <Label className="font-medium">Google Merchant ID</Label>
              <Input
                value={formValues['sslcommerz_gp_merchant_id'] || ''}
                onChange={(e) => updateFormValue('sslcommerz_gp_merchant_id', e.target.value)}
                placeholder="Your Google Pay merchant identifier"
              />
              <p className="text-xs text-muted-foreground">The merchant ID assigned by Google for your business. This is used as the gatewayMerchantId in the Google Pay configuration.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">AES Salt for user_refer Encryption</Label>
              <Input
                type="password"
                value={formValues['sslcommerz_gp_aes_salt'] || ''}
                onChange={(e) => updateFormValue('sslcommerz_gp_aes_salt', e.target.value)}
                placeholder="AES salt for encrypting user_refer parameter"
              />
              <p className="text-xs text-muted-foreground">AES encryption salt used to encrypt the user_refer parameter in Google Pay transactions. This ensures secure user identification during the payment flow.</p>
            </div>
          </div>

          <Separator />

          {/* Google Pay Info */}
          <div className="p-4 rounded-lg bg-muted/30 flex items-start gap-2">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Google Pay Integration Flow</p>
              <p className="text-xs text-muted-foreground">Google Pay through SSLCommerz follows a 3-step process: (1) Get Google Pay configuration, (2) Initiate transaction with customer&apos;s Google Pay token, (3) Process the encrypted token data. The gateway config is cached for 24 hours due to SSLCommerz&apos;s 3 requests/day limit.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Invoice Configuration
  const InvoiceConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Invoice Settings</CardTitle>
              <CardDescription>Configure SSLCommerz invoice generation and Bangla QR payments</CardDescription>
            </div>
            <Badge variant={invoiceEnabled ? 'default' : 'secondary'}>
              {invoiceEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Enable Invoice */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={invoiceEnabled}
                onCheckedChange={(checked) => updateFormValue('sslcommerz_invoice_enabled', checked ? 'true' : 'false')}
              />
              <Label className="font-medium">Enable Invoice</Label>
            </div>
          </div>

          <Separator />

          {/* Invoice Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Invoice Notification Settings</h3>

            <div className="flex items-center gap-3">
              <Switch
                checked={formValues['sslcommerz_invoice_auto_email'] === 'true'}
                onCheckedChange={(checked) => updateFormValue('sslcommerz_invoice_auto_email', checked ? 'true' : 'false')}
              />
              <Label className="font-medium">Auto-send Email on Invoice Creation</Label>
              <p className="text-xs text-muted-foreground ml-auto">Automatically email the invoice payment link to the customer</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formValues['sslcommerz_invoice_auto_sms'] === 'true'}
                onCheckedChange={(checked) => updateFormValue('sslcommerz_invoice_auto_sms', checked ? 'true' : 'false')}
              />
              <Label className="font-medium">Auto-send SMS on Invoice Creation</Label>
              <p className="text-xs text-muted-foreground ml-auto">Automatically SMS the invoice payment link to the customer</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formValues['sslcommerz_invoice_bangla_qr'] === 'true'}
              onCheckedChange={(checked) => updateFormValue('sslcommerz_invoice_bangla_qr', checked ? 'true' : 'false')}
              />
              <Label className="font-medium flex items-center gap-2">
                <QrCode className="w-4 h-4" />Enable Bangla QR
              </Label>
              <p className="text-xs text-muted-foreground ml-auto">Generate Bangla QR codes on invoices for QR-based payments</p>
            </div>
          </div>

          <Separator />

          {/* Invoice Info */}
          <div className="p-4 rounded-lg bg-muted/30 flex items-start gap-2">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Invoice Payment Flow</p>
              <p className="text-xs text-muted-foreground">SSLCommerz invoices create a payment link that can be shared with customers. The customer clicks the link and pays through any supported SSLCommerz method. You can track invoice status and cancel unpaid invoices. Bangla QR enables QR code-based payments compatible with the Bangladesh QR payment standard.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Platform Fee Configuration
  const PlatformFeeConfig = () => {
    const onlineFee = parseFloat(formValues['platform_fee_online'] || '2');
    const counterFee = parseFloat(formValues['platform_fee_counter'] || '3');
    const minFee = parseFloat(formValues['platform_fee_minimum'] || '5');

    return (
      <div className="space-y-6">
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
                <p className="text-4xl font-bold text-primary">{onlineFee}%</p>
                <p className="text-sm font-medium mt-2">Deducted from seller&apos;s selling price</p>
                <div className="mt-4 p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /><span className="text-sm">Buyer pays full listed price</span></div>
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /><span className="text-sm">Seller receives price minus {onlineFee}% fee</span></div>
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /><span className="text-sm">Platform collects {onlineFee}% from each sale</span></div>
                </div>
                <div className="mt-3 p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Example: Ticket ৳1,000 → Seller gets ৳{1000 - (1000 * onlineFee / 100)}, Platform gets ৳{1000 * onlineFee / 100}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-card border-2 border-orange/20">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-orange text-white text-lg px-3 py-1">Counter Copy</Badge>
                </div>
                <p className="text-4xl font-bold text-orange">{counterFee}%</p>
                <p className="text-sm font-medium mt-2">Buyer pays to platform directly</p>
                <div className="mt-4 p-3 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange" /><span className="text-sm">Buyer pays {counterFee}% platform fee online</span></div>
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange" /><span className="text-sm">Remaining amount paid in person/COD</span></div>
                  <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-orange" /><span className="text-sm">Platform collects {counterFee}% from buyer upfront</span></div>
                </div>
                <div className="mt-3 p-2 rounded-lg bg-orange/10 text-orange text-xs flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Example: Ticket ৳1,000 → Buyer pays ৳{1000 * counterFee / 100} fee online, ৳{1000 - (1000 * counterFee / 100)} to seller in person
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
                <Input
                  type="number"
                  value={onlineFee}
                  onChange={(e) => updateFormValue('platform_fee_online', e.target.value)}
                  step={0.1} min={0} max={10}
                />
                <p className="text-xs text-muted-foreground">Percentage deducted from seller&apos;s price for Online Copy tickets</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Badge className="bg-orange text-white">Counter</Badge>Platform Fee (%)
                </label>
                <Input
                  type="number"
                  value={counterFee}
                  onChange={(e) => updateFormValue('platform_fee_counter', e.target.value)}
                  step={0.1} min={0} max={10}
                />
                <p className="text-xs text-muted-foreground">Percentage buyer pays to platform for Counter Copy tickets</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Fee Amount (BDT)</label>
              <Input
                type="number"
                value={minFee}
                onChange={(e) => updateFormValue('platform_fee_minimum', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimum platform fee per transaction, regardless of percentage calculation</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fee Calculation Method</label>
              <Select
                value={formValues['fee_calculation_method'] || 'percentage'}
                onValueChange={(v) => updateFormValue('fee_calculation_method', v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage only</SelectItem>
                  <SelectItem value="percentage-min">Percentage with minimum fee</SelectItem>
                  <SelectItem value="fixed">Fixed amount per ticket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Important: Changing fee structure affects all future transactions</p>
                <p className="text-xs text-yellow-700">Existing orders will continue with the fee rate at the time of purchase. Only new orders will use the updated rate.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Payout Configuration
  const PayoutConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Banknote className="w-5 h-5" />Payout Configuration</CardTitle>
          <CardDescription>Configure how sellers receive their payments</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="font-medium">Minimum Payout Amount (BDT)</Label>
            <Input
              type="number"
              value={parseFloat(formValues['min_payout_amount'] || '500')}
              onChange={(e) => updateFormValue('min_payout_amount', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Minimum amount a seller must earn before they can request a payout</p>
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Payout Processing Time</Label>
            <Select
              value={formValues['payout_processing_time'] || '3-days'}
              onValueChange={(v) => updateFormValue('payout_processing_time', v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="1-day">1 Business Day</SelectItem>
                <SelectItem value="3-days">3 Business Days</SelectItem>
                <SelectItem value="7-days">7 Business Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-medium">Auto Payout Threshold (BDT)</Label>
            <Input
              type="number"
              value={parseFloat(formValues['auto_payout_threshold'] || '5000')}
              onChange={(e) => updateFormValue('auto_payout_threshold', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">When a seller&apos;s balance exceeds this amount, payout is triggered automatically</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={formValues['auto_payout_enabled'] === 'true'}
              onCheckedChange={(checked) => updateFormValue('auto_payout_enabled', checked ? 'true' : 'false')}
            />
            <Label>Enable auto-payout when threshold reached</Label>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="font-medium">Supported Payout Methods</Label>
            <div className="space-y-2">
              {['bKash', 'Nagad', 'Bank Transfer'].map(method => {
                const key = `payout_method_${method.toLowerCase().replace(/\s+/g, '_')}`;
                return (
                  <div key={method} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">{method}</span>
                    <Switch
                      checked={formValues[key] === 'true'}
                      onCheckedChange={(checked) => updateFormValue(key, checked ? 'true' : 'false')}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Webhooks Configuration
  const WebhooksConfig = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Webhook className="w-5 h-5" />Payment Webhooks</CardTitle>
          <CardDescription>Configure webhook endpoints for payment status notifications</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              { name: 'bKash Payment Success', url: '/api/webhooks/bkash/success', key: 'webhook_bkash_success' },
              { name: 'bKash Payment Failed', url: '/api/webhooks/bkash/failed', key: 'webhook_bkash_failed' },
              { name: 'SSLCommerz IPN', url: '/api/payment/sslcommerz/ipn', key: 'webhook_sslcommerz_ipn' },
              { name: 'SSLCommerz Validation', url: '/api/payment/sslcommerz/validate', key: 'webhook_sslcommerz_validate' },
            ].map(wh => (
              <div key={wh.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-sm">{wh.name}</p>
                  <p className="text-xs text-muted-foreground">{wh.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formValues[wh.key] !== 'false'}
                    onCheckedChange={(checked) => updateFormValue(wh.key, checked ? 'true' : 'false')}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main Save Button
  const SaveButton = ({ label = 'Save Settings' }: { label?: string }) => (
    <div className="flex items-center gap-3 pt-4">
      <Button
        onClick={() => handleSave(getChangedSettings())}
        disabled={saving}
      >
        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {saved ? 'Saved!' : label}
      </Button>
      {saved && (
        <span className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />Settings saved successfully
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6" />Payment Gateway Settings</h1>
        <SaveButton label="Save All Changes" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><Zap className="w-3 h-3 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="bkash"><Wallet className="w-3 h-3 mr-1" />bKash</TabsTrigger>
          <TabsTrigger value="sslcommerz"><CreditCard className="w-3 h-3 mr-1" />SSLCommerz</TabsTrigger>
          <TabsTrigger value="quick-bank-pay"><Landmark className="w-3 h-3 mr-1" />Quick Bank Pay</TabsTrigger>
          <TabsTrigger value="google-pay"><Globe className="w-3 h-3 mr-1" />Google Pay</TabsTrigger>
          <TabsTrigger value="invoice"><FileText className="w-3 h-3 mr-1" />Invoice</TabsTrigger>
          <TabsTrigger value="platform-fee"><Coins className="w-3 h-3 mr-1" />Platform Fee</TabsTrigger>
          <TabsTrigger value="payout"><Banknote className="w-3 h-3 mr-1" />Payout</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="w-3 h-3 mr-1" />Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <PaymentMethodsOverview />
          <SaveButton label="Save All Payment Settings" />
        </TabsContent>

        <TabsContent value="bkash" className="space-y-4 mt-4">
          <BkashConfig />
          <SaveButton label="Save bKash Settings" />
        </TabsContent>

        <TabsContent value="sslcommerz" className="space-y-4 mt-4">
          <SSLCommerzCoreConfig />
          <SaveButton label="Save SSLCommerz Settings" />
        </TabsContent>

        <TabsContent value="quick-bank-pay" className="space-y-4 mt-4">
          <QuickBankPayConfig />
          <SaveButton label="Save Quick Bank Pay Settings" />
        </TabsContent>

        <TabsContent value="google-pay" className="space-y-4 mt-4">
          <GooglePayConfig />
          <SaveButton label="Save Google Pay Settings" />
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4 mt-4">
          <InvoiceConfig />
          <SaveButton label="Save Invoice Settings" />
        </TabsContent>

        <TabsContent value="platform-fee" className="space-y-4 mt-4">
          <PlatformFeeConfig />
          <SaveButton label="Save Fee Settings" />
        </TabsContent>

        <TabsContent value="payout" className="space-y-4 mt-4">
          <PayoutConfig />
          <SaveButton label="Save Payout Settings" />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4 mt-4">
          <WebhooksConfig />
          <SaveButton label="Save Webhook Settings" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
