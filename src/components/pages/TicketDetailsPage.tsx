'use client';
import { useState, useEffect } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { PLATFORM_FEE_PERCENTAGE, PLATFORM_FEE_MINIMUM } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bus, TrainFront, Plane, Ship, MapPin, Calendar, Clock, User, ArrowLeft, ShieldCheck } from 'lucide-react';

const transportIcons: Record<string, React.ElementType> = { bus: Bus, train: TrainFront, flight: Plane, launch: Ship };

interface TicketData { id: string; from: string; to: string; departureDate: string; departureTime: string; transportType: string; transportCompany: string; price: number; seatNumber?: string; seatType?: string; coachNumber?: string; ticketType?: string; status: string; seller?: { name: string; isKycVerified: boolean }; }

export default function TicketDetailsPage() {
  const { navigate, pageParams } = useAppStore();
  const { token } = useAuthStore();
  const { language } = useLanguageStore();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!pageParams.id) return;
    fetch(`/api/tickets/${pageParams.id}`)
      .then((r) => r.json())
      .then((d) => setTicket(d))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [pageParams.id]);

  const fee = ticket ? Math.max(Math.round(ticket.price * PLATFORM_FEE_PERCENTAGE / 100), PLATFORM_FEE_MINIMUM) : 0;
  const total = ticket ? ticket.price + fee : 0;

  const handleBuy = async () => {
    if (!token) { navigate('login'); return; }
    setBuying(true); setMsg('');
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ticketId: ticket?.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purchase failed');
      setMsg(t('success', language));
      setTimeout(() => navigate('my-orders'), 1500);
    } catch (err: unknown) { setMsg(err instanceof Error ? err.message : 'Error'); }
    finally { setBuying(false); }
  };

  if (loading) return <div className="text-center py-20 text-muted-foreground">{t('loading', language)}</div>;
  if (!ticket) return <div className="text-center py-20"><p>{t('noData', language)}</p><Button variant="outline" className="mt-4" onClick={() => navigate('search')}>{t('back', language)}</Button></div>;

  const Icon = transportIcons[ticket.transportType] || Bus;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('search')} className="mb-4"><ArrowLeft className="w-4 h-4 mr-1" />{t('back', language)}</Button>
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
              <div>
                <CardTitle className="text-lg">{ticket.from} → {ticket.to}</CardTitle>
                <p className="text-sm text-muted-foreground">{ticket.transportCompany}</p>
              </div>
            </div>
            <Badge variant={ticket.status === 'active' ? 'default' : 'secondary'}>{ticket.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>{t('from', language)}: {ticket.from}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span>{t('to', language)}: {ticket.to}</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /><span>{t('date', language)}: {ticket.departureDate}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>{t('time', language)}: {ticket.departureTime}</span></div>
            {ticket.seatNumber && <div><span className="text-muted-foreground">{t('seatNumber', language)}:</span> {ticket.seatNumber}</div>}
            {ticket.seatType && <div><span className="text-muted-foreground">{t('seatType', language)}:</span> {ticket.seatType}</div>}
            {ticket.coachNumber && <div><span className="text-muted-foreground">{t('coachNumber', language)}:</span> {ticket.coachNumber}</div>}
            {ticket.ticketType && <div><span className="text-muted-foreground">{t('ticketType', language)}:</span> {ticket.ticketType}</div>}
          </div>
          {ticket.seller && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <User className="w-4 h-4" /><span className="text-sm">{ticket.seller.name}</span>
              {ticket.seller.isKycVerified && <Badge className="bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3 h-3 mr-1" />{t('verified', language)}</Badge>}
            </div>
          )}
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span>{t('price', language)}</span><span>{t('bdt', language)}{ticket.price}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>{t('platformFee', language)} ({PLATFORM_FEE_PERCENTAGE}%)</span><span>{t('bdt', language)}{fee}</span></div>
            <Separator />
            <div className="flex justify-between font-bold text-base"><span>{t('totalAmount', language)}</span><span className="text-primary">{t('bdt', language)}{total}</span></div>
          </div>
          {msg && <p className={`text-sm ${msg === t('success', language) ? 'text-emerald-600' : 'text-destructive'}`}>{msg}</p>}
          <Button className="w-full bg-gradient-to-r from-primary to-primary/90" size="lg" onClick={handleBuy} disabled={buying || ticket.status !== 'active'}>
            {buying ? '...' : ticket.status === 'active' ? language === 'en' ? 'Buy Now' : 'এখনই কিনুন' : t('sold', language)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
