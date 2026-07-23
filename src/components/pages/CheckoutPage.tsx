'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import {
  ArrowLeft, Shield, Phone, MapPin, Mail, User, Home,
  CreditCard, Lock, CheckCircle2, Bus, TrainFront, Plane, Ship,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ALL_BD_DISTRICTS } from '@/lib/constants';

// ─── Payment methods ────────────────────────────────────────────────
type PaymentMethod = 'bkash' | 'sslcommerz';

const paymentMethods: {
  id: PaymentMethod;
  labelEn: string;
  labelBn: string;
  iconBg: string;
  descriptionEn: string;
  descriptionBn: string;
}[] = [
  {
    id: 'bkash',
    labelEn: 'bKash',
    labelBn: 'বিকাশ',
    iconBg: 'bg-pink-500',
    descriptionEn: 'Pay with your bKash mobile wallet',
    descriptionBn: 'আপনার বিকাশ মোবাইল ওয়ালেট দিয়ে পেমেন্ট করুন',
  },
  {
    id: 'sslcommerz',
    labelEn: 'SSLCommerz',
    labelBn: 'SSLCommerz',
    iconBg: 'bg-blue-600',
    descriptionEn: 'Pay via SSLCommerz (card, net banking, mobile banking)',
    descriptionBn: 'SSLCommerz দিয়ে পেমেন্ট করুন (কার্ড, নেট ব্যাংকিং, মোবাইল ব্যাংকিং)',
  },
];

