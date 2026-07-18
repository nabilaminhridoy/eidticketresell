'use client';
import { useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { BD_CITIES, TRANSPORT_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Ticket, ArrowLeft } from 'lucide-react';

export default function SellTicketPage() {
  const { navigate } = useAppStore();
  const { token } = useAuthStore();
  const { language } = useLanguageStore();
  const [form, setForm] = useState({ transportType: 'bus', from: '', to: '', departureDate: '', departureTime: '', price: '', seatNumber: '', seatType: '', coachNumber: '', ticketType: 'online_copy', transportCompany: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate('login'); return; }
    if (!form.from || !form.to || !form.departureDate || !form.departureTime || !form.price) {
      setError('Please fill all required fields'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setSuccess(true);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4"><Ticket className="w-8 h-8 text-emerald-600" /></div>
      <h2 className="text-xl font-bold mb-2">{t('success', language)}!</h2>
      <p className="text-muted-foreground mb-6">{language === 'en' ? 'Your ticket has been listed for sale.' : 'আপনার টিকেট বিক্রির জন্য তালিকাভুক্ত হয়েছে।'}</p>
      <div className="flex gap-3 justify-center">
        <Button onClick={() => navigate('my-tickets')}>{t('myTickets', language)}</Button>
        <Button variant="outline" onClick={() => navigate('search')}>{t('searchTickets', language)}</Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate('home')} className="mb-4"><ArrowLeft className="w-4 h-4 mr-1" />{t('back', language)}</Button>
      <Card className="border-primary/10">
        <CardHeader><CardTitle className={`flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : ''}`}><Ticket className="w-5 h-5 text-primary" />{t('sellTicket', language)}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>{t('transport', language)} *</Label>
                <Select value={form.transportType} onValueChange={(v) => set('transportType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TRANSPORT_TYPES.map((tt) => <SelectItem key={tt.id} value={tt.id}>{language === 'bn' ? tt.labelBn : tt.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>{t('ticketType', language)} *</Label>
                <Select value={form.ticketType} onValueChange={(v) => set('ticketType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="online_copy">{t('onlineCopy', language)}</SelectItem><SelectItem value="counter_copy">{t('counterCopy', language)}</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>{t('from', language)} *</Label>
                <Select value={form.from} onValueChange={(v) => set('from', v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BD_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>{t('to', language)} *</Label>
                <Select value={form.to} onValueChange={(v) => set('to', v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BD_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label>{t('departureDate', language)} *</Label><Input type="date" value={form.departureDate} onChange={(e) => set('departureDate', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>{t('departureTime', language)} *</Label><Input type="time" value={form.departureTime} onChange={(e) => set('departureTime', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>{t('transportCompany', language)}</Label><Input value={form.transportCompany} onChange={(e) => set('transportCompany', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>{t('price', language)} (৳) *</Label><Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>{t('seatNumber', language)}</Label><Input value={form.seatNumber} onChange={(e) => set('seatNumber', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>{t('seatType', language)}</Label><Input value={form.seatType} onChange={(e) => set('seatType', e.target.value)} placeholder="AC / Non-AC" /></div>
              <div className="space-y-1.5"><Label>{t('coachNumber', language)}</Label><Input value={form.coachNumber} onChange={(e) => set('coachNumber', e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>{t('description', language)}</Label><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/90" disabled={loading}>{loading ? '...' : t('submit', language)}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
