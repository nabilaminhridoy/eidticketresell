'use client';

import { useLanguageStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Cookie, Info, ShieldCheck, BarChart3, Settings,
  Megaphone, Monitor, Globe, Clock, Bell,
  Mail, CheckCircle2, Lock, Eye, Cog
} from 'lucide-react';

export default function CookiesPolicyPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const content = {
    hero: {
      title: isBn ? 'কুকি নীতি' : 'Cookies Policy',
      subtitle: isBn
        ? 'কুকি কি, আমরা কুকি কিভাবে ব্যবহার করি, এবং আপনি কিভাবে কুকি নিয়ন্ত্রণ করতে পারেন'
        : 'What cookies are, how we use them, and how you can manage them',
    },
    lastUpdated: isBn ? 'সর্বশেষ আপডেট: ১ মার্চ, ২০২৫' : 'Last Updated: March 1, 2025',

    // Section 1: What Are Cookies
    s1Title: isBn ? '১. কুকি কি?' : '1. What Are Cookies?',
    s1Content: isBn
      ? 'কুকি হল ছোট টেক্সট ফাইল যা আপনার ব্রাউজারে সংরক্ষণ করা হয় যখন আপনি একটি ওয়েবসাইট দর্শন করেন। কুকি ওয়েবসাইটকে আপনার পছন্দ ও সেটিংস মনে রাখতে সাহায্য করে, প্রতিটি দর্শনে একই তথ্য পুনরায় প্রদান করতে হয় না। কুকি আপনার কম্পিউটারে কোনো ক্ষতিকারক প্রোগ্রাম অথবা ভাইরাস সংরক্ষণ করে না। তা আপনার ব্যক্তিগত তথ্য সরাসরি সংগ্রহ করে না।'
      : 'Cookies are small text files that are stored on your browser when you visit a website. Cookies help the website remember your preferences and settings, so you don\'t need to provide the same information again on each visit. Cookies do not store any harmful programs or viruses on your computer. They do not directly collect your personal information.',
    s1Points: isBn
      ? [
        'কুকি ছোট টেক্সট ফাইল, সরাসরি ব্যক্তিগত তথ্য সংগ্রহ করে না',
        'আপনার ব্রাউজারে সংরক্ষণ, ওয়েবসাইটকে পছন্দ মনে রাখতে সাহায্য',
        'কোনো ভাইরাস অথবা ক্ষতিকারক প্রোগ্রাম সংরক্ষণ করে না',
        'আপনি ব্রাউজার সেটিংস দিয়ে কুকি নিয়ন্ত্রণ করতে পারেন',
      ]
      : [
        'Cookies are small text files, they don\'t directly collect personal information',
        'Stored in your browser, helping the website remember your preferences',
        'They do not store any viruses or harmful programs',
        'You can control cookies through your browser settings',
      ],

    // Section 2: Types of Cookies
    s2Title: isBn ? '২. আমরা কি কুকি ব্যবহার করি' : '2. Types of Cookies We Use',

    essentialTitle: isBn ? 'প্রয়োজনীয় কুকি' : 'Essential Cookies',
    essentialDesc: isBn
      ? 'প্রয়োজনীয় কুকি প্ল্যাটফর্মের মৌলিক কার্যক্রমের জন্য অপরিহার্য। এগুলো বন্ধ করা যায় না।'
      : 'Essential cookies are required for the platform\'s basic functionality. These cannot be disabled.',
    essentialItems: isBn
      ? [
        { name: 'লগইন সেশন', d: 'আপনার অ্যাকাউন্ট লগইন অবস্থা মনে রাখে' },
        { name: 'পেমেন্ট সুরক্ষা', d: 'পেমেন্ট প্রক্রিয়ার সুরক্ষা ও প্রমাণীকরণ' },
        { name: 'সেশন টোকেন', d: 'সেশন পরিচালনা ও নিরাপত্তা' },
        { name: 'CSRF সুরক্ষা', d: 'ক্রস-সাইট রিকোয়েস্ট জালিয়াতি প্রতিরোধ' },
      ]
      : [
        { name: 'Login Session', d: 'Keeps your account logged in' },
        { name: 'Payment Security', d: 'Payment process security and authentication' },
        { name: 'Session Token', d: 'Session management and security' },
        { name: 'CSRF Protection', d: 'Cross-site request forgery prevention' },
      ],
    essentialBadge: isBn ? 'বন্ধ করা যায় না' : 'Cannot be disabled',

    performanceTitle: isBn ? 'পারফরম্যান্স কুকি' : 'Performance Cookies',
    performanceDesc: isBn
      ? 'পারফরম্যান্স কুকি প্ল্যাটফর্মের কার্যক্ষমতা ও ব্যবহারকারী অভিজ্ঞতা বৃদ্ধি করে। এগুলো বন্ধ করা যায়।'
      : 'Performance cookies improve the platform\'s performance and user experience. These can be disabled.',
    performanceItems: isBn
      ? [
        { name: 'পৃষ্ঠা দর্শন ট্র্যাকিং', d: 'কোন পৃষ্ঠা দর্শন করেন তা বিশ্লেষণ' },
        { name: 'পেজ লোড সময়', d: 'পৃষ্ঠা লোড সময় বিশ্লেষণ ও উন্নয়ন' },
        { name: 'ত্রুটি ট্র্যাকিং', d: 'প্রযুক্তিগত ত্রুটি সনাক্তকরণ' },
        { name: 'ব্যবহার প্রবাহ', d: 'ব্যবহারকারী প্রবাহ বিশ্লেষণ ও উন্নয়ন' },
      ]
      : [
        { name: 'Page View Tracking', d: 'Analyzes which pages you view' },
        { name: 'Page Load Time', d: 'Analyzes and improves page load times' },
        { name: 'Error Tracking', d: 'Detects technical errors' },
        { name: 'User Flow', d: 'Analyzes and improves user flow' },
      ],
    performanceBadge: isBn ? 'বিকল্প' : 'Optional',

    functionalityTitle: isBn ? 'ফাংশনালিটি কুকি' : 'Functionality Cookies',
    functionalityDesc: isBn
      ? 'ফাংশনালিটি কুকি আপনার পছন্দ মনে রাখে ও ব্যবহারকারী অভিজ্ঞতা বৃদ্ধি করে। এগুলো বন্ধ করা যায়।'
      : 'Functionality cookies remember your preferences and enhance user experience. These can be disabled.',
    functionalityItems: isBn
      ? [
        { name: 'ভাষা পছন্দ', d: 'আপনার নির্বাচিত ভাষা (বাংলা/English) মনে রাখে' },
        { name: 'থিম পছন্দ', d: 'আপনার নির্বাচিত থিম (লাইট/ডার্ক) মনে রাখে' },
        { name: 'সার্চ ফিল্টার', d: 'সার্চ ও ফিল্টার পছন্দ মনে রাখে' },
        { name: 'লেআউট পছন্দ', d: 'পৃষ্ঠা লেআউট ও প্রদর্শন পছন্দ মনে রাখে' },
      ]
      : [
        { name: 'Language Preference', d: 'Remembers your selected language (Bengali/English)' },
        { name: 'Theme Preference', d: 'Remembers your selected theme (Light/Dark)' },
        { name: 'Search Filters', d: 'Remembers search and filter preferences' },
        { name: 'Layout Preference', d: 'Remembers page layout and display preferences' },
      ],
    functionalityBadge: isBn ? 'বিকল্প' : 'Optional',

    advertisingTitle: isBn ? 'বিজ্ঞপ্তি কুকি' : 'Advertising Cookies',
    advertisingDesc: isBn
      ? 'বর্তমানে আমরা বিজ্ঞপ্তি কুকি ব্যবহার করি না। ভবিষ্যতে যোগ করার পরিকল্পনা আছে এবং তখন এই নীতি আপডেট করা হবে।'
      : 'We currently do not use advertising cookies. We plan to add them in the future and will update this policy accordingly.',
    advertisingBadge: isBn ? 'বর্তমানে ব্যবহার নেই' : 'Not currently used',

    // Section 3: How to Manage Cookies
    s3Title: isBn ? '৩. কুকি নিয়ন্ত্রণ' : '3. How to Manage Cookies',
    s3Intro: isBn
      ? 'আপনি ব্রাউজার সেটিংস দিয়ে কুকি নিয়ন্ত্রণ করতে পারেন। প্রয়োজনীয় কুকি বন্ধ করলে প্ল্যাটফর্মের মৌলিক কার্যক্রম সম্পন্ন হতে পারে না।'
      : 'You can control cookies through your browser settings. Disabling essential cookies may prevent the platform\'s basic functionality from working.',
    browsers: isBn
      ? [
        {
          name: 'Google Chrome', d: 'সেটিংস → প্রাইভেসি ও সিকিউরিটি → কুকি ও অন্যান্য সাইট ডেটা',
        },
        {
          name: 'Mozilla Firefox', d: 'সেটিংস → প্রাইভেসি ও সিকিউরিটি → কুকি ও সাইট ডেটা',
        },
        {
          name: 'Safari (iPhone)', d: 'সেটিংস → Safari → প্রাইভেসি ও সিকিউরিটি',
        },
        {
          name: 'Safari (Mac)', d: 'Safari → প্রিফারেন্স → প্রাইভেসি',
        },
      ]
      : [
        {
          name: 'Google Chrome', d: 'Settings → Privacy and security → Cookies and other site data',
        },
        {
          name: 'Mozilla Firefox', d: 'Settings → Privacy & Security → Cookies and Site Data',
        },
        {
          name: 'Safari (iPhone)', d: 'Settings → Safari → Privacy & Security',
        },
        {
          name: 'Safari (Mac)', d: 'Safari → Preferences → Privacy',
        },
      ],

    // Section 4: Third-Party Cookies
    s4Title: isBn ? '৪. তৃতীয় পক্ষের কুকি' : '4. Third-Party Cookies',
    s4Content: isBn
      ? 'প্ল্যাটফর্মে তৃতীয় পক্ষের কুকি ব্যবহার হতে পারে:'
      : 'Third-party cookies may be used on the platform:',
    thirdParty: isBn
      ? [
        { name: 'Google Analytics', d: 'প্ল্যাটফর্ম ব্যবহার বিশ্লেষণ ও উন্নয়নের জন্য। আপনি Google Analytics অপ্ট-আউট প্লাগইন দিয়ে বন্ধ করতে পারেন।', opt: 'অপ্ট-আউট প্লাগইন উপলব্ধ' },
        { name: 'bKash', d: 'বিকাশ পেমেন্ট প্রক্রিয়ার জন্য নিজস্ব কুকি ব্যবহার।', opt: 'পেমেন্ট প্রক্রিয়া প্রয়োজনীয়' },
        { name: 'SSLCommerz', d: 'SSLCommerz পেমেন্ট প্রক্রিয়ার জন্য নিজস্ব কুকি ব্যবহার।', opt: 'পেমেন্ট প্রক্রিয়া প্রয়োজনীয়' },
      ]
      : [
        { name: 'Google Analytics', d: 'For platform usage analytics and improvement. You can disable it using the Google Analytics opt-out plugin.', opt: 'Opt-out plugin available' },
        { name: 'bKash', d: 'bKash uses its own cookies for payment processing.', opt: 'Required for payment' },
        { name: 'SSLCommerz', d: 'SSLCommerz uses its own cookies for payment processing.', opt: 'Required for payment' },
      ],

    // Section 5: Cookie Duration
    s5Title: isBn ? '৫. কুকি সময়কাল' : '5. Cookie Duration',
    s5Intro: isBn
      ? 'কুকি সময়কাল দুই প্রকার:'
      : 'Cookie duration is of two types:',
    duration: isBn
      ? [
        { t: 'সেশন কুকি', d: 'ব্রাউজার বন্ধ করলে স্বয়ংক্রিয়ভাবে মুছে যায়। প্রয়োজনীয় সেশন কুকি (লগইন, পেমেন্ট)।' },
        { t: 'স্থায়ী কুকি', d: 'নির্দিষ্ট সময়ের জন্য সংরক্ষণ (১ দিন থেকে ১ বছর)। পছন্দ ও বিশ্লেষণ কুকি।' },
      ]
      : [
        { t: 'Session Cookies', d: 'Automatically deleted when the browser is closed. Used for essential session cookies (login, payment).' },
        { t: 'Persistent Cookies', d: 'Stored for a specified duration (1 day to 1 year). Used for preference and analytics cookies.' },
      ],
    expiry: isBn
      ? [
        { t: 'লগইন সেশন', d: 'ব্রাউজার বন্ধ হলে মুছে যায়' },
        { t: 'ভাষা পছন্দ', d: '১ বছর' },
        { t: 'থিম পছন্দ', d: '১ বছর' },
        { t: 'বিশ্লেষণ', d: '২ বছর' },
        { t: 'পেমেন্ট টোকেন', d: 'ব্রাউজার বন্ধ হলে মুছে যায়' },
      ]
      : [
        { t: 'Login Session', d: 'Deleted when browser closes' },
        { t: 'Language Preference', d: '1 year' },
        { t: 'Theme Preference', d: '1 year' },
        { t: 'Analytics', d: '2 years' },
        { t: 'Payment Token', d: 'Deleted when browser closes' },
      ],

    // Section 6: Changes to Policy
    s6Title: isBn ? '৬. নীতি পরিবর্তন' : '6. Changes to Policy',
    s6Items: isBn
      ? [
        'আমরা যেকোনো সময় কুকি নীতি পরিবর্তন করতে পারি।',
        'পরিবর্তন প্ল্যাটফর্মে প্রকাশের পর প্রযোজ্য।',
        'বড় পরিবর্তনের জন্য ইমেইল বিজ্ঞপ্তি প্রদান।',
        'প্রযোজ্য তারিখ: প্রকাশের ৭ দিন পর।',
      ]
      : [
        'We may modify this cookies policy at any time.',
        'Changes become effective upon publication on the platform.',
        'For significant changes, email notification is provided.',
        'Effective date: 7 days after publication.',
      ],

    // Section 7: Contact
    s7Title: isBn ? '৭. যোগাযোগ' : '7. Contact',
    s7Content: isBn
      ? 'কুকি সংক্রান্ত যেকোনো প্রশ্নের জন্য যোগাযোগ করুন:'
      : 'For any questions related to cookies, please contact:',
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
          <Cookie className="w-7 h-7 text-primary" />
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${fontClass}`}>{content.hero.title}</h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${fontClass}`}>{content.hero.subtitle}</p>
      </div>

      {/* Section 1: What Are Cookies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Info className="w-5 h-5 text-primary" />
            {content.s1Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground leading-relaxed ${fontClass}`}>{content.s1Content}</p>
          <ul className="space-y-2">
            {content.s1Points.map((p, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 2: Types of Cookies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Cookie className="w-5 h-5 text-primary" />
            {content.s2Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Essential Cookies */}
          <Card className="border-green-600/20 bg-green-600/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <h3 className={`font-semibold text-lg ${fontClass}`}>{content.essentialTitle}</h3>
                <Badge className="bg-green-600 text-white">{content.essentialBadge}</Badge>
              </div>
              <p className={`text-sm text-muted-foreground ${fontClass}`}>{content.essentialDesc}</p>
              <ul className="space-y-2">
                {content.essentialItems.map((item, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                    <Lock className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-medium ${fontClass}`}>{item.name}</span>
                      <span className={`text-muted-foreground ${fontClass}`}> — {item.d}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Performance Cookies */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className={`font-semibold text-lg ${fontClass}`}>{content.performanceTitle}</h3>
                <Badge variant="secondary">{content.performanceBadge}</Badge>
              </div>
              <p className={`text-sm text-muted-foreground ${fontClass}`}>{content.performanceDesc}</p>
              <ul className="space-y-2">
                {content.performanceItems.map((item, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                    <BarChart3 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-medium ${fontClass}`}>{item.name}</span>
                      <span className={`text-muted-foreground ${fontClass}`}> — {item.d}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Functionality Cookies */}
          <Card className="border-orange/20 bg-orange/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange" />
                <h3 className={`font-semibold text-lg ${fontClass}`}>{content.functionalityTitle}</h3>
                <Badge variant="secondary">{content.functionalityBadge}</Badge>
              </div>
              <p className={`text-sm text-muted-foreground ${fontClass}`}>{content.functionalityDesc}</p>
              <ul className="space-y-2">
                {content.functionalityItems.map((item, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${fontClass}`}>
                    <Cog className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                    <div>
                      <span className={`font-medium ${fontClass}`}>{item.name}</span>
                      <span className={`text-muted-foreground ${fontClass}`}> — {item.d}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Advertising Cookies */}
          <Card className="border-muted bg-muted/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-muted-foreground" />
                <h3 className={`font-semibold text-lg ${fontClass}`}>{content.advertisingTitle}</h3>
                <Badge variant="outline">{content.advertisingBadge}</Badge>
              </div>
              <p className={`text-sm text-muted-foreground ${fontClass}`}>{content.advertisingDesc}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Section 3: How to Manage Cookies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Monitor className="w-5 h-5 text-primary" />
            {content.s3Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s3Intro}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {content.browsers.map((b, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-4">
                  <p className={`font-semibold mb-1 ${fontClass}`}>{b.name}</p>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{b.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-orange/20 bg-orange/5 mt-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-orange shrink-0" />
                <p className={`text-sm text-muted-foreground ${fontClass}`}>
                  {isBn
                    ? 'প্রয়োজনীয় কুকি বন্ধ করলে প্ল্যাটফর্মের লগইন, পেমেন্ট ও সেশন কার্যক্রম সম্পন্ন হতে পারে না। অন্যান্য কুকি বন্ধ করলে প্ল্যাটফর্মের কিছু ফিচার সীমিত হতে পারে।'
                    : 'Disabling essential cookies may prevent login, payment, and session functionality. Disabling other cookies may limit some platform features.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Section 4: Third-Party Cookies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Globe className="w-5 h-5 text-primary" />
            {content.s4Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s4Content}</p>
          <div className="space-y-3">
            {content.thirdParty.map((tp, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className={`font-semibold ${fontClass}`}>{tp.name}</p>
                    <Badge variant="outline" className="text-xs">{tp.opt}</Badge>
                  </div>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{tp.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Cookie Duration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Clock className="w-5 h-5 text-primary" />
            {content.s5Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s5Intro}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {content.duration.map((d, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-4">
                  <h4 className={`font-semibold mb-1 ${fontClass}`}>{d.t}</h4>
                  <p className={`text-sm text-muted-foreground ${fontClass}`}>{d.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator />
          <h4 className={`font-semibold mb-3 ${fontClass}`}>
            {isBn ? 'কুকি মেয়াদ বিবরণ:' : 'Cookie expiry details:'}
          </h4>
          <div className="space-y-2">
            {content.expiry.map((e, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-muted/50">
                <span className={`text-sm font-medium ${fontClass}`}>{e.t}</span>
                <Badge variant="secondary" className={`text-xs ${fontClass}`}>{e.d}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Changes to Policy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Bell className="w-5 h-5 text-primary" />
            {content.s6Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {content.s6Items.map((p, i) => (
            <p key={i} className={`flex items-start gap-2 text-sm text-muted-foreground ${fontClass}`}>
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              {p}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Section 7: Contact */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-xl ${fontClass}`}>
            <Mail className="w-5 h-5 text-primary" />
            {content.s7Title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-muted-foreground ${fontClass}`}>{content.s7Content}</p>
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
