'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { TICKET_STATUS, BUS_CLASSES, COURIER_COMPANIES, DELIVERY_SPEEDS, formatDepartureDate, formatDepartureTime, ONLINE_COPY_PLATFORM_FEE_PERCENTAGE, COUNTER_COPY_PLATFORM_FEE_PERCENTAGE, PLATFORM_FEE_MINIMUM } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bus, TrainFront, Plane, Ship, MapPin, Calendar, Clock,
  ShieldCheck, Eye, EyeOff, Lock, QrCode, ArrowLeft,
  User, Phone, MessageCircle, FileText, ChevronRight,
  Armchair, Building2, AlertTriangle, CheckCircle2, Info,
  Truck, Navigation, Scale, Download, Mail
} from 'lucide-react';

// ─── Transport helpers ────────────────────────────────────
const transportIcons: Record<string, React.ElementType> = {
  bus: Bus, train: TrainFront, flight: Plane, launch: Ship,
};
const transportColors: Record<string, string> = {
  bus: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  train: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  flight: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  launch: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

// ─── Types ────────────────────────────────────────────────
interface SellerInfo {
  id: string;
  name: string;
  avatar?: string;
  isKycVerified: boolean;
  role: string;
  createdAt: string;
}

interface TicketData {
  id: string;
  ticketId: string;
  sellerId: string;
  transportType: string;
  transportCompany: string;
  ticketType: string;
  pnrNumber?: string;
  ticketDocument?: string;
  routeFrom: string;
  routeTo: string;
  departureDate: string;
  departureTime: string;
  boardingPoint?: string;
  droppingPoint?: string;
  seatClass?: string;
  deckType?: string;
  seatNumber?: string;
  seatType?: string;
  coachNumber?: string;
  originalPrice: number;
  price: number;
  platformFee: number;
  totalAmount: number;
  deliveryType?: string;
  meetingPlace?: string;
  courierName?: string;
  deliverySpeed?: string;
  deliveryChargePaidBy?: string;
  deliveryCharge: number;
  description?: string;
  sellerNotes?: string;
  status: string;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  seller: SellerInfo;
}

interface OrderData {
  id: string;
  orderId: string;
  ticketId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  escrowStatus: string;
  paymentStatus: string;
  deliveryMethod: string;
  deliveryStatus: string;
  qrCode?: string;
  isQrScanned: boolean;
  status: string;
  ticket: TicketData & { pnrNumber?: string; ticketDocument?: string };
  seller: SellerInfo & { phone?: string };
}

// ─── Component ────────────────────────────────────────────
interface TicketDetailsPageProps {
  ticketId?: string;
}

export default function TicketDetailsPage({ ticketId }: TicketDetailsPageProps = {}) {
  const { pageParams } = useAppStore();
  const { navigate } = useNav();
  const { token, isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';

  // Resolve ticket ID: prop from URL path > store pageParams > empty
  const resolvedTicketId = ticketId || pageParams.id || '';

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // ─── Fetch platform fees from admin settings ────────────────
  const [feeSettings, setFeeSettings] = useState({
    onlineFee: ONLINE_COPY_PLATFORM_FEE_PERCENTAGE,
    counterFee: COUNTER_COPY_PLATFORM_FEE_PERCENTAGE,
    minimumFee: PLATFORM_FEE_MINIMUM,
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        const feesGroup = d.settings?.fees || d.settings?.payments || {};
        if (feesGroup.platform_fee_online) {
          setFeeSettings({
            onlineFee: parseFloat(feesGroup.platform_fee_online || String(ONLINE_COPY_PLATFORM_FEE_PERCENTAGE)),
            counterFee: parseFloat(feesGroup.platform_fee_counter || String(COUNTER_COPY_PLATFORM_FEE_PERCENTAGE)),
            minimumFee: parseFloat(feesGroup.platform_fee_minimum || String(PLATFORM_FEE_MINIMUM)),
          });
        }
      })
      .catch(() => {});
  }, []);

  // ─── Fetch ticket ────────────────────────────────────
  const fetchTicket = useCallback(async () => {
    if (!resolvedTicketId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/tickets/${resolvedTicketId}`);
      if (!res.ok) throw new Error(isBn ? 'টিকেট পাওয়া যায়নি' : 'Ticket not found');
      const data = await res.json();
      setTicket(data.ticket || data);
    } catch {
      setTicket(null);
      setError(isBn ? 'টিকেট লোড করা যায়নি' : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [resolvedTicketId, isBn]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // ─── Calculate fees ──────────────────────────────────
  const feePercentage = ticket?.ticketType === 'online_copy' ? feeSettings.onlineFee : feeSettings.counterFee;
  const platformFee = ticket
    ? Math.max(Math.round(ticket.price * feePercentage / 100), feeSettings.minimumFee)
    : 0;

  const isOnlineCopy = ticket?.ticketType === 'online_copy';
  const isCounterCopy = ticket?.ticketType === 'counter_copy';

  // For Online Copy: buyer pays full price (platform fee deducted from seller share after release)
  // For Counter Copy: buyer pays only platform fee now; ticket price paid to seller on delivery
  const buyerPaysNow = isOnlineCopy ? ticket?.price ?? 0 : platformFee;
  const sellerGetsAfterRelease = isOnlineCopy ? (ticket?.price ?? 0) - platformFee : 0;

  // ─── Handle purchase ─────────────────────────────────
  const handlePurchase = async () => {
    if (!token || !isAuthenticated) {
      navigate('login');
      return;
    }
    setBuying(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId: ticket?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isBn ? 'কেনাকাটা ব্যর্থ হয়েছে' : 'Purchase failed'));

      setOrder(data.order);
      setHasPaid(true);
      setShowConfirmDialog(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isBn ? 'ত্রুটি হয়েছে' : 'An error occurred'));
    } finally {
      setBuying(false);
    }
  };

  // ─── Status badge config ─────────────────────────────
  const statusConfig = ticket ? TICKET_STATUS[ticket.status as keyof typeof TICKET_STATUS] : null;
  const statusLabel = statusConfig
    ? (isBn
        ? { active: 'সক্রিয়', sold: 'বিক্রি হয়েছে', expired: 'মেয়াদোত্তীর্ণ', cancelled: 'বাতিল', pending_review: 'পর্যালোচনাধীন' }[ticket.status] || statusConfig.label
        : statusConfig.label)
    : ticket?.status;

  // ─── Transport icon & color ──────────────────────────
  const TransportIcon = ticket ? (transportIcons[ticket.transportType] || Bus) : Bus;
  const transportColor = ticket ? (transportColors[ticket.transportType] || transportColors.bus) : transportColors.bus;

  // ─── Info row helper ─────────────────────────────────
  const InfoRow = ({ icon: IconComp, label, value, sensitive = false }: {
    icon: React.ElementType; label: string; value?: string | null; sensitive?: boolean;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-2.5 text-sm">
        <IconComp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="min-w-0">
          <span className="text-muted-foreground">{label}: </span>
          {sensitive && !hasPaid ? (
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-muted-foreground select-none">
              <Lock className="w-3 h-3" />
              {isBn ? 'অর্থ প্রদান করুন' : 'Pay to view'}
            </span>
          ) : (
            <span className="font-medium">{value}</span>
          )}
        </div>
      </div>
    );
  };

  // ─── Loading state ───────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 max-w-5xl">
        <Skeleton className="h-8 w-24 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-52 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error / not found ───────────────────────────────
  if (!ticket) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className={`text-xl font-bold mb-2 ${isBn ? 'font-bangla' : ''}`}>
          {error || (isBn ? 'টিকেট পাওয়া যায়নি' : 'Ticket Not Found')}
        </h2>
        <p className={`text-muted-foreground mb-6 ${isBn ? 'font-bangla' : ''}`}>
          {isBn ? 'এই টিকেটটি আর পাওয়া যাচ্ছে না বা সরানো হয়েছে' : 'This ticket may no longer exist or has been removed'}
        </p>
        <Button variant="outline" onClick={() => navigate('search')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('back', language)}
        </Button>
      </div>
    );
  }

  // ─── Post-purchase order confirmation ────────────────
  if (hasPaid && order) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-6 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('my-orders')} className="mb-4 min-h-[44px]">
          <ArrowLeft className="w-4 h-4 mr-1" />{t('back', language)}
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Order info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Success header */}
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4 sm:p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h2 className={`text-xl font-bold mb-1 ${isBn ? 'font-bangla' : ''}`}>
                    {isBn ? 'অর্ডার সফল!' : 'Order Confirmed!'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isBn ? `অর্ডার আইডি: ${order.orderId}` : `Order ID: ${order.orderId}`}
                  </p>
                </CardContent>
              </Card>

              {/* Order details */}
              <Card className="border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className={`text-base ${isBn ? 'font-bangla' : ''}`}>
                    {isBn ? 'অর্ডারের বিবরণ' : 'Order Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBn ? 'রুট' : 'Route'}</span>
                    <span className="font-medium">{ticket.routeFrom} → {ticket.routeTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBn ? 'পরিবহন' : 'Transport'}</span>
                    <span className="font-medium">{ticket.transportCompany}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBn ? 'যাত্রার তারিখ' : 'Travel Date'}</span>
                    <span className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{formatDepartureDate(ticket.departureDate, language)} | {formatDepartureTime(ticket.departureTime, language)}</span>
                  </div>
                  {ticket.seatNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('seatNumber', language)}</span>
                      <span className="font-medium">{ticket.seatNumber}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('price', language)}</span>
                    <span>{t('bdt', language)}{ticket.price}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('platformFee', language)} ({feePercentage}%)</span>
                    <span>{t('bdt', language)}{platformFee}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>{isBn ? 'আপনি প্রদান করেছেন' : 'You Paid'}</span>
                    <span className="text-emerald-600">{t('bdt', language)}{order.totalAmount}</span>
                  </div>
                </CardContent>
              </Card>

              {/* PNR & Ticket Document (now revealed) */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-4"
                >
                  {order.ticket?.pnrNumber && (
                    <Card className="border-primary/10">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{isBn ? 'পিএনআর নম্বর' : 'PNR / Ticket Number'}</p>
                            <p className="text-lg font-bold font-mono tracking-wide">{order.ticket.pnrNumber}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {order.ticket?.ticketDocument && (
                    <Card className="border-primary/10 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-3 bg-muted/50 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className={`text-sm font-medium ${isBn ? 'font-bangla' : ''}`}>
                            {isBn ? 'টিকেট নথি' : 'Ticket Document'}
                          </span>
                        </div>
                        <div className="relative">
                          <img
                            src={order.ticket.ticketDocument}
                            alt={isBn ? 'টিকেট নথি' : 'Ticket Document'}
                            className="w-full object-contain max-h-96"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right column - Escrow + Seller */}
            <div className="space-y-4">
              {/* Escrow status */}
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className={`font-medium text-sm mb-1 ${isBn ? 'font-bangla' : ''}`}>
                        {isBn ? 'এসক্রো সুরক্ষা' : 'Escrow Protection'}
                      </p>
                      <p className={`text-xs text-muted-foreground leading-relaxed ${isBn ? 'font-bangla' : ''}`}>
                        {isOnlineCopy
                          ? (isBn
                              ? 'আপনার অর্থ যাত্রার তারিখ পর্যন্ত আমাদের কাছে নিরাপদে রাখা হয়েছে। বিক্রেতা প্রতারক হলে আপনি সম্পূর্ণ ফেরত পাবেন (প্ল্যাটফর্ম ফি বাদে)। আপনি সফলভাবে ভ্রমণ করলে, আমরা বিক্রেতাকে অর্থ প্রদান করব।'
                              : 'We hold the money until the travel date. If the seller is fraudulent, you get a full refund (minus platform fee). If you travel successfully, we release money to the seller.')
                          : (isBn
                              ? 'আপনি প্ল্যাটফর্ম ফি প্রদান করেছেন। টিকেটের মূল্য ডেলিভারির সময় সরাসরি বিক্রেতাকে প্রদান করুন।'
                              : 'You paid the platform fee. Pay the ticket price directly to the seller upon delivery.')
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code for counter copy */}
              {isCounterCopy && order.qrCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Card className="border-primary/10">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <QrCode className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className={`font-semibold mb-1 ${isBn ? 'font-bangla' : ''}`}>
                        {isBn ? 'ডেলিভারি ভেরিফিকেশন কিউআর' : 'Delivery Verification QR'}
                      </h3>
                      <p className={`text-xs text-muted-foreground mb-4 ${isBn ? 'font-bangla' : ''}`}>
                        {isBn ? 'টিকেট ডেলিভারির সময় বিক্রেতাকে এই কিউআর কোড দেখান' : 'Show this QR code to the seller during ticket delivery'}
                      </p>
                      <div className="inline-block p-4 bg-white rounded-xl border-2 border-dashed border-primary/30">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:20px_20px] rounded-lg flex items-center justify-center">
                          <span className="bg-white px-2 py-1 rounded text-[10px] font-mono text-center break-all">{order.qrCode}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">{order.qrCode}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Seller info (revealed after payment) */}
              <Card className="border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className={`text-base flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                    <User className="w-4 h-4 text-primary" />
                    {isBn ? 'বিক্রেতার তথ্য' : 'Seller Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.seller?.name || ticket.seller.name}</span>
                        {ticket.seller.isKycVerified && (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                            <ShieldCheck className="w-3 h-3 mr-0.5" />
                            {t('verified', language)}
                          </Badge>
                        )}
                      </div>
                      {order.seller?.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.seller.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full min-h-[44px]"
                    variant="outline"
                    onClick={() => navigate('chat', { orderId: order.id })}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {isBn ? 'বিক্রেতার সাথে চ্যাট করুন' : 'Chat with Seller'}
                  </Button>
                </CardContent>
              </Card>

              {/* Counter copy delivery info */}
              {isCounterCopy && ticket.deliveryType && (
                <Card className="border-primary/10">
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-base flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                      {ticket.deliveryType === 'in_person'
                        ? <><Navigation className="w-4 h-4 text-primary" />{isBn ? 'সাক্ষাৎ মিটিং' : 'In-Person Meeting'}</>
                        : <><Truck className="w-4 h-4 text-primary" />{isBn ? 'কুরিয়ার ডেলিভারি' : 'Courier Delivery'}</>
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    {ticket.deliveryType === 'in_person' && ticket.meetingPlace && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-muted-foreground text-xs">{isBn ? 'মিটিং পয়েন্ট' : 'Meeting Point'}</p>
                          <p className="font-medium">{ticket.meetingPlace}</p>
                        </div>
                      </div>
                    )}
                    {ticket.deliveryType === 'courier' && (
                      <>
                        {ticket.courierName && (
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{isBn ? 'কুরিয়ার:' : 'Courier:'}</span>
                            <span className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{(() => { const cr = COURIER_COMPANIES.find(c => c.id === ticket.courierName); return cr ? (isBn ? cr.labelBn : cr.label) : ticket.courierName; })()}</span>
                          </div>
                        )}
                        {ticket.deliverySpeed && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{isBn ? 'গতি:' : 'Speed:'}</span>
                            <span className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{(() => { const ds = DELIVERY_SPEEDS.find(d => d.id === ticket.deliverySpeed); return ds ? (isBn ? ds.labelBn : ds.label) : ticket.deliverySpeed; })()}</span>
                          </div>
                        )}
                        {ticket.deliveryCharge > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{isBn ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
                            <span className="font-medium">{t('bdt', language)}{ticket.deliveryCharge}</span>
                            <span className="text-xs text-muted-foreground">
                              ({ticket.deliveryChargePaidBy === 'seller'
                                ? (isBn ? 'বিক্রেতা প্রদান করবে' : 'Paid by seller')
                                : (isBn ? 'ক্রেতা প্রদান করবে' : 'Paid by buyer')})
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button className="flex-1 min-h-[44px]" onClick={() => navigate('my-orders')}>
              {isBn ? 'আমার অর্ডার দেখুন' : 'View My Orders'}
            </Button>
            <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => navigate('search')}>
              {isBn ? 'আরও টিকেট খুঁজুন' : 'Find More Tickets'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Main ticket detail view (before purchase) ───────
  const isAvailable = ticket.status === 'active';

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-5xl">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('search')} className="mb-4 -ml-2 min-h-[44px]">
        <ArrowLeft className="w-4 h-4 mr-1" />
        {t('back', language)}
      </Button>

      {/* BRTA Regulations Notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold text-amber-800 dark:text-amber-300 mb-1 ${isBn ? 'font-bangla' : ''}`}>
              {isBn ? 'বিআরটিএ (BRTA) প্রবিধান সতর্কতা' : 'BRTA Regulations Notice'}
            </h3>
            <p className={`text-sm text-amber-700 dark:text-amber-400 leading-relaxed ${isBn ? 'font-bangla' : ''}`}>
              {isBn
                ? 'বিআরটিএ প্রবিধান মেনে চলতে, ঈদ টিকেট পুনর্বিক্রয় মূল্য অফিসিয়াল ভাড়ার বেশি হতে পারে না। বিআরটিএ-অনুমোদিত ভাড়ার চেয়ে বেশি মূল্যের যেকোনো তালিকা অনুমোদিত হবে না।'
                : 'To comply with BRTA regulations, Eid ticket resale prices must not exceed the official fare. Any listing priced above the BRTA-approved fare will not be approved.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          2-COLUMN LAYOUT: Left (2/3) | Right (1/3)
          Left:  Ticket Info, Image/PNR, Route, Seat, Delivery, Description
          Right: Price, Seller
      ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="lg:col-span-2 space-y-4">

          {/* ─── 1. Ticket Information ──────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="border-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${transportColor}`}>
                      <TransportIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className={`text-lg leading-tight ${isBn ? 'font-bangla' : ''}`}>
                        {ticket.routeFrom} → {ticket.routeTo}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{ticket.transportCompany}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ticket.isFeatured && (
                      <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        ⭐ {isBn ? 'বিশেষ' : 'Featured'}
                      </Badge>
                    )}
                    <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-700'}>
                      {statusLabel}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{ticket.ticketId}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {ticket.views} {isBn ? 'দেখেছে' : 'views'}
                  </span>
                </div>
              </CardHeader>
              {/* Date & Time summary bar */}
              <CardContent className="pt-0 pb-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-sm bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-lg">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{formatDepartureDate(ticket.departureDate, language)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-primary/5 dark:bg-primary/10 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium">{formatDepartureTime(ticket.departureTime, language)}</span>
                  </div>
                  <Badge variant="outline" className={isOnlineCopy
                    ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                    : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                  }>
                    {isOnlineCopy ? t('onlineCopy', language) : t('counterCopy', language)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 2. Ticket Image/PDF & Ticket/PNR Number ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
            <Card className="border-primary/10 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className={`text-base flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                  <FileText className="w-4 h-4 text-primary" />
                  {isBn ? 'টিকেট নথি ও পিএনআর' : 'Ticket Document & PNR'}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-3">
                {/* PNR Number - blurred */}
                {ticket.pnrNumber && (
                  <div className="relative">
                    <div className={`transition-all duration-500 ${hasPaid ? 'blur-0' : 'blur-md select-none'}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{isBn ? 'পিএনআর নম্বর' : 'PNR / Ticket Number'}</p>
                          <p className="text-lg font-bold font-mono tracking-wide">{ticket.pnrNumber}</p>
                        </div>
                      </div>
                    </div>
                    {!hasPaid && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border">
                          <Lock className="w-4 h-4 text-primary" />
                          <span className={`text-sm font-medium ${isBn ? 'font-bangla' : ''}`}>
                            {isBn ? 'প্ল্যাটফর্ম ফি প্রদান করুন' : 'Pay Platform Fee to View'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ticket document - blurred */}
                {ticket.ticketDocument && (
                  <div className="relative">
                    <div className={`transition-all duration-500 overflow-hidden ${hasPaid ? 'blur-0' : 'blur-lg select-none'}`}>
                      <img
                        src={ticket.ticketDocument}
                        alt={isBn ? 'টিকেট নথি' : 'Ticket Document'}
                        className="w-full object-contain max-h-72 rounded-lg"
                      />
                    </div>
                    {!hasPaid && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
                        <div className="flex flex-col items-center gap-3 bg-background/95 px-6 py-5 rounded-xl shadow-lg border">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className={`font-semibold ${isBn ? 'font-bangla' : ''}`}>
                              {isBn ? 'প্ল্যাটফর্ম ফি প্রদান করুন' : 'Pay Platform Fee to Unlock'}
                            </p>
                            <p className={`text-xs text-muted-foreground mt-1 ${isBn ? 'font-bangla' : ''}`}>
                              {isOnlineCopy
                                ? (isBn ? `৳${ticket.price} প্রদান করুন সম্পূর্ণ টিকেট দেখতে` : `Pay ৳${ticket.price} to view full ticket details`)
                                : (isBn ? `৳${platformFee} প্ল্যাটফর্ম ফি প্রদান করুন` : `Pay ৳${platformFee} platform fee to unlock`)
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* If no PNR or document but still needs blur message */}
                {!ticket.pnrNumber && !ticket.ticketDocument && !hasPaid && (
                  <div className="p-6 text-center rounded-lg bg-muted/30">
                    <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className={`text-sm text-muted-foreground ${isBn ? 'font-bangla' : ''}`}>
                      {isBn ? 'সংবেদনশীল তথ্য অর্থ প্রদানের পর দেখা যাবে' : 'Sensitive details will be visible after payment'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 3. Route Details ────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Card className="border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className={`text-base flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                  <MapPin className="w-4 h-4 text-primary" />
                  {isBn ? 'রুটের বিবরণ' : 'Route Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* From / To row */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex-1 p-2.5 sm:p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">
                      {t('from', language)}
                    </p>
                    <p className={`font-semibold truncate ${isBn ? 'font-bangla' : ''}`}>{ticket.routeFrom}</p>
                    {ticket.boardingPoint && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{ticket.boardingPoint}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-center shrink-0">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="flex-1 p-2.5 sm:p-3 rounded-lg bg-red-50 dark:bg-red-900/20 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-red-600 dark:text-red-400 font-semibold mb-0.5">
                      {t('to', language)}
                    </p>
                    <p className={`font-semibold truncate ${isBn ? 'font-bangla' : ''}`}>{ticket.routeTo}</p>
                    {ticket.droppingPoint && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{ticket.droppingPoint}</p>
                    )}
                  </div>
                </div>

                {/* Boarding / Dropping points (if not shown in from/to boxes) */}
                {ticket.boardingPoint && (
                  <InfoRow icon={MapPin} label={isBn ? 'বোর্ডিং পয়েন্ট' : 'Boarding Point'} value={ticket.boardingPoint} />
                )}
                {ticket.droppingPoint && (
                  <InfoRow icon={MapPin} label={isBn ? 'ড্রপিং পয়েন্ট' : 'Dropping Point'} value={ticket.droppingPoint} />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── 4. Seat Information ─────────────────────── */}
          {(ticket.seatClass || ticket.deckType || ticket.seatNumber || ticket.seatType || ticket.coachNumber) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
              <Card className="border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className={`text-base flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                    <Armchair className="w-4 h-4 text-primary" />
                    {isBn ? 'সিটের তথ্য' : 'Seat Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
                    {ticket.seatClass && (
                      <div className="p-2 sm:p-2.5 rounded-lg bg-muted/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{isBn ? 'ক্লাস' : 'Class'}</p>
                        <p className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{(() => { const cls = BUS_CLASSES.find(c => c.id === ticket.seatClass); return cls ? (isBn ? cls.labelBn : cls.label) : ticket.seatClass; })()}</p>
                      </div>
                    )}
                    {ticket.deckType && (
                      <div className="p-2 sm:p-2.5 rounded-lg bg-muted/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{isBn ? 'ডেক টাইপ' : 'Deck Type'}</p>
                        <p className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{(() => { const dt = [{id:'upper',labelBn:'আপার ডেক',label:'Upper Deck'},{id:'lower',labelBn:'লোয়ার ডেক',label:'Lower Deck'}].find(d => d.id === ticket.deckType); return dt ? (isBn ? dt.labelBn : dt.label) : ticket.deckType; })()}</p>
                      </div>
                    )}
                    {ticket.seatNumber && (
                      <div className="p-2 sm:p-2.5 rounded-lg bg-muted/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{t('seatNumber', language)}</p>
                        <p className="font-medium">{ticket.seatNumber}</p>
                      </div>
                    )}
                    {ticket.seatType && (
                      <div className="p-2 sm:p-2.5 rounded-lg bg-muted/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{t('seatType', language)}</p>
                        <p className="font-medium">{ticket.seatType}</p>
                      </div>
                    )}
                    {ticket.coachNumber && (
                      <div className="p-2 sm:p-2.5 rounded-lg bg-muted/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{isBn ? 'কোচ/কেবিন' : 'Coach/Cabin'}</p>
                        <p className="font-medium">{ticket.coachNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ─── 5. Delivery Information ─────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            {isOnlineCopy && (
              <Card className="border-emerald-200 dark:border-emerald-800/50">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm mb-1 ${isBn ? 'font-bangla' : ''}`}>
                        {isBn ? 'অনলাইন কপি ডেলিভারি' : 'Online Copy Delivery'}
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className={isBn ? 'font-bangla' : ''}>
                            {isBn ? 'পেমেন্টের পর টিকেটটি PDF হিসেবে ইমেইলে পাবেন' : 'Receive ticket as PDF via email after payment'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className={isBn ? 'font-bangla' : ''}>
                            {isBn ? 'ড্যাশবোর্ড → আমার অর্ডার থেকে ডাউনলোড করুন' : 'Download from Dashboard → My Orders'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {isCounterCopy && ticket.deliveryType && (
              <Card className="border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className={`text-base flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                    {ticket.deliveryType === 'in_person'
                      ? <><Navigation className="w-4 h-4 text-primary" />{isBn ? 'ডেলিভারি: সাক্ষাৎ' : 'Delivery: In Person'}</>
                      : <><Truck className="w-4 h-4 text-primary" />{isBn ? 'ডেলিভারি: কুরিয়ার' : 'Delivery: Courier'}</>
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {ticket.deliveryType === 'in_person' && ticket.meetingPlace && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">{isBn ? 'মিটিং পয়েন্ট' : 'Meeting Place'}</p>
                        <p className="font-medium">{ticket.meetingPlace}</p>
                      </div>
                    </div>
                  )}
                  {ticket.deliveryType === 'courier' && (
                    <>
                      {ticket.courierName && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{isBn ? 'কুরিয়ার:' : 'Courier:'}</span>
                          <span className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{(() => { const cr = COURIER_COMPANIES.find(c => c.id === ticket.courierName); return cr ? (isBn ? cr.labelBn : cr.label) : ticket.courierName; })()}</span>
                        </div>
                      )}
                      {ticket.deliverySpeed && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">{isBn ? 'গতি:' : 'Speed:'}</span>
                          <span className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{(() => { const ds = DELIVERY_SPEEDS.find(d => d.id === ticket.deliverySpeed); return ds ? (isBn ? ds.labelBn : ds.label) : ticket.deliverySpeed; })()}</span>
                        </div>
                      )}
                      {ticket.deliveryCharge > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{isBn ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
                          <span className="font-medium">{t('bdt', language)}{ticket.deliveryCharge}</span>
                          <span className="text-xs text-muted-foreground">
                            ({ticket.deliveryChargePaidBy === 'seller'
                              ? (isBn ? 'বিক্রেতা প্রদান করবে' : 'Paid by seller')
                              : (isBn ? 'ক্রেতা প্রদান করবে' : 'Paid by buyer')})
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            {!isOnlineCopy && !isCounterCopy && !ticket.deliveryType && null}
          </motion.div>

          {/* ─── 6. Description & Seller Notes ───────────── */}
          {(ticket.description || ticket.sellerNotes) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
              <Card className="border-primary/10">
                <CardContent className="p-3 sm:p-4 space-y-3">
                  {ticket.description && (
                    <div>
                      <h4 className={`text-sm font-semibold mb-1 ${isBn ? 'font-bangla' : ''}`}>
                        {t('description', language)}
                      </h4>
                      <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${isBn ? 'font-bangla' : ''}`}>
                        {ticket.description}
                      </p>
                    </div>
                  )}
                  {ticket.sellerNotes && (
                    <div>
                      <h4 className={`text-sm font-semibold mb-1 ${isBn ? 'font-bangla' : ''}`}>
                        {isBn ? 'বিক্রেতার নোট' : 'Seller Notes'}
                      </h4>
                      <p className={`text-sm text-muted-foreground leading-relaxed whitespace-pre-line ${isBn ? 'font-bangla' : ''}`}>
                        {ticket.sellerNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="space-y-4">

          {/* ─── Price Breakdown ────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
            <Card className="border-primary/10 sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className={`text-base flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                  <Building2 className="w-4 h-4 text-primary" />
                  {isBn ? 'মূল্যের বিবরণ' : 'Price Breakdown'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-3">
                {/* Ticket type badge */}
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={isOnlineCopy
                    ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                    : 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                  }>
                    {isOnlineCopy ? t('onlineCopy', language) : t('counterCopy', language)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {ticket.originalPrice > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{isBn ? 'মূল টিকেট মূল্য' : 'Original Ticket Price'}</span>
                      <span>{t('bdt', language)}{ticket.originalPrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{isBn ? 'বিক্রয় মূল্য' : 'Selling Price'}</span>
                    <span className="font-medium">{t('bdt', language)}{ticket.price}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('platformFee', language)} ({feePercentage}%)</span>
                    <span>{t('bdt', language)}{platformFee}</span>
                  </div>
                </div>

                <Separator />

                {isOnlineCopy ? (
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-base">
                      <span>{isBn ? 'আপনার প্রদানযোগ্য মোট' : 'Total You Pay'}</span>
                      <span className="text-primary">{t('bdt', language)}{ticket.price}</span>
                    </div>
                    <p className={`text-xs text-muted-foreground leading-relaxed ${isBn ? 'font-bangla' : ''}`}>
                      {isBn
                        ? `প্ল্যাটফর্ম ফি ৳${platformFee} বিক্রেতার অংশ থেকে কেটে নেওয়া হবে। এসক্রো মুক্তির পর বিক্রেতা ৳${sellerGetsAfterRelease} পাবেন।`
                        : `Platform fee ৳${platformFee} is deducted from seller's share. Seller gets ৳${sellerGetsAfterRelease} after escrow release.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span>{isBn ? 'এখন প্রদান করুন' : 'Pay Now'}</span>
                        <span className="font-semibold text-amber-700 dark:text-amber-400">{t('bdt', language)}{platformFee}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{isBn ? 'ডেলিভারিতে বিক্রেতাকে প্রদান' : 'Pay Seller on Delivery'}</span>
                        <span className="font-semibold">{t('bdt', language)}{ticket.price}</span>
                      </div>
                    </div>
                    <p className={`text-xs text-muted-foreground leading-relaxed ${isBn ? 'font-bangla' : ''}`}>
                      {isBn
                        ? `এখন শুধু ৳${platformFee} প্ল্যাটফর্ম ফি প্রদান করুন। টিকেটের মূল্য ৳${ticket.price} ডেলিভারির সময় সরাসরি বিক্রেতাকে প্রদান করুন।`
                        : `Pay only ৳${platformFee} platform fee now. Pay the ticket price ৳${ticket.price} directly to the seller upon delivery.`
                      }
                    </p>
                  </div>
                )}

                <Separator />

                {/* Escrow Protection */}
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className={`text-xs font-semibold mb-0.5 ${isBn ? 'font-bangla' : ''}`}>
                      {isBn ? 'এসক্রো সুরক্ষা' : 'Escrow Protection'}
                    </p>
                    <p className={`text-[11px] text-muted-foreground leading-relaxed ${isBn ? 'font-bangla' : ''}`}>
                      {isOnlineCopy
                        ? (isBn
                            ? 'যাত্রার তারিখ পর্যন্ত অর্থ নিরাপদে রাখা হয়। প্রতারক বিক্রেতা হলে ফেরত (ফি বাদে)।'
                            : 'Money held safely until travel. Full refund (minus fee) if seller is fraudulent.')
                        : (isBn
                            ? 'প্ল্যাটফর্ম ফি এখন দিন, টিকেট মূল্য ডেলিভারিতে।'
                            : 'Pay platform fee now, ticket price on delivery.')
                      }
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Purchase section */}
                {!isAvailable ? (
                  <div className="p-3 text-center rounded-lg bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="w-5 h-5 mx-auto text-red-500 mb-1" />
                    <p className={`text-sm font-medium text-red-600 dark:text-red-400 ${isBn ? 'font-bangla' : ''}`}>
                      {ticket.status === 'sold'
                        ? (isBn ? 'ইতিমধ্যে বিক্রি হয়েছে' : 'Already Sold')
                        : ticket.status === 'cancelled'
                          ? (isBn ? 'বাতিল করা হয়েছে' : 'Cancelled')
                          : ticket.status === 'expired'
                            ? (isBn ? 'মেয়াদ শেষ' : 'Expired')
                            : (isBn ? 'কেনার জন্য উপলব্ধ নয়' : 'Not Available')
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    {showConfirmDialog ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5 space-y-3"
                      >
                        <h4 className={`font-semibold text-sm ${isBn ? 'font-bangla' : ''}`}>
                          {isBn ? 'কেনাকাটা নিশ্চিত করুন' : 'Confirm Your Purchase'}
                        </h4>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span>{isBn ? 'টিকেট মূল্য' : 'Ticket Price'}</span>
                            <span>{t('bdt', language)}{ticket.price}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>{t('platformFee', language)} ({feePercentage}%)</span>
                            <span>{t('bdt', language)}{platformFee}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                            <span>{isBn ? 'এখন প্রদানযোগ্য' : 'You Pay Now'}</span>
                            <span className="text-primary">{t('bdt', language)}{buyerPaysNow}</span>
                          </div>
                          {isCounterCopy && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              {isBn
                                ? `+ ৳${ticket.price} ডেলিভারির সময় বিক্রেতাকে প্রদান করবেন`
                                : `+ ৳${ticket.price} to pay seller on delivery`}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            className="w-full bg-primary min-h-[44px]"
                            size="lg"
                            onClick={handlePurchase}
                            disabled={buying}
                          >
                            {buying
                              ? (isBn ? 'প্রক্রিয়াধীন...' : 'Processing...')
                              : (isBn ? 'কেনাকাটা নিশ্চিত করুন' : 'Confirm Purchase')
                            }
                          </Button>
                          <Button variant="outline" size="lg" className="w-full min-h-[44px]" onClick={() => setShowConfirmDialog(false)} disabled={buying}>
                            {t('cancel', language)}
                          </Button>
                        </div>
                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}
                      </motion.div>
                    ) : (
                      <Button
                        className="w-full bg-primary shadow-lg hover:shadow-primary/20 transition-shadow min-h-[48px] text-base"
                        size="lg"
                        onClick={() => {
                          if (!token || !isAuthenticated) {
                            navigate('login');
                            return;
                          }
                          setError('');
                          setShowConfirmDialog(true);
                        }}
                      >
                        {isOnlineCopy
                          ? (isBn ? `৳${ticket.price} প্রদান করুন — টিকেট কিনুন` : `Pay ৳${ticket.price} — Buy Ticket`)
                          : (isBn ? `৳${platformFee} প্ল্যাটফর্ম ফি প্রদান করুন` : `Pay ৳${platformFee} Platform Fee`)
                        }
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Seller Information ──────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Card className="border-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className={`text-base flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                  <User className="w-4 h-4 text-primary" />
                  {isBn ? 'বিক্রেতার তথ্য' : 'Seller Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {hasPaid ? (
                      <User className="w-5 h-5 text-primary" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {hasPaid ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ticket.seller.name}</span>
                          {ticket.seller.isKycVerified && (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-1.5 py-0">
                              <ShieldCheck className="w-3 h-3 mr-0.5" />
                              {t('verified', language)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{ticket.seller.role}</p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          {isBn ? 'যাচাইকৃত বিক্রেতা' : 'Verified Seller'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {isBn ? '(নাম অর্থ প্রদানের পর দেখা যাবে)' : '(Name revealed after payment)'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ─── Bottom spacer ──────────────────────────────── */}
      <div className="h-8" />
    </div>
  );
}