// ─── Checkout Page Component ────────────────────────────────────────
export default function CheckoutPage() {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  // ─── Form state ──────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [upazilla, setUpazilla] = useState('');
  const [district, setDistrict] = useState('');
  const [postCode, setPostCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');

  // ─── Validation state ────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Phone validation (Bangladesh 11-digit) ──────────────────
  const validatePhone = (value: string): boolean => {
    // Remove +88 prefix if present, then check for 11 digits
    const cleaned = value.replace(/^\+?88/, '').replace(/\D/g, '');
    return /^01[3-9]\d{8}$/.test(cleaned);
  };

  const formatPhoneDisplay = (value: string): string => {
    // Always show +88 prefix
    const cleaned = value.replace(/^\+?88/, '').replace(/\D/g, '');
    return cleaned ? `+88 ${cleaned}` : '+88 ';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip prefix if user typed it, store only the local number
    let val = e.target.value;
    // Remove the +88 prefix the user might type
    val = val.replace(/^\+?88\s?/, '');
    // Only allow digits
    val = val.replace(/\D/g, '');
    // Limit to 11 digits
    if (val.length > 11) val = val.slice(0, 11);
    setPhone(val);
  };

  // ─── Form validation ─────────────────────────────────────────
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = isBn ? 'পূর্ণ নাম আবশ্যক' : 'Full name is required';
    }
    if (!phone.trim() || !validatePhone(phone)) {
      newErrors.phone = isBn ? 'সঠিক ১১-ডিজিট ফোন নম্বর দিন' : 'Enter a valid 11-digit Bangladesh phone number';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = isBn ? 'সঠিক ইমেইল দিন' : 'Enter a valid email address';
    }
    if (!address.trim()) {
      newErrors.address = isBn ? 'ঠিকানা আবশ্যক' : 'Address is required';
    }
    if (!upazilla.trim()) {
      newErrors.upazilla = isBn ? 'উপজেলা/থানা আবশ্যক' : 'Upazilla/Thana is required';
    }
    if (!district) {
      newErrors.district = isBn ? 'জেলা নির্বাচন আবশ্যক' : 'District is required';
    }
    if (!postCode.trim()) {
      newErrors.postCode = isBn ? 'পোস্ট কোড আবশ্যক' : 'Post code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate payment processing
    try {
      // In real app, this would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate('order-successful');
    } catch {
      navigate('order-failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Get payment method name ─────────────────────────────────
  const getPaymentMethodName = () => {
    const method = paymentMethods.find(m => m.id === paymentMethod);
    return method ? (isBn ? method.labelBn : method.labelEn) : '';
  };

  // ─── Mock ticket data ────────────────────────────────────────
  const ticketInfo = {
    transportType: 'bus',
    operatorEn: 'Green Line Paribahan',
    operatorBn: 'গ্রিন লাইন পরিবাহন',
    fromEn: 'Dhaka',
    fromBn: 'ঢাকা',
    toEn: 'Chittagong',
    toBn: 'চট্টগ্রাম',
    date: '2025-03-28',
    time: '22:00',
    seat: 'A1',
    classEn: 'AC Business',
    classBn: 'এসি বিজনেস',
    price: 850,
    fee: 17,
    total: 867,
  };

  const transportIconMap: Record<string, React.ElementType> = {
    bus: Bus,
    train: TrainFront,
    flight: Plane,
    launch: Ship,
  };
  const TransportIcon = transportIconMap[ticketInfo.transportType] || Bus;

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-background ${fontClass}`}>
      {/* ─── Header ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('search')}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {isBn ? 'সার্চ পৃষ্ঠায় ফিরুন' : 'Back to Search'}
        </Button>
      </div>

      {/* ─── Main Layout: 2-col desktop, stacked mobile ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ─── LEFT: Buyer Information ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  {isBn ? 'ক্রেতা তথ্য' : 'Buyer Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    {isBn ? 'পূর্ণ নাম' : 'Full Name'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder={isBn ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your full name'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      aria-invalid={errors.fullName ? 'true' : undefined}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    {isBn ? 'ফোন নম্বর' : 'Phone Number'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="01XXXXXXXXX"
                      value={formatPhoneDisplay(phone)}
                      onChange={handlePhoneChange}
                      className="pl-10"
                      aria-invalid={errors.phone ? 'true' : undefined}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.phone}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {isBn ? '১১-ডিজিট বাংলাদেশ ফোন নম্বর (01 দিয়ে শুরু)' : '11-digit Bangladesh phone number (starts with 01)'}
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {isBn ? 'ইমেইল' : 'Email'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={isBn ? 'আপনার ইমেইল লিখুন' : 'Enter your email'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      aria-invalid={errors.email ? 'true' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    {isBn ? 'ঠিকানা' : 'Address'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder={isBn ? 'আপনার ঠিকানা লিখুন' : 'Enter your address'}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10"
                      aria-invalid={errors.address ? 'true' : undefined}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.address}
                    </p>
                  )}
                </div>

                {/* Upazilla/Thana */}
                <div className="space-y-2">
                  <Label htmlFor="upazilla" className="text-sm font-medium">
                    {isBn ? 'উপজেলা/থানা' : 'Upazilla/Thana'} <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="upazilla"
                      placeholder={isBn ? 'উপজেলা/থানা লিখুন' : 'Enter upazilla/thana'}
                      value={upazilla}
                      onChange={(e) => setUpazilla(e.target.value)}
                      className="pl-10"
                      aria-invalid={errors.upazilla ? 'true' : undefined}
                    />
                  </div>
                  {errors.upazilla && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.upazilla}
                    </p>
                  )}
                </div>

                {/* District */}
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium">
                    {isBn ? 'জেলা' : 'District'} <span className="text-destructive">*</span>
                  </Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger id="district" className="w-full" aria-invalid={errors.district ? 'true' : undefined}>
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
                  {errors.district && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.district}
                    </p>
                  )}
                </div>

                {/* Post Code */}
                <div className="space-y-2">
                  <Label htmlFor="postCode" className="text-sm font-medium">
                    {isBn ? 'পোস্ট কোড' : 'Post Code'} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="postCode"
                    placeholder={isBn ? 'পোস্ট কোড লিখুন' : 'Enter post code'}
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    aria-invalid={errors.postCode ? 'true' : undefined}
                  />
                  {errors.postCode && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.postCode}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── RIGHT: Ticket Summary + Payment ────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Ticket Summary Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TransportIcon className="h-5 w-5 text-primary" />
                  {isBn ? 'টিকেট সারসংক্ষেপ' : 'Ticket Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isBn ? 'অপারেটর' : 'Operator'}</span>
                    <span className="font-medium">{isBn ? ticketInfo.operatorBn : ticketInfo.operatorEn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isBn ? 'রুট' : 'Route'}</span>
                    <span className="font-medium">
                      {isBn ? `${ticketInfo.fromBn} → ${ticketInfo.toBn}` : `${ticketInfo.fromEn} → ${ticketInfo.toEn}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isBn ? 'তারিখ' : 'Date'}</span>
                    <span className="font-medium">28-Mar-2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isBn ? 'সময়' : 'Time'}</span>
                    <span className="font-medium">10:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isBn ? 'সিট' : 'Seat'}</span>
                    <span className="font-medium">{ticketInfo.seat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isBn ? 'ক্লাস' : 'Class'}</span>
                    <Badge variant="secondary">{isBn ? ticketInfo.classBn : ticketInfo.classEn}</Badge>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isBn ? 'টিকেট মূল্য' : 'Ticket Price'}</span>
                    <span className="font-medium">৳ {ticketInfo.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      {isBn ? 'প্ল্যাটফর্ম ফি (২%)' : 'Platform Fee (2%)'}
                    </span>
                    <span className="font-medium text-xs">৳ {ticketInfo.fee}</span>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{isBn ? 'মোট' : 'Total'}</span>
                    <span className="font-bold text-lg text-primary">৳ {ticketInfo.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  {isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      {/* Payment method icon */}
                      <div className={`${method.iconBg} text-white rounded-lg p-2 flex items-center justify-center`}>
                        {method.id === 'bkash' ? (
                          <span className="text-sm font-bold">b</span>
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="font-semibold cursor-pointer">
                          {isBn ? method.labelBn : method.labelEn}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isBn ? method.descriptionBn : method.descriptionEn}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                      {isBn ? 'এসক্রো সুরক্ষা' : 'Escrow Protection'}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      {isBn
                        ? 'আপনার পেমেন্ট নিরাপদে এসক্রোতে রাখা হয়। টিকেট বৈধ না হলে সম্পূর্ণ ফেরত পাবেন।'
                        : 'Your payment is held securely in escrow. If the ticket is invalid, you will receive a full refund.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pay Now Button */}
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isBn ? 'প্রক্রিয়াকরণ...' : 'Processing...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {isBn
                    ? `${getPaymentMethodName()} দিয়ে পেমেন্ট করুন`
                    : `Pay with ${getPaymentMethodName()}`
                  }
                </span>
              )}
            </Button>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                {isBn ? 'নিরাপদ পেমেন্ট' : 'Secure Payment'}
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                {isBn ? 'এসক্রো সুরক্ষিত' : 'Escrow Protected'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isBn ? 'ফেরত গ্যারান্টি' : 'Refund Guarantee'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
