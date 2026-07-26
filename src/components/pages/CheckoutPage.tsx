'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import {
  ArrowLeft, Shield, Phone, MapPin, Mail, User, Home,
  CreditCard, Lock, CheckCircle2, Bus, TrainFront, Plane, Ship,
  AlertCircle, Link2, Clock, Copy, ExternalLink,
  Loader2, Wallet,
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
type PaymentMethod = 'bkash' | 'sslcommerz' | 'googlepay' | 'invoice';

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
    descriptionEn: 'Pay with bKash tokenized checkout (auto-debit after first setup)',
    descriptionBn: 'বিকাশ টোকেনাইজড চেকআউট দিয়ে পেমেন্ট করুন (প্রথম সেটআপের পরে স্বয়ংক্রিয়)',
  },
  {
    id: 'sslcommerz',
    labelEn: 'SSLCommerz',
    labelBn: 'SSLCommerz',
    iconBg: 'bg-blue-600',
    descriptionEn: 'Pay via SSLCommerz (card, net banking, mobile banking)',
    descriptionBn: 'SSLCommerz দিয়ে পেমেন্ট করুন (কার্ড, নেট ব্যাংকিং, মোবাইল ব্যাংকিং)',
  },
  {
    id: 'googlepay',
    labelEn: 'Google Pay',
    labelBn: 'গুগল পে',
    iconBg: 'bg-white border border-gray-200',
    descriptionEn: 'Pay with your Google Pay account',
    descriptionBn: 'আপনার গুগল পে অ্যাকাউন্ট দিয়ে পেমেন্ট করুন',
  },
  {
    id: 'invoice',
    labelEn: 'Pay via Invoice Link',
    labelBn: 'ইনভয়েস লিংক দিয়ে পেমেন্ট',
    iconBg: 'bg-amber-500',
    descriptionEn: 'Get a payment link you can pay later or share',
    descriptionBn: 'পেমেন্ট লিংক পান যা আপনি পরে পেমেন্ট করতে বা শেয়ার করতে পারেন',
  },
];

// ─── Google Pay Types ────────────────────────────────────────────────
interface GooglePayConfig {
  apiVersion: string;
  apiVersionMinor: string;
  gatewayMerchantId: string;
  gateway: string;
  merchantId: string;
  merchantName: string;
  allowedAuthMethods: string[];
  allowedCardNetworks: string[];
  environment: string;
  totalAmount: number;
  currency: string;
  countryCode: string;
}

interface InvoiceData {
  pay_url: string;
  qr_image_pay_url: string;
  invoice_id: string;
  tran_id: string;
}

// ─── bKash Payment State ────────────────────────────────────────────
interface BkashPaymentState {
  status: 'idle' | 'checking_agreement' | 'creating_agreement' | 'creating_payment' | 'redirecting' | 'success' | 'failed';
  agreementID: string | null;
  message: string;
  trxId?: string;
  error?: string;
}

