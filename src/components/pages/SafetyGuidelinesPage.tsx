'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  Shield,
  Eye,
  CheckCircle,
  CreditCard,
  Star,
  AlertTriangle,
  UserCheck,
  Camera,
  Lock,
  MessageSquare,
  Bus,
  Train,
  Plane,
  Ship,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileText,
  Ban,
  HandCoins,
  CircleDot,
  Verified,
  Clock,
  HeadphonesIcon,
} from 'lucide-react';

export default function SafetyGuidelinesPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const cls = isBn ? 'font-bangla' : '';

  const [dbPage, setDbPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    fetch('/api/page-content?slug=safety-guidelines')
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout);
        if (data.page) setDbPage(data.page);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  // Parse API content
  let dbContent: any = null;
  let dbContentBn: any = null;
  try {
    dbContent = dbPage?.content ? JSON.parse(dbPage.content) : null;
    dbContentBn = dbPage?.contentBn ? JSON.parse(dbPage.contentBn) : null;
  } catch { /* ignore */ }

  const apiContent = isBn ? (dbContentBn || dbContent) : (dbContent || dbContentBn);

  // Icon mapping for tip items (used for both API and default data)
  const iconMap: Record<string, React.ElementType> = {
    Eye, CheckCircle, CreditCard, Ban, Star, AlertTriangle,
    Lock, UserCheck, HandCoins, Camera, MessageSquare, FileText,
    Shield, Verified, Clock, HeadphonesIcon, Phone, Mail, MapPin,
    Heart, Bus, Train, Plane, Ship,
  };

  // Helper to resolve icon from API data or fallback
  const resolveIcon = (iconName: string | undefined, fallbackIcon: React.ElementType): React.ElementType => {
    if (!iconName) return fallbackIcon;
    return iconMap[iconName] || fallbackIcon;
  };

  // Helper to merge tip arrays
  const mergeTips = (defaults: any[], apiTips: any[] | null) => {
    if (!apiTips) return defaults;
    return defaults.map((d, i) => ({
      ...d,
      icon: resolveIcon(apiTips[i]?.icon, d.icon),
      title: apiTips[i]?.title || d.title,
      desc: apiTips[i]?.desc || apiTips[i]?.description || d.desc,
    }));
  };

  // Default buyer tips (fallback)
  const defaultBuyerTips = [
    {
      icon: Eye,
      title: isBn ? 'টিকেট যাচাই করুন' : 'Verify the Ticket',
      desc: isBn ? 'কেনার আগে টিকেটের PNR নম্বর আমাদের যাচাই টুল দিয়ে চেক করুন। নকল টিকেট থেকে বিরত থাকুন।' : 'Before buying, verify the ticket PNR number using our verification tool. Avoid counterfeit tickets.',
    },
    {
      icon: CheckCircle,
      title: isBn ? 'PNR যাচাই করুন' : 'Check PNR Status',
      desc: isBn ? 'PNR নম্বর যানবাহন কোম্পানির অফিসিয়াল ওয়েবসাইটে যাচাই করুন। টিকেট সত্যিকারের হলে তবেই কেনাকাটা সম্পন্ন করুন।' : 'Cross-check the PNR number on the transport company\'s official website. Only proceed with purchase if the ticket is genuine.',
    },
    {
      icon: CreditCard,
      title: isBn ? 'এসক্রো পেমেন্ট ব্যবহার করুন' : 'Use Escrow Payment',
      desc: isBn ? 'সরাসরি বিক্রেতাকে পেমেন্ট না করে প্ল্যাটফর্মের এসক্রো সিস্টেম ব্যবহার করুন। যাত্রা সম্পন্ন হলেই পেমেন্ট বিক্রেতাকে যায়।' : 'Always use the platform\'s escrow system instead of paying the seller directly. Payment goes to the seller only after the journey is completed.',
    },
    {
      icon: Ban,
      title: isBn ? 'প্ল্যাটফর্মের বাইরে পেমেন্ট করবেন না' : 'Don\'t Pay Outside Platform',
      desc: isBn ? 'বিক্রেতা যদি প্ল্যাটফর্মের বাইরে পেমেন্ট চায়, তা গ্রহণ করবেন না। বাইরে পেমেন্ট করলে আপনার সুরক্ষা থাকবে না।' : 'Never accept a seller\'s request to pay outside the platform. Payments made outside the platform have no protection.',
    },
    {
      icon: Star,
      title: isBn ? 'বিক্রেতার রেটিং দেখুন' : 'Check Seller Rating',
      desc: isBn ? 'টিকেট কেনার আগে বিক্রেতার রেটিং ও রিভিউ পড়ুন। উচ্চ রেটিং ও ভালো রিভিউ নির্ভরযোগ্য বিক্রেতার প্রমাণ।' : 'Read seller ratings and reviews before purchasing. High ratings and good reviews indicate a trustworthy seller.',
    },
    {
      icon: AlertTriangle,
      title: isBn ? 'সন্দেহজনক কার্যকলাপ রিপোর্ট করুন' : 'Report Suspicious Activity',
      desc: isBn ? 'কোনো বিক্রেতা সন্দেহজনক মনে হলে অবিলম্বে রিপোর্ট করুন। আমাদের সাহায্য দল দ্রুত তদন্ত করবে।' : 'If any seller seems suspicious, report them immediately. Our support team will investigate promptly.',
    },
  ];

  // Default seller tips (fallback)
  const defaultSellerTips = [
    {
      icon: Lock,
      title: isBn ? 'ব্যক্তিগত তথ্য শেয়ার করবেন না' : 'Don\'t Share Personal Information',
      desc: isBn ? 'ফোন নম্বর, ঠিকানা বা অন্য ব্যক্তিগত তথ্য ক্রেতার সাথে শেয়ার করবেন না। সকল যোগাযোগ প্ল্যাটফর্মের মাধ্যমে করুন।' : 'Never share your phone number, address, or other personal details with buyers. Conduct all communication through the platform.',
    },
    {
      icon: UserCheck,
      title: isBn ? 'ক্রেতা যাচাই করুন' : 'Verify the Buyer',
      desc: isBn ? 'ক্রেতার প্রোফাইল ও রেটিং দেখুন। নতুন বা যাচাইহীন ক্রেতার সাথে সতর্ক থাকুন।' : 'Review the buyer\'s profile and ratings. Be cautious with new or unverified buyers.',
    },
    {
      icon: HandCoins,
      title: isBn ? 'প্ল্যাটফর্ম পেমেন্ট ব্যবহার করুন' : 'Use Platform Payment',
      desc: isBn ? 'প্ল্যাটফর্মের পেমেন্ট সিস্টেম ব্যবহার করুন যাতে এসক্রো সুরক্ষা পান। সরাসরি পেমেন্ট গ্রহণে সুরক্ষা নেই।' : 'Use the platform\'s payment system to get escrow protection. Accepting direct payments has no security guarantee.',
    },
    {
      icon: Camera,
      title: isBn ? 'স্ক্রিনশট সংরক্ষণ করুন' : 'Keep Screenshots',
      desc: isBn ? 'সকল চ্যাট বার্তা, পেমেন্ট রিসিপি ও টিকেটের স্ক্রিনশট রাখুন। কোনো সমস্যা হলে এগুলো প্রমাণ হিসেবে কাজ করবে।' : 'Keep screenshots of all chat messages, payment receipts, and tickets. These serve as evidence if any issue arises.',
    },
    {
      icon: MessageSquare,
      title: isBn ? 'হয়রানি রিপোর্ট করুন' : 'Report Harassment',
      desc: isBn ? 'ক্রেতা যদি হয়রানি করে বা অনুপযুক্ত বার্তা পাঠায়, অবিলম্বে রিপোর্ট করুন। আমরা বিক্রেতার সুরক্ষা নিশ্চিত করি।' : 'If a buyer harasses you or sends inappropriate messages, report them immediately. We protect seller safety.',
    },
    {
      icon: FileText,
      title: isBn ? 'সকল নীতি পড়ুন' : 'Read All Policies',
      desc: isBn ? 'প্ল্যাটফর্মের সেবার শর্ত, পেমেন্ট নীতি ও ফেরত নীতি ভালোভাবে পড়ুন। সকল নিয়ম জানলে সমস্যা কম হবে।' : 'Read the platform\'s Terms of Service, Payment Policy, and Refund Policy thoroughly. Knowing all rules helps avoid problems.',
    },
  ];

  const buyerTips = mergeTips(defaultBuyerTips, apiContent?.buyerTips || null);
  const sellerTips = mergeTips(defaultSellerTips, apiContent?.sellerTips || null);

  // Transport safety (fallback) - merge with API data
  const defaultTransportSafety = [
    {
      icon: Bus,
      type: isBn ? 'বাস' : 'Bus',
      tips: isBn
        ? ['বাসের নির্ধারিত সময় ও রুট যাচাই করুন', 'বাস কোম্পানির নাম ও নিবন্ধন নম্বর চেক করুন', 'বোর্ডিং পয়েন্ট ও ড্রপ-অফ পয়েন্ট নিশ্চিত করুন', 'AC/Non-AC সিট টাইপ যাচাই করুন', 'প্রস্থান সময় আগে বাস স্ট্যান্ডে পৌঁছান']
        : ['Verify the bus schedule and route', 'Check the bus company name and registration number', 'Confirm boarding and drop-off points', 'Verify AC/Non-AC seat type', 'Arrive at the bus stand before departure time'],
    },
    {
      icon: Train,
      type: isBn ? 'ট্রেন' : 'Train',
      tips: isBn
        ? ['PNR নম্বর বাংলাদেশ রেলওয়ে ওয়েবসাইটে যাচাই করুন', 'কোচ ও সিট নম্বর নিশ্চিত করুন', 'শোভন/স্নিগ্ধা/একান্ত ক্যাটাগরি মিল করুন', 'যাত্রা শুরুর স্টেশন ও সময় দেখুন', 'ট্রেন স্টেশনে আগে পৌঁছান']
        : ['Verify PNR on Bangladesh Railway website', 'Confirm coach and seat number', 'Match Shobhon/Snigdha/Ekanta category', 'Check departure station and time', 'Arrive at the station early'],
    },
    {
      icon: Plane,
      type: isBn ? 'ফ্লাইট' : 'Flight',
      tips: isBn
        ? ['ফ্লাইট নম্বর ও এয়ারলাইন্স যাচাই করুন', 'বোর্ডিং পাস ও ই-টিকেট মিল করুন', 'চেক-ইন সময় ও গেট নম্বর নিশ্চিত করুন', 'বিমানবন্দরে 2-3 ঘণ্টা আগে পৌঁছান', 'লাগেজ নিয়মাবলী জানুন']
        : ['Verify flight number and airline', 'Match boarding pass with e-ticket', 'Confirm check-in time and gate number', 'Arrive at airport 2-3 hours before', 'Know luggage regulations'],
    },
    {
      icon: Ship,
      type: isBn ? 'লঞ্চ' : 'Launch',
      tips: isBn
        ? ['লঞ্চ নাম ও রুট যাচাই করুন', 'ডেক/কেবিন টাইপ নিশ্চিত করুন', 'BIWTA অফিসিয়াল সময়সূচি মিল করুন', 'ঘাটে আগে পৌঁছান', 'জলযাত্রায় সতর্কতা অবলম্বন করুন']
        : ['Verify launch name and route', 'Confirm deck/cabin type', 'Match schedule with BIWTA official timetable', 'Arrive at the ghat early', 'Follow water travel safety precautions'],
    },
  ];

  const transportSafety = apiContent?.transportSafety
    ? defaultTransportSafety.map((d, i) => ({
      ...d,
      type: apiContent.transportSafety[i]?.type || d.type,
      tips: apiContent.transportSafety[i]?.tips || d.tips,
    }))
    : defaultTransportSafety;

  // Emergency contacts (fallback)
  const defaultEmergencyContacts = [
    { icon: Phone, label: isBn ? 'জাতীয় হেল্পলাইন' : 'National Helpline', number: '999' },
    { icon: Phone, label: isBn ? 'পুলিশ হেল্পলাইন' : 'Police Helpline', number: '100' },
    { icon: Phone, label: isBn ? 'ফায়ার সার্ভিস' : 'Fire Service', number: '102' },
    { icon: Phone, label: isBn ? 'এমবুলেন্স' : 'Ambulance', number: '103' },
    { icon: Phone, label: isBn ? 'রেলওয়ে হেল্পলাইন' : 'Railway Helpline', number: '0800-000001' },
    { icon: Phone, label: isBn ? 'বিমানবন্দর হেল্পলাইন' : 'Airport Helpline', number: '02-7911042' },
  ];

  const emergencyContacts = apiContent?.emergencyContacts
    ? apiContent.emergencyContacts.map((ec: any, i: number) => ({
      ...defaultEmergencyContacts[i],
      icon: resolveIcon(ec.icon, Phone),
      label: ec.label || defaultEmergencyContacts[i]?.label,
      number: ec.number || defaultEmergencyContacts[i]?.number,
    }))
    : defaultEmergencyContacts;

  // Hero text
  const heroTitle = dbPage ? (isBn ? (dbPage.titleBn || dbPage.title) : dbPage.title) : (isBn ? 'নিরাপত্তা নির্দেশিকা' : 'Safety Guidelines');
  const heroSubtitle = apiContent?.heroSubtitle
    ? (isBn ? (apiContent.heroSubtitle || 'নিরাপদ টিকেট কেনাবেচার জন্য এই নির্দেশিকা অনুসরণ করুন। ক্রেতা ও বিক্রেতা উভয়ের সুরক্ষা নিশ্চিত করুন।') : apiContent.heroSubtitle)
    : (isBn ? 'নিরাপদ টিকেট কেনাবেচার জন্য এই নির্দেশিকা অনুসরণ করুন। ক্রেতা ও বিক্রেতা উভয়ের সুরক্ষা নিশ্চিত করুন।' : 'Follow these guidelines for safe ticket buying and selling. Ensure protection for both buyers and sellers.');

  // Warning text
  const warningTitle = apiContent?.warningTitle
    ? (isBn ? (apiContent.warningTitle || 'গুরুত্বপূর্ণ সতর্কতা') : apiContent.warningTitle)
    : (isBn ? 'গুরুত্বপূর্ণ সতর্কতা' : 'Important Warning');
  const warningDesc = apiContent?.warningDesc
    ? (isBn ? (apiContent.warningDesc || 'কোনো ব্যবহারকারী যদি প্ল্যাটফর্মের বাইরে পেমেন্ট চায়, ব্যক্তিগত তথ্য দাবি করে, বা সন্দেহজনক আচরণ করে — অবিলম্বে রিপোর্ট করুন। আমাদের সাহায্য দল 24/7 উপলব্ধ। প্ল্যাটফর্মের এসক্রো সিস্টেম ব্যবহার না করে পেমেন্ট করলে আপনার সুরক্ষা নেই।') : apiContent.warningDesc)
    : (isBn ? 'কোনো ব্যবহারকারী যদি প্ল্যাটফর্মের বাইরে পেমেন্ট চায়, ব্যক্তিগত তথ্য দাবি করে, বা সন্দেহজনক আচরণ করে — অবিলম্বে রিপোর্ট করুন। আমাদের সাহায্য দল 24/7 উপলব্ধ। প্ল্যাটফর্মের এসক্রো সিস্টেম ব্যবহার না করে পেমেন্ট করলে আপনার সুরক্ষা নেই।' : 'If any user requests payment outside the platform, demands personal information, or behaves suspiciously — report them immediately. Our support team is available 24/7. Payments made without using the platform\'s escrow system have no protection.');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <Badge className="mb-4 bg-green-600 text-white hover:bg-green-700">
          {isBn ? 'আপনার সুরক্ষা আমাদের প্রথম দায়িত্ব' : 'Your Safety Is Our Priority'}
        </Badge>
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${cls}`}>
          {heroTitle}
        </h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${cls}`}>
          {heroSubtitle}
        </p>
      </div>

      {/* Buyer Safety Tips */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-8 bg-green-600 rounded-full" />
          <ShieldCheck className="w-6 h-6 text-green-600" />
          <h2 className={`text-2xl font-bold ${cls}`}>
            {apiContent?.buyerTitle ? (isBn ? (apiContent.buyerTitle) : apiContent.buyerTitle) : (isBn ? 'ক্রেতাদের নিরাপত্তা টিপস' : 'Buyer Safety Tips')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {buyerTips.map((tip, i) => {
            const IconComp = tip.icon;
            return (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-600/10 rounded-full flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className={`font-semibold ${cls}`}>{tip.title}</h3>
                  </div>
                  <p className={`text-muted-foreground text-sm leading-relaxed ${cls}`}>
                    {tip.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Seller Safety Tips */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
          <ShieldCheck className="w-6 h-6 text-orange-500" />
          <h2 className={`text-2xl font-bold ${cls}`}>
            {apiContent?.sellerTitle ? (isBn ? (apiContent.sellerTitle) : apiContent.sellerTitle) : (isBn ? 'বিক্রেতাদের নিরাপত্তা টিপস' : 'Seller Safety Tips')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellerTips.map((tip, i) => {
            const IconComp = tip.icon;
            return (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className={`font-semibold ${cls}`}>{tip.title}</h3>
                  </div>
                  <p className={`text-muted-foreground text-sm leading-relaxed ${cls}`}>
                    {tip.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Transport-Specific Safety */}
      <section className="mb-10">
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${cls}`}>
            {apiContent?.transportTitle ? (isBn ? (apiContent.transportTitle) : apiContent.transportTitle) : (isBn ? 'যানবাহন ভিত্তিক নিরাপত্তা' : 'Transport-Specific Safety')}
          </h2>
          <p className={`text-muted-foreground ${cls}`}>
            {apiContent?.transportSubtitle ? (isBn ? (apiContent.transportSubtitle) : apiContent.transportSubtitle) : (isBn ? 'প্রতিটি যানবাহনের জন্য বিশেষ নিরাপত্তা নির্দেশিকা' : 'Specific safety guidelines for each transport type')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transportSafety.map((ts) => {
            const IconComp = ts.icon;
            return (
              <Card key={ts.type} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 text-lg ${cls}`}>
                    <IconComp className="w-5 h-5 text-primary" />
                    {ts.type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {ts.tips.map((tip, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm ${cls}`}>
                        <CircleDot className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${cls}`}>
            {apiContent?.emergencyTitle ? (isBn ? (apiContent.emergencyTitle) : apiContent.emergencyTitle) : (isBn ? 'জরুরি যোগাযোগ' : 'Emergency Contacts')}
          </h2>
          <p className={`text-muted-foreground ${cls}`}>
            {apiContent?.emergencySubtitle ? (isBn ? (apiContent.emergencySubtitle) : apiContent.emergencySubtitle) : (isBn ? 'বাংলাদেশের জরুরি সেবা নম্বর' : 'Bangladesh Emergency Service Numbers')}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {emergencyContacts.map((ec, i) => {
            const IconComp = ec.icon;
            return (
              <Card key={i} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <IconComp className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className={`font-medium text-sm mb-1 ${cls}`}>{ec.label}</p>
                  <p className="text-lg font-bold text-primary">{ec.number}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Important Notice */}
      <section>
        <Card className="border-red-500/30 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h3 className={`font-semibold mb-2 ${cls}`}>
                  {warningTitle}
                </h3>
                <p className={`text-sm text-muted-foreground leading-relaxed ${cls}`}>
                  {warningDesc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
