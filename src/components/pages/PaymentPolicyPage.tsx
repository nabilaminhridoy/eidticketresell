'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard, ShieldCheck, Lock, Clock, AlertTriangle,
  Globe, Receipt, CheckCircle2, ArrowRight, Wallet,
  Banknote, Smartphone, BadgeCheck
} from 'lucide-react';

// Helper: pick value from API data or fallback
function pick<T>(apiEn: T | undefined | null, apiBn: T | undefined | null, fallbackEn: T, fallbackBn: T, isBn: boolean): T {
  if (isBn) return apiBn ?? apiEn ?? fallbackBn;
  return apiEn ?? apiBn ?? fallbackEn;
}

export default function PaymentPolicyPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [dbPage, setDbPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    fetch('/api/page-content?slug=payment-policy')
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

  const content = {
    hero: {
      title: pick(dbContent?.hero?.title, dbContentBn?.hero?.title, dbPage ? dbPage.title : 'Payment Policy', dbPage ? (dbPage.titleBn || dbPage.title) : 'পেমেন্ট নীতি', isBn),
      subtitle: pick(dbContent?.hero?.subtitle, dbContentBn?.hero?.subtitle, 'Complete information about how payments work on Eid Ticket Resell', 'ঈদ টিকেট রিসেলে পেমেন্ট কিভাবে কাজ করে, সেই সম্পর্কে সম্পূর্ণ তথ্য', isBn),
    },
    lastUpdated: pick(dbContent?.lastUpdated, dbContentBn?.lastUpdated, 'Last Updated: March 1, 2025', 'সর্বশেষ আপডেট: ১ মার্চ, ২০২৫', isBn),

    s1Title: pick(dbContent?.s1Title, dbContentBn?.s1Title, '1. Accepted Payment Methods', '১. গ্রহণযোগ্য পেমেন্ট পদ্ধতি', isBn),
    s1Intro: pick(dbContent?.s1Intro, dbContentBn?.s1Intro, 'Eid Ticket Resell supports the major payment methods in Bangladesh so every user can transact easily and securely.', 'ঈদ টিকেট রিসেল বাংলাদেশের প্রধান পেমেন্ট পদ্ধতি সমর্থন করে যাতে প্রতিটি ব্যবহারকারী সহজে ও নিরাপদে লেনদেন করতে পারেন।', isBn),
    bKashTitle: pick(dbContent?.bKashTitle, dbContentBn?.bKashTitle, 'bKash', 'বিকাশ', isBn),
    bKashDesc: pick(dbContent?.bKashDesc, dbContentBn?.bKashDesc, 'Bangladesh\'s most popular mobile financial service. You can pay directly from your bKash account. Authorize with your payment PIN and receive instant confirmation.', 'বাংলাদেশের সবচেয়ে জনপ্রিয় মোবাইল ফাইন্যান্সিয়াল সার্ভিস। বিকাশ অ্যাকাউন্ট থেকে সরাসরি পেমেন্ট করতে পারবেন। পেমেন্ট পিন দিয়ে অনুমোদন করুন এবং তাৎক্ষণিক কনফিরমেশন পান।', isBn),
    sslTitle: pick(dbContent?.sslTitle, dbContentBn?.sslTitle, 'SSLCommerz', 'SSLCommerz', isBn),
    sslDesc: pick(dbContent?.sslDesc, dbContentBn?.sslDesc, 'Bangladesh\'s premier payment gateway supporting the following methods:', 'বাংলাদেশের প্রধান পেমেন্ট গেটওয়ে যা নিম্নলিখিত পদ্ধতি সমর্থন করে:', isBn),
    sslMethods: (isBn ? (dbContentBn?.sslMethods || dbContent?.sslMethods) : (dbContent?.sslMethods || dbContentBn?.sslMethods)) || (isBn
      ? ['ভিসা (Visa) ক্রেডিট/ডেবিট কার্ড', 'মাস্টারকার্ড (Mastercard) ক্রেডিট/ডেবিট কার্ড', 'আমেরিকান এক্সপ্রেস (Amex)', 'ডিবিবিল নেকাস (DBBL Nexus) কার্ড', 'মোবাইল ব্যাংকিং (বিকাশ, রকেট, নগদ, উপায়)', 'ইন্টারনেট ব্যাংকিং']
      : ['Visa Credit/Debit Cards', 'Mastercard Credit/Debit Cards', 'American Express (Amex)', 'DBBL Nexus Cards', 'Mobile Banking (bKash, Rocket, Nagad, Upay)', 'Internet Banking']),

    s2Title: pick(dbContent?.s2Title, dbContentBn?.s2Title, '2. Payment Process', '২. পেমেন্ট প্রক্রিয়া', isBn),
    s2Intro: pick(dbContent?.s2Intro, dbContentBn?.s2Intro, 'The payment process for purchasing a ticket follows these steps:', 'টিকেট ক্রয়ের পেমেন্ট প্রক্রিয়া নিম্নলিখিত ধাপে সম্পন্ন হয়:', isBn),
    steps: (isBn ? (dbContentBn?.steps || dbContent?.steps) : (dbContent?.steps || dbContentBn?.steps)) || (isBn
      ? [
        { n: 'ধাপ ১', t: 'টিকেট নির্বাচন', d: 'আপনার পছন্দের টিকেট নির্বাচন করুন এবং ক্রয় বিকল্পে ক্লিক করুন।' },
        { n: 'ধাপ ২', t: 'পেমেন্ট পদ্ধতি নির্বাচন', d: 'বিকাশ অথবা SSLCommerz (কার্ড/মোবাইল ব্যাংকিং) নির্বাচন করুন।' },
        { n: 'ধাপ ৩', t: 'পেমেন্ট অনুমোদন', d: 'পেমেন্ট পিন (বিকাশ) অথবা কার্ড তথ্য প্রদান করে পেমেন্ট অনুমোদন করুন।' },
        { n: 'ধাপ ৪', t: 'এসক্রো হোল্ড', d: 'পেমেন্ট নিরাপদে এসক্রোতে রাখা হয় — বিক্রেতা তাৎক্ষণিকভাবে পান না।' },
        { n: 'ধাপ ৫', t: 'টিকেট ডেলিভারি', d: 'বিক্রেতা টিকেট তথ্য প্রদান করেন এবং ক্রেতা যাচাই করেন।' },
        { n: 'ধাপ ৬', t: 'এসক্রো রিলিজ', d: 'যাত্রা সম্পন্ন হলে অথবা ক্রেতা নিশ্চিত করলে পেমেন্ট বিক্রেতাকে রিলিজ করা হয়।' },
      ]
      : [
        { n: 'Step 1', t: 'Select Ticket', d: 'Choose your desired ticket and click the purchase option.' },
        { n: 'Step 2', t: 'Choose Payment Method', d: 'Select bKash or SSLCommerz (card/mobile banking).' },
        { n: 'Step 3', t: 'Authorize Payment', d: 'Authorize by providing your payment PIN (bKash) or card details.' },
        { n: 'Step 4', t: 'Escrow Hold', d: 'Payment is securely held in escrow — the seller does not receive it immediately.' },
        { n: 'Step 5', t: 'Ticket Delivery', d: 'Seller provides ticket details and buyer verifies them.' },
        { n: 'Step 6', t: 'Escrow Release', d: 'Payment is released to the seller after journey completion or buyer confirmation.' },
      ]),

    s3Title: pick(dbContent?.s3Title, dbContentBn?.s3Title, '3. Escrow Protection System', '৩. এসক্রো সুরক্ষা ব্যবস্থা', isBn),
    s3Intro: pick(dbContent?.s3Intro, dbContentBn?.s3Intro, 'Our escrow system ensures payment security for both buyer and seller. The buyer\'s payment is held in escrow until the journey is completed.', 'আমাদের এসক্রো ব্যবস্থা ক্রেতা ও বিক্রেতা উভয়ের জন্য পেমেন্ট নিরাপত্তা নিশ্চিত করে। ক্রেতার পেমেন্ট যাত্রা সম্পন্ন হওয়া পর্যন্ত এসক্রোতে অবরুদ্ধ থাকে।', isBn),
    escrowPoints: (isBn ? (dbContentBn?.escrowPoints || dbContent?.escrowPoints) : (dbContent?.escrowPoints || dbContentBn?.escrowPoints)) || (isBn
      ? ['ক্রেতার পেমেন্ট লেনদেন শুরুতেই এসক্রোতে রাখা হয়', 'বিক্রেতা পেমেন্ট পান না যতক্ষণ না ক্রেতা টিকেট যাচাই করেন', 'যাত্রা সম্পন্ন হলে পেমেন্ট স্বয়ংক্রিয়ভাবে বিক্রেতাকে রিলিজ হয়', 'টিকেট সমস্যা হলে ক্রেতা পেমেন্ট ফেরতের অনুরোধ করতে পারেন', 'বিবাদ উঠলে প্ল্যাটফর্ম এসক্রো পেমেন্ট হোল্ড করে রাখে যতক্ষণ না সমাধান হয়', 'এসক্রো ব্যবস্থা প্ল্যাটফর্ম ফি প্রযোজ্য হওয়ার পর বিক্রেতাকে পেমেন্ট রিলিজ করে']
      : ['Buyer\'s payment is held in escrow at the start of the transaction', 'Seller does not receive payment until the buyer verifies the ticket', 'Payment is automatically released to the seller after journey completion', 'If there is a ticket issue, the buyer can request a refund', 'In case of dispute, the platform holds the escrow payment until resolution', 'The escrow system releases payment to the seller after platform fee is applied']),
    escrowReleaseTitle: pick(dbContent?.escrowReleaseTitle, dbContentBn?.escrowReleaseTitle, 'Escrow Release Conditions', 'এসক্রো রিলিজের শর্ত', isBn),
    escrowRelease: (isBn ? (dbContentBn?.escrowRelease || dbContent?.escrowRelease) : (dbContent?.escrowRelease || dbContentBn?.escrowRelease)) || (isBn
      ? ['ক্রেতা যাত্রা সম্পন্নের পর নিশ্চিত করেন ("কনফার্ম রিসিপশন" বাটন)', 'যাত্রা সম্পন্ন হওয়ার ২৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে রিলিজ', 'ক্রেতা কোনো অভিযোগ জানালে প্ল্যাটফর্ম তদন্ত করে সিদ্ধান্ত নেয়', 'তদন্ত ৭ কর্মদিবসের মধ্যে সম্পন্ন হয়']
      : ['Buyer confirms after journey completion ("Confirm Reception" button)', 'Automatic release 24 hours after journey completion', 'If the buyer raises a complaint, the platform investigates and decides', 'Investigation is completed within 7 business days']),

    s4Title: pick(dbContent?.s4Title, dbContentBn?.s4Title, '4. Platform Service Fee', '৪. প্ল্যাটফর্ম সার্ভিস ফি', isBn),
    s4Intro: pick(dbContent?.s4Intro, dbContentBn?.s4Intro, 'A 5% service fee applies to every successful transaction. This fee covers platform operations, escrow protection, and buyer-seller support.', 'প্রতিটি সফল লেনদেনে ৫% সার্ভিস ফি প্রযোজ্য। এই ফি প্ল্যাটফর্ম পরিচালনা, এসক্রো সুরক্ষা ও ক্রেতা-বিক্রেতা সহায়তার খরচ বহন করে।', isBn),
    feePoints: (isBn ? (dbContentBn?.feePoints || dbContent?.feePoints) : (dbContent?.feePoints || dbContentBn?.feePoints)) || (isBn
      ? ['ফি হল লেনদেনের মোট পরিমাণের ৫%', 'ফি বিক্রেতার প্রাপ্য পেমেন্ট থেকে কর্তন করা হয়', 'ক্রেতা পুরো পরিমাণ প্রদান করেন — ক্রেতার উপর কোনো অতিরিক্ত ফি নেই', 'ফি এসক্রো রিলিজের সময় স্বয়ংক্রিয়ভাবে কর্তন হয়', 'ফি ন্যূনতম ৳২০ (লেনদেনের পরিমাণ কম হলে)', 'ফি বাতিল/ফেরতের লেনদেনে প্রযোজ্য হয় না']
      : ['The fee is 5% of the total transaction amount', 'The fee is deducted from the seller\'s received payment', 'The buyer pays the full amount — no additional fee on the buyer', 'The fee is automatically deducted at escrow release', 'Minimum fee is ৳20 (for small transaction amounts)', 'The fee does not apply to cancelled/refunded transactions']),

    s5Title: pick(dbContent?.s5Title, dbContentBn?.s5Title, '5. Payment Security', '৫. পেমেন্ট নিরাপত্তা', isBn),
    s5Intro: pick(dbContent?.s5Intro, dbContentBn?.s5Intro, 'We use the best technology to ensure the security of every payment.', 'আমরা প্রতিটি পেমেন্টের নিরাপত্তা নিশ্চিত করতে শ্রেষ্ঠ প্রযুক্তি ব্যবহার করি।', isBn),
    securityPoints: (isBn ? (dbContentBn?.securityPoints || dbContent?.securityPoints) : (dbContent?.securityPoints || dbContentBn?.securityPoints)) || (isBn
      ? ['SSL/TLS এনক্রিপশন: সকল পেমেন্ট তথ্য ২৫৬-বিট SSL এনক্রিপশনে সুরক্ষিত', 'PCI DSS সম্মতি: আমাদের পেমেন্ট গেটওয়ে PCI DSS মান অনুসরণ করে', 'কার্ড তথ্য সংরক্ষণ নেই: আমরা কোনো কার্ড নম্বর সংরক্ষণ করি না', 'টোকেনাইজেশন: পেমেন্ট তথ্য টোকেন হিসেবে প্রক্রিয়াজাত হয়', 'দ্বি-পক্ষীয় যাচাই: বিকাশ পেমেন্টে OTP যাচাই প্রযোজ্য', 'নিরাপদ এসক্রো: পেমেন্ট যাত্রা পর্যন্ত অবরুদ্ধ থাকে']
      : ['SSL/TLS Encryption: All payment data is secured with 256-bit SSL encryption', 'PCI DSS Compliance: Our payment gateway follows PCI DSS standards', 'No Card Data Storage: We do not store any card numbers', 'Tokenization: Payment data is processed as tokens', 'Two-Factor Verification: OTP verification required for bKash payments', 'Secure Escrow: Payment is held locked until the journey']),

    s6Title: pick(dbContent?.s6Title, dbContentBn?.s6Title, '6. Failed Payments', '৬. ব্যর্থ পেমেন্ট', isBn),
    s6Intro: pick(dbContent?.s6Intro, dbContentBn?.s6Intro, 'Sometimes payments may fail for technical reasons. Learn what happens and what to do in this section.', 'কখনও কখনও পেমেন্ট প্রযুক্তিগত কারণে ব্যর্থ হতে পারে। এই অংশে জানুন কি হয় এবং কি করতে হবে।', isBn),
    failedPoints: (isBn ? (dbContentBn?.failedPoints || dbContent?.failedPoints) : (dbContent?.failedPoints || dbContentBn?.failedPoints)) || (isBn
      ? [{ t: 'ব্যর্থ পেমেন্টে কি হয়', d: 'পেমেন্ট ব্যর্থ হলে কোনো টাকা কর্তন হয় না। লেনদেন বাতিল হয় এবং টিকেট অর্ডার সম্পন্ন হয় না।' }, { t: 'পুনরায় চেষ্টা', d: 'আপনি অন্য পেমেন্ট পদ্ধতি ব্যবহার করে পুনরায় চেষ্টা করতে পারেন। "পেমেন্ট পুনরায় চেষ্টা" বাটনে ক্লিক করুন।' }, { t: 'অপ্রত্যাশিত কর্তন', d: 'যদি পেমেন্ট ব্যর্থ হলেও টাকা কর্তন হয়, তা ৩-৫ কর্মদিবসের মধ্যে স্বয়ংক্রিয়ভাবে ফেরত আসবে।' }, { t: 'সহায়তা', d: '৫ কর্মদিবসের মধ্যে ফেরত না পেলে support@eidticketresell.com যোগাযোগ করুন।' }]
      : [{ t: 'What happens on failure', d: 'If payment fails, no money is deducted. The transaction is cancelled and the ticket order is not completed.' }, { t: 'Retry process', d: 'You can retry using a different payment method. Click the "Retry Payment" button.' }, { t: 'Unexpected deduction', d: 'If money is deducted despite payment failure, it will be automatically refunded within 3-5 business days.' }, { t: 'Support', d: 'If you do not receive a refund within 5 business days, contact support@eidticketresell.com.' }]),

    s7Title: pick(dbContent?.s7Title, dbContentBn?.s7Title, '7. International Payments', '৭. আন্তর্জাতিক পেমেন্ট', isBn),
    s7Intro: pick(dbContent?.s7Intro, dbContentBn?.s7Intro, 'We currently do not support international payments. All transactions are completed in Bangladeshi Taka (BDT).', 'বর্তমানে আমরা আন্তর্জাতিক পেমেন্ট সমর্থন করি না। সকল লেনদেন বাংলাদেশি টাকা (BDT) এ সম্পন্ন হয়।', isBn),
    intlPoints: (isBn ? (dbContentBn?.intlPoints || dbContent?.intlPoints) : (dbContent?.intlPoints || dbContentBn?.intlPoints)) || (isBn
      ? ['শুধুমাত্র বাংলাদেশি পেমেন্ট পদ্ধতি গ্রহণযোগ্য', 'সকল লেনদেন BDT (৳) তে সম্পন্ন হয়', 'বিদেশি ক্রেডিট/ডেবিট কার্ড বর্তমানে সমর্থন করি না', 'ভবিষ্যতে আন্তর্জাতিক পেমেন্ট সমর্থন যোগ করার পরিকল্পনা আছে']
      : ['Only Bangladeshi payment methods are accepted', 'All transactions are in BDT (৳)', 'International credit/debit cards are not currently supported', 'We plan to add international payment support in the future']),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <CreditCard className="w-7 h-7 text-primary" />
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${fontClass}`}>{content.hero.title}</h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${fontClass}`}>{content.hero.subtitle}</p>
      </div>

      {/* Section 1: Accepted Payment Methods */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Wallet className="w-5 h-5 text-primary" />
            {content.s1Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s1Intro}</p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* bKash */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <h3 className={`font-semibold ${fontClass}`}>{content.bKashTitle}</h3>
                  <Badge variant="secondary" className="text-xs">{isBn ? 'মোবাইল ব্যাংকিং' : 'Mobile Banking'}</Badge>
                </div>
                <p className={`text-sm text-muted-foreground ${fontClass}`}>{content.bKashDesc}</p>
              </CardContent>
            </Card>

            {/* SSLCommerz */}
            <Card className="border-orange/20 bg-orange/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange" />
                  <h3 className={`font-semibold ${fontClass}`}>{content.sslTitle}</h3>
                  <Badge variant="secondary" className="text-xs">{isBn ? 'পেমেন্ট গেটওয়ে' : 'Payment Gateway'}</Badge>
                </div>
                <p className={`text-sm text-muted-foreground ${fontClass}`}>{content.sslDesc}</p>
                <ul className="space-y-1 mt-2">
                  {content.sslMethods.map((m, i) => (
                    <li key={i} className={`flex items-center gap-2 text-sm ${fontClass}`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Payment Process */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <ArrowRight className="w-5 h-5 text-primary" />
            {content.s2Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s2Intro}</p>
          <div className="space-y-3">
            {content.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${fontClass}`}>{s.n}: {s.t}</p>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Escrow System */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <ShieldCheck className="w-5 h-5 text-primary" />
            {content.s3Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s3Intro}</p>
          <ul className="space-y-2">
            {content.escrowPoints.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <BadgeCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
          <Separator />
          <h3 className={`font-semibold text-lg ${fontClass}`}>{content.escrowReleaseTitle}</h3>
          <ul className="space-y-2">
            {content.escrowRelease.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 4: Platform Fee */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Receipt className="w-5 h-5 text-primary" />
            {content.s4Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s4Intro}</p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center mb-4">
            <p className={`text-2xl font-bold text-primary ${fontClass}`}>5%</p>
            <p className={`text-sm text-muted-foreground ${fontClass}`}>
              {isBn ? 'সার্ভিস ফি (বিক্রেতার প্রাপ্য থেকে কর্তন)' : 'Service Fee (deducted from seller\'s payout)'}
            </p>
          </div>
          <ul className="space-y-2">
            {content.feePoints.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <Banknote className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 5: Payment Security */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Lock className="w-5 h-5 text-primary" />
            {content.s5Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s5Intro}</p>
          <ul className="space-y-2">
            {content.securityPoints.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 6: Failed Payments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <AlertTriangle className="w-5 h-5 text-orange" />
            {content.s6Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s6Intro}</p>
          <div className="space-y-3">
            {content.failedPoints.map((p, i) => (
              <Card key={i} className="border-orange/10">
                <CardContent className="p-4">
                  <h4 className={`font-semibold mb-1 ${fontClass}`}>{p.t}</h4>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{p.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 7: International Payments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Globe className="w-5 h-5 text-primary" />
            {content.s7Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s7Intro}</p>
          <ul className="space-y-2">
            {content.intlPoints.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center mt-8">
        <Separator className="mb-4" />
        <p className={`text-sm text-muted-foreground ${fontClass}`}>{content.lastUpdated}</p>
      </div>
    </div>
  );
}
