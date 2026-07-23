'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  ALL_BD_DISTRICTS,
  BUS_CLASSES,
  TRANSPORT_TYPES,
  formatDepartureDate,
  formatDepartureTime,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Bus, TrainFront, Plane, Ship, Search, MapPin, Calendar, Clock,
  Loader2, FileText, Image as ImageIcon, Armchair, ArrowRight,
  Tag, ChevronRight, SlidersHorizontal, X, Sun, Moon as MoonIcon,
  Sunset, Sunrise,
} from 'lucide-react';
// Removed framer-motion AnimatePresence for memory optimization - using simple grid rendering

/* ─── Static Maps ────────────────────────────────────── */

const transportIcons: Record<string, React.ElementType> = {
  bus: Bus, train: TrainFront, flight: Plane, launch: Ship,
};
const transportColors: Record<string, string> = {
  bus: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  train: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  flight: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  launch: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

const DEPARTURE_PERIODS = [
  { id: 'morning', icon: Sunrise },
  { id: 'afternoon', icon: Sun },
  { id: 'night', icon: MoonIcon },
  { id: 'mid_night', icon: Sunset },
] as const;

const SEAT_OPTIONS = [
  { id: '1', key: 'seats1' },
  { id: '2', key: 'seats2' },
  { id: '3', key: 'seats3' },
  { id: '4', key: 'seats4' },
  { id: '4+', key: 'seats4Plus' },
] as const;

const SORT_OPTIONS = [
  { id: 'default', key: 'sortDefault' },
  { id: 'newest', key: 'newestFirst', sortBy: 'createdAt', sortOrder: 'desc' },
  { id: 'oldest', key: 'oldestFirst', sortBy: 'createdAt', sortOrder: 'asc' },
  { id: 'price_low', key: 'priceLowToHigh', sortBy: 'price', sortOrder: 'asc' },
  { id: 'price_high', key: 'priceHighToLow', sortBy: 'price', sortOrder: 'desc' },
  { id: 'departure_earliest', key: 'departureEarliest', sortBy: 'departureTime', sortOrder: 'asc' },
  { id: 'departure_latest', key: 'departureLatest', sortBy: 'departureTime', sortOrder: 'desc' },
  { id: 'travel_date_earliest', key: 'travelDateEarliest', sortBy: 'departureDate', sortOrder: 'asc' },
  { id: 'travel_date_latest', key: 'travelDateLatest', sortBy: 'departureDate', sortOrder: 'desc' },
  { id: 'best_match', key: 'bestMatch' },
] as const;

const PER_PAGE_OPTIONS = [12, 18, 24] as const;

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

/* ─── FilterSidebar Sub-component ─────────────────────── */

function FilterSidebar({
  language,
  isBn,
  fontClass,
  selectedTransportTypes,
  setSelectedTransportTypes,
  selectedTicketTypes,
  setSelectedTicketTypes,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedDepartureTime,
  setSelectedDepartureTime,
  selectedClasses,
  setSelectedClasses,
  selectedSeats,
  setSelectedSeats,
  clearAllFilters,
  activeFilterCount,
}: {
  language: 'en' | 'bn';
  isBn: boolean;
  fontClass: string;
  selectedTransportTypes: string[];
  setSelectedTransportTypes: (v: string[]) => void;
  selectedTicketTypes: string[];
  setSelectedTicketTypes: (v: string[]) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  selectedDepartureTime: string[];
  setSelectedDepartureTime: (v: string[]) => void;
  selectedClasses: string[];
  setSelectedClasses: (v: string[]) => void;
  selectedSeats: string;
  setSelectedSeats: (v: string) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
}) {
  const toggleArrayItem = (arr: string[], item: string) => {
    if (arr.includes(item)) return arr.filter(i => i !== item);
    return [...arr, item];
  };

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-2">
        <h2 className={`text-base font-semibold ${fontClass}`}>
          {t('filterBy', language)}
        </h2>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-xs font-medium">
            {activeFilterCount}
          </Badge>
        )}
      </div>
      <Separator />

      {/* Accordion filter sections */}
      <Accordion type="multiple" defaultValue={['transport', 'tickettype', 'price', 'departure', 'class', 'seats']}
        className="w-full">
        {/* ── Transport Type ── */}
        <AccordionItem value="transport">
          <AccordionTrigger className={`text-sm font-medium ${fontClass}`}>
            {t('transportType', language)}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5">
              {TRANSPORT_TYPES.map((tt) => {
                const Icon = transportIcons[tt.id] || Bus;
                const checked = selectedTransportTypes.includes(tt.id);
                return (
                  <Label key={tt.id} className="flex items-center gap-2 cursor-pointer font-normal text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => setSelectedTransportTypes(toggleArrayItem(selectedTransportTypes, tt.id))}
                    />
                    <Icon className={`w-4 h-4 ${checked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={fontClass}>{isBn ? tt.labelBn : tt.label}</span>
                  </Label>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Ticket Type ── */}
        <AccordionItem value="tickettype">
          <AccordionTrigger className={`text-sm font-medium ${fontClass}`}>
            {t('ticketType', language)}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5">
              <Label className="flex items-center gap-2 cursor-pointer font-normal text-sm">
                <Checkbox
                  checked={selectedTicketTypes.includes('online_copy')}
                  onCheckedChange={() => setSelectedTicketTypes(toggleArrayItem(selectedTicketTypes, 'online_copy'))}
                />
                <FileText className={`w-4 h-4 ${selectedTicketTypes.includes('online_copy') ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                <span className={fontClass}>{t('onlineCopy', language)}</span>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer font-normal text-sm">
                <Checkbox
                  checked={selectedTicketTypes.includes('counter_copy')}
                  onCheckedChange={() => setSelectedTicketTypes(toggleArrayItem(selectedTicketTypes, 'counter_copy'))}
                />
                <ImageIcon className={`w-4 h-4 ${selectedTicketTypes.includes('counter_copy') ? 'text-amber-600' : 'text-muted-foreground'}`} />
                <span className={fontClass}>{t('counterCopy', language)}</span>
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Price Range ── */}
        <AccordionItem value="price">
          <AccordionTrigger className={`text-sm font-medium ${fontClass}`}>
            {t('priceRange', language)}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className={`text-xs text-muted-foreground mb-1 ${fontClass}`}>
                  ৳ {t('minPrice', language)}
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 text-sm"
                  min={0}
                />
              </div>
              <div className="flex-1">
                <Label className={`text-xs text-muted-foreground mb-1 ${fontClass}`}>
                  ৳ {t('maxPrice', language)}
                </Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 text-sm"
                  min={0}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Departure Time ── */}
        <AccordionItem value="departure">
          <AccordionTrigger className={`text-sm font-medium ${fontClass}`}>
            {t('departureTime', language)}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {DEPARTURE_PERIODS.map((period) => {
                const checked = selectedDepartureTime.includes(period.id);
                return (
                  <Label key={period.id} className="flex items-center gap-2 cursor-pointer font-normal text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => setSelectedDepartureTime(toggleArrayItem(selectedDepartureTime, period.id))}
                    />
                    <period.icon className={`w-4 h-4 ${checked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={fontClass}>{t(period.id === 'mid_night' ? 'midNight' : period.id, language)}</span>
                  </Label>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Class ── */}
        <AccordionItem value="class">
          <AccordionTrigger className={`text-sm font-medium ${fontClass}`}>
            {t('ticketClass', language)}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5">
              {BUS_CLASSES.map((cls) => {
                const checked = selectedClasses.includes(cls.id);
                return (
                  <Label key={cls.id} className="flex items-center gap-2 cursor-pointer font-normal text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => setSelectedClasses(toggleArrayItem(selectedClasses, cls.id))}
                    />
                    <Armchair className={`w-3.5 h-3.5 ${checked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={fontClass}>{isBn ? cls.labelBn : cls.label}</span>
                  </Label>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Available Seats ── */}
        <AccordionItem value="seats">
          <AccordionTrigger className={`text-sm font-medium ${fontClass}`}>
            {t('availableSeats', language)}
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup
              value={selectedSeats}
              onValueChange={setSelectedSeats}
              className="gap-2"
            >
              {SEAT_OPTIONS.map((opt) => (
                <Label key={opt.id} className="flex items-center gap-2 cursor-pointer font-normal text-sm">
                  <RadioGroupItem value={opt.id} />
                  <span className={fontClass}>{t(opt.key, language)}</span>
                </Label>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Clear all filters button */}
      <div className="px-1 pt-2 pb-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={activeFilterCount === 0}
          onClick={clearAllFilters}
        >
          <X className="w-3.5 h-3.5 mr-1.5" />
          <span className={fontClass}>{t('clearFilters', language)}</span>
        </Button>
      </div>
    </div>
  );
}

/* ─── TicketCard Sub-component ────────────────────────── */

function TicketCard({ tk, language, isBn, fontClass, navigate }: {
  tk: Ticket;
  language: 'en' | 'bn';
  isBn: boolean;
  fontClass: string;
  navigate: (page: string, params?: Record<string, string>) => void;
}) {
  const Icon = transportIcons[tk.transportType] || Bus;
  const color = transportColors[tk.transportType] || transportColors.bus;
  const isOnlineCopy = tk.ticketType === 'online_copy';

  const getSeatClassLabel = (id: string) => {
    const cls = BUS_CLASSES.find((c) => c.id === id);
    return cls ? (isBn ? cls.labelBn : cls.label) : id;
  };

  const getSaveInfo = (tk: Ticket) => {
    if (!tk.originalPrice || tk.originalPrice <= tk.price) return { amount: 0, percent: 0 };
    const saved = tk.originalPrice - tk.price;
    const percent = Math.round((saved / tk.originalPrice) * 100);
    return { amount: saved, percent };
  };

  const saveInfo = getSaveInfo(tk);
  const hasDiscount = saveInfo.amount > 0;

  return (
    <Card
      className="cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group h-full flex flex-col"
      onClick={() => navigate('ticket-details', { id: tk.id })}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* ── Row 1: Transport Type | Ticket Type | Save ── */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Badge className={`${color} text-[10px] gap-0.5 font-semibold`}>
              <Icon className="w-3 h-3" />
              {isBn ? TRANSPORT_TYPES.find(x => x.id === tk.transportType)?.labelBn || tk.transportType : TRANSPORT_TYPES.find(x => x.id === tk.transportType)?.label || tk.transportType}
            </Badge>
            <Badge variant="outline" className={`text-[10px] font-medium ${
              isOnlineCopy ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
            }`}>
              {isOnlineCopy
                ? (<span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" />{t('onlineCopy', language)}</span>)
                : (<span className="flex items-center gap-0.5"><ImageIcon className="w-2.5 h-2.5" />{t('counterCopy', language)}</span>)
              }
            </Badge>
          </div>
          {hasDiscount && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] gap-0.5 font-semibold">
              <Tag className="w-3 h-3" />
              {isBn ? `৳${saveInfo.amount.toLocaleString()} সাশ্রয় (${saveInfo.percent}%)` : `Save ৳${saveInfo.amount.toLocaleString()} (${saveInfo.percent}%)`}
            </Badge>
          )}
        </div>

        {/* ── Row 2: From → To ── */}
        <div className="px-3 pb-1">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold text-base ${fontClass}`}>{tk.from}</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className={`font-bold text-base ${fontClass}`}>{tk.to}</span>
          </div>
        </div>

        {/* ── Row 3: Transport Company ── */}
        <div className="px-3 pb-1.5">
          <p className={`text-xs text-muted-foreground truncate ${fontClass}`}>
            {tk.transportCompany}
          </p>
        </div>

        {/* ── Row 4: Date | Time ── */}
        <div className="px-3 pb-1.5">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" />
              <span className={`font-medium ${fontClass}`}>{formatDepartureDate(tk.departureDate, language)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              <span className="font-medium">{formatDepartureTime(tk.departureTime, language)}</span>
            </span>
          </div>
        </div>

        {/* ── Row 5: Class | Seat ── */}
        {(tk.seatClass || tk.seatNumber) && (
          <div className="px-3 pb-1.5">
            <div className="flex items-center gap-2 text-[10px]">
              {tk.seatClass && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/60 font-medium">
                  <Armchair className="w-3 h-3 text-primary" />
                  <span className={fontClass}>{getSeatClassLabel(tk.seatClass)}</span>
                </span>
              )}
              {tk.seatNumber && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/60 font-medium">
                  {isBn ? 'আসন' : 'Seat'}: {tk.seatNumber}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Spacer to push footer down ── */}
        <div className="flex-1 min-h-[4px]" />

        {/* ── Row 6: Price | View Ticket ── */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 rounded-b-lg border-t border-border/50 mt-auto">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className={`text-xs line-through text-muted-foreground ${fontClass}`}>
                  ৳{tk.originalPrice.toLocaleString()}
                </span>
                <span className={`text-base font-bold text-primary ${fontClass}`}>
                  ৳{tk.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className={`text-base font-bold text-primary ${fontClass}`}>
                ৳{tk.price.toLocaleString()}
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="min-h-[32px] bg-primary group-hover:shadow-md transition-shadow gap-1 text-xs"
            onClick={(e) => { e.stopPropagation(); navigate('ticket-details', { id: tk.id }); }}
          >
            {isBn ? 'টিকেট দেখুন' : 'View Ticket'}
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main SearchPage ─────────────────────────────────── */

export default function SearchPage() {
  const urlSearchParams = useSearchParams();
  const { pageParams } = useAppStore();
  const { navigate } = useNav();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  // Search params from URL or store
  const urlTransport = urlSearchParams.get('transport') || '';
  const urlFrom = urlSearchParams.get('from') || '';
  const urlTo = urlSearchParams.get('to') || '';
  const urlDate = urlSearchParams.get('date') || '';

  // Filter state
  const [from, setFrom] = useState(urlFrom || pageParams.from || '');
  const [to, setTo] = useState(urlTo || pageParams.to || '');
  const [transportType, setTransportType] = useState(urlTransport || pageParams.transportType || '');
  const [date, setDate] = useState(urlDate || pageParams.date || '');
  const [selectedTransportTypes, setSelectedTransportTypes] = useState<string[]>(transportType && transportType !== 'all' ? [transportType] : []);
  const [selectedTicketTypes, setSelectedTicketTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedDepartureTime, setSelectedDepartureTime] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string>('');

  // Sort & Pagination
  const [sortBy, setSortBy] = useState('default');
  const [perPage, setPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Data
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const fetchIdRef = useRef(0);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedTransportTypes.length > 0) count++;
    if (selectedTicketTypes.length > 0) count++;
    if (minPrice || maxPrice) count++;
    if (selectedDepartureTime.length > 0) count++;
    if (selectedClasses.length > 0) count++;
    if (selectedSeats) count++;
    return count;
  }, [selectedTransportTypes, selectedTicketTypes, minPrice, maxPrice, selectedDepartureTime, selectedClasses, selectedSeats]);

  const clearAllFilters = useCallback(() => {
    setSelectedTransportTypes([]);
    setSelectedTicketTypes([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedDepartureTime([]);
    setSelectedClasses([]);
    setSelectedSeats('');
  }, []);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    setFetching(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (date) params.set('date', date);
      if (selectedTransportTypes.length > 0) params.set('transportType', selectedTransportTypes.join(','));
      if (selectedTicketTypes.length > 0) params.set('ticketType', selectedTicketTypes.join(','));
      if (selectedClasses.length > 0) params.set('seatClass', selectedClasses.join(','));
      if (selectedDepartureTime.length > 0) params.set('departureTimePeriod', selectedDepartureTime.join(','));
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('page', String(currentPage));
      params.set('limit', String(perPage));

      // Sort
      const sortOption = SORT_OPTIONS.find(o => o.id === sortBy);
      if (sortOption && 'sortBy' in sortOption && 'sortOrder' in sortOption) {
        params.set('sortBy', sortOption.sortBy);
        params.set('sortOrder', sortOption.sortOrder);
      }

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();

      if (fetchId === fetchIdRef.current) {
        const rawTickets = Array.isArray(data) ? data : data.tickets || [];
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
        if (data.pagination) {
          setTotalTickets(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch {
      if (fetchId === fetchIdRef.current) {
        setTickets([]);
        setTotalTickets(0);
        setTotalPages(0);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setFetching(false);
      }
    }
  }, [from, to, date, selectedTransportTypes, selectedTicketTypes, selectedClasses, selectedDepartureTime, minPrice, maxPrice, currentPage, perPage, sortBy]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset page when filters change (except currentPage itself)
  useEffect(() => {
    setCurrentPage(1);
  }, [from, to, date, selectedTransportTypes, selectedTicketTypes, selectedClasses, selectedDepartureTime, minPrice, maxPrice, sortBy, perPage]);

  // Pagination range calculation
  const getPageNumbers = useCallback(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // Showing range
  const showingFrom = totalTickets === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const showingTo = Math.min(currentPage * perPage, totalTickets);

  const filterSidebarProps = {
    language,
    isBn,
    fontClass,
    selectedTransportTypes,
    setSelectedTransportTypes,
    selectedTicketTypes,
    setSelectedTicketTypes,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedDepartureTime,
    setSelectedDepartureTime,
    selectedClasses,
    setSelectedClasses,
    selectedSeats,
    setSelectedSeats,
    clearAllFilters,
    activeFilterCount,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl font-bold ${fontClass}`}>
              {t('searchTickets', language)}
            </h1>
            <p className={`text-xs sm:text-sm text-muted-foreground ${fontClass}`}>
              {isBn ? 'উপলব্ধ টিকেট খুঁজুন ও কিনুন' : 'Find and buy available tickets'}
            </p>
          </div>
        </div>

        {/* ── Search Bar (Route / Date selectors) ── */}
        <Card className="mb-4 border-primary/10">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="h-10 w-full">
                  <MapPin className="w-4 h-4 mr-1 shrink-0 text-primary" />
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
                <SelectTrigger className="h-10 w-full">
                  <MapPin className="w-4 h-4 mr-1 shrink-0 text-orange-500" />
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

              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full"
                placeholder={t('journeyDate', language)}
              />

              <Button
                variant="outline"
                className="min-h-[40px] w-full"
                onClick={() => { setFrom(''); setTo(''); setDate(''); }}
              >
                <X className="w-4 h-4 mr-1.5" />
                <span className={fontClass}>{t('cancel', language)}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Main Content: Sidebar + Grid ── */}
        <div className="flex gap-4 lg:gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <Card className="sticky top-4">
              <CardContent className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                <FilterSidebar {...filterSidebarProps} />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* ── Toolbar: Sort + Per Page + Mobile Filter Button ── */}
            <div className="flex items-center justify-between gap-2 mb-3">
              {/* Mobile filter button */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden min-h-[40px]"
                onClick={() => setMobileFilterOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                <span className={fontClass}>{t('filterBy', language)}</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-xs h-5 min-w-[20px] flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* Results count */}
              <p className={`text-sm text-muted-foreground hidden sm:block ${fontClass}`}>
                {fetching ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t('loading', language)}
                  </span>
                ) : (
                  t('showingResults', language)
                    .replace('{from}', String(showingFrom))
                    .replace('{to}', String(showingTo))
                    .replace('{total}', String(totalTickets))
                )}
              </p>

              {/* Sort + Per Page selectors */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[160px] sm:w-[180px] text-xs">
                    <SelectValue placeholder={t('sortBy', language)} />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        <span className={`text-xs ${fontClass}`}>{t(opt.key, language)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                  <SelectTrigger className="h-9 w-[70px] sm:w-[80px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PER_PAGE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        <span className="text-xs">{n}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Ticket Grid ── */}
            {fetching ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                <p className={`text-sm ${fontClass}`}>{t('loading', language)}</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className={`text-lg font-medium ${fontClass}`}>{t('noResults', language)}</p>
                <p className={`text-sm mt-1 ${fontClass}`}>
                  {isBn ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন' : 'Try changing your filters'}
                </p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={clearAllFilters}>
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    <span className={fontClass}>{t('clearFilters', language)}</span>
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile results count */}
                <p className={`text-xs text-muted-foreground mb-2 sm:hidden ${fontClass}`}>
                  {t('showingResults', language)
                    .replace('{from}', String(showingFrom))
                    .replace('{to}', String(showingTo))
                    .replace('{total}', String(totalTickets))}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {tickets.map((tk) => (
                      <TicketCard
                        key={tk.id}
                        tk={tk}
                        language={language}
                        isBn={isBn}
                        fontClass={fontClass}
                        navigate={navigate}
                      />
                    ))}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>

                        {getPageNumbers().map((pn, idx) => (
                          <PaginationItem key={idx}>
                            {pn === 'ellipsis' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                isActive={pn === currentPage}
                                onClick={() => setCurrentPage(pn)}
                                className="cursor-pointer"
                              >
                                {pn}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Sheet (Drawer from bottom) ── */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="bottom" className="h-[85vh] max-h-[85vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle className={fontClass}>{t('filterBy', language)}</SheetTitle>
            <SheetDescription className={fontClass}>
              {isBn ? 'আপনার পছন্দ অনুযায়ী টিকেট ফিল্টার করুন' : 'Filter tickets according to your preferences'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            <FilterSidebar {...filterSidebarProps} />
          </div>
          <SheetFooter className="flex-row gap-2 pt-2 border-t">
            <Button
              variant="outline"
              className="flex-1"
              disabled={activeFilterCount === 0}
              onClick={() => { clearAllFilters(); setMobileFilterOpen(false); }}
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              <span className={fontClass}>{t('clearFilters', language)}</span>
            </Button>
            <Button
              className="flex-1 bg-primary"
              onClick={() => setMobileFilterOpen(false)}
            >
              <span className={fontClass}>{isBn ? 'ফিল্টার প্রয়োগ করুন' : 'Apply Filters'}</span>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
