'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { BD_CITIES, TRANSPORT_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, TrainFront, Plane, Ship, Search, MapPin, Calendar } from 'lucide-react';

const transportIcons: Record<string, React.ElementType> = { bus: Bus, train: TrainFront, flight: Plane, launch: Ship };
const transportColors: Record<string, string> = { bus: 'bg-emerald-100 text-emerald-700', train: 'bg-teal-100 text-teal-700', flight: 'bg-sky-100 text-sky-700', launch: 'bg-violet-100 text-violet-700' };

interface Ticket { id: string; from: string; to: string; departureDate: string; departureTime: string; transportType: string; price: number; status: string; transportCompany: string; }

export default function SearchPage() {
  const { navigate, pageParams } = useAppStore();
  const { language } = useLanguageStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(pageParams.from || '');
  const [to, setTo] = useState(pageParams.to || '');
  const [transportType, setTransportType] = useState(pageParams.transportType || 'all');
  const [date, setDate] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (transportType && transportType !== 'all') params.set('transportType', transportType);
    if (date) params.set('date', date);
    let cancelled = false;
    fetch(`/api/tickets?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setTickets(Array.isArray(d) ? d : d.tickets || []); })
      .catch(() => { if (!cancelled) setTickets([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [from, to, transportType, date]);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-6xl">
      <h1 className={`text-2xl font-bold mb-4 ${language === 'bn' ? 'font-bangla' : ''}`}>{t('searchTickets', language)}</h1>
      <Card className="mb-6 border-primary/10">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="h-11 w-full"><MapPin className="w-4 h-4 mr-1" /><SelectValue placeholder={t('from', language)} /></SelectTrigger>
              <SelectContent>{BD_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="h-11 w-full"><MapPin className="w-4 h-4 mr-1" /><SelectValue placeholder={t('to', language)} /></SelectTrigger>
              <SelectContent>{BD_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={transportType} onValueChange={setTransportType}>
              <SelectTrigger className="h-11 w-full"><SelectValue placeholder={t('transport', language)} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTransport', language)}</SelectItem>
                {TRANSPORT_TYPES.map((tt) => <SelectItem key={tt.id} value={tt.id}>{language === 'bn' ? tt.labelBn : tt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-full" />
            <Button variant="outline" className="min-h-[44px] w-full" onClick={() => { setFrom(''); setTo(''); setTransportType('all'); setDate(''); }}>{t('cancel', language)}</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t('loading', language)}</div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-3 opacity-30" />
            <p className={`text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>{t('noResults', language)}</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((tk) => {
            const Icon = transportIcons[tk.transportType] || Bus;
            return (
              <Card key={tk.id} className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all" onClick={() => navigate('ticket-details', { id: tk.id })}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <Badge className={`${transportColors[tk.transportType] || 'bg-gray-100 text-gray-700'} text-xs`}> <Icon className="w-3 h-3 mr-1" />{language === 'bn' ? TRANSPORT_TYPES.find((x) => x.id === tk.transportType)?.labelBn || tk.transportType : tk.transportType}</Badge>
                    <Badge variant={tk.status === 'active' ? 'default' : 'secondary'} className="text-xs">{tk.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold">{tk.from}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold">{tk.to}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{tk.departureDate}</span>
                    <span>{tk.departureTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-primary">{t('bdt', language)}{tk.price}</span>
                    <Button size="sm" variant="outline" className="min-h-[44px]" onClick={(e) => { e.stopPropagation(); navigate('ticket-details', { id: tk.id }); }}>{t('viewDetails', language)}</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
