'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore, useAuthStore, useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  ALL_BD_DISTRICTS,
  BUS_CLASSES,
  DECK_TYPES,
  COURIER_COMPANIES,
  DELIVERY_SPEEDS,
  DECK_REQUIRED_CLASSES,
  TRANSPORT_TYPES,
  PLATFORM_FEE_PERCENTAGE,
  PLATFORM_FEE_MINIMUM,
} from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Ticket,
  ArrowLeft,
  Upload,
  MapPin,
  Clock,
  Bus,
  Train,
  Plane,
  Ship,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Truck,
  User,
  Package,
  DollarSign,
  Info,
  Loader2,
  Eye,
  X,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormState {
  transportType: string;
  transportCompany: string;
  ticketType: string;
  pnrNumber: string;
  ticketDocument: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  boardingPoint: string;
  droppingPoint: string;
  seatClass: string;
  deckType: string;
  seatNumber: string;
  coachNumber: string;
  originalPrice: string;
  sellingPrice: string;
  deliveryType: string;
  meetingPlace: string;
  courierName: string;
  deliverySpeed: string;
  deliveryChargePaidBy: string;
  deliveryCharge: string;
  description: string;
  sellerNotes: string;
  confirmCorrect: boolean;
  confirmLegalRight: boolean;
  confirmFakeWarning: boolean;
}

const initialForm: FormState = {
  transportType: 'bus',
  transportCompany: '',
  ticketType: 'online_copy',
  pnrNumber: '',
  ticketDocument: '',
  from: '',
  to: '',
  departureDate: '',
  departureTime: '',
  boardingPoint: '',
  droppingPoint: '',
  seatClass: '',
  deckType: '',
  seatNumber: '',
  coachNumber: '',
  originalPrice: '',
  sellingPrice: '',
  deliveryType: '',
  meetingPlace: '',
  courierName: '',
  deliverySpeed: '',
  deliveryChargePaidBy: 'seller',
  deliveryCharge: '',
  description: '',
  sellerNotes: '',
  confirmCorrect: false,
  confirmLegalRight: false,
  confirmFakeWarning: false,
};

/* ------------------------------------------------------------------ */
/*  Helper: transport icon                                             */
/* ------------------------------------------------------------------ */

function TransportIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'bus':
      return <Bus className={className} />;
    case 'train':
      return <Train className={className} />;
    case 'flight':
      return <Plane className={className} />;
    case 'launch':
      return <Ship className={className} />;
    default:
      return <Bus className={className} />;
  }
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function FormSection({
  title,
  icon,
  children,
  language,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  language: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
          <CardTitle
            className={`flex items-center gap-2 text-base font-semibold ${language === 'bn' ? 'font-bangla' : ''}`}
          >
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-5">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Field helper                                                       */
/* ------------------------------------------------------------------ */

function FieldLabel({
  children,
  required,
  language,
}: {
  children: React.ReactNode;
  required?: boolean;
  language: string;
}) {
  return (
    <Label className={`text-sm font-medium mb-1.5 block ${language === 'bn' ? 'font-bangla' : ''}`}>
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
  );
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export default function SellTicketPage() {
  const { navigate } = useAppStore();
  const { user, token, isAuthenticated, updateUser } = useAuthStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';

  const [form, setForm] = useState<FormState>(initialForm);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [kycStatus, setKycStatus] = useState<'unknown' | 'none' | 'pending' | 'approved' | 'rejected'>('unknown');

  // Fetch user profile & KYC status on mount
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setCheckingAuth(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) updateUser(data.user);
          if (data.user?.isKycVerified) {
            setKycStatus('approved');
          } else {
            // Check KYC application status
            const kycRes = await fetch('/api/kyc', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (kycRes.ok) {
              const kycData = await kycRes.json();
              if (kycData.application) {
                setKycStatus(kycData.application.status === 'pending' ? 'pending' : kycData.application.status === 'approved' ? 'approved' : kycData.application.status === 'rejected' ? 'rejected' : 'none');
              } else {
                setKycStatus('none');
              }
            } else {
              setKycStatus('none');
            }
          }
        }
      } catch {
        setKycStatus('none');
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, [isAuthenticated, token, updateUser]);

  /* ---- derived ---- */
  const platformFee = useMemo(() => {
    const sp = parseFloat(form.sellingPrice);
    if (!sp || sp <= 0) return 0;
    return Math.max(PLATFORM_FEE_MINIMUM, Math.round(sp * (PLATFORM_FEE_PERCENTAGE / 100)));
  }, [form.sellingPrice]);

  const showSeatClass = form.transportType === 'bus';
  const showDeckType = showSeatClass && DECK_REQUIRED_CLASSES.includes(form.seatClass);
  const isCounterCopy = form.ticketType === 'counter_copy';

  /* ---- setters ---- */
  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        // Reset deckType when class changes away from deck-requiring classes
        if (key === 'seatClass' && !DECK_REQUIRED_CLASSES.includes(value as string)) {
          next.deckType = '';
        }
        // Reset delivery fields when ticket type changes
        if (key === 'ticketType') {
          next.deliveryType = '';
          next.meetingPlace = '';
          next.courierName = '';
          next.deliverySpeed = '';
          next.deliveryChargePaidBy = 'seller';
          next.deliveryCharge = '';
          next.ticketDocument = '';
          setUploadFileName('');
        }
        // Reset transport-specific fields when transport type changes
        if (key === 'transportType') {
          next.seatClass = '';
          next.deckType = '';
        }
        // Reset courier fields when delivery type changes
        if (key === 'deliveryType') {
          next.meetingPlace = '';
          next.courierName = '';
          next.deliverySpeed = '';
          next.deliveryCharge = '';
          next.deliveryChargePaidBy = 'seller';
        }
        return next;
      });
    },
    [],
  );

  /* ---- file upload ---- */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type based on ticket type
    if (form.ticketType === 'online_copy') {
      if (file.type !== 'application/pdf') {
        toast.error(isBn ? 'শুধুমাত্র PDF ফাইল আপলোড করুন' : 'Only PDF files can be uploaded for Online Copy');
        return;
      }
    } else {
      const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validImageTypes.includes(file.type)) {
        toast.error(isBn ? 'শুধুমাত্র PNG/JPG/JPEG ফাইল আপলোড করুন' : 'Only PNG/JPG/JPEG files can be uploaded for Counter Copy');
        return;
      }
    }

    // Validate file size (10MB for PDF, 5MB for images)
    const maxSize = form.ticketType === 'online_copy' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        isBn
          ? `ফাইলের আকার ${form.ticketType === 'online_copy' ? '10MB' : '5MB'} এর কম হতে হবে`
          : `File size must be under ${form.ticketType === 'online_copy' ? '10MB' : '5MB'}`,
      );
      return;
    }

    if (!token) {
      navigate('login');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      set('ticketDocument', data.url);
      setUploadFileName(file.name);
      toast.success(isBn ? 'ফাইল আপলোড সফল!' : 'File uploaded successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : isBn ? 'আপলোড ব্যর্থ' : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  /* ---- validation ---- */
  const validate = (): string | null => {
    if (!form.transportCompany.trim()) return isBn ? 'পরিবহন কোম্পানির নাম দিন' : 'Transport company name is required';
    if (!form.pnrNumber.trim()) return isBn ? 'টিকেট/PNR নম্বর দিন' : 'Ticket/PNR number is required';
    if (!form.ticketDocument) return isBn ? 'টিকেট নথি আপলোড করুন' : 'Ticket document upload is required';
    if (!form.from) return isBn ? 'যাত্রা শুরুর স্থান নির্বাচন করুন' : 'From location is required';
    if (!form.to) return isBn ? 'গন্তব্য নির্বাচন করুন' : 'To location is required';
    if (form.from === form.to) return isBn ? 'শুরু ও গন্তব্য এক হতে পারে না' : 'From and To cannot be the same';
    if (!form.departureDate) return isBn ? 'যাত্রার তারিখ দিন' : 'Travel date is required';
    if (!form.departureTime) return isBn ? 'যাত্রার সময় দিন' : 'Departure time is required';

    if (showSeatClass && !form.seatClass) return isBn ? 'ক্লাস নির্বাচন করুন' : 'Seat class is required for bus tickets';
    if (showDeckType && !form.deckType) return isBn ? 'ডেক টাইপ নির্বাচন করুন' : 'Deck type is required';

    if (!form.originalPrice || parseFloat(form.originalPrice) <= 0)
      return isBn ? 'মূল টিকেটের মূল্য দিন' : 'Original ticket price is required';
    if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0)
      return isBn ? 'বিক্রয় মূল্য দিন' : 'Selling price is required';

    if (isCounterCopy) {
      if (!form.deliveryType) return isBn ? 'ডেলিভারি টাইপ নির্বাচন করুন' : 'Delivery type is required for counter copy';
      if (form.deliveryType === 'in_person' && !form.meetingPlace.trim())
        return isBn ? 'মিটিং প্লেস দিন' : 'Meeting place is required';
      if (form.deliveryType === 'courier') {
        if (!form.courierName) return isBn ? 'কুরিয়ার নির্বাচন করুন' : 'Courier name is required';
        if (!form.deliverySpeed) return isBn ? 'ডেলিভারি ধরন নির্বাচন করুন' : 'Delivery speed is required';
        if (form.deliveryChargePaidBy === 'buyer' && (!form.deliveryCharge || parseFloat(form.deliveryCharge) <= 0))
          return isBn ? 'ডেলিভারি চার্জ দিন' : 'Delivery charge is required';
      }
    }

    if (!form.confirmCorrect) return isBn ? 'টিকেট তথ্য নিশ্চিত করুন' : 'Please confirm ticket information is correct';
    if (!form.confirmLegalRight) return isBn ? 'আইনি অধিকার নিশ্চিত করুন' : 'Please confirm you have the legal right to transfer';
    if (!form.confirmFakeWarning) return isBn ? 'সতর্কতা স্বীকার করুন' : 'Please acknowledge the fake ticket warning';

    return null;
  };

  /* ---- submit ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated || !token) {
      navigate('login');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        transportType: form.transportType,
        transportCompany: form.transportCompany.trim(),
        ticketType: form.ticketType,
        pnrNumber: form.pnrNumber.trim(),
        ticketDocument: form.ticketDocument,
        routeFrom: form.from,
        routeTo: form.to,
        departureDate: form.departureDate,
        departureTime: form.departureTime,
        boardingPoint: form.boardingPoint.trim() || undefined,
        droppingPoint: form.droppingPoint.trim() || undefined,
        seatClass: form.seatClass || undefined,
        deckType: form.deckType || undefined,
        seatNumber: form.seatNumber.trim() || undefined,
        coachNumber: form.coachNumber.trim() || undefined,
        originalPrice: parseFloat(form.originalPrice),
        price: parseFloat(form.sellingPrice),
        description: form.description.trim() || undefined,
        sellerNotes: form.sellerNotes.trim() || undefined,
        deliveryType: isCounterCopy ? form.deliveryType : undefined,
        meetingPlace: isCounterCopy && form.deliveryType === 'in_person' ? form.meetingPlace.trim() : undefined,
        courierName: isCounterCopy && form.deliveryType === 'courier' ? form.courierName : undefined,
        deliverySpeed: isCounterCopy && form.deliveryType === 'courier' ? form.deliverySpeed : undefined,
        deliveryChargePaidBy: isCounterCopy && form.deliveryType === 'courier' ? form.deliveryChargePaidBy : undefined,
        deliveryCharge:
          isCounterCopy && form.deliveryType === 'courier' && form.deliveryChargePaidBy === 'buyer'
            ? parseFloat(form.deliveryCharge)
            : 0,
        isConfirmed: true,
      };

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (isBn ? 'টিকেট তৈরি ব্যর্থ' : 'Failed to create ticket'));
      }

      setSuccess(true);
      toast.success(isBn ? 'টিকেট সফলভাবে তালিকাভুক্ত হয়েছে!' : 'Ticket listed successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isBn ? 'একটি ত্রুটি ঘটেছে' : 'An error occurred';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- helpers ---- */
  const getDistrictLabel = (dist: (typeof ALL_BD_DISTRICTS)[number]) =>
    isBn ? dist.labelBn : dist.label;

  const getTransportLabel = (id: string) => {
    const tt = TRANSPORT_TYPES.find((t) => t.id === id);
    return tt ? (isBn ? tt.labelBn : tt.label) : id;
  };

  const getClassLabel = (id: string) => {
    const cls = BUS_CLASSES.find((c) => c.id === id);
    return cls ? (isBn ? cls.labelBn : cls.label) : id;
  };

  const getDeckLabel = (id: string) => {
    const dk = DECK_TYPES.find((d) => d.id === id);
    return dk ? (isBn ? dk.labelBn : dk.label) : id;
  };

  const getCourierLabel = (id: string) => {
    const cr = COURIER_COMPANIES.find((c) => c.id === id);
    return cr ? (isBn ? cr.labelBn : cr.label) : id;
  };

  const getDeliverySpeedLabel = (id: string) => {
    const ds = DELIVERY_SPEEDS.find((d) => d.id === id);
    return ds ? (isBn ? ds.labelBn : ds.label) : id;
  };

  /* ================================================================ */
  /*  AUTH GATE                                                        */
  /* ================================================================ */

  if (checkingAuth) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
        <p className={`text-muted-foreground ${isBn ? 'font-bangla' : ''}`}>
          {isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 shadow-md">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${isBn ? 'font-bangla' : ''}`}>
                {isBn ? 'লগইন প্রয়োজন' : 'Login Required'}
              </h2>
              <p className={`text-muted-foreground mb-6 text-sm ${isBn ? 'font-bangla' : ''}`}>
                {isBn
                  ? 'টিকেট বিক্রি করতে আপনাকে প্রথমে লগইন করতে হবে।'
                  : 'You need to login first to sell tickets on our platform.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('login')} className="bg-gradient-to-r from-primary to-primary/90">
                  {t('login', language)}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={() => navigate('register')}>
                  {t('register', language)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ================================================================ */
  /*  KYC GATE                                                        */
  /* ================================================================ */

  if (kycStatus !== 'approved') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-200 dark:border-amber-800/50 shadow-md">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-5">
                <ShieldCheck className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${isBn ? 'font-bangla' : ''}`}>
                {isBn ? 'KYC যাচাইকরণ প্রয়োজন' : 'KYC Verification Required'}
              </h2>
              <p className={`text-muted-foreground mb-6 text-sm ${isBn ? 'font-bangla' : ''}`}>
                {kycStatus === 'pending'
                  ? isBn
                    ? 'আপনার KYC আবেদন পর্যালোচনাধীন আছে। অনুমোদিত হলে আপনি টিকেট বিক্রি করতে পারবেন।'
                    : 'Your KYC application is under review. You can sell tickets once it\'s approved.'
                  : kycStatus === 'rejected'
                    ? isBn
                      ? 'আপনার KYC আবেদন প্রত্যাখ্যাত হয়েছে। অনুগ্রহ করে পুনরায় আবেদন করুন।'
                      : 'Your KYC application was rejected. Please resubmit with correct information.'
                    : isBn
                      ? 'টিকেট বিক্রি করতে আপনাকে প্রথমে KYC যাচাইকরণ সম্পন্ন করতে হবে। এটি ক্রেতাদের নিরাপত্তা নিশ্চিত করে।'
                      : 'You need to complete KYC verification before selling tickets. This ensures buyer safety and trust.'}
              </p>

              {kycStatus === 'pending' && (
                <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-6">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span className={`text-sm text-amber-700 dark:text-amber-400 ${isBn ? 'font-bangla' : ''}`}>
                    {isBn ? 'পর্যালোচনাধীন — সাধারণত ২৪ ঘন্টার মধ্যে অনুমোদিত হয়' : 'Under review — usually approved within 24 hours'}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {kycStatus === 'none' || kycStatus === 'rejected' ? (
                  <Button onClick={() => navigate('kyc')} className="bg-gradient-to-r from-primary to-primary/90">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {isBn ? 'KYC যাচাইকরণ শুরু করুন' : 'Start KYC Verification'}
                  </Button>
                ) : null}
                <Button variant="outline" onClick={() => navigate('home')}>
                  {t('back', language)}
                </Button>
              </div>

              {/* Benefits list */}
              <div className="mt-6 pt-6 border-t text-left">
                <p className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 ${isBn ? 'font-bangla' : ''}`}>
                  {isBn ? 'যাচাইকৃত বিক্রেতাদের সুবিধা' : 'Verified Seller Benefits'}
                </p>
                <ul className="space-y-2">
                  {[
                    isBn ? 'টিকেট বিক্রি করার অনুমতি' : 'Permission to sell tickets',
                    isBn ? 'ভেরিফাইড ব্যাজ প্রদর্শন' : 'Verified badge displayed on profile',
                    isBn ? 'ক্রেতাদের কাছে বেশি বিশ্বাসযোগ্যতা' : 'Higher trust from buyers',
                    isBn ? 'ওয়ালেট ও উত্তোলন সুবিধা' : 'Wallet & withdrawal access',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className={isBn ? 'font-bangla' : ''}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ================================================================ */
  /*  SUCCESS PAGE                                                     */
  /* ================================================================ */

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isBn ? 'font-bangla' : ''}`}>
            {t('success', language)}! 🎉
          </h2>
          <p className={`text-muted-foreground mb-8 ${isBn ? 'font-bangla' : ''}`}>
            {isBn
              ? 'আপনার টিকেট বিক্রির জন্য তালিকাভুক্ত হয়েছে। ক্রেতারা এখন এটি দেখতে পাবেন।'
              : 'Your ticket has been listed for sale. Buyers can now see it.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('my-tickets')} className="bg-gradient-to-r from-primary to-primary/90">
              <Ticket className="w-4 h-4 mr-2" />
              {t('myTickets', language)}
            </Button>
            <Button variant="outline" onClick={() => navigate('search')}>
              {t('searchTickets', language)}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ================================================================ */
  /*  PREVIEW CARD                                                     */
  /* ================================================================ */

  const PreviewCard = () => {
    const fromDist = ALL_BD_DISTRICTS.find((d) => d.label === form.from);
    const toDist = ALL_BD_DISTRICTS.find((d) => d.label === form.to);

    return (
      <Card className="border-primary/20 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TransportIcon type={form.transportType} className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">{getTransportLabel(form.transportType)}</span>
          </div>
          <Badge variant={form.ticketType === 'online_copy' ? 'default' : 'secondary'} className="text-xs">
            {form.ticketType === 'online_copy'
              ? t('onlineCopy', language)
              : t('counterCopy', language)}
          </Badge>
        </div>
        <CardContent className="p-4 space-y-3">
          {/* Route */}
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-xs text-muted-foreground">{t('from', language)}</p>
              <p className={`font-bold text-sm ${isBn ? 'font-bangla' : ''}`}>
                {form.from ? (fromDist ? getDistrictLabel(fromDist) : form.from) : '—'}
              </p>
            </div>
            <div className="text-primary text-lg">→</div>
            <div className="flex-1 text-center">
              <p className="text-xs text-muted-foreground">{t('to', language)}</p>
              <p className={`font-bold text-sm ${isBn ? 'font-bangla' : ''}`}>
                {form.to ? (toDist ? getDistrictLabel(toDist) : form.to) : '—'}
              </p>
            </div>
          </div>
          <Separator />
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">{t('transportCompany', language)}:</span>
              <p className={`font-medium truncate ${isBn ? 'font-bangla' : ''}`}>{form.transportCompany || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('departureDate', language)}:</span>
              <p className="font-medium">{form.departureDate || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('departureTime', language)}:</span>
              <p className="font-medium">{form.departureTime || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('seatNumber', language)}:</span>
              <p className="font-medium">{form.seatNumber || '—'}</p>
            </div>
            {showSeatClass && form.seatClass && (
              <div>
                <span className="text-muted-foreground">{isBn ? 'ক্লাস' : 'Class'}:</span>
                <p className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{getClassLabel(form.seatClass)}</p>
              </div>
            )}
            {showDeckType && form.deckType && (
              <div>
                <span className="text-muted-foreground">{isBn ? 'ডেক' : 'Deck'}:</span>
                <p className={`font-medium ${isBn ? 'font-bangla' : ''}`}>{getDeckLabel(form.deckType)}</p>
              </div>
            )}
            {form.coachNumber && (
              <div>
                <span className="text-muted-foreground">{t('coachNumber', language)}:</span>
                <p className="font-medium">{form.coachNumber}</p>
              </div>
            )}
          </div>
          <Separator />
          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{isBn ? 'বিক্রয় মূল্য' : 'Selling Price'}</span>
              <span className="font-semibold">
                ৳{form.sellingPrice ? parseFloat(form.sellingPrice).toLocaleString() : '0'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('platformFee', language)}</span>
              <span className="text-amber-600 dark:text-amber-400">৳{platformFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-bold">
              <span>{isBn ? 'ক্রেতা প্রদান করবে' : 'Buyer Pays'}</span>
              <span className="text-primary">
                ৳{form.sellingPrice ? (parseFloat(form.sellingPrice) + platformFee).toLocaleString() : '0'}
              </span>
            </div>
          </div>
          {/* Delivery info */}
          {isCounterCopy && form.deliveryType && (
            <>
              <Separator />
              <div className="text-xs">
                <span className="text-muted-foreground">{t('deliveryMethod', language)}: </span>
                <span className="font-medium">
                  {form.deliveryType === 'in_person'
                    ? t('inPerson', language)
                    : `${t('courier', language)} - ${getCourierLabel(form.courierName)}`}
                </span>
              </div>
            </>
          )}
          {!isCounterCopy && form.ticketDocument && (
            <>
              <Separator />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                <span>{isBn ? 'ক্রেতা পেমেন্টের পর ইমেইলে PDF পাবেন' : 'Buyer will receive PDF via email after payment'}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  /* ================================================================ */
  /*  MAIN FORM                                                        */
  /* ================================================================ */

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('home')} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span className={isBn ? 'font-bangla' : ''}>{t('back', language)}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-1.5 sm:hidden"
        >
          <Eye className="w-4 h-4" />
          {isBn ? 'প্রিভিউ' : 'Preview'}
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Ticket className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${isBn ? 'font-bangla' : ''}`}>{t('sellTicket', language)}</h1>
          <p className={`text-sm text-muted-foreground ${isBn ? 'font-bangla' : ''}`}>
            {isBn ? 'আপনার টিকেটের বিস্তারিত তথ্য পূরণ করুন' : 'Fill in your ticket details to list for sale'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ---- FORM COLUMN ---- */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ====== SECTION 1: Ticket Information ====== */}
            <FormSection
              title={isBn ? 'টিকেট তথ্য' : 'Ticket Information'}
              icon={<Ticket className="w-4 h-4 text-primary" />}
              language={language}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Transport Type */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>{t('transport', language)}</FieldLabel>
                  <Select value={form.transportType} onValueChange={(v) => set('transportType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSPORT_TYPES.map((tt) => (
                        <SelectItem key={tt.id} value={tt.id}>
                          <span className="flex items-center gap-2">
                            <TransportIcon type={tt.id} className="w-4 h-4" />
                            {isBn ? tt.labelBn : tt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ticket Type */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>{t('ticketType', language)}</FieldLabel>
                  <Select value={form.ticketType} onValueChange={(v) => set('ticketType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online_copy">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {t('onlineCopy', language)}
                        </span>
                      </SelectItem>
                      <SelectItem value="counter_copy">
                        <span className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          {t('counterCopy', language)}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Transport Company */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>{t('transportCompany', language)}</FieldLabel>
                  <Input
                    value={form.transportCompany}
                    onChange={(e) => set('transportCompany', e.target.value)}
                    placeholder={isBn ? 'যেমন: Green Line, Shyamoli' : 'e.g. Green Line, Shyamoli'}
                    className={isBn ? 'font-bangla' : ''}
                  />
                </div>

                {/* PNR / Ticket Number */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>
                    {isBn ? 'টিকেট/PNR নম্বর' : 'Ticket/PNR Number'}
                  </FieldLabel>
                  <Input
                    value={form.pnrNumber}
                    onChange={(e) => set('pnrNumber', e.target.value)}
                    placeholder={isBn ? 'যেমন: ETR-12345678' : 'e.g. ETR-12345678'}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="mt-4 space-y-1.5">
                <FieldLabel required language={language}>
                  {isBn
                    ? form.ticketType === 'online_copy'
                      ? 'টিকেট PDF আপলোড'
                      : 'টিকেট ছবি আপলোড'
                    : form.ticketType === 'online_copy'
                      ? 'Ticket PDF Upload'
                      : 'Ticket Image Upload'}
                </FieldLabel>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('ticket-file-input')?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading
                      ? isBn
                        ? 'আপলোড হচ্ছে...'
                        : 'Uploading...'
                      : isBn
                        ? 'ফাইল নির্বাচন করুন'
                        : 'Choose File'}
                  </Button>
                  {uploadFileName && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="truncate max-w-[180px]">{uploadFileName}</span>
                      <button
                        type="button"
                        onClick={() => {
                          set('ticketDocument', '');
                          setUploadFileName('');
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className={`text-xs text-muted-foreground mt-1 ${isBn ? 'font-bangla' : ''}`}>
                  {form.ticketType === 'online_copy'
                    ? isBn
                      ? 'শুধুমাত্র PDF ফাইল (সর্বোচ্চ 10MB)'
                      : 'Only PDF files allowed (max 10MB)'
                    : isBn
                      ? 'শুধুমাত্র PNG/JPG/JPEG ফাইল (সর্বোচ্চ 5MB)'
                      : 'Only PNG/JPG/JPEG files allowed (max 5MB)'}
                </p>
                <input
                  id="ticket-file-input"
                  type="file"
                  className="hidden"
                  accept={form.ticketType === 'online_copy' ? '.pdf' : '.png,.jpg,.jpeg'}
                  onChange={handleFileUpload}
                />
              </div>
            </FormSection>

            {/* ====== SECTION 2: Route ====== */}
            <FormSection
              title={isBn ? 'রুট' : 'Route'}
              icon={<MapPin className="w-4 h-4 text-primary" />}
              language={language}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* From */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>{t('from', language)}</FieldLabel>
                  <Select value={form.from} onValueChange={(v) => set('from', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={isBn ? 'জেলা নির্বাচন করুন' : 'Select district'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {ALL_BD_DISTRICTS.map((dist) => (
                        <SelectItem key={dist.label} value={dist.label}>
                          {isBn ? dist.labelBn : dist.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* To */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>{t('to', language)}</FieldLabel>
                  <Select value={form.to} onValueChange={(v) => set('to', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={isBn ? 'জেলা নির্বাচন করুন' : 'Select district'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {ALL_BD_DISTRICTS.map((dist) => (
                        <SelectItem key={dist.label} value={dist.label}>
                          {isBn ? dist.labelBn : dist.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Travel Date */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>{t('departureDate', language)}</FieldLabel>
                  <Input
                    type="date"
                    value={form.departureDate}
                    onChange={(e) => set('departureDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Departure Time */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>{t('departureTime', language)}</FieldLabel>
                  <Input
                    type="time"
                    value={form.departureTime}
                    onChange={(e) => set('departureTime', e.target.value)}
                  />
                </div>

                {/* Boarding Point */}
                <div className="space-y-1.5">
                  <FieldLabel language={language}>{isBn ? 'বোর্ডিং পয়েন্ট' : 'Boarding Point'}</FieldLabel>
                  <Input
                    value={form.boardingPoint}
                    onChange={(e) => set('boardingPoint', e.target.value)}
                    placeholder={isBn ? 'যেমন: Gabtoli, Sayedabad' : 'e.g. Gabtoli, Sayedabad'}
                    className={isBn ? 'font-bangla' : ''}
                  />
                </div>

                {/* Dropping Point */}
                <div className="space-y-1.5">
                  <FieldLabel language={language}>{isBn ? 'ড্রপিং পয়েন্ট' : 'Dropping Point'}</FieldLabel>
                  <Input
                    value={form.droppingPoint}
                    onChange={(e) => set('droppingPoint', e.target.value)}
                    placeholder={isBn ? 'যেমন: Oxygen More, CDA Market' : 'e.g. Oxygen More, CDA Market'}
                    className={isBn ? 'font-bangla' : ''}
                  />
                </div>
              </div>
            </FormSection>

            {/* ====== SECTION 3: Class & Seat ====== */}
            <FormSection
              title={isBn ? 'ক্লাস ও আসন' : 'Class & Seat'}
              icon={<Bus className="w-4 h-4 text-primary" />}
              language={language}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Seat Class - only for Bus */}
                <AnimatePresence mode="wait">
                  {showSeatClass && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      <FieldLabel required language={language}>{isBn ? 'ক্লাস' : 'Class'}</FieldLabel>
                      <Select value={form.seatClass} onValueChange={(v) => set('seatClass', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isBn ? 'ক্লাস নির্বাচন করুন' : 'Select class'} />
                        </SelectTrigger>
                        <SelectContent>
                          {BUS_CLASSES.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {isBn ? cls.labelBn : cls.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Deck Type - only for certain classes */}
                <AnimatePresence mode="wait">
                  {showDeckType && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      <FieldLabel required language={language}>{isBn ? 'ডেক টাইপ' : 'Deck Type'}</FieldLabel>
                      <Select value={form.deckType} onValueChange={(v) => set('deckType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isBn ? 'ডেক নির্বাচন করুন' : 'Select deck'} />
                        </SelectTrigger>
                        <SelectContent>
                          {DECK_TYPES.map((dk) => (
                            <SelectItem key={dk.id} value={dk.id}>
                              {isBn ? dk.labelBn : dk.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Seat Number */}
                <div className="space-y-1.5">
                  <FieldLabel language={language}>{t('seatNumber', language)}</FieldLabel>
                  <Input
                    value={form.seatNumber}
                    onChange={(e) => set('seatNumber', e.target.value)}
                    placeholder={isBn ? 'যেমন: A1, B3' : 'e.g. A1, B3'}
                  />
                </div>

                {/* Coach/Cabin/Room Number */}
                <div className="space-y-1.5">
                  <FieldLabel language={language}>
                    {form.transportType === 'train'
                      ? isBn
                        ? 'কোচ/ক্যাবিন নম্বর'
                        : 'Coach/Cabin Number'
                      : form.transportType === 'flight'
                        ? isBn
                          ? 'রুম/সিট নম্বর'
                          : 'Room/Seat Number'
                        : form.transportType === 'launch'
                          ? isBn
                            ? 'ক্যাবিন/রুম নম্বর'
                            : 'Cabin/Room Number'
                          : t('coachNumber', language)}
                  </FieldLabel>
                  <Input
                    value={form.coachNumber}
                    onChange={(e) => set('coachNumber', e.target.value)}
                    placeholder={
                      form.transportType === 'train'
                        ? isBn
                          ? 'যেমন: S-1, KA-3'
                          : 'e.g. S-1, KA-3'
                        : form.transportType === 'launch'
                          ? isBn
                            ? 'যেমন: Cabin-12'
                            : 'e.g. Cabin-12'
                          : isBn
                            ? 'যেমন: Coach-1'
                            : 'e.g. Coach-1'
                    }
                  />
                </div>
              </div>

              {/* Info message when not bus */}
              {!showSeatClass && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <Info className="w-4 h-4 shrink-0" />
                  <span className={isBn ? 'font-bangla' : ''}>
                    {form.transportType === 'train'
                      ? isBn
                        ? 'ট্রেনের ক্লাস নির্বাচন এখানে প্রযোজ্য নয়'
                        : 'Class selection is not applicable for train tickets'
                      : form.transportType === 'flight'
                        ? isBn
                          ? 'ফ্লাইটের ক্লাস টিকেটে উল্লেখ থাকবে'
                          : 'Flight class is mentioned on the ticket'
                        : isBn
                          ? 'লঞ্চের ক্যাবিন টাইপ টিকেটে উল্লেখ থাকবে'
                          : 'Launch cabin type is mentioned on the ticket'}
                  </span>
                </div>
              )}
            </FormSection>

            {/* ====== SECTION 4: Pricing ====== */}
            <FormSection
              title={isBn ? 'মূল্য' : 'Pricing'}
              icon={<DollarSign className="w-4 h-4 text-primary" />}
              language={language}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original Price */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>
                    {isBn ? 'মূল টিকেট মূল্য (৳)' : 'Original Ticket Price (৳)'}
                  </FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) => set('originalPrice', e.target.value)}
                    placeholder="0"
                  />
                </div>

                {/* Selling Price */}
                <div className="space-y-1.5">
                  <FieldLabel required language={language}>
                    {isBn ? 'বিক্রয় মূল্য (৳)' : 'Selling Price (৳)'}
                  </FieldLabel>
                  <Input
                    type="number"
                    min="0"
                    value={form.sellingPrice}
                    onChange={(e) => set('sellingPrice', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Platform Fee */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className={`text-sm text-muted-foreground ${isBn ? 'font-bangla' : ''}`}>
                      {t('platformFee', language)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    ৳{platformFee.toLocaleString()}
                  </span>
                </div>
                <p className={`text-xs text-muted-foreground mt-1 ${isBn ? 'font-bangla' : ''}`}>
                  {isBn
                    ? `${PLATFORM_FEE_PERCENTAGE}% (সর্বনিম্ন ৳${PLATFORM_FEE_MINIMUM})`
                    : `${PLATFORM_FEE_PERCENTAGE}% (min ৳${PLATFORM_FEE_MINIMUM})`}
                </p>

                {/* Total buyer pays */}
                {form.sellingPrice && parseFloat(form.sellingPrice) > 0 && (
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className={`text-sm font-medium ${isBn ? 'font-bangla' : ''}`}>
                      {isBn ? 'ক্রেতা সর্বমোট প্রদান করবে' : 'Buyer will pay total'}
                    </span>
                    <span className="text-base font-bold text-primary">
                      ৳{(parseFloat(form.sellingPrice) + platformFee).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </FormSection>

            {/* ====== SECTION 5: Delivery ====== */}
            <AnimatePresence mode="wait">
              {isCounterCopy ? (
                <motion.div
                  key="delivery-section"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormSection
                    title={isBn ? 'ডেলিভারি' : 'Delivery'}
                    icon={<Truck className="w-4 h-4 text-primary" />}
                    language={language}
                  >
                    {/* Delivery Type */}
                    <div className="space-y-1.5 mb-4">
                      <FieldLabel required language={language}>
                        {isBn ? 'টিকেট ডেলিভারি ধরন' : 'Ticket Delivery Type'}
                      </FieldLabel>
                      <Select value={form.deliveryType} onValueChange={(v) => set('deliveryType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isBn ? 'ডেলিভারি ধরন নির্বাচন করুন' : 'Select delivery type'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_person">
                            <span className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {t('inPerson', language)}
                            </span>
                          </SelectItem>
                          <SelectItem value="courier">
                            <span className="flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              {t('courier', language)}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* In Person: Meeting Place */}
                    <AnimatePresence mode="wait">
                      {form.deliveryType === 'in_person' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5"
                        >
                          <FieldLabel required language={language}>
                            {isBn ? 'মিটিং প্লেস' : 'Meeting Place'}
                          </FieldLabel>
                          <Input
                            value={form.meetingPlace}
                            onChange={(e) => set('meetingPlace', e.target.value)}
                            placeholder={isBn ? 'যেমন: কমলাপুর রেলস্টেশন, গেট নং ৩' : 'e.g. Kamalapur Railway Station, Gate 3'}
                            className={isBn ? 'font-bangla' : ''}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Courier fields */}
                    <AnimatePresence mode="wait">
                      {form.deliveryType === 'courier' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          {/* Courier Name */}
                          <div className="space-y-1.5">
                            <FieldLabel required language={language}>
                              {isBn ? 'কুরিয়ার সার্ভিস' : 'Courier Name'}
                            </FieldLabel>
                            <Select value={form.courierName} onValueChange={(v) => set('courierName', v)}>
                              <SelectTrigger>
                                <SelectValue placeholder={isBn ? 'কুরিয়ার নির্বাচন করুন' : 'Select courier'} />
                              </SelectTrigger>
                              <SelectContent>
                                {COURIER_COMPANIES.map((cr) => (
                                  <SelectItem key={cr.id} value={cr.id}>
                                    {isBn ? cr.labelBn : cr.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Delivery Speed */}
                          <div className="space-y-1.5">
                            <FieldLabel required language={language}>
                              {isBn ? 'ডেলিভারি ধরন' : 'Delivery Type'}
                            </FieldLabel>
                            <Select value={form.deliverySpeed} onValueChange={(v) => set('deliverySpeed', v)}>
                              <SelectTrigger>
                                <SelectValue placeholder={isBn ? 'ধরন নির্বাচন করুন' : 'Select type'} />
                              </SelectTrigger>
                              <SelectContent>
                                {DELIVERY_SPEEDS.map((ds) => (
                                  <SelectItem key={ds.id} value={ds.id}>
                                    {isBn ? ds.labelBn : ds.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Delivery Charge Paid By */}
                          <div className="space-y-2">
                            <FieldLabel language={language}>
                              {isBn ? 'ডেলিভারি চার্জ প্রদানকারী' : 'Delivery Charge Paid by'}
                            </FieldLabel>
                            <RadioGroup
                              value={form.deliveryChargePaidBy}
                              onValueChange={(v) => set('deliveryChargePaidBy', v)}
                              className="flex gap-6"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="seller" id="paid-seller" />
                                <Label htmlFor="paid-seller" className={`text-sm ${isBn ? 'font-bangla' : ''}`}>
                                  {isBn ? 'বিক্রেতা (আপনি)' : 'Seller (You)'}
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="buyer" id="paid-buyer" />
                                <Label htmlFor="paid-buyer" className={`text-sm ${isBn ? 'font-bangla' : ''}`}>
                                  {t('buyer', language)}
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Delivery Charge - only when buyer pays */}
                          <AnimatePresence mode="wait">
                            {form.deliveryChargePaidBy === 'buyer' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-1.5"
                              >
                                <FieldLabel required language={language}>
                                  {isBn ? 'ডেলিভারি চার্জ (৳)' : 'Delivery Charge (৳)'}
                                </FieldLabel>
                                <Input
                                  type="number"
                                  min="0"
                                  value={form.deliveryCharge}
                                  onChange={(e) => set('deliveryCharge', e.target.value)}
                                  placeholder="0"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </FormSection>
                </motion.div>
              ) : (
                <motion.div
                  key="online-delivery-info"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-border/50 shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                        <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className={`text-sm font-medium ${isBn ? 'font-bangla' : ''}`}>
                            {isBn ? 'অনলাইন কপি ডেলিভারি' : 'Online Copy Delivery'}
                          </p>
                          <p className={`text-sm text-muted-foreground mt-1 ${isBn ? 'font-bangla' : ''}`}>
                            {isBn
                              ? 'ক্রেতা পেমেন্টের পর টিকেটটি PDF হিসেবে ইমেইলে পাবেন।'
                              : 'Buyer will receive the ticket as PDF via email after payment.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ====== SECTION 6: Details ====== */}
            <FormSection
              title={isBn ? 'বিস্তারিত' : 'Details'}
              icon={<FileText className="w-4 h-4 text-primary" />}
              language={language}
            >
              <div className="space-y-4">
                {/* Description */}
                <div className="space-y-1.5">
                  <FieldLabel language={language}>{t('description', language)}</FieldLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    placeholder={
                      isBn
                        ? 'টিকেট সম্পর্কে বিস্তারিত লিখুন...'
                        : 'Write details about the ticket...'
                    }
                    rows={3}
                    className={isBn ? 'font-bangla' : ''}
                  />
                </div>

                {/* Seller Notes */}
                <div className="space-y-1.5">
                  <FieldLabel language={language}>
                    {isBn ? 'বিক্রেতা নোট' : 'Seller Notes'}
                  </FieldLabel>
                  <Textarea
                    value={form.sellerNotes}
                    onChange={(e) => set('sellerNotes', e.target.value)}
                    placeholder={
                      isBn
                        ? 'ক্রেতার জন্য বিশেষ নোট...'
                        : 'Special notes for the buyer...'
                    }
                    rows={2}
                    className={isBn ? 'font-bangla' : ''}
                  />
                </div>
              </div>
            </FormSection>

            {/* ====== TICKET PREVIEW (inline for mobile) ====== */}
            <div className="lg:hidden">
              <AnimatePresence mode="wait">
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="mb-2">
                      <h3 className={`text-sm font-semibold flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                        <Eye className="w-4 h-4" />
                        {isBn ? 'টিকেট প্রিভিউ' : 'Ticket Preview'}
                      </h3>
                    </div>
                    <PreviewCard />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ====== AGREEMENTS ====== */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <h3 className={`text-sm font-semibold flex items-center gap-2 ${isBn ? 'font-bangla' : ''}`}>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {isBn ? 'চুক্তি ও নিশ্চিতকরণ' : 'Agreements & Confirmation'}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm-correct"
                      checked={form.confirmCorrect}
                      onCheckedChange={(v) => set('confirmCorrect', v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="confirm-correct" className={`text-sm leading-relaxed cursor-pointer ${isBn ? 'font-bangla' : ''}`}>
                      {isBn
                        ? 'আমি নিশ্চিত করছি যে এই টিকেট তথ্য সঠিক।'
                        : 'I confirm this ticket information is correct.'}
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm-legal"
                      checked={form.confirmLegalRight}
                      onCheckedChange={(v) => set('confirmLegalRight', v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="confirm-legal" className={`text-sm leading-relaxed cursor-pointer ${isBn ? 'font-bangla' : ''}`}>
                      {isBn
                        ? 'আমার এই টিকেট হস্তান্তরের আইনি অধিকার আছে।'
                        : 'I have the legal right to transfer this ticket.'}
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm-fake"
                      checked={form.confirmFakeWarning}
                      onCheckedChange={(v) => set('confirmFakeWarning', v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="confirm-fake" className={`text-sm leading-relaxed cursor-pointer ${isBn ? 'font-bangla' : ''}`}>
                      {isBn
                        ? 'আমি বুঝতে পেরেছি যে জাল টিকেট জমা দিলে আমার অ্যাকাউন্ট স্থগিত হতে পারে।'
                        : 'I understand fake ticket submission may result in account suspension.'}
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/90 h-12 text-base font-semibold"
              disabled={submitting || uploading}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isBn ? 'জমা হচ্ছে...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  {isBn ? 'টিকেট তালিকাভুক্ত করুন' : 'List Ticket for Sale'}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* ---- PREVIEW SIDEBAR (desktop) ---- */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-6">
            <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${isBn ? 'font-bangla' : ''}`}>
              <Eye className="w-4 h-4" />
              {isBn ? 'টিকেট প্রিভিউ' : 'Ticket Preview'}
            </h3>
            <PreviewCard />
          </div>
        </div>
      </div>
    </div>
  );
}
