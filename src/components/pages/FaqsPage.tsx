'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HelpCircle,
  ShoppingCart,
  Tag,
  CreditCard,
  UserCircle,
  MessageCircle,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  icon: React.ElementType;
  title: string;
  color: string;
  items: FaqItem[];
}

// Icon/color mapping for DB categories
const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  'general': HelpCircle,
  'buying': ShoppingCart,
  'selling': Tag,
  'payment': CreditCard,
  'account': UserCircle,
};

const CATEGORY_COLOR_MAP: Record<string, string> = {
  'general': 'bg-green-600',
  'buying': 'bg-orange-500',
  'selling': 'bg-purple-500',
  'payment': 'bg-blue-500',
  'account': 'bg-teal-500',
};

export default function FaqsPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const cls = isBn ? 'font-bangla' : '';

  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    fetch('/api/faqs')
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout);
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setDbCategories(data.categories);
        }
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  // Default hardcoded FAQ categories (fallback)
  const defaultFaqCategories: FaqCategory[] = [
    {
      icon: HelpCircle,
      title: isBn ? 'সাধারণ জিজ্ঞাসা' : 'General',
      color: 'bg-green-600',
      items: [
        {
          q: isBn ? 'ঈদ টিকেট রিসেল কি?' : 'What is Eid Ticket Resell?',
          a: isBn
            ? 'ঈদ টিকেট রিসেল বাংলাদেশের সবচেয়ে বিশ্বস্ত টিকেট মার্কেটপ্লেস। আমরা বাস, ট্রেন, ফ্লাইট ও লঞ্চ টিকেট নিরাপদে কেনাবেচার প্ল্যাটফর্ম প্রদান করি। এসক্রো সুরক্ষা, যাচাইকৃত বিক্রেতা ও 24/7 সাহায্য নিশ্চিত করি।'
            : 'Eid Ticket Resell is Bangladesh\'s most trusted ticket marketplace. We provide a secure platform for buying and selling Bus, Train, Flight & Launch tickets. We ensure escrow protection, verified sellers, and 24/7 support.',
        },
        {
          q: isBn ? 'কিভাবে কাজ করে?' : 'How does it work?',
          a: isBn
            ? 'ক্রেতা টিকেট সার্চ করে, পছন্দ করে এবং পেমেন্ট করে। পেমেন্ট এসক্রোতে রাখা হয়। বিক্রেতা টিকেট তালিকাভুক্ত করে, যাচাই পায় এবং যাত্রা শেষে পেমেন্ট পায়। সকল লেনদেন নিরাপদ ও স্বচ্ছ।'
            : 'Buyers search, select, and pay for tickets. Payments are held in escrow. Sellers list tickets, get verified, and receive payment after the journey. All transactions are secure and transparent.',
        },
        {
          q: isBn ? 'এটি কি নিরাপদ?' : 'Is it safe?',
          a: isBn
            ? 'হ্যাঁ, সম্পূর্ণ নিরাপদ। আমাদের এসক্রো সিস্টেম ক্রেতার পেমেন্ট যাত্রা শেষ হওয়া পর্যন্ত রাখে। প্রতিটি বিক্রেতা KYC যাচাই সম্পন্ন করে। PNR যাচাই টুল টিকেটের সত্যিকার নিশ্চিত করে।'
            : 'Yes, completely safe. Our escrow system holds buyer payments until the journey is complete. Every seller completes KYC verification. The PNR verification tool confirms ticket authenticity.',
        },
        {
          q: isBn ? 'কোন যানবাহনের টিকেট পাওয়া যায়?' : 'Which transport types are available?',
          a: isBn
            ? 'বাস, ট্রেন, ফ্লাইট ও লঞ্চ — বাংলাদেশের সকল প্রধান যানবাহনের টিকেট পাওয়া যায়। ঢাকা-চট্টগ্রাম, ঢাকা-সিলেট, ঢাকা-রাজশাহী ও অন্যান্য প্রধান রুটের টিকেট উপলব্ধ।'
            : 'Bus, Train, Flight & Launch — tickets for all major Bangladesh transport types are available. Tickets for Dhaka-Chittagong, Dhaka-Sylhet, Dhaka-Rajshahi and other major routes are available.',
        },
        {
          q: isBn ? 'প্ল্যাটফর্ম কি বিনামূল্যে?' : 'Is the platform free?',
          a: isBn
            ? 'ক্রেতাদের জন্য সম্পূর্ণ বিনামূল্যে। বিক্রেতাদের জন্য টিকেট তালিকাভুক্ত করা বিনামূল্যে, কিন্তু টিকেট বিক্রি হলে একটি সামান্য সার্ভিস ফি প্রযোজ্য। ফি স্বচ্ছ ও প্রতিযোগিতামূলক।'
            : 'Completely free for buyers. Sellers can list tickets for free, but a small service fee applies when a ticket is sold. The fee is transparent and competitive.',
        },
        {
          q: isBn ? 'মোবাইল অ্যাপ কি আছে?' : 'Is there a mobile app?',
          a: isBn
            ? 'বর্তমানে আমরা মোবাইল-অনুকূল ওয়েবসাইট প্রদান করি। মোবাইল অ্যাপ শীঘ্রই আসছে। যেকোনো মোবাইল ব্রাউজারে সহজে প্ল্যাটফর্ম ব্যবহার করা যায়।'
            : 'Currently we provide a mobile-friendly website. A mobile app is coming soon. The platform works seamlessly on any mobile browser.',
        },
      ],
    },
    {
      icon: ShoppingCart,
      title: isBn ? 'টিকেট ক্রয়' : 'Buying Tickets',
      color: 'bg-orange-500',
      items: [
        {
          q: isBn ? 'কিভাবে টিকেট কিনব?' : 'How to buy tickets?',
          a: isBn
            ? 'হোম পেজে যানবাহনের ধরন, রুট ও তারিখ নির্বাচন করে সার্চ করুন। পছন্দের টিকেট নির্বাচন করুন, PNR যাচাই করুন, পেমেন্ট করুন এবং টিকেট কনফিরমেশন পান।'
            : 'Select transport type, route, and date on the home page to search. Choose your ticket, verify PNR, make payment, and receive ticket confirmation.',
        },
        {
          q: isBn ? 'টিকেট ভুল হলে কি করব?' : 'What if the ticket is invalid?',
          a: isBn
            ? 'টিকেট ভুল হলে অবিলম্বে সাহায্য দলে রিপোর্ট করুন। এসক্রো সুরক্ষার অধীনে সম্পূর্ণ ফেরত পাবেন। বিক্রেতার অ্যাকাউন্ট সাময়িক বা স্থায়ী বন্ধ করা হবে।'
            : 'Report to our support team immediately if a ticket is invalid. You\'ll receive a full refund under escrow protection. The seller\'s account may be temporarily or permanently suspended.',
        },
        {
          q: isBn ? 'টিকেট কি ক্যানসেল করা যায়?' : 'Can I cancel a ticket purchase?',
          a: isBn
            ? 'পেমেন্ট সম্পন্ন হওয়ার 30 মিনিটের মধ্যে ক্যানসেল করা যায়। যাত্রা শুরুর 24 ঘণ্টা আগে ক্যানসেল করলে 80% ফেরত পাবেন। বিস্তারিত ফেরত নীতি দেখুন।'
            : 'Cancellation is possible within 30 minutes of payment. If cancelled 24 hours before journey start, you\'ll receive an 80% refund. See detailed refund policy.',
        },
        {
          q: isBn ? 'PNR কিভাবে যাচাই করব?' : 'How to verify PNR?',
          a: isBn
            ? 'আমাদের "Verify Ticket" পেজে PNR নম্বর দিয়ে যাচাই করুন। ট্রেন টিকেটের PNR বাংলাদেশ রেলওয়ে ওয়েবসাইটেও যাচাই করা যায়। বাস টিকেটের PNR সংশ্লিষ্ট কোম্পানির ওয়েবসাইটে যাচাই করুন।'
            : 'Use our "Verify Ticket" page to verify with the PNR number. Train PNR can also be verified on Bangladesh Railway website. Bus PNR can be verified on the respective company\'s website.',
        },
        {
          q: isBn ? 'একই টিকেট দুজন কি কিনতে পারে?' : 'Can two people buy the same ticket?',
          a: isBn
            ? 'না, একই টিকেট একবারই কেনা যায়। প্রথম ক্রেতা পেমেন্ট সম্পন্ন করলে টিকেট "Sold" হিসেবে দেখায়। অন্য ক্রেতারা আর কিনতে পারবে না।'
            : 'No, a ticket can only be purchased once. When the first buyer completes payment, the ticket shows as "Sold". Other buyers cannot purchase it anymore.',
        },
        {
          q: isBn ? 'টিকেটের মূল্য কে নির্ধারণ করে?' : 'Who sets the ticket price?',
          a: isBn
            ? 'বিক্রেতা টিকেটের মূল্য নির্ধারণ করে। মূল মূল্যের উপরে বা নিচে মূল্য সেট করা যায়। তবে অতিরিক্ত মূল্যের টিকেট আমাদের প্ল্যাটফর্ম সীমাবদ্ধ করে।'
            : 'The seller sets the ticket price. Pricing can be above or below the original fare. However, excessively priced tickets are restricted by our platform.',
        },
      ],
    },
    {
      icon: Tag,
      title: isBn ? 'টিকেট বিক্রি' : 'Selling Tickets',
      color: 'bg-purple-500',
      items: [
        {
          q: isBn ? 'কিভাবে বিক্রেতা হব?' : 'How to become a seller?',
          a: isBn
            ? 'অ্যাকাউন্ট তৈরি করুন, KYC যাচাই সম্পন্ন করুন এবং "Sell Tickets" পেজে টিকেট তালিকাভুক্ত করুন। বিক্রেতা হওয়া সহজ ও বিনামূল্যে।'
            : 'Create an account, complete KYC verification, and list tickets on the "Sell Tickets" page. Becoming a seller is easy and free.',
        },
        {
          q: isBn ? 'KYC যাচাইয়ের জন্য কি দরকার?' : 'What is needed for KYC verification?',
          a: isBn
            ? 'জাতীয় পরিচয়পত্র (NID) বা পাসপোর্ট ও মুখের ছবি দিয়ে KYC যাচাই সম্পন্ন করুন। যাচাই সাধারণত 24-48 ঘণ্টায় সম্পন্ন হয়।'
            : 'Complete KYC verification with your National ID (NID) or Passport and a facial photo. Verification is usually completed within 24-48 hours.',
        },
        {
          q: isBn ? 'মূল্য কিভাবে সেট করব?' : 'How to set price?',
          a: isBn
            ? 'টিকেট তালিকাভুক্ত করার সময় মূল্য সেট করুন। মূল মূল্যের উপরে বা নিচে সেট করা যায়। আমাদের মূল্য টুল মার্কেট রেট অনুযায়ী সুপারিশ দেয়।'
            : 'Set the price while listing the ticket. It can be above or below the original fare. Our pricing tool suggests rates based on market trends.',
        },
        {
          q: isBn ? 'পেমেন্ট কবে পাব?' : 'When do I get paid?',
          a: isBn
            ? 'ক্রেতার যাত্রা সম্পন্ন হলে এসক্রো থেকে পেমেন্ট স্থানান্তর হয়। সাধারণত যাত্রা শেষে 24-48 ঘণ্টায় পেমেন্ট পান। bKash, ব্যাংক ট্রান্সফারে পান।'
            : 'Payment is transferred from escrow after the buyer\'s journey is completed. Usually within 24-48 hours after the journey. You can receive via bKash or bank transfer.',
        },
        {
          q: isBn ? 'একাধিক টিকেট কি বিক্রি করা যায়?' : 'Can I sell multiple tickets?',
          a: isBn
            ? 'হ্যাঁ, একাধিক টিকেট তালিকাভুক্ত ও বিক্রি করা যায়। প্রতিটি টিকেটের জন্য সঠিক তথ্য দিন। যাচাইকৃত বিক্রেতারা একাধিক টিকেট বিক্রি করতে পারে।'
            : 'Yes, you can list and sell multiple tickets. Provide accurate information for each ticket. Verified sellers can sell multiple tickets.',
        },
        {
          q: isBn ? 'টিকেট বিক্রি না হলে কি হবে?' : 'What happens if my ticket doesn\'t sell?',
          a: isBn
            ? 'টিকেট বিক্রি না হলে তালিকাভুক্ত টিকেট স্বয়ংক্রিয়ভাবে যাত্রার তারিখ পরে সরে যায়। মূল্য পরিবর্তন করে আবার তালিকাভুক্ত করা যায়। কোনো ফি প্রযোজ্য নয়।'
            : 'Unsold tickets are automatically removed after the journey date. You can relist with a different price. No fee is charged for unsold tickets.',
        },
      ],
    },
    {
      icon: CreditCard,
      title: isBn ? 'পেমেন্ট ও ফেরত' : 'Payment & Refunds',
      color: 'bg-blue-500',
      items: [
        {
          q: isBn ? 'কোন পেমেন্ট মাধ্যম উপলব্ধ?' : 'What payment methods are available?',
          a: isBn
            ? 'bKash, SSLCommerz, ব্যাংক ট্রান্সফার, ক্রেডিট/ডেবিট কার্ড ও নগদ পেমেন্ট উপলব্ধ। সকল পেমেন্ট এসক্রো সুরক্ষায় সম্পন্ন হয়।'
            : 'bKash, SSLCommerz, bank transfer, credit/debit card, and cash payment are available. All payments are processed under escrow protection.',
        },
        {
          q: isBn ? 'এসক্রো কি?' : 'What is escrow?',
          a: isBn
            ? 'এসক্রো একটি সুরক্ষা সিস্টেম। ক্রেতার পেমেন্ট প্ল্যাটফর্মে নিরাপদে রাখা হয়। যাত্রা সম্পন্ন হলেই বিক্রেতা পেমেন্ট পান। কোনো সমস্যা হলে ক্রেতা ফেরত পান।'
            : 'Escrow is a protection system. The buyer\'s payment is securely held by the platform. The seller receives payment only after the journey is completed. If any issue arises, the buyer gets a refund.',
        },
        {
          q: isBn ? 'ফেরত কত দিনে পাব?' : 'What is the refund timeline?',
          a: isBn
            ? 'ফেরত অনুরোধ সাধারণত 3-5 কার্যদিবসে প্রক্রিয়া হয়। bKash ও মোবাইল ব্যাংকিংয়ে 1-2 দিনে, ব্যাংক ট্রান্সফারে 3-5 দিনে ফেরত পান।'
            : 'Refund requests are typically processed within 3-5 business days. bKash and mobile banking refunds arrive in 1-2 days, bank transfers take 3-5 days.',
        },
        {
          q: isBn ? 'ফেরত নীতি কি?' : 'What is the refund policy?',
          a: isBn
            ? 'ভুল টিকেট: সম্পূর্ণ ফেরত। যাত্রা বাতিল: সম্পূর্ণ ফেরত। 24 ঘণ্টা আগে ক্যানসেল: 80% ফেরত। যাত্রা শুরুর কম সময়ে ক্যানসেল: ফেরত নেই। বিস্তারিত ফেরত নীতি পৃষ্ঠা দেখুন।'
            : 'Invalid ticket: full refund. Journey cancelled: full refund. Cancelled 24 hours before: 80% refund. Cancelled near journey start: no refund. See detailed refund policy page.',
        },
        {
          q: isBn ? 'পেমেন্ট ফি কি?' : 'What are the payment fees?',
          a: isBn
            ? 'ক্রেতাদের জন্য কোনো পেমেন্ট ফি নেই। বিক্রেতাদের জন্য টিকেট বিক্রির 5% সার্ভিস ফি প্রযোজ্য। পেমেন্ট মাধ্যমের নিজস্ব ফি আলাদা হতে পারে।'
            : 'No payment fees for buyers. Sellers pay a 5% service fee on ticket sales. Payment method-specific fees may apply separately.',
        },
        {
          q: isBn ? 'পেমেন্ট সুরক্ষা কি?' : 'What is payment security?',
          a: isBn
            ? 'সকল পেমেন্ট SSLCommerz ও PCI-DSS কমপ্লায়েন্ট সিস্টেমে প্রক্রিয়া হয়। এসক্রো সুরক্ষা, দ্বি-পক্ষীয় যাচাই ও ফ্রaud ডিটেকশন সিস্টেম আমাদের পেমেন্ট সুরক্ষিত।'
            : 'All payments are processed via SSLCommerz and PCI-DSS compliant systems. Escrow protection, two-party verification, and fraud detection keep payments secure.',
        },
      ],
    },
    {
      icon: UserCircle,
      title: isBn ? 'অ্যাকাউন্ট ও যাচাই' : 'Account & Verification',
      color: 'bg-teal-500',
      items: [
        {
          q: isBn ? 'কিভাবে অ্যাকাউন্ট তৈরি করব?' : 'How to register?',
          a: isBn
            ? '"Register" পেজে নাম, ইমেইল, ফোন নম্বর ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট তৈরি করুন। OTP যাচাই সম্পন্ন করুন এবং অ্যাকাউন্ট সক্রিয় করুন।'
            : 'Create an account on the "Register" page with your name, email, phone number, and password. Complete OTP verification to activate your account.',
        },
        {
          q: isBn ? 'OTP যাচাই কি?' : 'What is OTP verification?',
          a: isBn
            ? 'OTP (One Time Password) অ্যাকাউন্ট যাচাইয়ের প্রক্রিয়া। ফোন নম্বরে একটি 6-ডিজিট কোড পাঠানো হয়। কোড দিয়ে অ্যাকাউন্ট যাচাই সম্পন্ন করুন।'
            : 'OTP (One Time Password) is the account verification process. A 6-digit code is sent to your phone number. Use the code to complete account verification.',
        },
        {
          q: isBn ? 'পাসওয়ার্ড কিভাবে পরিবর্তন করব?' : 'How to reset password?',
          a: isBn
            ? '"Forgot Password" পেজে ইমেইল বা ফোন নম্বর দিন। OTP পান এবং নতুন পাসওয়ার্ড সেট করুন। পাসওয়ার্ড নিরাপদে পরিবর্তন হয়।'
            : 'Enter your email or phone on the "Forgot Password" page. Receive OTP and set a new password. Password is changed securely.',
        },
        {
          q: isBn ? 'KYC প্রক্রিয়া কি?' : 'What is the KYC process?',
          a: isBn
            ? 'KYC (Know Your Customer) প্রক্রিয়ায় NID/পাসপোর্ট ও মুখের ছবি দিন। আমাদের যাচাই দল 24-48 ঘণ্টায় প্রক্রিয়া সম্পন্ন করে। যাচাই সম্পন্ন হলে বিক্রেতা Badge পান।'
            : 'KYC (Know Your Customer) process requires NID/Passport and facial photo. Our verification team completes the process within 24-48 hours. Verified sellers receive a badge.',
        },
        {
          q: isBn ? 'অ্যাকাউন্ট কি বন্ধ করা যায়?' : 'Can I deactivate my account?',
          a: isBn
            ? 'হ্যাঁ, সেটিংস পেজে অ্যাকাউন্ট বন্ধ করা যায়। চলমান লেনদেন সম্পন্ন হলে অ্যাকাউন্ট বন্ধ হবে। পেমেন্ট ও টিকেটের তথ্য সংরক্ষিত থাকে।'
            : 'Yes, you can deactivate your account from the Settings page. The account will be deactivated once ongoing transactions are completed. Payment and ticket data is retained.',
        },
        {
          q: isBn ? 'একাধিক অ্যাকাউন্ট কি পারমিশন?' : 'Can I have multiple accounts?',
          a: isBn
            ? 'না, প্রতিটি ব্যবহারকারী একটি অ্যাকাউন্ট পারমিশন। একাধিক অ্যাকাউন্ট প্ল্যাটফর্ম নীতির বিরোধ। একাধিক অ্যাকাউন্ট পাওয়া গেলে সকল বন্ধ করা হবে।'
            : 'No, each user is allowed one account. Multiple accounts violate platform policy. If multiple accounts are found, all will be deactivated.',
        },
      ],
    },
  ];

  // Use DB categories if available, otherwise default
  const faqCategories: FaqCategory[] = dbCategories.length > 0
    ? dbCategories.map((cat) => ({
      icon: CATEGORY_ICON_MAP[cat.slug] || HelpCircle,
      title: isBn ? (cat.name + (cat.slug ? '' : '')) : cat.name, // Use DB name, it might be in English only
      color: CATEGORY_COLOR_MAP[cat.slug] || 'bg-green-600',
      items: cat.items.map((item: any) => ({
        q: isBn ? (item.questionBn || item.question) : item.question,
        a: isBn ? (item.answerBn || item.answer) : item.answer,
      })),
    }))
    : defaultFaqCategories;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <Badge className="mb-4 bg-green-600 text-white hover:bg-green-700">
          <HelpCircle className="w-4 h-4 mr-1" />
          {isBn ? 'সাধারণ জিজ্ঞাসা' : 'Frequently Asked Questions'}
        </Badge>
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${cls}`}>
          {isBn ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions (FAQ)'}
        </h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${cls}`}>
          {isBn
            ? 'আপনার সাধারণ জিজ্ঞাসাগুলোর উত্তর এখানে পান। যেকোনো বিষয়ে সহজে তথ্য পান।'
            : 'Find answers to your common questions here. Get information on any topic easily.'}
        </p>
      </div>

      {/* FAQ Categories */}
      {faqCategories.map((category, catIdx) => {
        const IconComp = category.icon;
        return (
          <section key={catIdx} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 ${category.color} rounded-full flex items-center justify-center`}>
                <IconComp className="w-4 h-4 text-white" />
              </div>
              <h2 className={`text-xl font-bold ${cls}`}>{category.title}</h2>
            </div>
            <Card className="border-border">
              <CardContent className="p-4">
                <Accordion type="single" collapsible>
                  {category.items.map((item, itemIdx) => (
                    <AccordionItem key={itemIdx} value={`${catIdx}-${itemIdx}`}>
                      <AccordionTrigger className={cls}>
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className={cls}>
                        <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        );
      })}

      {/* Still Have Questions */}
      <section className="text-center">
        <Card className="bg-gradient-to-r from-green-600 to-orange-500 text-white border-0">
          <CardContent className="p-8">
            <MessageCircle className="w-10 h-10 mx-auto mb-4 text-white/90" />
            <h2 className={`text-2xl font-bold mb-3 ${cls}`}>
              {isBn ? 'এখনও প্রশ্ন আছে?' : 'Still Have Questions?'}
            </h2>
            <p className={`mb-4 text-white/90 ${cls}`}>
              {isBn
                ? 'আমাদের সাহায্য দল আপনার যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।'
                : 'Our support team is ready to answer any question you have.'}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <span className="text-white/80 text-sm flex items-center gap-1">
                📧 support@eidticketresell.com
              </span>
              <span className="text-white/80 text-sm flex items-center gap-1">
                📞 +880 1234-567890
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
