'use client';

import { useLanguageStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck, Eye, Lock, Share2, Database,
  Cookie, UserCheck, Clock, Baby, Bell, Mail,
  CheckCircle2, AlertTriangle, Smartphone, Server,
  FileText, KeyRound
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const content = {
    hero: {
      title: isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy',
      subtitle: isBn
        ? 'আপনার ব্যক্তিগত তথ্য কিভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত করা হয়'
        : 'How your personal information is collected, used, and protected',
    },
    lastUpdated: isBn ? 'সর্বশেষ আপডেট: ১ মার্চ, ২০২৫' : 'Last Updated: March 1, 2025',

    // Section 1: Information We Collect
    s1Title: isBn ? '১. আমরা কি তথ্য সংগ্রহ করি' : '1. Information We Collect',
    s1Intro: isBn
      ? 'আমরা প্ল্যাটফর্ম সেবা প্রদানের জন্য নিম্নলিখিত তথ্য সংগ্রহ করি:'
      : 'We collect the following information to provide platform services:',
    collectCategories: isBn
      ? [
        {
          t: 'ব্যক্তিগত তথ্য', icon: 'UserCheck',
          d: 'নাম, ইমেইল ঠিকানা, মোবাইল নম্বর, জাতীয় ID কার্ড নম্বর (KYC যাচাই), ফটো, ঠিকানা',
          items: ['নাম ও ইমেইল (অ্যাকাউন্ট নিবন্ধন)', 'মোবাইল নম্বর (যোগাযোগ ও পেমেন্ট)', 'জাতীয় ID কার্ড (বিক্রেতা KYC)', 'ফটো (KYC যাচাই)', 'ঠিকানা (KYC যাচাই)'],
        },
        {
          t: 'পেমেন্ট তথ্য', icon: 'Smartphone',
          d: 'পেমেন্ট প্রক্রিয়ার তথ্য — এনক্রিপ্ট করা, সংরক্ষণ করা হয় না',
          items: ['বিকাশ পেমেন্ট রেকর্ড (এনক্রিপ্ট)', 'SSLCommerz পেমেন্ট রেকর্ড (এনক্রিপ্ট)', 'কার্ড তথ্য সংরক্ষণ করা হয় না', 'পেমেন্ট স্ট্যাটাস ও লেনদেন ID'],
        },
        {
          t: 'ব্যবহার তথ্য', icon: 'Eye',
          d: 'প্ল্যাটফর্ম ব্যবহারের তথ্য সেবা উন্নয়নের জন্য',
          items: ['পৃষ্ঠা দর্শন ও ক্লিক ডেটা', 'সার্চ কুয়েরি ও ফিল্টার', 'লেনদেন ইতিহাস', 'অ্যাকাউন্ট লগইন সময়'],
        },
        {
          t: 'ডিভাইস তথ্য', icon: 'Smartphone',
          d: 'সেবা সুরক্ষা ও প্রযুক্তিগত উন্নয়নের জন্য',
          items: ['ব্রাউজার প্রকার ও সংস্করণ', 'ডিভাইস প্রকার (মোবাইল/ডেস্কটপ)', 'IP ঠিকানা', 'অপারেটিং সিস্টেম'],
        },
      ]
      : [
        {
          t: 'Personal Information', icon: 'UserCheck',
          d: 'Name, email address, mobile number, National ID card number (KYC verification), photo, address',
          items: ['Name and email (account registration)', 'Mobile number (communication and payment)', 'National ID card (seller KYC)', 'Photo (KYC verification)', 'Address (KYC verification)'],
        },
        {
          t: 'Payment Information', icon: 'Smartphone',
          d: 'Payment processing information — encrypted, not stored',
          items: ['bKash payment records (encrypted)', 'SSLCommerz payment records (encrypted)', 'Card details are not stored', 'Payment status and transaction ID'],
        },
        {
          t: 'Usage Information', icon: 'Eye',
          d: 'Platform usage data for service improvement',
          items: ['Page views and click data', 'Search queries and filters', 'Transaction history', 'Account login times'],
        },
        {
          t: 'Device Information', icon: 'Smartphone',
          d: 'For service security and technical improvement',
          items: ['Browser type and version', 'Device type (mobile/desktop)', 'IP address', 'Operating system'],
        },
      ],

    // Section 2: How We Use Information
    s2Title: isBn ? '২. তথ্য ব্যবহার' : '2. How We Use Information',
    s2Items: isBn
      ? [
        { t: 'সেবা প্রদান', d: 'অ্যাকাউন্ট পরিচালনা, টিকেট লেনদেন, পেমেন্ট প্রক্রিয়া' },
        { t: 'যাচাই', d: 'KYC যাচাই, টিকেট সত্যতা যাচাই, ব্যবহারকারী পরিচয় নিশ্চিত' },
        { t: 'যোগাযোগ', d: 'লেনদেন আপডেট, নীতি পরিবর্তন বিজ্ঞপ্তি, সহায়তা সংক্রান্ত' },
        { t: 'উন্নয়ন', d: 'প্ল্যাটফর্ম উন্নয়ন, ব্যবহারকারী অভিজ্ঞতা বৃদ্ধি, নিরাপত্তা বৃদ্ধি' },
        { t: 'নিরাপত্তা', d: 'জালিয়াতি প্রতিরোধ, অবৈধ কার্যকলাপ সনাক্তকরণ' },
      ]
      : [
        { t: 'Service Delivery', d: 'Account management, ticket transactions, payment processing' },
        { t: 'Verification', d: 'KYC verification, ticket authenticity verification, user identity confirmation' },
        { t: 'Communication', d: 'Transaction updates, policy change notifications, support-related' },
        { t: 'Improvement', d: 'Platform improvement, user experience enhancement, security enhancement' },
        { t: 'Security', d: 'Fraud prevention, detection of illegal activities' },
      ],

    // Section 3: Information Sharing
    s3Title: isBn ? '৩. তথ্য শেয়ারিং' : '3. Information Sharing',
    s3Intro: isBn
      ? 'আমরা আমাদের তথ্য শেয়ারিং নীতি:'
      : 'Our information sharing policy:',
    sharing: isBn
      ? [
        { t: 'তথ্য বিক্রি নেই', d: 'আমরা কোনো ব্যবহারকারীর ব্যক্তিগত তথ্য বিক্রি করি না।', icon: 'Lock', color: 'text-green-600' },
        { t: 'পেমেন্ট প্রক্রিয়াকরী', d: 'পেমেন্ট প্রক্রিয়ার জন্য বিকাশ ও SSLCommerz এ প্রযোজ্য তথ্য শেয়ার। এই সংস্থাগুলো আমাদের সমান নিরাপত্তা মান অনুসরণ করে।', icon: 'Share2', color: 'text-primary' },
        { t: 'আইনি প্রয়োজন', d: 'বাংলাদেশের আইনি প্রয়োজনে, আদালতের আদেশে, অথবা সরকারি তদন্তে প্রযোজ্য তথ্য শেয়ার।', icon: 'FileText', color: 'text-orange' },
        { t: 'লেনদেন তথ্য', d: 'ক্রেতা ও বিক্রেতার মধ্যে টিকেট লেনদেনে প্রযোজ্য তথ্য শেয়ার (নাম, পরিবহন তথ্য)।', icon: 'Database', color: 'text-primary' },
      ]
      : [
        { t: 'No Data Sale', d: 'We do not sell any user\'s personal information.', icon: 'Lock', color: 'text-green-600' },
        { t: 'Payment Processors', d: 'For payment processing, necessary information is shared with bKash and SSLCommerz. These companies follow equivalent security standards.', icon: 'Share2', color: 'text-primary' },
        { t: 'Legal Requirements', d: 'When required by Bangladesh law, court order, or government investigation, applicable information is shared.', icon: 'FileText', color: 'text-orange' },
        { t: 'Transaction Data', d: 'Information necessary for ticket transactions between buyer and seller is shared (name, transport information).', icon: 'Database', color: 'text-primary' },
      ],

    // Section 4: Data Security
    s4Title: isBn ? '৪. তথ্য সুরক্ষা' : '4. Data Security',
    s4Intro: isBn
      ? 'আমরা ব্যবহারকারীর তথ্য সুরক্ষায় শ্রেষ্ঠ প্রযুক্তি ব্যবহার করি:'
      : 'We use the best technology for user data protection:',
    security: isBn
      ? [
        { t: 'এনক্রিপশন', d: 'সকল স্থায়ী তথ্য ২৫৬-বিট AES এনক্রিপশনে সুরক্ষিত। পেমেন্ট তথ্য SSL/TLS এনক্রিপশন।' },
        { t: 'সুরক্ষিত সংরক্ষণ', d: 'তথ্য সুরক্ষিত সার্ভারে সংরক্ষণ, অ্যাক্সেস নিয়ন্ত্রণ প্রযোজ্য।' },
        { t: 'নিয়মিত তদন্ত', d: 'নিরাপত্তা তদন্ত নিয়মিত সম্পন্ন, দুর্বলতা সনাক্তকরণ ও সমাধান।' },
        { t: 'পেমেন্ট সুরক্ষা', d: 'পেমেন্ট গেটওয়ে PCI DSS সম্মতি, কার্ড তথ্য সংরক্ষণ নেই।' },
      ]
      : [
        { t: 'Encryption', d: 'All persistent data is secured with 256-bit AES encryption. Payment data uses SSL/TLS encryption.' },
        { t: 'Secure Storage', d: 'Data is stored on secure servers with required access controls.' },
        { t: 'Regular Audits', d: 'Security audits are conducted regularly to detect and resolve vulnerabilities.' },
        { t: 'Payment Security', d: 'Payment gateway follows PCI DSS compliance, no card data storage.' },
      ],

    // Section 5: Cookies
    s5Title: isBn ? '৫. কুকি' : '5. Cookies',
    s5Intro: isBn
      ? 'আমরা নিম্নলিখিত কুকি ব্যবহার করি:'
      : 'We use the following cookies:',
    cookies: isBn
      ? [
        { t: 'প্রয়োজনীয় কুকি', d: 'অ্যাকাউন্ট লগইন, পেমেন্ট সুরক্ষা, সেশন পরিচালনা — বন্ধ করা যায় না।' },
        { t: 'বিশ্লেষণ কুকি', d: 'ব্যবহার বিশ্লেষণ, পৃষ্ঠা দর্শন, প্রযুক্তিগত উন্নয়ন — বন্ধ করা যায়।' },
        { t: 'পছন্দ কুকি', d: 'ভাষা পছন্দ, থিম পছন্দ, সার্চ ফিল্টার — বন্ধ করা যায়।' },
      ]
      : [
        { t: 'Essential Cookies', d: 'Account login, payment security, session management — cannot be disabled.' },
        { t: 'Analytics Cookies', d: 'Usage analytics, page views, technical improvement — can be disabled.' },
        { t: 'Preference Cookies', d: 'Language preference, theme preference, search filters — can be disabled.' },
      ],

    // Section 6: User Rights
    s6Title: isBn ? '৬. ব্যবহারকারী অধিকার' : '6. User Rights',
    s6Items: isBn
      ? [
        { t: 'তথ্য অ্যাক্সেস', d: 'আপনার সকল ব্যক্তিগত তথ্য দেখুন ও ডাউনলোড করুন।' },
        { t: 'তথ্য সংশোধন', d: 'আপনার তথ্য সংশোধন করুন (নাম, ইমেইল, ফটো, ঠিকানা)।' },
        { t: 'অ্যাকাউন্ট মুছুন', d: 'অ্যাকাউন্ট মুছুন — সকল তথ্য ৩০ দিনের মধ্যে সম্পূর্ণ মুছে ফেলা হয়।' },
        { t: 'যোগাযোগ না করা', d: 'বিজ্ঞপ্তি ও ইমেইল যোগাযোগ থেকে বের হওয়া (opt out)।' },
      ]
      : [
        { t: 'Access Data', d: 'View and download all your personal information.' },
        { t: 'Correct Data', d: 'Correct your information (name, email, photo, address).' },
        { t: 'Delete Account', d: 'Delete your account — all data is completely removed within 30 days.' },
        { t: 'Opt Out of Communications', d: 'Opt out of notifications and email communications.' },
      ],

    // Section 7: Data Retention
    s7Title: isBn ? '৭. তথ্য সংরক্ষণ সময়' : '7. Data Retention',
    s7Intro: isBn
      ? 'আমরা নিম্নলিখিত সময়সীমায় তথ্য সংরক্ষণ করি:'
      : 'We retain data for the following durations:',
    retention: isBn
      ? [
        { t: 'অ্যাকাউন্ট তথ্য', d: 'অ্যাকাউন্ট সক্রিয় থাকার সময় + মুছে ফেলার অনুরোধের ৩০ দিন' },
        { t: 'লেনদেন তথ্য', d: '৩ বছর (আইনি প্রয়োজন)' },
        { t: 'KYC তথ্য', d: 'অ্যাকাউন্ট সক্রিয় থাকার সময় + মুছে ফেলার ৩০ দিন' },
        { t: 'ব্যবহার তথ্য', d: '২ বছর' },
        { t: 'পেমেন্ট তথ্য', d: '৩ বছর (আইনি প্রয়োজন)' },
      ]
      : [
        { t: 'Account Data', d: 'Duration of active account + 30 days after deletion request' },
        { t: 'Transaction Data', d: '3 years (legal requirement)' },
        { t: 'KYC Data', d: 'Duration of active account + 30 days after deletion' },
        { t: 'Usage Data', d: '2 years' },
        { t: 'Payment Data', d: '3 years (legal requirement)' },
      ],

    // Section 8: Children's Privacy
    s8Title: isBn ? '৮. শিশু গোপনীয়তা' : '8. Children\'s Privacy',
    s8Content: isBn
      ? 'ঈদ টিকেট রিসেল ১৩ বছরের কম বয়সী শিশুদের জন্য নয়। আমরা ১৩ বছরের কম বয়সী শিশুর ব্যক্তিগত তথ্য সংগ্রহ করি না। যদি আমরা জানতে পারি ১৩ বছরের কম বয়সী শিশু অ্যাকাউন্ট তৈরি করেছে, অ্যাকাউন্ট তাৎক্ষণিকভাবে বাতিল করা হবে।'
      : 'Eid Ticket Resell is not for children under 13 years of age. We do not collect personal information from children under 13. If we discover that a child under 13 has created an account, the account will be immediately cancelled.',

    // Section 9: Changes to Policy
    s9Title: isBn ? '৯. নীতি পরিবর্তন' : '9. Changes to Policy',
    s9Items: isBn
      ? [
        'আমরা যেকোনো সময় গোপনীয়তা নীতি পরিবর্তন করতে পারি।',
        'পরিবর্তন প্ল্যাটফর্মে প্রকাশের পর প্রযোজ্য।',
        'বড় পরিবর্তনের জন্য ইমেইল বিজ্ঞপ্তি প্রদান।',
        'প্রযোজ্য তারিখ: প্রকাশের ৭ দিন পর।',
      ]
      : [
        'We may modify this privacy policy at any time.',
        'Changes become effective upon publication on the platform.',
        'For significant changes, email notification is provided.',
        'Effective date: 7 days after publication.',
      ],

    // Section 10: Contact
    s10Title: isBn ? '১০. গোপনীয়তা সংক্রান্ত যোগাযোগ' : '10. Contact for Privacy Concerns',
    s10Content: isBn
      ? 'গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্ন, অভিযোগ অথবা অনুরোধের জন্য যোগাযোগ করুন:'
      : 'For any questions, complaints, or requests related to privacy, please contact:',
    contact: isBn
      ? [
        { label: 'ইমেইল', value: 'privacy@eidticketresell.com' },
        { label: 'ফোন', value: '+880 1234-567890' },
        { label: 'ঠিকানা', value: 'ঢাকা, বাংলাদেশ' },
      ]
      : [
        { label: 'Email', value: 'privacy@eidticketresell.com' },
        { label: 'Phone', value: '+880 1234-567890' },
        { label: 'Address', value: 'Dhaka, Bangladesh' },
      ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${fontClass}`}>{content.hero.title}</h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${fontClass}`}>{content.hero.subtitle}</p>
      </div>

      {/* Section 1: Information We Collect */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Database className="w-5 h-5 text-primary" />
            {content.s1Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s1Intro}</p>
          <div className="space-y-4">
            {content.collectCategories.map((cat, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{cat.t}</Badge>
                  </div>
                  <p className={`text-sm text-muted-foreground mb-2 ${fontClass}`}>{cat.d}</p>
                  <ul className="space-y-1">
                    {cat.items.map((item, j) => (
                      <li key={j} className={`flex items-center gap-2 text-sm ${fontClass}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: How We Use Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <KeyRound className="w-5 h-5 text-primary" />
            {content.s2Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.s2Items.map((item, i) => (
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
        </CardContent>
      </Card>

      {/* Section 3: Information Sharing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Share2 className="w-5 h-5 text-primary" />
            {content.s3Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s3Intro}</p>
          <div className="space-y-3">
            {content.sharing.map((item, i) => (
              <Card key={i} className={`border-${item.color.includes('green') ? 'green-600/20 bg-green-600/5' : item.color.includes('orange') ? 'orange/20 bg-orange/5' : 'primary/20 bg-primary/5'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lock className={`w-5 h-5 ${item.color} shrink-0 mt-0.5`} />
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

      {/* Section 4: Data Security */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Lock className="w-5 h-5 text-primary" />
            {content.s4Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s4Intro}</p>
          <div className="space-y-3">
            {content.security.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-semibold ${fontClass}`}>{item.t}</h4>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Cookies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Cookie className="w-5 h-5 text-primary" />
            {content.s5Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s5Intro}</p>
          <div className="space-y-3">
            {content.cookies.map((item, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="shrink-0 mt-0.5 text-xs">
                      {i === 0 ? (isBn ? 'প্রয়োজনীয়' : 'Required') : (isBn ? 'বিকল্প' : 'Optional')}
                    </Badge>
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

      {/* Section 6: User Rights */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <UserCheck className="w-5 h-5 text-primary" />
            {content.s6Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {content.s6Items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className={`font-semibold ${fontClass}`}>{item.t}</h4>
                <p className={`text-sm text-muted-foreground ${fontClass}`}>{item.d}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 7: Data Retention */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Clock className="w-5 h-5 text-primary" />
            {content.s7Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s7Intro}</p>
          <div className="space-y-2">
            {content.retention.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0 mt-0.5 font-bold">
                  {isBn ? `${i + 1}` : `${i + 1}`}
                </Badge>
                <div>
                  <p className={`font-semibold text-sm ${fontClass}`}>{item.t}</p>
                  <p className={`text-xs text-muted-foreground ${fontClass}`}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 8: Children's Privacy */}
      <Card className="mb-6 border-orange/20">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Baby className="w-5 h-5 text-orange" />
            {content.s8Title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-muted-foreground leading-relaxed ${fontClass}`}>{content.s8Content}</p>
        </CardContent>
      </Card>

      {/* Section 9: Changes to Policy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Bell className="w-5 h-5 text-primary" />
            {content.s9Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {content.s9Items.map((p, i) => (
            <p key={i} className={`flex items-start gap-2 text-sm text-muted-foreground ${fontClass}`}>
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {p}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Section 10: Contact */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Mail className="w-5 h-5 text-primary" />
            {content.s10Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s10Content}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {content.contact.map((c, i) => (
              <Card key={i} className="border-primary/10 text-center">
                <CardContent className="p-4">
                  <p className={`font-semibold text-primary mb-1 ${fontClass}`}>{c.label}</p>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{c.value}</p>
                </CardContent>
              </Card>
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
