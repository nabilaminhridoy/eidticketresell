'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  TRANSPORT_TYPES,
  TICKET_STATUS,
  formatDepartureDate,
  formatDepartureTime,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Bus,
  TrainFront,
  Plane,
  Ship,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Loader2,
  User,
  Info,
} from 'lucide-react';

// ─── Transport helpers ────────────────────────────────────
const transportIcons: Record<string, React.ElementType> = {
  bus: Bus,
  train: TrainFront,
  flight: Plane,
  launch: Ship,
};

const transportLabels: Record<string, Record<string, string>> = {};
TRANSPORT_TYPES.forEach((tt) => {
  transportLabels[tt.id] = { en: tt.label, bn: tt.labelBn };
});

// ─── Types ────────────────────────────────────────────────
interface SellerInfo {
  id: string;
  name: string;
  isKycVerified: boolean;
}

interface VerifiedTicket {
  id: string;
  ticketId: string;
  transportType: string;
  transportCompany: string;
  routeFrom: string;
  routeTo: string;
  departureDate: string;
  departureTime: string;
  ticketType: string;
  seatClass?: string;
  seatNumber?: string;
  seatType?: string;
  coachNumber?: string;
  status: string;
  seller: SellerInfo;
}

type VerifyState = 'idle' | 'loading' | 'not_found' | 'verified' | 'expired';

