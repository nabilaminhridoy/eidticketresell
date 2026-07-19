'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  ALL_BD_DISTRICTS,
  BUS_CLASSES,
  TRANSPORT_TYPES,
  PLATFORM_FEE_PERCENTAGE,
  PLATFORM_FEE_MINIMUM,
  formatDepartureDate,
  formatDepartureTime,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Bus, TrainFront, Plane, Ship, Search, MapPin, Calendar, Clock,
  Loader2, FileText, Image as ImageIcon, Armchair, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const transportIcons: Record<string, React.ElementType> = { bus: Bus, train: TrainFront, flight: Plane, launch: Ship };
const transportColors: Record<string, string> = {
  bus: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  train: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  flight: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  launch: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

interface Ticket {
  id: string;
  ticketId: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  transportType: string;
  transportCompany: string;
  ticketType: string;
  price: number;
  originalPrice: number;
  platformFee: number;
  seatClass?: string;
  seatNumber?: string;
  coachNumber?: string;
  boardingPoint?: string;
  droppingPoint?: string;
  status: string;
  seller?: { id: string; name: string; isKycVerified: boolean };
}

export default function SearchPage() {
  const { navigate, pageParams } = useAppStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [from, setFrom] = useState(pageParams.from || '');
  const [to, setTo] = useState(pageParams.to || '');
  const [transportType, setTransportType] = useState(pageParams.transportType || 'all');
  const [date, setDate] = useState('');
  const [fetching, setFetching] = useState(false);
  const fetchIdRef = useRef(0);

  const fetchTickets = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    setFetching(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (transportType && transportType !== 'all') params.set('transportType', transportType);
      if (date) params.set('date', date);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();

      if (fetchId === fetchIdRef.current) {
        const rawTickets = Array.isArray(data) ? data : data.tickets || [];
        // Map API fields to our interface
        const mapped = rawTickets.map((tk: Record<string, unknown>) => ({
          id: tk.id as string,
          ticketId: (tk.ticketId || '') as string,
          from: (tk.routeFrom || '') as string,
          to: (tk.routeTo || '') as string,
          departureDate: (tk.departureDate || '') as string,
          departureTime: (tk.departureTime || '') as string,
          transportType: (tk.transportType || 'bus') as string,
          transportCompany: (tk.transportCompany || '') as string,
          ticketType: (tk.ticketType || 'online_copy') as string,
          price: (tk.price || 0) as number,
          originalPrice: (tk.originalPrice || 0) as number,
          platformFee: (tk.platformFee || 0) as number,
          seatClass: (tk.seatClass || '') as string,
          seatNumber: (tk.seatNumber || '') as string,
          coachNumber: (tk.coachNumber || '') as string,
          boardingPoint: (tk.boardingPoint || '') as string,
          droppingPoint: (tk.droppingPoint || '') as string,
          status: (tk.status || 'active') as string,
          seller: tk.seller as { id: string; name: string; isKycVerified: boolean } | undefined,
        }));
        setTickets(mapped);
      }
    } catch {
      if (fetchId === fetchIdRef.current) {
        setTickets([]);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setFetching(false);
      }
    }
  }, [from, to, transportType, date]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Helper to get seat class label
  const getSeatClassLabel = (id: string) => {
    const cls = BUS_CLASSES.find((c) => c.id === id);
    return cls ? (isBn ? cls.labelBn : cls.label) : id;
  };

  // Calculate buyer pays based on ticket type
  const getBuyerPays = (tk: Ticket) => {
    const fee = Math.max(PLATFORM_FEE_MINIMUM, Math.round(tk.price * PLATFORM_FEE_PERCENTAGE / 100));
    return tk.ticketType === 'counter_copy' ? fee : tk.price;
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Search className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${fontClass}`}>{t('searchTickets', language)}</h1>
          <p className={`text-sm text-muted-foreground ${fontClass}`}>
            {isBn ? 'উপলব্ধ টিকেট খুঁজুন ও কিনুন' : 'Find and buy available tickets'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-primary/10">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="h-11 w-full">
                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                <SelectValue placeholder={t('from', language)} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {ALL_BD_DISTRICTS.map((dist) => (
                  <SelectItem key={dist.label} value={dist.label} disabled={dist.label === to}>
                    <span className={fontClass}>{isBn ? dist.labelBn : dist.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="h-11 w-full">
                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                <SelectValue placeholder={t('to', language)} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {ALL_BD_DISTRICTS.map((dist) => (
                  <SelectItem key={dist.label} value={dist.label} disabled={dist.label === from}>
                    <span className={fontClass}>{isBn ? dist.labelBn : dist.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={transportType} onValueChange={setTransportType}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder={t('transport', language)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTransport', language)}</SelectItem>
                {TRANSPORT_TYPES.map((tt) => (
                  <SelectItem key={tt.id} value={tt.id}>{isBn ? tt.labelBn : tt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-full" />

            <Button
              variant="outline"
              className="min-h-[44px] w-full"
              onClick={() => { setFrom(''); setTo(''); setTransportType('all'); setDate(''); }}
            >
              {t('cancel', language)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {fetching ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
          <p className={`text-sm ${fontClass}`}>{t('loading', language)}</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mb-3 opacity-30" />
          <p className={`text-lg ${fontClass}`}>{t('noResults', language)}</p>
          <p className={`text-sm mt-1 ${fontClass}`}>
            {isBn ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন' : 'Try changing your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {tickets.map((tk) => {
              const Icon = transportIcons[tk.transportType] || Bus;
              const color = transportColors[tk.transportType] || transportColors.bus;
              const isOnlineCopy = tk.ticketType === 'online_copy';
              const buyerPays = getBuyerPays(tk);
              const fee = Math.max(PLATFORM_FEE_MINIMUM, Math.round(tk.price * PLATFORM_FEE_PERCENTAGE / 100));

              return (
                <motion.div
                  key={tk.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card
                    className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group h-full"
                    onClick={() => navigate('ticket-details', { id: tk.id })}
                  >
                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Header: Transport + Ticket Type + Status */}
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${color} text-xs gap-1`}>
                            <Icon className="w-3 h-3" />
                            {isBn ? TRANSPORT_TYPES.find((x) => x.id === tk.transportType)?.labelBn || tk.transportType : (TRANSPORT_TYPES.find((x) => x.id === tk.transportType)?.label || tk.transportType)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              isOnlineCopy
                                ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                                : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {isOnlineCopy
                              ? (<span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" />{t('onlineCopy', language)}</span>)
                              : (<span className="flex items-center gap-0.5"><ImageIcon className="w-2.5 h-2.5" />{t('counterCopy', language)}</span>)
                            }
                          </Badge>
                        </div>
                        {tk.status !== 'active' && (
                          <Badge variant="secondary" className="text-xs">{tk.status}</Badge>
                        )}
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-semibold text-base ${fontClass}`}>{tk.from}</span>
                        <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                        <span className={`font-semibold text-base ${fontClass}`}>{tk.to}</span>
                      </div>

                      {/* Company */}
                      <p className={`text-sm text-muted-foreground mb-2 truncate ${fontClass}`}>
                        {tk.transportCompany}
                      </p>

                      {/* Date & Time - formatted */}
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span className={fontClass}>{formatDepartureDate(tk.departureDate, language)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{formatDepartureTime(tk.departureTime, language)}</span>
                        </span>
                      </div>

                      {/* Seat info */}
                      {(tk.seatClass || tk.seatNumber) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                          {tk.seatClass && (
                            <span className="flex items-center gap-1">
                              <Armchair className="w-3 h-3" />
                              <span className={fontClass}>{getSeatClassLabel(tk.seatClass)}</span>
                            </span>
                          )}
                          {tk.seatNumber && (
                            <span>{isBn ? 'আসন' : 'Seat'}: {tk.seatNumber}</span>
                          )}
                        </div>
                      )}

                      <div className="mt-auto">
                        <Separator className="mb-3" />

                        {/* Price section */}
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg font-bold text-primary">
                                ৳{buyerPays.toLocaleString()}
                              </span>
                              {tk.ticketType === 'counter_copy' && (
                                <span className={`text-[10px] text-amber-600 dark:text-amber-400 font-medium ${fontClass}`}>
                                  {isBn ? 'ফি মাত্র' : 'fee only'}
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] text-muted-foreground ${fontClass}`}>
                              {isOnlineCopy
                                ? (isBn ? `বিক্রয় মূল্য ৳${tk.price.toLocaleString()}` : `Selling price ৳${tk.price.toLocaleString()}`)
                                : (isBn ? `টিকেট মূল্য ৳${tk.price.toLocaleString()} ডেলিভারিতে দিন` : `Ticket ৳${tk.price.toLocaleString()} pay on delivery`)
                              }
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-h-[40px] group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate('ticket-details', { id: tk.id }); }}
                          >
                            {t('viewDetails', language)}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
