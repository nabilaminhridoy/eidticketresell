'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LayoutDashboard, Users, ShieldCheck, Settings, Ticket, ShoppingBag, Wallet, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const { token } = useAuthStore();
  const { language } = useLanguageStore();
  const [stats, setStats] = useState({ users: 0, tickets: 0, orders: 0, revenue: 0 });
  const [users, setUsers] = useState<Array<{id:string;name:string;email:string;role:string;isKycVerified:boolean}>>([]);
  const [kycPending, setKycPending] = useState<Array<{id:string;name:string;documentType:string;submittedAt:string}>>([]);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    fetch('/api/admin/stats', { headers }).then((r) => r.json()).then(setStats).catch(() => {});
    fetch('/api/admin/users', { headers }).then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : d.users || [])).catch(() => {});
    fetch('/api/admin/kyc/pending', { headers }).then((r) => r.json()).then((d) => setKycPending(Array.isArray(d) ? d : d.kyc || [])).catch(() => {});
  }, [token]);

  const handleKyc = async (id: string, action: 'approve' | 'reject') => {
    if (!token) return;
    await fetch(`/api/admin/kyc/${id}/${action}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setKycPending((p) => p.filter((k) => k.id !== id));
  };

  const statCards = [
    { icon: Users, label: t('users', language), value: stats.users, color: 'text-blue-600 bg-blue-100' },
    { icon: Ticket, label: t('tickets', language), value: stats.tickets, color: 'text-emerald-600 bg-emerald-100' },
    { icon: ShoppingBag, label: t('orders', language), value: stats.orders, color: 'text-amber-600 bg-amber-100' },
    { icon: Wallet, label: language === 'en' ? 'Revenue' : 'আয়', value: `${t('bdt', language)}${stats.revenue}`, color: 'text-violet-600 bg-violet-100' },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-6xl">
      <h1 className={`text-2xl font-bold mb-4 ${language === 'bn' ? 'font-bangla' : ''}`}>{t('adminPanel', language)}</h1>
      <Tabs defaultValue="dashboard">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 mb-4">
          <TabsList className="flex gap-1 mb-0 min-w-max sm:min-w-0 sm:flex-wrap">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm min-h-[44px]"><LayoutDashboard className="w-3 h-3 mr-1" />{t('dashboard', language)}</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm min-h-[44px]"><Users className="w-3 h-3 mr-1" />{t('users', language)}</TabsTrigger>
            <TabsTrigger value="kyc" className="text-xs sm:text-sm min-h-[44px]"><ShieldCheck className="w-3 h-3 mr-1" />{t('kyc', language)}</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm min-h-[44px]"><Settings className="w-3 h-3 mr-1" />{t('settings', language)}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((s, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${s.color} flex items-center justify-center shrink-0`}><s.icon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                  <div className="min-w-0"><p className="text-[10px] sm:text-xs text-muted-foreground truncate">{s.label}</p><p className="text-base sm:text-lg font-bold">{s.value}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card><CardHeader><CardTitle className="text-base">{t('users', language)}</CardTitle></CardHeader>
            <CardContent>
              {users.length === 0 ? <p className="text-center py-6 text-muted-foreground">{t('noData', language)}</p> : (
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
                  <Table><TableHeader><TableRow><TableHead>{t('name', language)}</TableHead><TableHead>{t('email', language)}</TableHead><TableHead>{t('status', language)}</TableHead><TableHead>{language === 'en' ? 'Role' : 'ভূমিকা'}</TableHead></TableRow></TableHeader>
                    <TableBody>{users.map((u) => (
                      <TableRow key={u.id}><TableCell className="font-medium whitespace-nowrap">{u.name}</TableCell><TableCell className="whitespace-nowrap">{u.email}</TableCell><TableCell><Badge variant={u.isKycVerified ? 'default' : 'secondary'}>{u.isKycVerified ? t('verified', language) : t('unverified', language)}</Badge></TableCell><TableCell><Badge variant="outline">{u.role}</Badge></TableCell></TableRow>
                    ))}</TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />{t('kycPending', language)}</CardTitle></CardHeader>
            <CardContent>
              {kycPending.length === 0 ? <p className="text-center py-6 text-muted-foreground">{t('noData', language)}</p> : (
                <div className="space-y-3">{kycPending.map((k) => (
                  <div key={k.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3">
                    <div className="min-w-0"><p className="font-medium truncate">{k.name}</p><p className="text-xs text-muted-foreground">{k.documentType} · {k.submittedAt}</p></div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 min-h-[44px]" onClick={() => handleKyc(k.id, 'approve')}>{language === 'en' ? 'Approve' : 'অনুমোদন'}</Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 min-h-[44px]" onClick={() => handleKyc(k.id, 'reject')}>{language === 'en' ? 'Reject' : 'প্রত্যাখ্যান'}</Button>
                    </div>
                  </div>
                ))}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-primary/10"><CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <div><h3 className="font-medium mb-3">{t('businessSettings', language)}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>{language === 'en' ? 'Platform Fee %' : 'প্ল্যাটফর্ম ফি %'}</Label><Input type="number" defaultValue="2" className="h-11" /></div>
                <div className="space-y-1.5"><Label>{language === 'en' ? 'Min Fee (৳)' : 'সর্বনিম্ন ফি (৳)'}</Label><Input type="number" defaultValue="20" className="h-11" /></div>
              </div>
            </div>
            <div><h3 className="font-medium mb-3">{language === 'en' ? 'Features' : 'বৈশিষ্ট্য'}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm">{language === 'en' ? 'Maintenance Mode' : 'রক্ষণাবেক্ষণ মোড'}</span><Switch /></div>
                <div className="flex items-center justify-between"><span className="text-sm">{language === 'en' ? 'New Registration' : 'নতুন নিবন্ধন'}</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><span className="text-sm">{language === 'en' ? 'Ticket Listing' : 'টিকেট তালিকা'}</span><Switch defaultChecked /></div>
              </div>
            </div>
            <Button className="bg-primary min-h-[44px] w-full sm:w-auto">{t('save', language)}</Button>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