const BKASH_AGREEMENT_KEY = 'bkash_agreement_id';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('sslcommerz');

  // ─── Validation state ────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Google Pay state ────────────────────────────────────────
  const [gpayConfig, setGpayConfig] = useState<GooglePayConfig | null>(null);
  const [gpayReady, setGpayReady] = useState(false);
  const [gpayLoading, setGpayLoading] = useState(false);
  const googlePayBtnRef = useRef<HTMLDivElement>(null);

  // ─── Invoice state ───────────────────────────────────────────
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // ─── bKash payment state ──────────────────────────────────────
  const [bkashState, setBkashState] = useState<BkashPaymentState>({
    status: 'idle',
    agreementID: null,
    message: '',
  });

  // ─── Payment result from callback redirect ────────────────────
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment_status');
  const paymentMethodParam = searchParams.get('payment_method');
  const trxIdParam = searchParams.get('trxId');
  const agreementIDParam = searchParams.get('agreementID');
  const orderIdParam = searchParams.get('orderId');
  const errorParam = searchParams.get('error');

  // ─── Mock ticket data ────────────────────────────────────────
  const ticketInfo = {
    transportType: 'bus',
    operatorEn: 'Green Line Paribahan',
    operatorBn: 'গ্রিন লাইন পরিবাহন',
    fromEn: 'Dhaka',
    fromBn: 'ঢাকা',
    toEn: 'Chittigong',
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

  // ─── Phone validation (Bangladesh 11-digit) ──────────────────
  const validatePhone = (value: string): boolean => {
    const cleaned = value.replace(/^\+?88/, '').replace(/\D/g, '');
    return /^01[3-9]\d{8}$/.test(cleaned);
  };

  const formatPhoneDisplay = (value: string): string => {
    const cleaned = value.replace(/^\+?88/, '').replace(/\D/g, '');
    return cleaned ? `+88 ${cleaned}` : '+88 ';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/^\+?88\s?/, '');
    val = val.replace(/\D/g, '');
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

  // ─── Get payment method name ─────────────────────────────────
  const getPaymentMethodName = () => {
    const method = paymentMethods.find(m => m.id === paymentMethod);
    return method ? (isBn ? method.labelBn : method.labelEn) : '';
  };

  // ─── Google Pay: Load SDK & Initialize ───────────────────────
  const loadGooglePayScript = useCallback(() => {
    const existing = document.querySelector('script[src="https://pay.google.com/gp/p/js/pay.js"]');
    if (existing) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Pay SDK'));
      document.body.appendChild(script);
    });
  }, []);

  const fetchGooglePayConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/payment/googlepay/config');
      const data = await res.json();
      if (data.success && data.apiVersion) {
        setGpayConfig({
          apiVersion: data.apiVersion,
          apiVersionMinor: data.apiVersionMinor,
          gatewayMerchantId: data.gatewayMerchantId,
          gateway: data.gateway,
          merchantId: data.merchantId,
          merchantName: data.merchantName,
          allowedAuthMethods: data.allowedAuthMethods,
          allowedCardNetworks: data.allowedCardNetworks,
          environment: data.environment,
          totalAmount: ticketInfo.total,
          currency: data.currency || 'BDT',
          countryCode: data.countryCode || 'BD',
        });
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const initGooglePay = useCallback(async () => {
    if (gpayReady) return;
    setGpayLoading(true);

    try {
      // Load the Google Pay SDK
      await loadGooglePayScript();

      // Fetch config from our backend
      const config = await fetchGooglePayConfig();
      if (!config) {
        setGpayLoading(false);
        return;
      }

      // Initialize PaymentsClient
      const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
        environment: config.environment === 'TEST' ? 'TEST' : 'PRODUCTION',
      });

      // Check if Google Pay is ready
      const isReadyToPayRequest = {
        apiVersion: config.apiVersion,
        apiVersionMinor: config.apiVersionMinor,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: config.allowedAuthMethods,
              allowedCardNetworks: config.allowedCardNetworks,
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: config.gateway,
                gatewayMerchantId: config.gatewayMerchantId,
              },
            },
          },
        ],
      };

      const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
      if (response.result) {
        setGpayReady(true);
      }
    } catch (err) {
      console.error('Google Pay initialization failed:', err);
    } finally {
      setGpayLoading(false);
    }
  }, [gpayReady, loadGooglePayScript, fetchGooglePayConfig]);

  // ─── Google Pay: Handle payment ──────────────────────────────
  const handleGooglePayClick = async () => {
    if (!gpayConfig) return;

    try {
      const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
        environment: gpayConfig.environment === 'TEST' ? 'TEST' : 'PRODUCTION',
      });

      const paymentDataRequest = {
        apiVersion: gpayConfig.apiVersion,
        apiVersionMinor: gpayConfig.apiVersionMinor,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: gpayConfig.allowedAuthMethods,
              allowedCardNetworks: gpayConfig.allowedCardNetworks,
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: gpayConfig.gateway,
                gatewayMerchantId: gpayConfig.gatewayMerchantId,
              },
            },
          },
        ],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: String(ticketInfo.total),
          currencyCode: gpayConfig.currency,
          countryCode: gpayConfig.countryCode,
        },
        merchantInfo: {
          merchantId: gpayConfig.merchantId,
          merchantName: gpayConfig.merchantName,
        },
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

      // Got the payment token from Google Pay
      const tokenData = paymentData.paymentMethodData.tokenizationData.token;

      // First: initiate a Google Pay transaction on our backend
      setIsSubmitting(true);
      const initiateRes = await fetch('/api/payment/googlepay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: ticketInfo.total,
          currency: gpayConfig.currency,
          tranId: `GPY-${Date.now()}`,
          cusName: fullName,
          cusEmail: email,
          cusPhone: `+88${phone}`,
          cusAdd1: address,
          cusCity: district,
          cusPostcode: postCode,
          cusCountry: 'BD',
          product_category: 'bus ticket',
          product_name: `${ticketInfo.fromEn} to ${ticketInfo.toEn} - ${ticketInfo.operatorEn}`,
          product_profile: 'airline-tickets',
          orderId: 'DEMO-ORDER',
        }),
      });
      const initiateData = await initiateRes.json();

      if (!initiateData.success) {
        navigate('order-failed');
        return;
      }

      // Second: process the Google Pay token with the session key
      const processRes = await fetch('/api/payment/googlepay/process-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_key: initiateData.session_key,
          en_signature_data: tokenData,
          actionurl: initiateData.actionurl,
        }),
      });
      const processData = await processRes.json();

      if (processData.success) {
        if (processData.type === 'otp') {
          // Redirect to 3DS OTP page
          window.location.href = processData.redirectUrl;
        } else {
          // Direct success
          navigate('order-successful');
        }
      } else {
        navigate('order-failed');
      }
    } catch {
      navigate('order-failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Invoice: Create invoice link ────────────────────────────
  const handleCreateInvoice = async () => {
    if (!validateForm()) return;
    setInvoiceLoading(true);

    try {
      const res = await fetch('/api/payment/invoice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: ticketInfo.total,
          currency: 'BDT',
          cusName: fullName,
          cusEmail: email,
          cusPhone: `+88${phone}`,
          cusAdd1: address,
          cusCity: district,
          cusPostcode: postCode,
          cusCountry: 'BD',
          product_category: 'bus ticket',
          product_name: `${ticketInfo.fromEn} to ${ticketInfo.toEn} - ${ticketInfo.operatorEn}`,
          product_profile: 'airline-tickets',
          inv_name: `${ticketInfo.fromEn} to ${ticketInfo.toEn} - ${ticketInfo.operatorEn}`,
          inv_description: `Bus ticket: ${ticketInfo.fromEn} → ${ticketInfo.toEn}, Seat ${ticketInfo.seat}, ${ticketInfo.classEn}`,
        }),
      });
      const data = await res.json();

      if (data.success && data.pay_url) {
        setInvoiceData({
          pay_url: data.pay_url,
          qr_image_pay_url: data.qr_image_pay_url || '',
          invoice_id: data.invoice_id || '',
          tran_id: data.tran_id || '',
        });
      } else {
        setErrors({ ...errors, invoice: data.error || (isBn ? 'ইনভয়েস তৈরি ব্যর্থ' : 'Invoice creation failed') });
      }
    } catch {
      setErrors({ ...errors, invoice: isBn ? 'ইনভয়েস তৈরি ব্যর্থ' : 'Invoice creation failed' });
    } finally {
      setInvoiceLoading(false);
    }
  };

  // ─── Invoice: Copy link ──────────────────────────────────────
  const handleCopyLink = async () => {
    if (!invoiceData?.pay_url) return;
    try {
      await navigator.clipboard.writeText(invoiceData.pay_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = invoiceData.pay_url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Initialize Google Pay when selected ─────────────────────
  useEffect(() => {
    if (paymentMethod === 'googlepay' && !gpayReady && !gpayLoading) {
      initGooglePay();
    }
  }, [paymentMethod, gpayReady, gpayLoading, initGooglePay]);

  // ─── Clear invoice data when switching payment method ────────
  useEffect(() => {
    if (paymentMethod !== 'invoice') {
      setInvoiceData(null);
      setCopied(false);
    }
  }, [paymentMethod]);

  // ─── Handle bKash payment result from callback redirect ──────
  useEffect(() => {
    if (paymentStatus && paymentMethodParam === 'bkash') {
      if (paymentStatus === 'success') {
        // Save agreementID to localStorage for future use
        if (agreementIDParam) {
          localStorage.setItem(BKASH_AGREEMENT_KEY, agreementIDParam);
        }
        setBkashState({
          status: 'success',
          agreementID: agreementIDParam || null,
          message: isBn ? 'বিকাশ পেমেন্ট সফল!' : 'bKash payment successful!',
          trxId: trxIdParam || undefined,
        });
      } else if (paymentStatus === 'failed') {
        // If the error is related to agreement, clear the stored agreementID
        if (errorParam === 'agreement_cancelled' || errorParam === 'unknown_mode') {
          localStorage.removeItem(BKASH_AGREEMENT_KEY);
        }
        setBkashState({
          status: 'failed',
          agreementID: null,
          message: isBn ? 'বিকাশ পেমেন্ট ব্যর্থ' : 'bKash payment failed',
          error: errorParam || undefined,
        });
      }
    }
  }, [paymentStatus, paymentMethodParam, trxIdParam, agreementIDParam, errorParam, isBn]);

  // ─── Load stored bKash agreementID on mount ───────────────────
  useEffect(() => {
    if (paymentMethod === 'bkash') {
      const storedAgreementID = localStorage.getItem(BKASH_AGREEMENT_KEY);
      if (storedAgreementID) {
        setBkashState(prev => ({ ...prev, agreementID: storedAgreementID }));
      }
    }
  }, [paymentMethod]);

  // ─── Main Submit Handler ─────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (paymentMethod === 'sslcommerz') {
        // ─── SSLCommerz Hosted Payment (Redirect) ──────────
        const res = await fetch('/api/payment/sslcommerz/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: 'DEMO-ORDER',
            totalAmount: ticketInfo.total,
            currency: 'BDT',
            cusName: fullName,
            cusEmail: email,
            cusAdd1: address,
            cusCity: district,
            cusPostcode: postCode,
            cusCountry: 'Bangladesh',
            cusPhone: `+88${phone}`,
            product_name: `${ticketInfo.fromEn} to ${ticketInfo.toEn} - ${ticketInfo.operatorEn}`,
            product_category: 'bus ticket',
            product_profile: 'airline-tickets',
          }),
        });
        const data = await res.json();

        if (data.data) {
          // Redirect to SSLCommerz Gateway Page (Hosted Payment mode)
          window.location.href = data.data;
        } else {
          setErrors({ ...errors, payment: data.error || data.details || (isBn ? 'পেমেন্ট শুরু ব্যর্থ' : 'Payment initiation failed') });
          setIsSubmitting(false);
        }
      } else if (paymentMethod === 'googlepay') {
        // Google Pay flow is handled by the button click, not the main submit
        // But we validate the form here so user sees errors if form is incomplete
        setIsSubmitting(false);
      } else if (paymentMethod === 'invoice') {
        // Invoice flow handled by handleCreateInvoice
        setIsSubmitting(false);
      } else if (paymentMethod === 'bkash') {
        // ─── bKash Tokenized Checkout ──────────────────────
        const storedAgreementID = localStorage.getItem(BKASH_AGREEMENT_KEY);
        const payerReference = phone; // Use phone number as payer reference

        if (storedAgreementID) {
          // ── Has existing agreement: check status, then create payment ──
          setBkashState({ status: 'checking_agreement', agreementID: storedAgreementID, message: isBn ? 'বিকাশ এগ্রিমেন্ট যাচাই হচ্ছে...' : 'Checking bKash agreement...' });

          try {
            const statusRes = await fetch('/api/payment/bkash/agreement/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ agreementID: storedAgreementID }),
            });
            const statusData = await statusRes.json();

            if (statusData.success && statusData.agreementStatus === 'Completed') {
              // Agreement is active - create payment
              setBkashState({ status: 'creating_payment', agreementID: storedAgreementID, message: isBn ? 'বিকাশ পেমেন্ট তৈরি হচ্ছে...' : 'Creating bKash payment...' });

              const payRes = await fetch('/api/payment/bkash/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: 'DEMO-ORDER',
                  totalAmount: ticketInfo.total,
                  currency: 'BDT',
                  payerReference,
                  agreementID: storedAgreementID,
                }),
              });
              const payData = await payRes.json();

              if (payData.success && payData.bkashURL) {
                setBkashState({ status: 'redirecting', agreementID: storedAgreementID, message: isBn ? 'বিকাশে রিডাইরেক্ট হচ্ছে...' : 'Redirecting to bKash...' });
                window.location.href = payData.bkashURL;
                return; // Page will redirect, don't set isSubmitting to false
              } else {
                // Payment creation failed - maybe agreement is invalid, clear it
                localStorage.removeItem(BKASH_AGREEMENT_KEY);
                setBkashState({ status: 'failed', agreementID: null, message: '', error: payData.error || (isBn ? 'পেমেন্ট তৈরি ব্যর্থ' : 'Payment creation failed') });
                setErrors({ ...errors, payment: payData.error || (isBn ? 'পেমেন্ট তৈরি ব্যর্থ' : 'Payment creation failed') });
              }
            } else {
              // Agreement is not active (Cancelled/expired) - clear and create new
              localStorage.removeItem(BKASH_AGREEMENT_KEY);
              setBkashState({ status: 'creating_agreement', agreementID: null, message: isBn ? 'নতুন এগ্রিমেন্ট তৈরি হচ্ছে...' : 'Creating new agreement...' });

              const agrRes = await fetch('/api/payment/bkash/agreement/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: 'DEMO-ORDER',
                  totalAmount: ticketInfo.total,
                  currency: 'BDT',
                  payerReference,
                }),
              });
              const agrData = await agrRes.json();

              if (agrData.success && agrData.bkashURL) {
                setBkashState({ status: 'redirecting', agreementID: null, message: isBn ? 'বিকাশে রিডাইরেক্ট হচ্ছে (এগ্রিমেন্ট সেটআপ)...' : 'Redirecting to bKash (agreement setup)...' });
                window.location.href = agrData.bkashURL;
                return;
              } else {
                setBkashState({ status: 'failed', agreementID: null, message: '', error: agrData.error || (isBn ? 'এগ্রিমেন্ট তৈরি ব্যর্থ' : 'Agreement creation failed') });
                setErrors({ ...errors, payment: agrData.error || (isBn ? 'এগ্রিমেন্ট তৈরি ব্যর্থ' : 'Agreement creation failed') });
              }
            }
          } catch {
            localStorage.removeItem(BKASH_AGREEMENT_KEY);
            setBkashState({ status: 'failed', agreementID: null, message: '', error: isBn ? 'এগ্রিমেন্ট যাচাই ব্যর্থ' : 'Agreement check failed' });
            setErrors({ ...errors, payment: isBn ? 'এগ্রিমেন্ট যাচাই ব্যর্থ' : 'Agreement check failed' });
          }
        } else {
          // ── No existing agreement: create new agreement ──
          setBkashState({ status: 'creating_agreement', agreementID: null, message: isBn ? 'বিকাশ এগ্রিমেন্ট তৈরি হচ্ছে...' : 'Creating bKash agreement...' });

          try {
            const agrRes = await fetch('/api/payment/bkash/agreement/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: 'DEMO-ORDER',
                totalAmount: ticketInfo.total,
                currency: 'BDT',
                payerReference,
              }),
            });
            const agrData = await agrRes.json();

            if (agrData.success && agrData.bkashURL) {
              setBkashState({ status: 'redirecting', agreementID: null, message: isBn ? 'বিকাশে রিডাইরেক্ট হচ্ছে (এগ্রিমেন্ট সেটআপ)...' : 'Redirecting to bKash (agreement setup)...' });
              window.location.href = agrData.bkashURL;
              return;
            } else {
              setBkashState({ status: 'failed', agreementID: null, message: '', error: agrData.error || (isBn ? 'এগ্রিমেন্ট তৈরি ব্যর্থ' : 'Agreement creation failed') });
              setErrors({ ...errors, payment: agrData.error || (isBn ? 'এগ্রিমেন্ট তৈরি ব্যর্থ' : 'Agreement creation failed') });
            }
          } catch {
            setBkashState({ status: 'failed', agreementID: null, message: '', error: isBn ? 'এগ্রিমেন্ট তৈরি ব্যর্থ' : 'Agreement creation failed' });
            setErrors({ ...errors, payment: isBn ? 'এগ্রিমেন্ট তৈরি ব্যর্থ' : 'Agreement creation failed' });
          }
        }
      }
    } catch {
      navigate('order-failed');
    } finally {
      // Only set false if we didn't redirect (SSLCommerz/bKash redirect the whole page)
      if ((paymentMethod !== 'sslcommerz' && paymentMethod !== 'bkash') || errors.payment) {
        setIsSubmitting(false);
      }
      // Also reset bkash state to idle if not redirecting
      if (paymentMethod === 'bkash' && bkashState.status !== 'redirecting') {
        setBkashState(prev => ({ ...prev, status: 'idle' }));
      }
    }
  };

  // ─── Determine button text and action ────────────────────────
  const getButtonConfig = () => {
    if (paymentMethod === 'invoice') {
      if (invoiceData) {
        return {
          text: isBn ? 'ইনভয়েস লিংক দেখুন' : 'View Invoice Link',
          action: () => window.open(invoiceData.pay_url, '_blank'),
          disabled: false,
        };
      }
      return {
        text: isBn ? 'ইনভয়েস তৈরি করুন' : 'Create Invoice',
        action: handleCreateInvoice,
        disabled: invoiceLoading,
      };
    }
    if (paymentMethod === 'googlepay') {
      // Google Pay uses its own button, so the main button just validates form
      return {
        text: isBn ? 'ফর্ম যাচাই করুন' : 'Validate Form',
        action: () => validateForm(),
        disabled: false,
      };
    }
    return {
      text: isBn
        ? `${getPaymentMethodName()} দিয়ে পেমেন্ট করুন`
        : `Pay with ${getPaymentMethodName()}`,
      action: handleSubmit,
      disabled: isSubmitting,
    };
  };

  const buttonConfig = getButtonConfig();

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
                      <div className={`${method.iconBg} text-white rounded-lg p-2 flex items-center justify-center min-w-[36px] min-h-[36px]`}>
                        {method.id === 'bkash' ? (
                          <span className="text-sm font-bold text-white">b</span>
                        ) : method.id === 'sslcommerz' ? (
                          <Lock className="h-4 w-4" />
                        ) : method.id === 'googlepay' ? (
                          <span className="text-sm font-bold text-gray-700">G</span>
                        ) : method.id === 'invoice' ? (
                          <Link2 className="h-4 w-4" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="font-semibold cursor-pointer">
                          {isBn ? method.labelBn : method.labelEn}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isBn ? method.descriptionBn : method.descriptionEn}
                        </p>
                      </div>
                      {method.id === 'invoice' && (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {/* ─── bKash Payment Status (shown when bKash is selected) ─── */}
                {paymentMethod === 'bkash' && (
                  <div className="mt-4 space-y-3">
                    <Separator />

                    {/* bKash Agreement Status Indicator */}
                    {bkashState.status !== 'idle' && bkashState.status !== 'success' && bkashState.status !== 'failed' && (
                      <div className="pt-2 p-4 bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-pink-200 dark:border-pink-800/30">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 text-pink-500 animate-spin" />
                          <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                            {bkashState.message}
                          </span>
                        </div>
                        {bkashState.status === 'creating_agreement' && (
                          <p className="text-xs text-pink-600 dark:text-pink-400 mt-2">
                            {isBn
                              ? 'প্রথমবার বিকাশ পেমেন্টের জন্য এগ্রিমেন্ট সেটআপ প্রয়োজন। আপনি বিকাশ পৃষ্ঠায় রিডাইরেক্ট হবেন।'
                              : 'First-time bKash payment requires an agreement setup. You will be redirected to bKash to authorize.'
                            }
                          </p>
                        )}
                        {bkashState.status === 'redirecting' && (
                          <p className="text-xs text-pink-600 dark:text-pink-400 mt-2">
                            {isBn
                              ? 'বিকাশ পৃষ্ঠায় যাচ্ছেন, দয়া করে অপেক্ষা করুন...'
                              : 'Heading to bKash page, please wait...'
                            }
                          </p>
                        )}
                      </div>
                    )}

                    {/* bKash Payment Success Result */}
                    {bkashState.status === 'success' && (
                      <div className="pt-2 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                            {bkashState.message}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                          {bkashState.trxId && (
                            <div className="flex justify-between">
                              <span>{isBn ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}</span>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">{bkashState.trxId}</span>
                            </div>
                          )}
                          {bkashState.agreementID && (
                            <div className="flex justify-between">
                              <span>{isBn ? 'এগ্রিমেন্ট আইডি' : 'Agreement ID'}</span>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">{bkashState.agreementID}</span>
                            </div>
                          )}
                          {orderIdParam && (
                            <div className="flex justify-between">
                              <span>{isBn ? 'অর্ডার আইডি' : 'Order ID'}</span>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">{orderIdParam}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>{isBn ? 'মোট পরিমাণ' : 'Total Amount'}</span>
                            <span className="font-medium">৳ {ticketInfo.total}</span>
                          </div>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full mt-3 flex items-center gap-2"
                          onClick={() => navigate('order-successful')}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isBn ? 'অর্ডার সফল পৃষ্ঠায় যান' : 'Go to Order Success Page'}
                        </Button>
                      </div>
                    )}

                    {/* bKash Payment Failure Result */}
                    {bkashState.status === 'failed' && (
                      <div className="pt-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <span className="font-semibold text-red-800 dark:text-red-300 text-sm">
                            {bkashState.message}
                          </span>
                        </div>
                        {bkashState.error && (
                          <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                            {isBn ? `ত্রুটি: ${bkashState.error}` : `Error: ${bkashState.error}`}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => {
                            setBkashState({ status: 'idle', agreementID: null, message: '' });
                            localStorage.removeItem(BKASH_AGREEMENT_KEY);
                          }}
                        >
                          {isBn ? 'আবার চেষ্টা করুন' : 'Try Again'}
                        </Button>
                      </div>
                    )}

                    {/* bKash Agreement Info for first-time users */}
                    {bkashState.status === 'idle' && (
                      <div className="pt-2">
                        {bkashState.agreementID ? (
                          // Has an existing agreement
                          <div className="p-3 bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-pink-200 dark:border-pink-800/30">
                            <div className="flex items-center gap-2 mb-1">
                              <Wallet className="h-4 w-4 text-pink-500" />
                              <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                                {isBn ? 'বিকাশ এগ্রিমেন্ট সক্রিয়' : 'bKash Agreement Active'}
                              </span>
                            </div>
                            <p className="text-xs text-pink-600 dark:text-pink-400">
                              {isBn
                                ? 'আপনার বিকাশ এগ্রিমেন্ট আগেই সেটআপ করা হয়েছে। পেমেন্ট করতে "বিকাশ দিয়ে পেমেন্ট করুন" বোতাম ক্লিক করুন।'
                                : 'Your bKash agreement is already set up. Click "Pay with bKash" to proceed with payment.'
                              }
                            </p>
                          </div>
                        ) : (
                          // No agreement yet - show info for first-time setup
                          <div className="p-3 bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-pink-200 dark:border-pink-800/30">
                            <div className="flex items-center gap-2 mb-1">
                              <Wallet className="h-4 w-4 text-pink-500" />
                              <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                                {isBn ? 'প্রথমবার বিকাশ সেটআপ' : 'First-time bKash Setup'}
                              </span>
                            </div>
                            <p className="text-xs text-pink-600 dark:text-pink-400">
                              {isBn
                                ? 'প্রথমবার বিকাশ পেমেন্টের জন্য এগ্রিমেন্ট সেটআপ প্রয়োজন। আপনি বিকাশ পৃষ্ঠায় রিডাইরেক্ট হবেন এবং একবার অনুমোদন করলে পরবর্তী পেমেন্ট স্বয়ংক্রিয় হবে।'
                                : 'First-time bKash payment requires an agreement setup. You will be redirected to bKash to authorize. Once authorized, future payments will be automatic.'
                              }
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {isBn
                                ? `মোট: ৳ ${ticketInfo.total} (BDT)`
                                : `Total: ৳ ${ticketInfo.total} (BDT)`
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Google Pay Button (shown when Google Pay is selected) ─── */}
                {paymentMethod === 'googlepay' && (
                  <div className="mt-4 space-y-3">
                    <Separator />
                    <div className="pt-2">
                      {gpayLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          {isBn ? 'গুগল পে লোড হচ্ছে...' : 'Loading Google Pay...'}
                        </div>
                      )}

                      {gpayReady && !gpayLoading && (
                        <div ref={googlePayBtnRef} className="flex justify-center">
                          <button
                            type="button"
                            onClick={handleGooglePayClick}
                            className="google-pay-button-inline flex items-center justify-center gap-2 bg-black text-white rounded-full px-6 py-3 min-h-[44px] font-medium transition-opacity hover:opacity-90"
                            aria-label={isBn ? 'গুগল পে দিয়ে পেমেন্ট করুন' : 'Pay with Google Pay'}
                          >
                            <svg viewBox="0 0 56 24" className="h-5 w-auto" aria-hidden="true">
                              <path d="M22.4 12.2c0-3.5-2.9-6.2-6.4-6.2-3.5 0-6.4 2.8-6.4 6.2 0 3.5 2.9 6.3 6.4 6.3 3.5 0 6.4-2.8 6.4-6.3zm-2.8 0c0 2.2-1.6 3.8-3.6 3.8-2 0-3.6-1.6-3.6-3.8 0-2.2 1.6-3.8 3.6-3.8 2 0 3.6 1.6 3.6 3.8z" fill="#4285F4"/>
                              <path d="M35.6 6.3v12.4h-2.8V6.3h2.8z" fill="#34A853"/>
                              <path d="M42.8 15.6l-2.2-1.5c.7-1 1.1-2.2 1.1-3.5 0-1.3-.4-2.5-1.1-3.5l2.2-1.5c1.1 1.5 1.7 3.3 1.7 5s-.6 3.5-1.7 5z" fill="#FBBC04"/>
                              <path d="M36 12.2c0-1.3.4-2.5 1.1-3.5l2.2 1.5c-.7 1-1.1 2.2-1.1 3.5 0 1.3.4 2.5 1.1 3.5L36 16.7c-.7-1-1.1-2.2-1.1-3.5 0 1.3.4 2.5 1.1 3.5z" fill="#EA4335"/>
                              <path d="M16 18.5c-3.5 0-6.4-2.8-6.4-6.3S12.5 6 16 6c1.7 0 3.2.6 4.4 1.7l2.2-2C20.8 4.2 18.5 3.3 16 3.3c-4.8 0-8.8 3.9-8.8 8.9s4 8.9 8.8 8.9c2.5 0 4.8-.9 6.6-2.4l-2.2-2c-1.2 1-2.7 1.7-4.4 1.7z" fill="#4285F4"/>
                            </svg>
                            <span>{isBn ? 'পেমেন্ট করুন' : 'Pay'}</span>
                          </button>
                        </div>
                      )}

                      {!gpayReady && !gpayLoading && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {isBn ? 'গুগল পে এই ডিভাইসে উপলব্ধ নয়' : 'Google Pay is not available on this device'}
                        </div>
                      )}

                      {gpayConfig && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          {isBn
                            ? `মোট: ৳ ${ticketInfo.total} (${gpayConfig.currency})`
                            : `Total: ৳ ${ticketInfo.total} (${gpayConfig.currency})`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── Invoice Link Display (shown after invoice creation) ─── */}
                {paymentMethod === 'invoice' && invoiceData && (
                  <div className="mt-4 space-y-3">
                    <Separator />
                    <div className="pt-2 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                          {isBn ? 'পেমেন্ট লিংক' : 'Payment Link'}
                        </span>
                      </div>

                      {/* Invoice link */}
                      <div className="flex items-center gap-2 mb-3">
                        <Input
                          readOnly
                          value={invoiceData.pay_url}
                          className="text-sm bg-white dark:bg-background"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyLink}
                          className="flex items-center gap-1"
                        >
                          {copied ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}
                        </Button>
                      </div>

                      {/* Open link button */}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => window.open(invoiceData.pay_url, '_blank')}
                        className="w-full flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {isBn ? 'পেমেন্ট পৃষ্ঠা খুলুন' : 'Open Payment Page'}
                      </Button>

                      {/* Invoice details */}
                      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>{isBn ? 'ইনভয়েস আইডি' : 'Invoice ID'}</span>
                          <span className="font-medium">{invoiceData.invoice_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isBn ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}</span>
                          <span className="font-medium">{invoiceData.tran_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{isBn ? 'মোট পরিমাণ' : 'Total Amount'}</span>
                          <span className="font-medium">৳ {ticketInfo.total}</span>
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {isBn
                          ? 'এই লিংক শেয়ার করে পরে পেমেন্ট করতে পারেন'
                          : 'Share this link to pay later or with someone else'}
                      </p>
                    </div>
                  </div>
                )}

                {/* ─── Payment error ─── */}
                {errors.payment && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-3">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.payment}
                  </p>
                )}
                {errors.invoice && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-3">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.invoice}
                  </p>
                )}
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
              onClick={buttonConfig.action}
              disabled={buttonConfig.disabled}
            >
              {isSubmitting || invoiceLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isSubmitting
                    ? (isBn ? 'প্রক্রিয়াকরণ...' : 'Processing...')
                    : (isBn ? 'ইনভয়েস তৈরি হচ্ছে...' : 'Creating Invoice...')
                  }
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {paymentMethod === 'invoice' && !invoiceData ? (
                    <Link2 className="h-4 w-4" />
                  ) : paymentMethod === 'invoice' && invoiceData ? (
                    <ExternalLink className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {buttonConfig.text}
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
