'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LocalizationSettings {
  defaultLanguage: string;
  availableLanguages: string[];
  defaultCurrency: string;
  currencySymbol: string;
  currencySymbolPosition: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const DEFAULT_SETTINGS: LocalizationSettings = {
  defaultLanguage: 'en',
  availableLanguages: ['en', 'bn'],
  defaultCurrency: 'BDT',
  currencySymbol: '৳',
  currencySymbolPosition: 'before',
  timezone: 'Asia/Dhaka',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'bn',
};

const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
];

const TIMEZONES = [
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Kolkata',
  'Asia/Karachi',
  'Asia/Tokyo',
  'UTC',
  'US/Eastern',
  'US/Pacific',
  'Europe/London',
];

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Bangladesh standard)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US standard)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO format)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (Alternate)' },
];

export default function AdminSettingsLocalizationPage({ section }: { section?: string }) {
  const [settings, setSettings] = useState<LocalizationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings?group=localization', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const settingsList = data.settings || [];

        // Map settings from DB to our state
        const loaded: Record<string, string> = {};
        for (const s of settingsList) {
          loaded[s.key] = s.value;
        }

        setSettings({
          defaultLanguage: loaded['localization_default_language'] || DEFAULT_SETTINGS.defaultLanguage,
          availableLanguages: loaded['localization_available_languages'] ? JSON.parse(loaded['localization_available_languages']) : DEFAULT_SETTINGS.availableLanguages,
          defaultCurrency: loaded['localization_default_currency'] || DEFAULT_SETTINGS.defaultCurrency,
          currencySymbol: loaded['localization_currency_symbol'] || DEFAULT_SETTINGS.currencySymbol,
          currencySymbolPosition: loaded['localization_currency_symbol_position'] || DEFAULT_SETTINGS.currencySymbolPosition,
          timezone: loaded['localization_timezone'] || DEFAULT_SETTINGS.timezone,
          dateFormat: loaded['localization_date_format'] || DEFAULT_SETTINGS.dateFormat,
          numberFormat: loaded['localization_number_format'] || DEFAULT_SETTINGS.numberFormat,
        });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load localization settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (code: string) => {
    setSettings(prev => {
      const current = prev.availableLanguages;
      if (current.includes(code)) {
        // Don't allow removing the default language
        if (code === prev.defaultLanguage) {
          toast({ title: 'Error', description: 'Cannot remove the default language', variant: 'destructive' });
          return prev;
        }
        return { ...prev, availableLanguages: current.filter(l => l !== code) };
      }
      return { ...prev, availableLanguages: [...current, code] };
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { key: 'localization_default_language', value: settings.defaultLanguage, group: 'localization' },
        { key: 'localization_available_languages', value: JSON.stringify(settings.availableLanguages), group: 'localization' },
        { key: 'localization_default_currency', value: settings.defaultCurrency, group: 'localization' },
        { key: 'localization_currency_symbol', value: settings.currencySymbol, group: 'localization' },
        { key: 'localization_currency_symbol_position', value: settings.currencySymbolPosition, group: 'localization' },
        { key: 'localization_timezone', value: settings.timezone, group: 'localization' },
        { key: 'localization_date_format', value: settings.dateFormat, group: 'localization' },
        { key: 'localization_number_format', value: settings.numberFormat, group: 'localization' },
      ];

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Localization settings saved successfully' });
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to save settings', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error while saving', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Localization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Language Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Language Settings</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Default Language</label>
              <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultLanguage: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Available Languages</label>
              <div className="space-y-2">
                {AVAILABLE_LANGUAGES.map(lang => (
                  <div key={lang.code} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{lang.label}</span>
                      {lang.code === settings.defaultLanguage && <Badge variant="default" className="text-xs">Default</Badge>}
                    </div>
                    <Switch
                      checked={settings.availableLanguages.includes(lang.code)}
                      onCheckedChange={() => toggleLanguage(lang.code)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Currency Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Currency Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Currency</label>
                <Select value={settings.defaultCurrency} onValueChange={(value) => {
                  const symbol = value === 'BDT' ? '৳' : '$';
                  setSettings(prev => ({ ...prev, defaultCurrency: value, currencySymbol: symbol }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Currency Symbol</label>
                <Input value={settings.currencySymbol} onChange={(e) => setSettings(prev => ({ ...prev, currencySymbol: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency Symbol Position</label>
              <Select value={settings.currencySymbolPosition} onValueChange={(value) => setSettings(prev => ({ ...prev, currencySymbolPosition: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before amount (৳ 500)</SelectItem>
                  <SelectItem value="after">After amount (500 ৳)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Timezone & Date Format */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Regional Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Format</label>
                <Select value={settings.dateFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DATE_FORMATS.map(fmt => (
                      <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number Format</label>
              <Select value={settings.numberFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, numberFormat: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English numerals (1, 2, 3)</SelectItem>
                  <SelectItem value="bn">Bengali numerals (১, ২, ৩)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Settings
        </Button>
        <Button variant="outline" onClick={fetchSettings}>Refresh</Button>
      </div>
    </div>
  );
}
