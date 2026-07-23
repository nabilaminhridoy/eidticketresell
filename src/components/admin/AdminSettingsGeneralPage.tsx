'use client';

import { useState } from 'react';
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
  Palette, Language, Clock, Coins, Browser
} from 'lucide-react';

export default function AdminSettingsGeneralPage({ section }: { section?: string }) {
  const [siteName, setSiteName] = useState('ETR');
  const [siteDescription, setSiteDescription] = useState('Bangladesh\'s trusted ticket marketplace');
  const [saved, setSaved] = useState(false);

  const currentSection = section || 'general';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Localization section
  if (currentSection === 'localization') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="w-6 h-6" />Localization Settings</h1>
        <Card>
          <CardHeader><CardTitle>Language & Region</CardTitle></CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Default Language</label>
              <Select defaultValue="en"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="bn">বাংলা (Bangla)</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Default Currency</label>
              <Select defaultValue="bdt"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bdt">BDT (৳) - Bangladeshi Taka</SelectItem><SelectItem value="usd">USD ($) - US Dollar</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Default Timezone</label>
              <Select defaultValue="asia-dhaka"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asia-dhaka">Asia/Dhaka (UTC+6)</SelectItem><SelectItem value="utc">UTC</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Date Format</label>
              <Select defaultValue="dd-mm-yyyy"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem><SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem><SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem></SelectContent></Select>
            </div>
            <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Enable bilingual mode (English/Bangla)</label></div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Settings'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Languages section
  if (currentSection === 'languages') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Language className="w-6 h-6" />Language Management</h1>
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
            <div className="space-y-2"><label className="text-sm font-medium">Primary Currency</label><Input defaultValue="BDT" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Currency Symbol</label><Input defaultValue="৳" /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Decimal Places</label><Input type="number" defaultValue={2} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Symbol Position</label>
              <Select defaultValue="before"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="before">Before (৳100)</SelectItem><SelectItem value="after">After (100৳)</SelectItem></SelectContent></Select>
            </div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Settings'}</Button>
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
              <Select defaultValue="asia-dhaka"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="asia-dhaka">Asia/Dhaka (UTC+6)</SelectItem><SelectItem value="utc">UTC</SelectItem><SelectItem value="asia-kolkata">Asia/Kolkata (UTC+5:30)</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Date Format</label>
              <Select defaultValue="dd-mm-yyyy"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem><SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Time Format</label>
              <Select defaultValue="12h"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="12h">12-hour (AM/PM)</SelectItem><SelectItem value="24h">24-hour</SelectItem></SelectContent></Select>
            </div>
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Settings'}</Button>
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
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Logo'}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Favicon section
  if (currentSection === 'favicon') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Browser className="w-6 h-6" />Favicon Settings</h1>
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
            <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Favicon'}</Button>
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
              <div className="space-y-2"><label className="text-sm font-medium">Site URL</label><Input defaultValue="https://etr.com.bd" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Admin Email</label><Input defaultValue="admin@etr.com.bd" type="email" /></div>
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Settings'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Contact Email</label><Input defaultValue="support@etr.com.bd" type="email" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Phone Number</label><Input defaultValue="+880 1XXX-XXXXXX" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Address</label><Textarea defaultValue="Dhaka, Bangladesh" rows={2} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">WhatsApp</label><Input defaultValue="+880 1XXX-XXXXXX" /></div>
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Settings'}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Enable Dark Mode</label></div>
              <div className="space-y-2"><label className="text-sm font-medium">Primary Color</label>
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary border-2 border-border" /><Input defaultValue="#7C3AED" className="max-w-[150px]" /></div>
              </div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Show powered by ETR in footer</label></div>
              <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save Settings'}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
