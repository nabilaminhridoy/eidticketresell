'use client';

import { useLanguageStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText, ShieldCheck, UserCheck, Ticket, CreditCard,
  AlertTriangle, Lock, Scale, XCircle, Clock,
  CheckCircle2, BookOpen, Gavel, UserX, Bell
} from 'lucide-react';

export default function TermsOfServicePage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const content = {
    hero: {
      title: isBn ? 'সেবার শর্তাবলী' : 'Terms of Service',
      subtitle: isBn
        ? 'ঈদ টিকেট রিসেল প্ল্যাটফর্ম ব্যবহারের শর্ত ও নিয়মাবলী'
        : 'Terms and conditions for using the Eid Ticket Resell platform',
    },
    lastUpdated: isBn ? 'সর্বশেষ আপডেট: ১ মার্চ, ২০২৫' : 'Last Updated: March 1, 2025',

    // Section 1: Acceptance of Terms
    s1Title: isBn ? '১. শর্তাবলী গ্রহণ' : '1. Acceptance of Terms',
    s1Content: isBn
      ? 'ঈদ টিকেট রিসেল (এই "প্ল্যাটফর্ম") ব্যবহার করে আপনি এই শর্তাবলী গ্রহণ করেন। এই শর্তাবলী প্ল্যাটফর্মে সকল ক্রেতা, বিক্রেতা ও ব্যবহারকারীর উপর প্রযোজ্য। আপনি যদি এই শর্তাবলীর সাথে সম্মত হন না, তবে প্ল্যাটফর্ম ব্যবহার করবেন না। প্ল্যাটফর্ম যেকোনো সময় শর্তাবলী পরিবর্তন করতে পারে এবং পরিবর্তন প্রকাশের পর স্বয়ংক্রিয়ভাবে প্রযোজ্য হয়।'
      : 'By using Eid Ticket Resell (this "Platform"), you accept these Terms of Service. These terms apply to all buyers, sellers, and users on the platform. If you do not agree with these terms, do not use the platform. The platform may modify these terms at any time, and changes become effective upon publication.',

    // Section 2: User Accounts
    s2Title: isBn ? '২. ব্যবহারকারী অ্যাকাউন্ট' : '2. User Accounts',
    s2Subtitle: isBn ? 'নিম্নলিখিত অ্যাকাউন্ট নিয়মাবলী সকল ব্যবহারকারীর উপর প্রযোজ্য:' : 'The following account rules apply to all users:',
    accountItems: isBn
      ? [
        { t: 'নিবন্ধন', d: 'প্ল্যাটফর্মে অ্যাকাউন্ট তৈরি করতে সঠিক নাম, ইমেইল ও মোবাইল নম্বর প্রদান করতে হবে। ভুয়া তথ্য প্রদান অ্যাকাউন্ট বাতিলের কারণ।' },
        { t: 'যাচাই', d: 'টিকেট বিক্রি করতে KYC (জান আপনি কে) যাচাই সম্পন্ন করতে হবে। এতে জাতীয় ID কার্ড, ফটো ও ঠিকানা প্রমাণ প্রদান প্রযোজ্য।' },
        { t: 'অ্যাকাউন্ট নিরাপত্তা', d: 'আপনি আপনার অ্যাকাউন্ট পাসওয়ার্ড সুরক্ষিত রাখার জন্য দায়ী। অননুমোদিত অ্যাকাউন্ট ব্যবহার প্ল্যাটফর্মকে অবহিত করতে হবে।' },
        { t: 'এক অ্যাকাউন্ট নিয়ম', d: 'প্রতিটি ব্যবহারকারী একটি অ্যাকাউন্ট রাখতে পারেন। একাধিক অ্যাকাউন্ট নিষিদ্ধ।' },
        { t: 'নিষিদ্ধ কার্যকলাপ', d: 'ভুয়া অ্যাকাউন্ট, বট অ্যাকাউন্ট, অথবা অন্যের তথ্য ব্যবহার করে অ্যাকাউন্ট তৈরি নিষিদ্ধ।' },
      ]
      : [
        { t: 'Registration', d: 'To create an account, you must provide a valid name, email, and mobile number. Providing false information will result in account cancellation.' },
        { t: 'Verification', d: 'To sell tickets, KYC (Know Your Customer) verification must be completed. This requires National ID card, photo, and address proof.' },
        { t: 'Account Security', d: 'You are responsible for keeping your account password secure. Unauthorized use must be reported to the platform immediately.' },
        { t: 'One Account Rule', d: 'Each user may maintain one account. Multiple accounts are prohibited.' },
        { t: 'Prohibited Activities', d: 'Fake accounts, bot accounts, or accounts using someone else\'s information are prohibited.' },
      ],

    // Section 3: Buying Tickets
    s3Title: isBn ? '৩. টিকেট ক্রয়' : '3. Buying Tickets',
    s3Items: isBn
      ? [
        { t: 'ক্রেতার দায়বদ্ধতা', d: 'ক্রেতা টিকেটের সকল তথ্য (রুট, সময়, শ্রেণি) যাচাই করে ক্রয় নিশ্চিত করবেন। ক্রয় নিশ্চিতের পর ফেরত শর্ত ফেরত নীতি অনুসারে।' },
        { t: 'পেমেন্ট শর্ত', d: 'ক্রেতা পেমেন্ট প্রক্রিয়া সম্পন্ন করবেন। পেমেন্ট এসক্রোতে রাখা হয় যতক্ষণ না যাত্রা সম্পন্ন।' },
        { t: 'টিকেট যাচাই', d: 'টিকেট প্রাপ্তির পর ক্রেতা টিকেটের সত্যতা যাচাই করবেন। টিকেট যাচাই প্ল্যাটফর্মের "যাচাই টিকেট" ফিচার দিয়ে করতে পারেন।' },
        { t: 'নিশ্চিতকরণ', d: 'টিকেট সত্যতা নিশ্চিত হলে "কনফার্ম রিসিপশন" ক্লিক করুন। এই নিশ্চিতকরণের পর পেমেন্ট বিক্রেতাকে রিলিজ হয়।' },
      ]
      : [
        { t: 'Buyer Obligations', d: 'The buyer must verify all ticket details (route, time, class) before confirming purchase. After confirmation, refund conditions follow the Refund Policy.' },
        { t: 'Payment Terms', d: 'The buyer must complete the payment process. Payment is held in escrow until the journey is completed.' },
        { t: 'Ticket Verification', d: 'After receiving the ticket, the buyer must verify its authenticity. Use the "Verify Ticket" feature on the platform.' },
        { t: 'Confirmation', d: 'Once ticket authenticity is confirmed, click "Confirm Reception." After this confirmation, payment is released to the seller.' },
      ],

    // Section 4: Selling Tickets
    s4Title: isBn ? '৪. টিকেট বিক্রি' : '4. Selling Tickets',
    s4Items: isBn
      ? [
        { t: 'বিক্রেতার দায়বদ্ধতা', d: 'বিক্রেতা সঠিক টিকেট তথ্য প্রদান করবেন। ভুয়া অথবা ভুল তথ্য প্রদান অ্যাকাউন্ট বাতিলের কারণ।' },
        { t: 'KYC প্রয়োজনীয়তা', d: 'টিকেট বিক্রি করতে KYC যাচাই সম্পন্ন করতে হবে। অযাচাইকৃত ব্যবহারকারী টিকেট তালিকাভুক্ত করতে পারবেন না।' },
        { t: 'মূল্য নির্ধারণ', d: 'বিক্রেতা টিকেটের মূল্য নির্ধারণ করতে পারেন। মূল্য বিক্রি করার মূল দামের অতিরিক্ত হতে পারে কিন্তু পরিমিত হওয়া উচিত। অতিরিক্ত মূল্য প্ল্যাটফর্ম সমর্থন করে না।' },
        { t: 'ডেলিভারি দায়বদ্ধতা', d: 'বিক্রেতা ক্রেতাকে টিকেট যাত্রার ৬ ঘণ্টা পূর্বে প্রদান করবেন। বিলম্ব ফেরত নীতি অনুসারে পেমেন্ট ফেরতের কারণ।' },
      ]
      : [
        { t: 'Seller Obligations', d: 'The seller must provide accurate ticket information. Providing fake or incorrect information will result in account cancellation.' },
        { t: 'KYC Requirements', d: 'KYC verification must be completed to sell tickets. Unverified users cannot list tickets.' },
        { t: 'Pricing Rules', d: 'The seller can set the ticket price. The price may exceed the original sale price but should be reasonable. Excessive pricing is not supported by the platform.' },
        { t: 'Delivery Commitment', d: 'The seller must deliver the ticket to the buyer at least 6 hours before departure. Delay results in refund per the Refund Policy.' },
      ],

    // Section 5: Platform Rules
    s5Title: isBn ? '৫. প্ল্যাটফর্ম নিয়ম' : '5. Platform Rules',
    s5Intro: isBn
      ? 'নিম্নলিখিত কার্যকলাপ প্ল্যাটফর্মে নিষিদ্ধ:'
      : 'The following activities are prohibited on the platform:',
    prohibited: isBn
      ? [
        { t: 'জালিয়াতি', d: 'ভুয়া টিকেট বিক্রি, পেমেন্ট জালিয়াতি, অথবা পরিচয় জালিয়াতি' },
        { t: 'স্কালপিং', d: 'টিকেট অতিরিক্ত মূল্যে বিক্রি (স্কালপিং) নিষিদ্ধ। প্ল্যাটফর্ম অতিরিক্ত মূল্যের টিকেট সরিয়ে দিতে পারে।' },
        { t: 'হয়রানি', d: 'অন্য ব্যবহারকারীর প্রতি হয়রানি, আপত্তিজনক ভাষা, অথবা বিদ্বেষমূলক কার্যকলাপ' },
        { t: 'স্প্যাম', d: 'অননুমোদিত বিজ্ঞপ্তি, স্প্যাম বার্তা, অথবা প্ল্যাটফর্মে অবৈধ বিষয়বস্তু প্রকাশ' },
        { t: 'বট ব্যবহার', d: 'প্ল্যাটফর্মে বট অথবা স্বয়ংক্রিয় সরঞ্জাম ব্যবহার করে টিকেট সংগ্রহ অথবা মূল্য বৃদ্ধি' },
      ]
      : [
        { t: 'Fraud', d: 'Selling fake tickets, payment fraud, or identity fraud' },
        { t: 'Scalping', d: 'Selling tickets at excessive prices (scalping) is prohibited. The platform may remove excessively priced tickets.' },
        { t: 'Harassment', d: 'Harassment, offensive language, or hateful behavior toward other users' },
        { t: 'Spam', d: 'Unauthorized advertisements, spam messages, or publishing illegal content on the platform' },
        { t: 'Bot Usage', d: 'Using bots or automated tools to collect tickets or inflate prices on the platform' },
      ],

    // Section 6: Intellectual Property
    s6Title: isBn ? '৬. সম্পত্তি অধিকার' : '6. Intellectual Property',
    s6Content: isBn
      ? [
        'প্ল্যাটফর্মের সকল বিষয়বস্তু (লোগো, ডিজাইন, টেক্সট, গ্রাফিক্স) ঈদ টিকেট রিসেলের সম্পত্তি। অননুমোদিত ব্যবহার নিষিদ্ধ।',
        'ব্যবহারকারীর প্রদানকৃত টিকেট তথ্য ব্যবহারকারীর সম্পত্তি। প্ল্যাটফর্ম লেনদেন প্রক্রিয়ার জন্য এই তথ্য ব্যবহার করে।',
        'ব্যবহারকারী প্ল্যাটফর্মের বিষয়বস্তু কপি, বিতরণ অথবা পুনরায় প্রকাশ করতে পারবেন না।',
      ]
      : [
        'All platform content (logo, design, text, graphics) is the property of Eid Ticket Resell. Unauthorized use is prohibited.',
        'Ticket information provided by users is the property of the user. The platform uses this information for transaction processing.',
        'Users may not copy, distribute, or republish platform content.',
      ],

    // Section 7: Limitation of Liability
    s7Title: isBn ? '৭. দায়বদ্ধতা সীমাবদ্ধতা' : '7. Limitation of Liability',
    s7Content: isBn
      ? [
        'প্ল্যাটফর্ম ক্রেতা ও বিক্রেতার মধ্যে মধ্যস্থতাকারী। প্ল্যাটফর্ম পরিবহন সংস্থার যাত্রা বিলম্ব, বাতিল অথবা সেবার গুণমানের জন্য দায়ী নয়।',
        'প্ল্যাটফর্ম ব্যবহারকারীর ক্রয়/বিক্রি সিদ্ধান্তের জন্য দায়ী নয়।',
        'প্ল্যাটফর্ম প্রযুক্তিগত ত্রুটি, ডাউনটাইম অথবা তৃতীয় পক্ষের সেবা ব্যর্থতার জন্য সর্বোচ্চ প্রয়াস করে কিন্তু দায়বদ্ধতা সীমিত।',
        'প্ল্যাটফর্মের দায়বদ্ধতা লেনদেনের প্ল্যাটফর্ম ফি পরিমাণের মধ্যে সীমাবদ্ধ।',
      ]
      : [
        'The platform is an intermediary between buyer and seller. The platform is not responsible for transport company\'s journey delays, cancellations, or service quality.',
        'The platform is not responsible for users\' purchase/sale decisions.',
        'The platform makes best efforts for technical issues, downtime, or third-party service failures, but liability is limited.',
        'The platform\'s liability is limited to the platform fee amount of the transaction.',
      ],

    // Section 8: Dispute Resolution
    s8Title: isBn ? '৮. বিবাদ সমাধান' : '8. Dispute Resolution',
    s8Items: isBn
      ? [
        { t: 'বিবাদ দাখিল', d: 'ক্রেতা অথবা বিক্রেতা প্ল্যাটফর্মে বিবাদ দাখিল করতে পারেন।' },
        { t: 'প্রক্রিয়া', d: 'প্ল্যাটফর্ম উভয় পক্ষের মতামত গ্রহণ করে এবং প্রমাণ পর্যালোচনা করে।' },
        { t: 'সময়সীমা', d: 'বিবাদ সমাধান ৭ কর্মদিবসের মধ্যে সম্পন্ন হয়।' },
        { t: 'সালিশি', d: 'বিবাদ সমাধানে প্ল্যাটফর্মের সিদ্ধান্ত চূড়ান্ত। বাংলাদেশের আইন অনুসারে সালিশি প্রক্রিয়া প্রযোজ্য।' },
      ]
      : [
        { t: 'Filing Dispute', d: 'Buyer or seller can file a dispute on the platform.' },
        { t: 'Process', d: 'The platform collects feedback from both parties and reviews evidence.' },
        { t: 'Timeline', d: 'Dispute resolution is completed within 7 business days.' },
        { t: 'Arbitration', d: 'The platform\'s decision in dispute resolution is final. Arbitration per Bangladesh law applies.' },
      ],

    // Section 9: Termination
    s9Title: isBn ? '৯. অ্যাকাউন্ট সমাপ্তি' : '9. Account Termination',
    s9Intro: isBn
      ? 'প্ল্যাটফর্ম নিম্নলিখিত অবস্থায় অ্যাকাউন্ট স্থগিত অথবা বাতিল করতে পারে:'
      : 'The platform may suspend or cancel accounts under the following conditions:',
    termination: isBn
      ? [
        'শর্তাবলী ভঙ্গ (নিষিদ্ধ কার্যকলাপ, জালিয়াতি)',
        'বিক্রেতা টিকেট প্রদানে ৩ বার ব্যর্থ',
        'ব্যবহারকারীর প্রতি অন্য ব্যবহারকারীর ৩+ অভিযোগ',
        'প্ল্যাটফর্মে অবৈধ বিষয়বস্তু প্রকাশ',
        'অ্যাকাউন্ট নিষিদ্ধ হলে সকল লেনদেন বাতিল এবং প্রযোজ্য ফেরত প্রক্রিয়াজাত',
      ]
      : [
        'Violation of terms (prohibited activities, fraud)',
        'Seller fails to deliver ticket 3 times',
        '3+ complaints against a user from other users',
        'Publishing illegal content on the platform',
        'When an account is banned, all transactions are cancelled and applicable refunds are processed',
      ],

    // Section 10: Changes to Terms
    s10Title: isBn ? '১০. শর্তাবলী পরিবর্তন' : '10. Changes to Terms',
    s10Content: isBn
      ? [
        'প্ল্যাটফর্ম যেকোনো সময় শর্তাবলী পরিবর্তন করতে পারে।',
        'পরিবর্তন প্ল্যাটফর্মে প্রকাশের পর স্বয়ংক্রিয়ভাবে প্রযোজ্য।',
        'বড় পরিবর্তনের জন্য ব্যবহারকারীদের ইমেইল বিজ্ঞপ্তি প্রদান করা হয়।',
        'প্রযোজ্য তারিখ: প্রকাশের ৭ দিন পর।',
      ]
      : [
        'The platform may modify these terms at any time.',
        'Changes become effective automatically upon publication on the platform.',
        'For significant changes, users are notified via email.',
        'Effective date: 7 days after publication.',
      ],

    // Section 11: Governing Law
    s11Title: isBn ? '১১. প্রযোজ্য আইন' : '11. Governing Law',
    s11Content: isBn
      ? 'এই শর্তাবলী বাংলাদেশের আইন অনুসারে প্রযোজ্য। যেকোনো আইনি বিবাদ বাংলাদেশের আদালতে নিষ্পত্তি হবে। প্ল্যাটফর্ম বাংলাদেশের ডিজিটাল নিরাপত্তা আইন, ভোক্তা অধিকার আইন, এবং ই-কমার্স নিয়মাবলী অনুসরণ করে।'
      : 'These terms are governed by the laws of Bangladesh. Any legal disputes will be settled in Bangladesh courts. The platform follows Bangladesh\'s Digital Security Act, Consumer Rights Act, and e-Commerce regulations.',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${fontClass}`}>{content.hero.title}</h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${fontClass}`}>{content.hero.subtitle}</p>
      </div>

      {/* Section 1: Acceptance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <BookOpen className="w-5 h-5 text-primary" />
            {content.s1Title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-muted-foreground leading-relaxed ${fontClass}`}>{content.s1Content}</p>
        </CardContent>
      </Card>

      {/* Section 2: User Accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <UserCheck className="w-5 h-5 text-primary" />
            {content.s2Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s2Subtitle}</p>
          <div className="space-y-3">
            {content.accountItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 mt-1 font-bold">
                  {isBn ? ['ক', 'খ', 'গ', 'ঘ', 'ঙ'][i] : ['a', 'b', 'c', 'd', 'e'][i]}
                </Badge>
                <div>
                  <h4 className={`font-semibold ${fontClass}`}>{item.t}</h4>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Buying Tickets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Ticket className="w-5 h-5 text-primary" />
            {content.s3Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.s3Items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 mt-1 font-bold">
                {isBn ? ['ক', 'খ', 'গ', 'ঘ'][i] : ['a', 'b', 'c', 'd'][i]}
              </Badge>
              <div>
                <h4 className={`font-semibold ${fontClass}`}>{item.t}</h4>
                <p className={`text-sm text-muted-foreground ${fontClass}`}>{item.d}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 4: Selling Tickets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <CreditCard className="w-5 h-5 text-orange" />
            {content.s4Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.s4Items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 mt-1 font-bold border-orange/30 text-orange">
                {isBn ? ['ক', 'খ', 'গ', 'ঘ'][i] : ['a', 'b', 'c', 'd'][i]}
              </Badge>
              <div>
                <h4 className={`font-semibold ${fontClass}`}>{item.t}</h4>
                <p className={`text-sm text-muted-foreground ${fontClass}`}>{item.d}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 5: Platform Rules */}
      <Card className="mb-6 border-red-500/20">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {content.s5Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s5Intro}</p>
          <div className="space-y-3">
            {content.prohibited.map((item, i) => (
              <Card key={i} className="border-red-500/10 bg-red-500/5">
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

      {/* Section 6: Intellectual Property */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Lock className="w-5 h-5 text-primary" />
            {content.s6Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {content.s6Content.map((p, i) => (
            <p key={i} className={`flex items-start gap-2 text-sm text-muted-foreground ${fontClass}`}>
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {p}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Section 7: Limitation of Liability */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <ShieldCheck className="w-5 h-5 text-primary" />
            {content.s7Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {content.s7Content.map((p, i) => (
            <p key={i} className={`flex items-start gap-2 text-sm text-muted-foreground ${fontClass}`}>
              <Badge variant="outline" className="shrink-0 mt-0.5 font-bold">
                {isBn ? `${i + 1}` : `${i + 1}`}
              </Badge>
              {p}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Section 8: Dispute Resolution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Scale className="w-5 h-5 text-primary" />
            {content.s8Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.s8Items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 mt-1 font-bold">
                {isBn ? ['ক', 'খ', 'গ', 'ঘ'][i] : ['a', 'b', 'c', 'd'][i]}
              </Badge>
              <div>
                <h4 className={`font-semibold ${fontClass}`}>{item.t}</h4>
                <p className={`text-sm text-muted-foreground ${fontClass}`}>{item.d}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 9: Termination */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <UserX className="w-5 h-5 text-red-500" />
            {content.s9Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s9Intro}</p>
          <ul className="space-y-2">
            {content.termination.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 10: Changes to Terms */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Bell className="w-5 h-5 text-primary" />
            {content.s10Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {content.s10Content.map((p, i) => (
            <p key={i} className={`flex items-start gap-2 text-sm text-muted-foreground ${fontClass}`}>
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {p}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Section 11: Governing Law */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Gavel className="w-5 h-5 text-primary" />
            {content.s11Title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-muted-foreground leading-relaxed ${fontClass}`}>{content.s11Content}</p>
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