// ─── Component ────────────────────────────────────────────
export default function VerifyTicketPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [pnrInput, setPnrInput] = useState('');
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [ticket, setTicket] = useState<VerifiedTicket | null>(null);

  const handleVerify = async () => {
    const pnr = pnrInput.trim();
    if (!pnr) return;

    setVerifyState('loading');
    setTicket(null);

    try {
      const res = await fetch(`/api/tickets/verify?pnr=${encodeURIComponent(pnr)}`);
      const data = await res.json();

      if (!res.ok || data.found === false || !data.ticket) {
        setVerifyState('not_found');
        return;
      }

      const tk = data.ticket as VerifiedTicket;
      setTicket(tk);

      if (tk.status === 'expired' || tk.status === 'cancelled') {
        setVerifyState('expired');
      } else {
        setVerifyState('verified');
      }
    } catch {
      setVerifyState('not_found');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify();
  };

  const TransportIcon = ticket ? transportIcons[ticket.transportType] || Bus : Bus;
  const tLabel = ticket
    ? transportLabels[ticket.transportType]?.[language] || ticket.transportType
    : '';

  const statusConfig = ticket ? TICKET_STATUS[ticket.status as keyof typeof TICKET_STATUS] : null;

  return (
    <div className={`min-h-screen bg-background ${fontClass}`}>
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">
        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <ShieldCheck className="h-7 w-7 text-[#16a34a] dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('verifyTicket', language)}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('verifyTicketDesc', language)}
          </p>
        </div>

        {/* ── Input Section ──────────────────────────── */}
        <Card className="mb-6 border border-border shadow-sm">
          <CardContent className="p-6">
            <label
              htmlFor="pnr-input"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              {t('ticketId', language)} / PNR
            </label>
            <div className="flex gap-3">
              <Input
                id="pnr-input"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('enterPnrNumber', language)}
                className="h-11 flex-1 text-base"
                autoComplete="off"
              />
              <Button
                onClick={handleVerify}
                disabled={verifyState === 'loading' || !pnrInput.trim()}
                className="h-11 px-6 bg-[#16a34a] hover:bg-[#15803d] text-white transition-colors duration-200"
                size="default"
              >
                {verifyState === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                {verifyState !== 'loading' && t('search', language)}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Result Section ─────────────────────────── */}
        {/* NOT FOUND */}
        {verifyState === 'not_found' && (
          <Card className="border border-red-200 dark:border-red-900/40 bg-white dark:bg-red-950/10 shadow-sm">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                {t('ticketNotFound', language)}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t('ticketNotFoundDesc', language)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* VERIFIED */}
        {verifyState === 'verified' && ticket && (
          <Card className="border border-green-200 dark:border-green-900/40 bg-white dark:bg-green-950/10 shadow-sm">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <CheckCircle2 className="h-5 w-5 text-[#16a34a] dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base text-[#16a34a] dark:text-green-400">
                    {t('ticketVerified', language)}
                  </CardTitle>
                </div>
                <Badge
                  className={
                    statusConfig?.color ||
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }
                >
                  {statusConfig?.label || ticket.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-6 pb-6">
              <Separator className="mb-4" />
              <div className="space-y-3.5">
                {/* Ticket ID */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('ticketId', language)}</p>
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {ticket.ticketId}
                    </p>
                  </div>
                </div>

                {/* Transport type + company */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <TransportIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t('transport', language)} & {t('transportCompany', language)}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {tLabel} &bull; {ticket.transportCompany}
                    </p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('routeFrom', language)} → {t('routeTo', language)}</p>
                    <p className="text-sm font-medium text-foreground">
                      {ticket.routeFrom} <ArrowRight className="mx-1 inline h-3 w-3" /> {ticket.routeTo}
                    </p>
                  </div>
                </div>

                {/* Departure Date */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('departureDate', language)}</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDepartureDate(ticket.departureDate, language)}
                    </p>
                  </div>
                </div>

                {/* Departure Time */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('departureTime', language)}</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDepartureTime(ticket.departureTime, language)}
                    </p>
                  </div>
                </div>

                {/* Ticket Type */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('ticketType', language)}</p>
                    <p className="text-sm font-medium text-foreground">
                      {ticket.ticketType === 'online_copy'
                        ? t('onlineCopy', language)
                        : t('counterCopy', language)}
                    </p>
                  </div>
                </div>

                {/* Seat Info */}
                {(ticket.seatNumber || ticket.seatType || ticket.coachNumber) && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <Bus className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t('seatNumber', language)}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {[
                          ticket.seatNumber && `${t('seatNumber', language)}: ${ticket.seatNumber}`,
                          ticket.seatType && `${t('seatType', language)}: ${ticket.seatType}`,
                          ticket.coachNumber && `${t('coachNumber', language)}: ${ticket.coachNumber}`,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Seller verification status */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t('seller', language)}</p>
                    {ticket.seller?.isKycVerified ? (
                      <Badge className="bg-green-100 text-[#16a34a] dark:bg-green-900/20 dark:text-green-400 border-0">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {t('verified', language)}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-0">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {t('unverified', language)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* EXPIRED / CANCELLED */}
        {verifyState === 'expired' && ticket && (
          <Card className="border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-amber-950/10 shadow-sm">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base text-amber-700 dark:text-amber-400">
                    {t('ticketExpired', language)}
                  </CardTitle>
                </div>
                <Badge
                  className={
                    statusConfig?.color ||
                    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }
                >
                  {statusConfig?.label || ticket.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-6 pb-6">
              <Separator className="mb-4" />
              <div className="space-y-3.5">
                {/* Ticket ID */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('ticketId', language)}</p>
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {ticket.ticketId}
                    </p>
                  </div>
                </div>

                {/* Transport type + company */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <TransportIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t('transport', language)} & {t('transportCompany', language)}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {tLabel} &bull; {ticket.transportCompany}
                    </p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t('routeFrom', language)} → {t('routeTo', language)}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {ticket.routeFrom} <ArrowRight className="mx-1 inline h-3 w-3" />{' '}
                      {ticket.routeTo}
                    </p>
                  </div>
                </div>

                {/* Departure Date */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('departureDate', language)}</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDepartureDate(ticket.departureDate, language)}
                    </p>
                  </div>
                </div>

                {/* Departure Time */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('departureTime', language)}</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDepartureTime(ticket.departureTime, language)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Info Section ───────────────────────────── */}
        <div className="mt-8">
          <Card className="border border-border bg-white dark:bg-card shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Info className="h-4 w-4 text-[#2563eb] dark:text-blue-400" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-foreground">
                    {t('pnrUniqueInfo', language)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('escrowProtected', language)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
