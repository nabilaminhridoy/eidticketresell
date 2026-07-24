'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw, ShieldCheck, CheckCircle2, XCircle, Clock,
  AlertTriangle, FileText, ArrowRight, Banknote, Scale,
  HelpCircle, UserCheck, Ticket
} from 'lucide-react';

function pick<T>(apiEn: T | undefined | null, apiBn: T | undefined | null, fallbackEn: T, fallbackBn: T, isBn: boolean): T {
  if (isBn) return apiBn ?? apiEn ?? fallbackBn;
  return apiEn ?? apiBn ?? fallbackEn;
}

function pickArray<T>(apiEn: T[] | undefined | null, apiBn: T[] | undefined | null, fallbackEn: T[], fallbackBn: T[], isBn: boolean): T[] {
  if (isBn) return apiBn ?? apiEn ?? fallbackBn;
  return apiEn ?? apiBn ?? fallbackEn;
}

export default function RefundPolicyPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [dbPage, setDbPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    fetch('/api/page-content?slug=refund-policy')
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

  let dbContent: any = null;
  let dbContentBn: any = null;
  try {
    dbContent = dbPage?.content ? JSON.parse(dbPage.content) : null;
    dbContentBn = dbPage?.contentBn ? JSON.parse(dbPage.contentBn) : null;
  } catch { /* ignore */ }

  const content = {
    hero: {
      title: pick(dbContent?.hero?.title, dbContentBn?.hero?.title, dbPage ? dbPage.title : 'Refund Policy', dbPage ? (dbPage.titleBn || dbPage.title) : 'ফেরত নীতি', isBn),
      subtitle: pick(dbContent?.hero?.subtitle, dbContentBn?.hero?.subtitle, 'Complete information about refund conditions, process, and timelines for ticket transactions', 'টিকেট লেনদেনে ফেরতের শর্ত, প্রক্রিয়া ও সময়সীমা সম্পর্কে সম্পূর্ণ তথ্য', isBn),
    },
    lastUpdated: pick(dbContent?.lastUpdated, dbContentBn?.lastUpdated, 'Last Updated: March 1, 2025', 'সর্বশেষ আপডেট: ১ মার্চ, ২০২৫', isBn),

    s1Title: pick(dbContent?.s1Title, dbContentBn?.s1Title, '1. Eligible Refund Scenarios', '১. ফেরত প্রাপ্য পরিস্থিতি', isBn),
    s1Intro: pick(dbContent?.s1Intro, dbContentBn?.s1Intro, 'Under the following circumstances, the buyer is entitled to a full refund:', 'নিম্নলিখিত পরিস্থিতিতে ক্রেতা সম্পূর্ণ ফেরত পাওয়ার অধিকারী:', isBn),
    eligible: pickArray(dbContent?.eligible, dbContentBn?.eligible,
      [{ t: 'Journey Cancelled', d: 'If the transport company cancels the journey, the buyer receives a full refund. The seller must provide proof of cancellation.', icon: 'XCircle' }, { t: 'Seller Fails to Deliver', d: 'If the seller fails to deliver the ticket within the specified time, full refund applies. Deadline: 6 hours before departure.', icon: 'UserCheck' }, { t: 'Invalid Ticket', d: 'If the provided ticket is invalid, counterfeit, or not found in the transport company\'s records, full refund applies.', icon: 'Ticket' }, { t: 'Duplicate Ticket', d: 'If the same ticket is sold to another buyer (duplicate sale), full refund applies.', icon: 'AlertTriangle' }, { t: 'Platform Error', d: 'If a platform technical error prevents the transaction from being completed, full refund applies.', icon: 'HelpCircle' }],
      [{ t: 'যাত্রা বাতিল', d: 'পরিবহন সংস্থা যাত্রা বাতিল করলে ক্রেতা সম্পূর্ণ ফেরত পাবেন। বিক্রেতাকে বাতিলের প্রমাণ দাখিল করতে হবে।', icon: 'XCircle' }, { t: 'বিক্রেতা টিকেট প্রদানে ব্যর্থ', d: 'বিক্রেতা নির্ধারিত সময়ের মধ্যে টিকেট প্রদান করতে ব্যর্থ হলে সম্পূর্ণ ফেরত। সময়সীমা: যাত্রার ৬ ঘণ্টা পূর্বে।', icon: 'UserCheck' }, { t: 'অবৈধ টিকেট', d: 'প্রদানকৃত টিকেট অবৈধ, ভুয়া অথবা পরিবহন সংস্থার রেকর্ডে না পাওয়া গেলে সম্পূর্ণ ফেরত।', icon: 'Ticket' }, { t: 'ডুপ্লিকেট টিকেট', d: 'একই টিকেট অন্য ক্রেতাকে বিক্রি করা হলে (ডুপ্লিকেট বিক্রি) সম্পূর্ণ ফেরত।', icon: 'AlertTriangle' }, { t: 'প্ল্যাটফর্ম ত্রুটি', d: 'প্ল্যাটফর্মের প্রযুক্তিগত ত্রুটির কারণে লেনদেন সম্পন্ন হতে পারলে সম্পূর্ণ ফেরত।', icon: 'HelpCircle' }],
      isBn),

    s2Title: pick(dbContent?.s2Title, dbContentBn?.s2Title, '2. Non-Eligible Scenarios', '২. ফেরত অপ্রাপ্য পরিস্থিতি', isBn),
    s2Intro: pick(dbContent?.s2Intro, dbContentBn?.s2Intro, 'Refunds are not applicable under the following circumstances:', 'নিম্নলিখিত পরিস্থিতিতে ফেরত প্রাপ্য নয়:', isBn),
    nonEligible: pickArray(dbContent?.nonEligible, dbContentBn?.nonEligible,
      [{ t: 'Change of Plans', d: 'If the buyer cancels the ticket due to their own change of plans, no refund is applicable.' }, { t: 'Missed Departure', d: 'If the buyer fails to arrive at the scheduled departure time (misses it), no refund is applicable.' }, { t: 'Buyer Negligence', d: 'If the buyer is negligent, provides wrong information, or fails to follow instructions, no refund is applicable.' }, { t: 'Ticket Already Used', d: 'If the ticket has been used and the journey is completed, no refund is applicable.' }, { t: 'Buyer Confirmation', d: 'Once the buyer clicks "Confirm Reception" to confirm ticket acceptance, no refund is applicable.' }],
      [{ t: 'পরিকল্পনার পরিবর্তন', d: 'ক্রেতার নিজস্ব পরিকল্পনা পরিবর্তনের কারণে টিকেট বাতিল করলে ফেরত প্রাপ্য নয়।' }, { t: 'যাত্রা মিস', d: 'ক্রেতা নির্ধারিত সময়ে যাত্রায় উপস্থিত হতে ব্যর্থ হলে (মিস করলে) ফেরত প্রাপ্য নয়।' }, { t: 'ক্রেতার অবহেলা', d: 'ক্রেতার অবহেলা, ভুল তথ্য প্রদান, অথবা নির্দেশনা অনুসরণ না করলে ফেরত প্রাপ্য নয়।' }, { t: 'টিকেট ব্যবহার সম্পন্ন', d: 'টিকেট ব্যবহার করে যাত্রা সম্পন্ন হলে ফেরত প্রাপ্য নয়।' }, { t: 'ক্রেতা নিশ্চিতকরণ', d: 'ক্রেতা "কনফার্ম রিসিপশন" বাটন ক্লিক করে টিকেট গ্রহণ নিশ্চিত করলে ফেরত প্রাপ্য নয়।' }],
      isBn),

    s3Title: pick(dbContent?.s3Title, dbContentBn?.s3Title, '3. Refund Process', '৩. ফেরত প্রক্রিয়া', isBn),
    s3Intro: pick(dbContent?.s3Intro, dbContentBn?.s3Intro, 'The refund process is completed through the following steps:', 'ফেরত প্রক্রিয়া নিম্নলিখিত ধাপে সম্পন্ন হয়:', isBn),
    refundSteps: pickArray(dbContent?.refundSteps, dbContentBn?.refundSteps,
      [{ n: 'Step 1', t: 'Submit Refund Request', d: 'The buyer submits a refund request on the platform. The request must include reason and proof.' }, { n: 'Step 2', t: 'Verification', d: 'The platform verifies the request — collects seller\'s feedback and reviews evidence.' }, { n: 'Step 3', t: 'Approval', d: 'Upon successful verification, the refund is approved. The seller may contest the decision.' }, { n: 'Step 4', t: 'Processing', d: 'The approved refund is processed through the payment gateway.' }, { n: 'Step 5', t: 'Credit to Account', d: 'The refund amount is credited to the buyer\'s payment source (bKash/card).' }],
      [{ n: 'ধাপ ১', t: 'ফেরত অনুরোধ দাখিল', d: 'ক্রেতা প্ল্যাটফর্মে ফেরত অনুরোধ দাখিল করেন। অনুরোধে কারণ ও প্রমাণ উল্লেখ করতে হবে।' }, { n: 'ধাপ ২', t: 'যাচাই', d: 'প্ল্যাটফর্ম অনুরোধ যাচাই করে — বিক্রেতার মতামত গ্রহণ ও প্রমাণ পর্যালোচনা।' }, { n: 'ধাপ ৩', t: 'অনুমোদন', d: 'যাচাই সম্পন্ন হলে ফেরত অনুমোদন করা হয়। বিক্রেতা প্রতিবাদ করতে পারেন।' }, { n: 'ধাপ ৪', t: 'প্রক্রিয়াজাত', d: 'অনুমোদিত ফেরত পেমেন্ট গেটওয়ে দিয়ে প্রক্রিয়াজাত করা হয়।' }, { n: 'ধাপ ৫', t: 'ক্রেতা অ্যাকাউন্টে ক্রেডিট', d: 'ফেরত পরিমাণ ক্রেতার পেমেন্ট উৎসে (বিকাশ/কার্ড) ক্রেডিট হয়।' }],
      isBn),

    s4Title: pick(dbContent?.s4Title, dbContentBn?.s4Title, '4. Refund Timeline', '৪. ফেরত সময়সীমা', isBn),
    s4Intro: pick(dbContent?.s4Intro, dbContentBn?.s4Intro, 'The refund processing timeline depends on the payment method:', 'ফেরত প্রক্রিয়াজাতের সময়সীমা পেমেন্ট পদ্ধতির উপর নির্ভরশীল:', isBn),
    timelines: pickArray(dbContent?.timelines, dbContentBn?.timelines,
      [{ method: 'bKash', time: '1-3 business days', note: 'bKash refunds are processed quickly' }, { method: 'SSLCommerz (Card)', time: '3-7 business days', note: 'Card refunds depend on bank processing' }, { method: 'SSLCommerz (Mobile Banking)', time: '1-3 business days', note: 'Mobile banking refunds are similar to bKash' }],
      [{ method: 'বিকাশ', time: '১-৩ কর্মদিবস', note: 'বিকাশ পেমেন্টের ফেরত দ্রুত প্রক্রিয়াজাত হয়' }, { method: 'SSLCommerz (কার্ড)', time: '৩-৭ কর্মদিবস', note: 'ক্রেডিট/ডেবিট কার্ডের ফেরত ব্যাংক প্রক্রিয়ার উপর নির্ভরশীল' }, { method: 'SSLCommerz (মোবাইল ব্যাংকিং)', time: '১-৩ কর্মদিবস', note: 'মোবাইল ব্যাংকিং ফেরত বিকাশের মতো দ্রুত' }],
      isBn),

    s5Title: pick(dbContent?.s5Title, dbContentBn?.s5Title, '5. Partial Refunds', '৫. আংশিক ফেরত', isBn),
    s5Intro: pick(dbContent?.s5Intro, dbContentBn?.s5Intro, 'In some circumstances, a partial refund may be applicable:', 'কিছু পরিস্থিতিতে আংশিক ফেরত প্রাপ্য হতে পারে:', isBn),
    partial: pickArray(dbContent?.partial, dbContentBn?.partial,
      ['Partial ticket defect (e.g., wrong route but journey still completed)', 'Seller provides an alternative ticket of lower value than the original', 'Both buyer and seller agree to a partial refund', 'Platform determines a partial refund during dispute resolution'],
      ['টিকেটের আংশিক ত্রুটি (যেমন, সঠিক রুট নয় কিন্তু যাত্রা সম্পন্ন হয়েছে)', 'বিক্রেতা বিকল্প টিকেট প্রদান করলে কিন্তু মূল টিকেটের চেয়ে কম মূল্যের', 'ক্রেতা ও বিক্রেতা আংশিক ফেরতে সম্মত হলে', 'প্ল্যাটফর্ম বিবাদ সমাধানে আংশিক ফেরত নির্ধারণ করলে'],
      isBn),

    s6Title: pick(dbContent?.s6Title, dbContentBn?.s6Title, '6. Escrow Release Conditions', '৬. এসক্রো রিলিজ শর্ত', isBn),
    s6Intro: pick(dbContent?.s6Intro, dbContentBn?.s6Intro, 'Conditions for releasing payment to the seller:', 'পেমেন্ট বিক্রেতাকে রিলিজ করার শর্ত:', isBn),
    escrowRelease: pickArray(dbContent?.escrowRelease, dbContentBn?.escrowRelease,
      ['Buyer clicks "Confirm Reception" confirming ticket acceptance', '24 hours after journey completion if no complaint is raised by the buyer', 'Platform decides in favor of the seller during dispute resolution', '5% platform fee is deducted at the time of release'],
      ['ক্রেতা "কনফার্ম রিসিপশন" ক্লিক করে টিকেট গ্রহণ নিশ্চিত করলে', 'যাত্রা সম্পন্ন হওয়ার ২৪ ঘণ্টা পর ক্রেতা কোনো অভিযোগ জানালে না', 'বিবাদ সমাধানে প্ল্যাটফর্ম বিক্রেতার পক্ষে সিদ্ধান্ত নিলে', 'রিলিজের সময় ৫% প্ল্যাটফর্ম ফি কর্তন করা হয়'],
      isBn),

    s7Title: pick(dbContent?.s7Title, dbContentBn?.s7Title, '7. Dispute Resolution', '৭. বিবাদ সমাধান', isBn),
    s7Intro: pick(dbContent?.s7Intro, dbContentBn?.s7Intro, 'If a dispute arises between buyer and seller, the platform mediates:', 'ক্রেতা ও বিক্রেতার মধ্যে বিবাদ উঠলে প্ল্যাটফর্ম মধ্যস্থতা করে:', isBn),
    dispute: pickArray(dbContent?.dispute, dbContentBn?.dispute,
      [{ t: 'File Dispute', d: 'Buyer or seller files a dispute on the platform. Feedback from both parties is collected within 24 hours.' }, { t: 'Investigation', d: 'The platform reviews evidence, contacts the transport company, and investigates transaction records.' }, { t: 'Resolution', d: 'A decision is made within 7 business days. Based on the decision, escrow payment is released or refunded.' }, { t: 'Final Decision', d: 'The platform\'s decision is final. For objections, contact support@eidticketresell.com.' }],
      [{ t: 'বিবাদ দাখিল', d: 'ক্রেতা অথবা বিক্রেতা প্ল্যাটফর্মে বিবাদ দাখিল করেন। ২৪ ঘণ্টার মধ্যে উভয় পক্ষের মতামত গ্রহণ করা হয়।' }, { t: 'তদন্ত', d: 'প্ল্যাটফর্ম প্রমাণ পর্যালোচনা, পরিবহন সংস্থা যোগাযোগ, এবং লেনদেন রেকর্ড তদন্ত করে।' }, { t: 'সমাধান', d: '৭ কর্মদিবসের মধ্যে সিদ্ধান্ত গ্রহণ। সিদ্ধান্তের ভিত্তিতে এসক্রো পেমেন্ট রিলিজ অথবা ফেরত।' }, { t: 'চূড়ান্ত সিদ্ধান্ত', d: 'প্ল্যাটফর্মের সিদ্ধান্ত চূড়ান্ত। আপত্তি জানাতে support@eidticketresell.com যোগাযোগ করুন।' }],
      isBn),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <RefreshCw className="w-7 h-7 text-primary" />
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${fontClass}`}>{content.hero.title}</h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${fontClass}`}>{content.hero.subtitle}</p>
      </div>

      {/* Section 1: Eligible Refund Scenarios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            {content.s1Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s1Intro}</p>
          <div className="space-y-3">
            {content.eligible.map((item, i) => (
              <Card key={i} className="border-green-600/20 bg-green-600/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className={`font-semibold ${fontClass}`}>{item.t}</h4>
                      <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>{item.d}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Non-Eligible Scenarios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <XCircle className="w-5 h-5 text-red-500" />
            {content.s2Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s2Intro}</p>
          <div className="space-y-3">
            {content.nonEligible.map((item, i) => (
              <Card key={i} className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className={`font-semibold ${fontClass}`}>{item.t}</h4>
                      <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>{item.d}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Refund Process */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <ArrowRight className="w-5 h-5 text-primary" />
            {content.s3Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s3Intro}</p>
          <div className="space-y-3">
            {content.refundSteps.map((s, i) => (
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

      {/* Section 4: Refund Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Clock className="w-5 h-5 text-primary" />
            {content.s4Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s4Intro}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {content.timelines.map((tl, i) => (
              <Card key={i} className="border-primary/20 text-center">
                <CardContent className="p-4">
                  <p className={`font-semibold text-primary mb-1 ${fontClass}`}>{tl.method}</p>
                  <p className={`text-2xl font-bold ${fontClass}`}>{tl.time}</p>
                  <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>{tl.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Partial Refunds */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Banknote className="w-5 h-5 text-orange" />
            {content.s5Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s5Intro}</p>
          <ul className="space-y-2">
            {content.partial.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <Badge variant="outline" className="shrink-0 mt-0.5">{i + 1}</Badge>
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 6: Escrow Release */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <ShieldCheck className="w-5 h-5 text-primary" />
            {content.s6Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s6Intro}</p>
          <ul className="space-y-2">
            {content.escrowRelease.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 7: Dispute Resolution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Scale className="w-5 h-5 text-primary" />
            {content.s7Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s7Intro}</p>
          <div className="space-y-3">
            {content.dispute.map((d, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {isBn ? ['ক', 'খ', 'গ', 'ঘ'][i] : ['A', 'B', 'C', 'D'][i]}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${fontClass}`}>{d.t}</p>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{d.d}</p>
                </div>
              </div>
            ))}
          </div>
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
