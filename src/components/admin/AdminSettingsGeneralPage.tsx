'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings, Globe, Upload, ImageIcon, Save, Mail, Phone, MapPin,
  Palette, Languages, Clock, Coins, Monitor, Loader2
} from 'lucide-react';

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminSettingsGeneralPage({ section }: { section?: string }) {
  const [initialSettings, setInitialSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // General / Site Info
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Contact
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Appearance
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [showPoweredBy, setShowPoweredBy] = useState(true);

  // Localization
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [bilingualMode, setBilingualMode] = useState(true);
  const [currency, setCurrency] = useState('bdt');
  const [timezone, setTimezone] = useState('asia-dhaka');
  const [dateFormat, setDateFormat] = useState('dd-mm-yyyy');

  // Currency
  const [primaryCurrency, setPrimaryCurrency] = useState('BDT');
  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [decimalPlaces, setDecimalPlaces] = useState('2');
  const [symbolPosition, setSymbolPosition] = useState('before');

  // Timezone
  const [platformTimezone, setPlatformTimezone] = useState('asia-dhaka');
  const [tzDateFormat, setTzDateFormat] = useState('dd-mm-yyyy');
  const [timeFormat, setTimeFormat] = useState('12h');

  const currentSection = section || 'general';

  useEffect(() => {
    fetch('/api/admin/settings', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          const map: Record<string, string> = {};
          d.settings.forEach((s: { key: string; value: string }) => {
            map[s.key] = s.value;
          });
          setInitialSettings(map);
          // Site Info
          setSiteName(map['site_name'] || 'ETR');
          setSiteDescription(map['site_description'] || 'Bangladesh\'s trusted ticket marketplace');
          setSiteUrl(map['site_url'] || 'https://etr.com.bd');
          setAdminEmail(map['admin_email'] || 'admin@etr.com.bd');
          // Contact
          setContactEmail(map['contact_email'] || 'support@etr.com.bd');
          setContactPhone(map['contact_phone'] || '+880 1XXX-XXXXXX');
          setContactAddress(map['contact_address'] || 'Dhaka, Bangladesh');
          setWhatsappNumber(map['whatsapp_number'] || '+880 1XXX-XXXXXX');
          // Appearance
          setDarkMode(map['dark_mode'] === 'true');
          setPrimaryColor(map['primary_color'] || '#7C3AED');
          setShowPoweredBy(map['show_powered_by'] !== 'false');
          // Localization
          setDefaultLanguage(map['default_language'] || 'en');
          setBilingualMode(map['bilingual_mode'] !== 'false');
          setCurrency(map['currency'] || 'bdt');
          setTimezone(map['timezone'] || 'asia-dhaka');
          setDateFormat(map['date_format'] || 'dd-mm-yyyy');
          // Currency
          setPrimaryCurrency(map['primary_currency'] || 'BDT');
          setCurrencySymbol(map['currency_symbol'] || '৳');
          setDecimalPlaces(map['decimal_places'] || '2');
          setSymbolPosition(map['symbol_position'] || 'before');
          // Timezone
          setPlatformTimezone(map['platform_timezone'] || 'asia-dhaka');
          setTzDateFormat(map['tz_date_format'] || 'dd-mm-yyyy');
          setTimeFormat(map['time_format'] || '12h');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const buildSettingsForSection = (sectionKey: string): { key: string; value: string; group: string }[] => {
    switch (sectionKey) {
      case 'general-site-info':
        return [
          { key: 'site_name', value: siteName, group: 'general' },
          { key: 'site_description', value: siteDescription, group: 'general' },
          { key: 'site_url', value: siteUrl, group: 'general' },
          { key: 'admin_email', value: adminEmail, group: 'general' },
        ];
      case 'general-contact':
        return [
          { key: 'contact_email', value: contactEmail, group: 'general' },
          { key: 'contact_phone', value: contactPhone, group: 'general' },
          { key: 'contact_address', value: contactAddress, group: 'general' },
          { key: 'whatsapp_number', value: whatsappNumber, group: 'general' },
        ];
      case 'general-appearance':
        return [
          { key: 'dark_mode', value: darkMode ? 'true' : 'false', group: 'general' },
          { key: 'primary_color', value: primaryColor, group: 'general' },
          { key: 'show_powered_by', value: showPoweredBy ? 'true' : 'false', group: 'general' },
        ];
      case 'localization':
        return [
          { key: 'default_language', value: defaultLanguage, group: 'localization' },
          { key: 'bilingual_mode', value: bilingualMode ? 'true' : 'false', group: 'localization' },
          { key: 'currency', value: currency, group: 'localization' },
          { key: 'timezone', value: timezone, group: 'localization' },
          { key: 'date_format', value: dateFormat, group: 'localization' },
        ];
      case 'currency':
        return [
          { key: 'primary_currency', value: primaryCurrency, group: 'currency' },
          { key: 'currency_symbol', value: currencySymbol, group: 'currency' },
          { key: 'decimal_places', value: decimalPlaces, group: 'currency' },
          { key: 'symbol_position', value: symbolPosition, group: 'currency' },
        ];
      case 'timezone':
        return [
          { key: 'platform_timezone', value: platformTimezone, group: 'timezone' },
          { key: 'tz_date_format', value: tzDateFormat, group: 'timezone' },
          { key: 'time_format', value: timeFormat, group: 'timezone' },
        ];
      default:
        return [];
    }
  };

  const handleSave = async (sectionKey: string) => {
    setSaving(true);
    try {
      const allSettings = buildSettingsForSection(sectionKey);
      // Diff: only send changed settings
      const changedSettings = allSettings.filter(s => {
        const initial = initialSettings[s.key];
        return initial !== s.value;
      });

      if (changedSettings.length === 0) {
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        return;
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: changedSettings }),
      });

      if (res.ok) {
        // Update initial settings to reflect saved values
        const newInitial = { ...initialSettings };
        changedSettings.forEach(s => { newInitial[s.key] = s.value; });
        setInitialSettings(newInitial);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Save failed silently
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  // Localization section
  if (currentSection === 'localization') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6" />Localization Settings</h1>
        <Card>
          <CardHeader><CardTitle>Language & Region</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Default Language</label>
              <Select value={defaultLanguage} onValueChange={setDefaultLanguage}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="bn">বাংলা (Bangla)</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Default Currency</label>
              <Select value={currency} onValueChange={setCurrency}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bdt">BDT (৳) - Bangladeshi Taka</SelectItem><SelectItem value="usd">USD ($) - US Dollar</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Default Timezone</label>
              <Select value={timezone} onValueChange={setTimezone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asia-dhaka">Asia/Dhaka (UTC+6)</SelectItem><SelectItem value="utc">UTC</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Date Format</label>
              <Select value={dateFormat} onValueChange={setDateFormat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem><SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem><SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem></SelectContent></Select>
            </div>
            <div className="flex items-center gap-2"><Switch checked={bilingualMode} onCheckedChange={setBilingualMode} /><label className="text-sm">Enable bilingual mode (English/Bangla)</label></div>
            <Button onClick={() => handleSave('localization')} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? 'Saved!' : 'Save Settings'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Languages section
  if (currentSection === 'languages') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Languages className="w-6 h-6" />Language Management</h1>
        <Card>
          <CardContent className="p-6 space-y-3">
            {[
              { code: 'en', name: 'English', native: 'English', active: true, progress: 100 },
              { code: 'bn', name: 'Bangla', native: 'বাংলা', active: true, progress: 85 },
            ].map(lang => (
              <div key={lang.code} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-lg">{lang.code.toUpperCase()}</div>
                  <div><p className="font-medium">{lang.name} ({lang.native})</p><p className="text-xs text-muted-foreground">Translation progress: {lang.progress}%</p></div>
                </div>
                <div className="flex items-center gap-2"><Switch checked={lang.active} /><Button variant="outline" size="sm">Edit</Button></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Currency section
  if (currentSection === 'currency') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Coins className="w-6 h-6" />Currency Settings</h1>
        <Card>
          <CardHeader><CardTitle>Currency Configuration</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Primary Currency</label><Input value={primaryCurrency} onChange={e => setPrimaryCurrency(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Currency Symbol</label><Input value={currencySymbol} onChange={e => setCurrencySymbol(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Decimal Places</label><Input type="number" value={decimalPlaces} onChange={e => setDecimalPlaces(e.target.value)} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Symbol Position</label>
              <Select value={symbolPosition} onValueChange={setSymbolPosition}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="before">Before (৳100)</SelectItem><SelectItem value="after">After (100৳)</SelectItem></SelectContent></Select>
            </div>
            <Button onClick={() => handleSave('currency')} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? 'Saved!' : 'Save Settings'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Timezone section
  if (currentSection === 'timezone') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6" />Timezone Settings</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Platform Timezone</label>
              <Select value={platformTimezone} onValueChange={setPlatformTimezone}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asia-dhaka">Asia/Dhaka (UTC+6)</SelectItem><SelectItem value="utc">UTC</SelectItem><SelectItem value="asia-kolkata">Asia/Kolkata (UTC+5:30)</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Date Format</label>
              <Select value={tzDateFormat} onValueChange={setTzDateFormat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem><SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Time Format</label>
              <Select value={timeFormat} onValueChange={setTimeFormat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="12h">12-hour (AM/PM)</SelectItem><SelectItem value="24h">24-hour</SelectItem></SelectContent></Select>
            </div>
            <Button onClick={() => handleSave('timezone')} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? 'Saved!' : 'Save Settings'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logo section
  if (currentSection === 'logo') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ImageIcon className="w-6 h-6" />Logo Settings</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Logo</label>
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click or drag to upload logo</p>
                <p className="text-xs text-muted-foreground">Recommended: 200x50px, PNG/SVG</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dark Mode Logo</label>
              <div className="p-6 border-2 border-dashed rounded-lg text-center bg-gray-900">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Click or drag to upload dark mode logo</p>
              </div>
            </div>
            <Button disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Logo'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Favicon section
  if (currentSection === 'favicon') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Monitor className="w-6 h-6" />Favicon Settings</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Favicon</label>
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click or drag to upload favicon</p>
                <p className="text-xs text-muted-foreground">Recommended: 32x32px, ICO/PNG</p>
              </div>
            </div>
            <Button disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Favicon'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // General settings (default)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6" />General Settings</h1>
        {saved && <Badge variant="default" className="gap-1"><Save className="w-3 h-3" />Saved</Badge>}
      </div>

      <Tabs defaultValue="site-info">
        <TabsList>
          <TabsTrigger value="site-info">Site Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="site-info">
          <Card>
            <CardHeader><CardTitle>Site Information</CardTitle><CardDescription>Basic site configuration</CardDescription></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Site Name</label><Input value={siteName} onChange={e => setSiteName(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Site Description</label><Textarea value={siteDescription} onChange={e => setSiteDescription(e.target.value)} rows={3} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Site URL</label><Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Admin Email</label><Input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} type="email" /></div>
              <Button onClick={() => handleSave('general-site-info')} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? 'Saved!' : 'Save Settings'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Contact Email</label><Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Phone Number</label><Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Address</label><Textarea value={contactAddress} onChange={e => setContactAddress(e.target.value)} rows={2} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">WhatsApp</label><Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} /></div>
              <Button onClick={() => handleSave('general-contact')} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? 'Saved!' : 'Save Settings'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Switch checked={darkMode} onCheckedChange={setDarkMode} /><label className="text-sm">Enable Dark Mode</label></div>
              <div className="space-y-2"><label className="text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg border-2 border-border" style={{ backgroundColor: primaryColor }} /><Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="max-w-[150px]" /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={showPoweredBy} onCheckedChange={setShowPoweredBy} /><label className="text-sm">Show powered by ETR in footer</label></div>
              <Button onClick={() => handleSave('general-appearance')} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? 'Saved!' : 'Save Settings'}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
