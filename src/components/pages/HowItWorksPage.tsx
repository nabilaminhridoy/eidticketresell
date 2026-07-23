'use client';

import { useLanguageStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  CheckCircle,
  CreditCard,
  Ticket,
  Upload,
  ShieldCheck,
  DollarSign,
  Wallet,
  ArrowRight,
  Star,
  Clock,
  HeadphonesIcon,
  Verified,
  Lock,
} from 'lucide-react';
import { useNav } from '@/lib/use-nav';

export default function HowItWorksPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const cls = isBn ? 'font-bangla' : '';
  const { navigate } = useNav();

  // Buyer steps data
  const buyerSteps = [
    {
      icon: Search,
      num: '1',
      title: isBn ? 'সার্চ ও ব্রাউজ' : 'Search & Browse',
      desc: isBn
        ? 'আমাদের প্ল্যাটফর্মে যানবাহনের ধরন, রুট ও তারিখ দিয়ে টিকেট সার্চ করুন। বাস, ট্রেন, ফ্লাইট ও লঞ্চ — সব ধরনের টিকেট এক জায়গায় পাবেন। আপনার যাত্রার তারিখ ও গন্তব্য অনুযায়ী সহজে টিকেট খুঁজে নিন।'
        : 'Search for tickets by transport type, route, and date on our platform. Bus, Train, Flight & Launch — find all ticket types in one place. Easily discover tickets matching your travel date and destination.',
      color: 'bg-green-500',
    },
    {
      icon: CheckCircle,
      num: '2',
      title: isBn ? 'নির্বাচন ও যাচাই' : 'Select & Verify',
      desc: isBn
        ? 'পছন্দের টিকেট নির্বাচন করুন এবং PNR নম্বর যাচাই করুন। টিকেটের বিস্তারিত তথ্য, বিক্রেতার রেটিং ও যাত্রার সকল বিবরণ দেখুন। ভুল টিকেট কেনার ঝুঁকি এড়িয়ে নিরাপদে যাচাই করুন।'
        : 'Choose your preferred ticket and verify the PNR number. View detailed ticket info, seller ratings, and complete journey details. Avoid the risk of buying invalid tickets by verifying before purchase.',
      color: 'bg-orange-500',
    },
    {
      icon: CreditCard,
      num: '3',
      title: isBn ? 'নিরাপদ পেমেন্ট' : 'Secure Payment',
      desc: isBn
        ? 'bKash, SSLCommerz ও অন্যান্য জনপ্রিয় পেমেন্ট মাধ্যম দিয়ে পেমেন্ট করুন। আপনার পেমেন্ট এসক্রো সুরক্ষায় রাখা হয় — যাত্রা সম্পন্ন হলেই বিক্রেতা পেমেন্ট পান। আপনার অর্থ সম্পূর্ণ নিরাপদ।'
        : 'Pay via bKash, SSLCommerz, and other popular payment methods. Your payment is held under escrow protection — the seller receives payment only after the journey is completed. Your money stays completely secure.',
      color: 'bg-blue-500',
    },
    {
      icon: Ticket,
      num: '4',
      title: isBn ? 'টিকেট গ্রহণ ও যাত্রা' : 'Receive & Travel',
      desc: isBn
        ? 'পেমেন্ট সম্পন্ন হলে টিকেট কনফিরমেশন পান। ই-টিকেট বা ডিজিটাল কপি সরাসরি আপনার অ্যাকাউন্টে পৌঁছে যায়। নিরাপদে ও আত্মবিশ্বাসে যাত্রা করুন — প্রয়োজনে 24/7 সাহায্য পান।'
        : 'Receive your ticket confirmation once payment is processed. The e-ticket or digital copy arrives directly in your account. Travel safely and confidently — with 24/7 support available whenever needed.',
      color: 'bg-purple-500',
    },
  ];

  // Seller steps data
  const sellerSteps = [
    {
      icon: Upload,
      num: '1',
      title: isBn ? 'টিকেট তালিকাভুক্ত করুন' : 'List Your Ticket',
      desc: isBn
        ? 'আপনার অতিরিক্ত বা ব্যবহার না হওয়া টিকেট তালিকাভুক্ত করুন। যানবাহনের ধরন, রুট, তারিখ, সিট নম্বর ও PNR দিয়ে সহজে টিকেট যোগ করুন।'
        : 'List your extra or unused tickets on our platform. Easily add ticket details including transport type, route, date, seat number, and PNR.',
    },
    {
      icon: Verified,
      num: '2',
      title: isBn ? 'KYC যাচাই' : 'KYC Verification',
      desc: isBn
        ? 'বিক্রেতা হতে NID ও মুখের ছবি দিয়ে KYC যাচাই সম্পন্ন করুন। যাচাইকৃত বিক্রেতার টিকেট ক্রেতারা বেশি পছন্দ করে এবং দ্রুত বিক্রি হয়।'
        : 'Complete KYC verification with your NID and facial photo to become a verified seller. Verified sellers attract more buyers and sell tickets faster.',
    },
    {
      icon: DollarSign,
      num: '3',
      title: isBn ? 'মূল্য নির্ধারণ' : 'Set Your Price',
      desc: isBn
        ? 'টিকেটের মূল্য নির্ধারণ করুন। মূল মূল্যের উপরে বা নিচে মূল্য সেট করা যায়। আমাদের মূল্য নির্ধারণ টুল মার্কেট রেট অনুযায়ী সুপারিশ দেয়।'
        : 'Set your ticket price. You can price above or below the original fare. Our pricing tool recommends rates based on current market demand and trends.',
    },
    {
      icon: Wallet,
      num: '4',
      title: isBn ? 'পেমেন্ট গ্রহণ' : 'Receive Payment',
      desc: isBn
        ? 'ক্রেতার যাত্রা সম্পন্ন হলে এসক্রো থেকে পেমেন্ট আপনার অ্যাকাউন্টে স্থানান্তর হয়। bKash, ব্যাংক ট্রান্সফার ও অন্যান্য মাধ্যমে পেমেন্ট পান।'
        : 'Once the buyer completes their journey, the escrow payment is transferred to your account. Receive payments via bKash, bank transfer, and other methods.',
    },
  ];

  // Benefits data
  const benefits = [
    {
      icon: Lock,
      title: isBn ? 'এসক্রো সুরক্ষা' : 'Escrow Protection',
      desc: isBn
        ? 'পেমেন্ট যাত্রা শেষ হওয়া পর্যন্ত নিরাপদে রাখা হয়। ক্রেতা ও বিক্রেতা উভয়ের অর্থ সুরক্ষিত।'
        : 'Payments are securely held until the journey is completed. Both buyer and seller funds are protected.',
    },
    {
      icon: Verified,
      title: isBn ? 'যাচাইকৃত বিক্রেতা' : 'Verified Sellers',
      desc: isBn
        ? 'প্রতিটি বিক্রেতা KYC যাচাই প্রক্রিয়া সম্পন্ন করে। ভুল টিকেট বিক্রির ঝুঁকি নেই।'
        : 'Every seller completes our KYC verification process. No risk of fraudulent or fake ticket sales.',
    },
    {
      icon: Clock,
      title: isBn ? 'তাৎক্ষণিক কনফিরমেশন' : 'Instant Confirmation',
      desc: isBn
        ? 'পেমেন্ট সম্পন্ন হলে সাথে সাথে টিকেট কনফিরমেশন পান। দীর্ঘ অপেক্ষা নেই।'
        : 'Receive ticket confirmation immediately after payment. No long waiting periods.',
    },
    {
      icon: HeadphonesIcon,
      title: isBn ? '24/7 সাহায্য' : '24/7 Support',
      desc: isBn
        ? 'দিনরাত যেকোনো সময় সাহায্য পান। ফোন, ইমেইল ও চ্যাট সাহায্য উপলব্ধ।'
        : 'Get help anytime, day or night. Phone, email, and chat support available around the clock.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <Badge className="mb-4 bg-green-600 text-white hover:bg-green-700">
          {isBn ? 'সহজ ও নিরাপদ' : 'Easy & Secure'}
        </Badge>
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${cls}`}>
          {isBn ? 'কিভাবে কাজ করে' : 'How It Works'}
        </h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${cls}`}>
          {isBn
            ? 'ঈদ টিকেট রিসেলে টিকেট কেনাবেচা সহজ ও নিরাপদ। কয়েকটি সহজ পদক্ষেপে আপনার যাত্রার টিকেট নিশ্চিত করুন।'
            : 'Buying and selling tickets on Eid Ticket Resell is easy and secure. Confirm your travel tickets in a few simple steps.'}
        </p>
      </div>

      {/* Buyer Steps */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-8 bg-green-600 rounded-full" />
          <h2 className={`text-2xl font-bold ${cls}`}>
            {isBn ? 'টিকেট ক্রেতাদের জন্য' : 'For Ticket Buyers'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buyerSteps.map((step) => {
            const IconComp = step.icon;
            return (
              <Card key={step.num} className="hover:shadow-md transition-shadow border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center shrink-0`}>
                      <span className="text-white font-bold text-lg">{step.num}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComp className="w-5 h-5 text-primary" />
                        <h3 className={`font-semibold text-lg ${cls}`}>{step.title}</h3>
                      </div>
                      <p className={`text-muted-foreground text-sm leading-relaxed ${cls}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Seller Steps */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
          <h2 className={`text-2xl font-bold ${cls}`}>
            {isBn ? 'টিকেট বিক্রেতাদের জন্য' : 'For Ticket Sellers'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sellerSteps.map((step) => {
            const IconComp = step.icon;
            return (
              <Card key={step.num} className="hover:shadow-md transition-shadow border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-lg">{step.num}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComp className="w-5 h-5 text-orange-500" />
                        <h3 className={`font-semibold text-lg ${cls}`}>{step.title}</h3>
                      </div>
                      <p className={`text-muted-foreground text-sm leading-relaxed ${cls}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => navigate('sell-ticket')}
          >
            {isBn ? 'টিকেট বিক্রি শুরু করুন' : 'Start Selling Tickets'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${cls}`}>
            {isBn ? 'আমাদের সুবিধাসমূহ' : 'Our Benefits'}
          </h2>
          <p className={`text-muted-foreground ${cls}`}>
            {isBn
              ? 'প্রতিটি লেনদেন নিরাপদ, স্বচ্ছ ও দ্রুত'
              : 'Every transaction is secure, transparent, and fast'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => {
            const IconComp = benefit.icon;
            return (
              <Card key={benefit.title} className="hover:shadow-md transition-shadow border-primary/10 text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComp className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className={`font-semibold mb-2 ${cls}`}>{benefit.title}</h3>
                  <p className={`text-muted-foreground text-sm leading-relaxed ${cls}`}>
                    {benefit.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <Card className="bg-gradient-to-r from-green-600 to-orange-500 text-white border-0">
          <CardContent className="p-8">
            <h2 className={`text-2xl font-bold mb-3 ${cls}`}>
              {isBn ? 'আজই শুরু করুন!' : 'Get Started Today!'}
            </h2>
            <p className={`mb-6 text-white/90 ${cls}`}>
              {isBn
                ? 'ঈদে নিরাপদ যাত্রার জন্য টিকেট কিনুন বা অতিরিক্ত টিকেট বিক্রি করুন'
                : 'Buy tickets for safe Eid travel or sell your extra tickets'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="secondary"
                className="bg-white text-green-600 hover:bg-white/90 font-semibold"
                onClick={() => navigate('search')}
              >
                {isBn ? 'টিকেট কিনুন' : 'Buy Tickets'}
                <Search className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold"
                onClick={() => navigate('sell-ticket')}
              >
                {isBn ? 'টিকেট বিক্রি করুন' : 'Sell Tickets'}
                <Upload className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
