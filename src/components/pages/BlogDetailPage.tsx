'use client';

import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import {
  ArrowLeft, CalendarDays, Clock, User, Tag, Share2,
  Facebook, Twitter, MessageCircle, BookOpen, MapPin,
  Shield, ShoppingCart, Newspaper, Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ─── Props ──────────────────────────────────────────────────────────
interface BlogDetailPageProps {
  slug: string;
}

// ─── Category icon mapping ─────────────────────────────────────────
const categoryIconMap: Record<string, React.ElementType> = {
  'travel-tips': MapPin,
  'safety': Shield,
  'buying-guide': ShoppingCart,
  'selling-guide': Tag,
  'transport-news': Newspaper,
  'festival-travel': Plane,
};

const categoryGradientMap: Record<string, string> = {
  'travel-tips': 'from-green-400 to-emerald-600',
  'safety': 'from-red-400 to-rose-600',
  'buying-guide': 'from-orange-400 to-amber-600',
  'selling-guide': 'from-purple-400 to-violet-600',
  'transport-news': 'from-blue-400 to-cyan-600',
  'festival-travel': 'from-yellow-400 to-orange-600',
};

const categoryBadgeMap: Record<string, string> = {
  'travel-tips': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'safety': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'buying-guide': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'selling-guide': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'transport-news': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'festival-travel': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const categoryLabelMap: Record<string, { en: string; bn: string }> = {
  'travel-tips': { en: 'Travel Tips', bn: 'ভ্রমণ টিপস' },
  'safety': { en: 'Safety', bn: 'নিরাপত্তা' },
  'buying-guide': { en: 'Buying Guide', bn: 'ক্রয় নির্দেশিকা' },
  'selling-guide': { en: 'Selling Guide', bn: 'বিক্রয় নির্দেশিকা' },
  'transport-news': { en: 'Transport News', bn: 'যানবাহন সংবাদ' },
  'festival-travel': { en: 'Festival Travel', bn: 'উৎসব ভ্রমণ' },
};

// ─── Blog content data (by slug) ───────────────────────────────────
interface BlogDetail {
  category: string;
  titleEn: string;
  titleBn: string;
  authorEn: string;
  authorBn: string;
  dateEn: string;
  dateBn: string;
  readTime: string;
  readTimeBn: string;
  tagsEn: string[];
  tagsBn: string[];
  contentEn: string[];
  contentBn: string[];
}

const blogContentMap: Record<string, BlogDetail> = {
  'eid-travel-tips': {
    category: 'travel-tips',
    titleEn: 'Eid Travel Tips: How to Plan Your Journey',
    titleBn: 'ঈদ ভ্রমণ টিপস: আপনার যাত্রা কীভাবে পরিকল্পনা করবেন',
    authorEn: 'Rahim Ahmed',
    authorBn: 'রহিম আহমেদ',
    dateEn: '15 March 2025',
    dateBn: '১৫ মার্চ ২০২৫',
    readTime: '5 min',
    readTimeBn: '৫ মিনিট',
    tagsEn: ['Eid', 'Travel', 'Planning', 'Bangladesh'],
    tagsBn: ['ঈদ', 'ভ্রমণ', 'পরিকল্পনা', 'বাংলাদেশ'],
    contentEn: [
      'Eid is the busiest travel season in Bangladesh, with millions of people heading home to celebrate with their families. Planning your journey well in advance is crucial to avoid the last-minute rush and inflated ticket prices that are common during this period.',
      'Start by deciding your travel dates early. Bangladesh Railway and bus operators typically release their Eid special schedules 2-3 weeks before the festival. Booking your tickets as soon as they become available can save you significant money and ensure you get a seat on your preferred route.',
      'Consider all transport options available for your route. While trains are often the most comfortable choice for long-distance travel, buses offer more flexibility with departure times and routes. Launch services are excellent for southern destinations like Barishal and Patuakhali, offering a scenic and relaxing journey.',
      'Pack smart for your Eid journey. Carry essentials like water, snacks, a first-aid kit, and entertainment for long journeys. If traveling with children, prepare accordingly with extra supplies. Keep your tickets and identification documents in a secure, easily accessible place.',
      'Use our ticket marketplace to find deals on confirmed tickets from verified sellers. Our escrow protection ensures your payment is safe until you verify the ticket is valid. This can be especially helpful when official tickets are sold out but sellers have spare confirmed tickets they no longer need.',
    ],
    contentBn: [
      'ঈদ বাংলাদেশের সবচেয়ে ব্যস্ত ভ্রমণ মৌসুম, লক্ষ লক্ষ মানুষ পরিবারের সাথে উদযাপন করতে বাড়ি যাচ্ছেন। শেষ মুহূর্তের দৌড় এবং এই সময়ে সাধারণ বাড়তি টিকেট মূল্য এড়াতে আগে থেকে ভ্রমণ পরিকল্পনা করা অত্যন্ত গুরুত্বপূর্ণ।',
      'আগে থেকে ভ্রমণ তারিখ নির্ধারণ করে শুরু করুন। বাংলাদেশ রেলওয়ে এবং বাস অপারেটররা সাধারণত উৎসবের ২-৩ সপ্তাহ আগে বিশেষ ঈদ সময়সূচী প্রকাশ করে। টিকেট উপলব্ধ হওয়ার সাথে সাথে বুকিং করলে আপনি উল্লেখযোগ্য অর্থ সাশ্রয় করতে পারেন এবং পছন্দের রুটে সিট পেতে পারেন।',
      'আপনার রুটের জন্য উপলব্ধ সমস্ত যানবাহন বিকল্প বিবেচনা করুন। ট্রেন দীর্ঘ-দূরত্ব ভ্রমণের জন্য সবচেয়ে আরামদায়ক পছন্দ হলেও, বাস যাত্রা সময় এবং রুটে অধিক নমনীয়তা দেয়। বরিশাল ও পটুয়াখালীর মতো দক্ষিণ গন্তব্যের জন্য লঞ্চ সেবা চমৎকার, দৃশ্যমান এবং আরামদায়ক যাত্রা দেয়।',
      'ঈদ যাত্রার জন্য সঠিকভাবে প্যাকিং করুন। পানি, স্ন্যাকস, ফার্স্ট-এড কিট এবং দীর্ঘ যাত্রার জন্য বিনোদন বহন করুন। শিশুদের সাথে ভ্রমণ করলে, অতিরিক্ত সরবরাহ নিয়ে প্রস্তুত হন। আপনার টিকেট এবং পরিচয় নথি নিরাপদ, সহজে প্রবেশযোগ্য স্থানে রাখুন।',
      'যাচাইকৃত বিক্রেতাদের থেকে নিশ্চিত টিকেটের ডিল খুঁজতে আমাদের টিকেট মার্কেটপ্লেস ব্যবহার করুন। আমাদের এসক্রো সুরক্ষা নিশ্চিত করে যে আপনার পেমেন্ট নিরাপদ যতক্ষণ না আপনি টিকেট বৈধ যাচাই করেন। এটি বিশেষত সহায়ক যখন অফিসিয়াল টিকেট বিক্রি হয়ে যায় কিন্তু বিক্রেতাদের আর প্রয়োজন নেই এমন অতিরিক্ত নিশ্চিত টিকেট আছে।',
    ],
  },
  'bus-travel-safety': {
    category: 'safety',
    titleEn: 'Safety Guide for Bus Travel in Bangladesh',
    titleBn: 'বাংলাদেশে বাস ভ্রমণের নিরাপত্তা নির্দেশিকা',
    authorEn: 'Karim Hossain',
    authorBn: 'করিম হোসেন',
    dateEn: '12 March 2025',
    dateBn: '১২ মার্চ ২০২৫',
    readTime: '7 min',
    readTimeBn: '৭ মিনিট',
    tagsEn: ['Bus', 'Safety', 'Travel', 'Bangladesh'],
    tagsBn: ['বাস', 'নিরাপত্তা', 'ভ্রমণ', 'বাংলাদেশ'],
    contentEn: [
      'Bus travel is the most common form of intercity transportation in Bangladesh, connecting every major city and town across the country. While convenient and affordable, it\'s important to prioritize safety when choosing and using bus services for your journey.',
      'Always choose reputable bus operators with good track records. Companies like Green Line, Shyamoli, and Desh Travel are known for their safety standards and well-maintained vehicles. Check online reviews and ask for recommendations from regular travelers before booking.',
      'Before boarding, verify the bus condition. Look for clean, well-maintained vehicles with functioning seatbelts, proper lighting, and emergency exits. Avoid buses that appear overloaded or poorly maintained. A safe bus should have a clear route display and a licensed driver.',
      'Keep your valuables secure during the journey. Use a small bag for essentials that stays with you at your seat. Larger luggage should go in the designated compartments. Never leave valuable items unattended, especially during stops. Keep your phone charged and have emergency contacts readily accessible.',
      'During Eid season, bus operators often add extra services. These may not always meet the same safety standards as regular services. Be extra cautious with Eid special buses — verify the operator, check the vehicle condition, and don\'t compromise on safety for a cheaper ticket. Our marketplace offers tickets from verified sellers for established operators.',
    ],
    contentBn: [
      'বাস ভ্রমণ বাংলাদেশের সবচেয়ে সাধারণ আন্তঃনগর যানবাহন, দেশের প্রতিটি প্রধান শহর ও জনপদ সংযোগ করে। সুবিধাজনক এবং সাশ্রয়ী হলেও, আপনার যাত্রার জন্য বাস সেবা নির্বাচন ও ব্যবহারে নিরাপত্তা অগ্রাধিকার দেওয়া গুরুত্বপূর্ণ।',
      'সর্বদা ভাল ট্র্যাক রেকর্ড সহ সম্মানজনক বাস অপারেটর নির্বাচন করুন। গ্রিন লাইন, শ্যামলী এবং দেশ ট্রাভেলের মতো কোম্পানি নিরাপত্তা মান এবং সুরক্ষিত যানবাহনের জন্য পরিচিত। বুকিং করার আগে অনলাইন পর্যালোচনা পরীক্ষা করুন এবং নিয়মিত ভ্রমণকারীদের থেকে সুপারিশ চান।',
      'বোর্ডিংয়ের আগে, বাসের অবস্থা যাচাই করুন। কার্যকরী সিটবেল্ট, সঠিক আলো এবং জরুরি নির্গমন সহ পরিষ্কার, সুরক্ষিত যানবাহন খুঁজুন। অতিরিক্ত লোড বা খারাপ অবস্থায় দেখা বাস এড়িয়ে চলুন। নিরাপদ বাসে পরিষ্কার রুট প্রদর্শন এবং লাইসেন্সধারী চালক থাকা উচিত।',
      'যাত্রার সময় আপনার মূল্যবান জিনিস নিরাপদ রাখুন। সিটে আপনার সাথে থাকা প্রয়োজনীয় জিনিসের জন্য ছোট ব্যাগ ব্যবহার করুন। বড় লাগেজ নির্দিষ্ট কম্পার্টমেন্টে যেতে হবে। বিশেষত স্টপেজে মূল্যবান জিনিস অরক্ষিত রাখবেন না। ফোন চার্জড রাখুন এবং জরুরি যোগাযোগ সহজে অ্যাক্সেসিবল রাখুন।',
      'ঈদ মৌসুমে, বাস অপারেটররা অতিরিক্ত সেবা যোগ করে। এগুলো সাধারণ সেবার মতো একই নিরাপত্তা মান পূরণ করতে পারে না। ঈদ বিশেষ বাসে অতিরিক্ত সতর্ক থাকুন — অপারেটর যাচাই করুন, যানবাহন অবস্থা পরীক্ষা করুন এবং সস্তা টিকেটের জন্য নিরাপত্তা ত্যাগ করবেন না।',
    ],
  },
  'budget-tickets-eid': {
    category: 'buying-guide',
    titleEn: 'How to Find Budget Tickets This Eid',
    titleBn: 'এই ঈদে বাজেট টিকেট কীভাবে খুঁজে পাবেন',
    authorEn: 'Nasreen Akter',
    authorBn: 'নাসরিন আক্তার',
    dateEn: '10 March 2025',
    dateBn: '১০ মার্চ ২০২৫',
    readTime: '6 min',
    readTimeBn: '৬ মিনিট',
    tagsEn: ['Budget', 'Tickets', 'Eid', 'Tips'],
    tagsBn: ['বাজেট', 'টিকেট', 'ঈদ', 'টিপস'],
    contentEn: [
      'Eid travel doesn\'t have to break your budget. With the right strategies and our marketplace, you can find affordable tickets even during the busiest travel season in Bangladesh. Here\'s how to save money while getting where you need to go.',
      'Book early — this is the single most effective way to get cheaper tickets. Counter tickets and online bookings for trains and buses are significantly cheaper when purchased weeks before Eid. Prices typically increase by 30-50% as the holiday approaches.',
      'Use our ticket marketplace to compare prices from multiple verified sellers. Sellers who purchased tickets early but can\'t use them often list them at or near the original counter price. This can be much cheaper than the inflated last-minute prices from unofficial resellers.',
      'Consider alternative routes and transport types. Sometimes a bus ticket on a less popular route can be cheaper than a train on the main route. Launch travel to southern destinations is often the most affordable option. Even AC bus tickets can be cheaper than non-AC train tickets on certain routes.',
      'Watch for our promotional offers and seller discounts. Many verified sellers offer early-bird pricing or bundle deals. Sign up for notifications so you never miss a deal. Remember, all tickets on our platform come with escrow protection, so you can buy with confidence knowing your payment is secure.',
    ],
    contentBn: [
      'ঈদ ভ্রমণে আপনার বাজেট ভাঙতে হবে না। সঠিক কৌশল এবং আমাদের মার্কেটপ্লেস দিয়ে, বাংলাদেশের সবচেয়ে ব্যস্ত ভ্রমণ মৌসুমেও সাশ্রয়ী টিকেট খুঁজে পাওয়া যায়। যেখানে যেতে হবে সেখানে অর্থ সাশ্রয় করার উপায়।',
      'আগে বুকিং করুন — এটি সস্তা টিকেট পাওয়ার সবচেয়ে কার্যকরী উপায়। ঈদের কয়েক সপ্তাহ আগে কাউন্টার টিকেট এবং অনলাইন বুকিং ট্রেন ও বাসের জন্য উল্লেখযোগ্য সস্তা। ছুটির সময় ঘনিয়ে আসার সাথে সাথে মূল্য সাধারণত ৩০-৫০% বৃদ্ধি পায়।',
      'আমাদের টিকেট মার্কেটপ্লেস ব্যবহার করে একাধিক যাচাইকৃত বিক্রেতার থেকে মূল্য তুলনা করুন। আগে টিকেট কিনেছেন কিন্তু ব্যবহার করতে পারবেন না এমন বিক্রেতারা সাধারণত আসল কাউন্টার মূল্যে বা কাছাকাছি তালিকাভুক্ত করে।',
      'বিকল্প রুট এবং যানবাহন প্রকার বিবেচনা করুন। কখনো কখনো কম জনপ্রিয় রুটে বাস টিকেট প্রধান রুটে ট্রেনের চেয়ে সস্তা হতে পারে। দক্ষিণ গন্তব্যের জন্য লঞ্চ ভ্রমণ সাধারণত সবচেয়ে সাশ্রয়ী বিকল্প।',
      'আমাদের প্রমোশনাল অফার এবং বিক্রেতা ডিসকাউন্ট দেখুন। অনেক যাচাইকৃত বিক্রেতা আগে থেকে মূল্য বা বান্ডল ডিল দেয়। নোটিফিকেশন সাইন আপ করুন যাতে কোনো ডিল মিস না হয়। মনে রাখুন, আমাদের প্ল্যাটফর্মের সমস্ত টিকেট এসক্রো সুরক্ষা আসে।',
    ],
  },
  'seller-guide-first-ticket': {
    category: 'selling-guide',
    titleEn: 'Complete Seller Guide: List Your First Ticket',
    titleBn: 'সম্পূর্ণ বিক্রেতা নির্দেশিকা: আপনার প্রথম টিকেট তালিকাভুক্ত করুন',
    authorEn: 'Imran Khan',
    authorBn: 'ইমরান খান',
    dateEn: '8 March 2025',
    dateBn: '৮ মার্চ ২০২৫',
    readTime: '8 min',
    readTimeBn: '৮ মিনিট',
    tagsEn: ['Selling', 'Guide', 'First Ticket', 'Steps'],
    tagsBn: ['বিক্রয়', 'নির্দেশিকা', 'প্রথম টিকেট', 'ধাপ'],
    contentEn: [
      'Selling your unused ticket on our marketplace is easy and profitable. Whether you bought a ticket that you can no longer use, or you\'re a regular traveler looking to help others find confirmed seats, this guide will walk you through every step of listing your first ticket.',
      'Step 1: Complete your KYC verification. Before listing any ticket, you need to verify your identity through our KYC process. This protects buyers and builds trust in the marketplace. The verification takes only a few minutes and requires your NID or passport information.',
      'Step 2: Create your ticket listing. Navigate to the "Sell Tickets" section and fill in all the required details — transport type, operator name, route (from/to), departure date and time, seat number, ticket type (online/counter copy), and your asking price.',
      'Step 3: Set a fair price. Research similar tickets on the platform to understand market rates. While you can price above the counter rate for confirmed tickets during peak season, keep it reasonable. Overpriced tickets rarely sell. Our platform adds a small 2% fee on successful transactions.',
      'Step 4: Respond to buyer inquiries promptly. When a buyer shows interest, respond quickly with any additional information they need. Be transparent about the ticket details and delivery method. Fast communication builds trust and leads to faster sales.',
      'Step 5: Complete the sale securely. Once a buyer confirms, our escrow system holds their payment until you deliver the ticket and the buyer verifies it. This protects both parties. After successful verification, your payment is released to your wallet within 24 hours.',
    ],
    contentBn: [
      'আমাদের মার্কেটপ্লেসে আপনার অব্যবহৃত টিকেট বিক্রি করা সহজ এবং লাভজনক। আপনি এমন টিকেট কিনেছেন যা আর ব্যবহার করতে পারবেন না, অথবা নিয়মিত ভ্রমণকারী হিসেবে অন্যদের নিশ্চিত সিট খুঁজে পেতে সাহায্য করতে চান, এই নির্দেশিকা আপনাকে প্রথম টিকেট তালিকাভুক্তির প্রতিটি ধাপে নিয়ে যাবে।',
      'ধাপ ১: কেওয়াইসি যাচাই সম্পন্ন করুন। কোনো টিকেট তালিকাভুক্ত করার আগে, আমাদের কেওয়াইসি প্রক্রিয়ার মাধ্যমে আপনার পরিচয় যাচাই করতে হবে। এটি ক্রেতাদের সুরক্ষা দেয় এবং মার্কেটপ্লেসে আস্থা তৈরি করে। যাচায় কয়েক মিনিট সময় নেয় এবং আপনার এনআইডি বা পাসপোর্ট তথ্য প্রয়োজন।',
      'ধাপ ২: আপনার টিকেট তালিকা তৈরি করুন। "টিকেট বিক্রি" বিভাগে যান এবং সমস্ত প্রয়োজনীয় বিবরণ পূরণ করুন — যানবাহন প্রকার, অপারেটর নাম, রুট (থেকে/যেখানে), যাত্রা তারিখ ও সময়, সিট নম্বর, টিকেট প্রকার এবং আপনার মূল্য।',
      'ধাপ ৩: সঠিক মূল্য নির্ধারণ করুন। প্ল্যাটফর্মে অনুরূপ টিকেট অনুসন্ধান করে মার্কেট মূল্য বুঝুন। ব্যস্ত মৌসুমে নিশ্চিত টিকেটের জন্য কাউন্টার মূল্যের উপরে মূল্য নির্ধারণ করতে পারেন, কিন্তু যুক্তিসংগত রাখুন। অতিরিক্ত মূল্যের টিকেট কম বিক্রি হয়।',
      'ধাপ ৪: ক্রেতা প্রশ্নে দ্রুত সাড়া দিন। ক্রেতা আগ্রহ দেখালে, তাদের প্রয়োজনীয় অতিরিক্ত তথ্য দিয়ে দ্রুত সাড়া দিন। টিকেট বিবরণ এবং ডেলিভারি পদ্ধতি স্বচ্ছ রাখুন। দ্রুত যোগাযোগ আস্থা তৈরি করে।',
      'ধাপ ৫: বিক্রি নিরাপদে সম্পন্ন করুন। ক্রেতা নিশ্চিত করলে, আমাদের এসক্রো সিস্টেম আপনি টিকেট ডেলিভারি করেন এবং ক্রেতা যাচাই করেন ততক্ষণ তাদের পেমেন্ট ধরে রাখে। সফল যাচায় পরে, আপনার পেমেন্ট ২৪ ঘন্টার মধ্যে আপনার ওয়ালেটে প্রকাশ করা হয়।',
    ],
  },
  'train-schedule-eid': {
    category: 'transport-news',
    titleEn: 'Train Schedule Changes During Eid Season',
    titleBn: 'ঈদ মৌসুমে ট্রেন সময়সূচী পরিবর্তন',
    authorEn: 'Sajid Rahman',
    authorBn: 'সাজিদ রহমান',
    dateEn: '5 March 2025',
    dateBn: '৫ মার্চ ২০২৫',
    readTime: '4 min',
    readTimeBn: '৪ মিনিট',
    tagsEn: ['Train', 'Schedule', 'Eid', 'Bangladesh Railway'],
    tagsBn: ['ট্রেন', 'সময়সূচী', 'ঈদ', 'বাংলাদেশ রেলওয়ে'],
    contentEn: [
      'Bangladesh Railway has announced significant changes to train schedules for the upcoming Eid season. These changes include additional trains, modified departure times, and special routes designed to accommodate the massive increase in passenger demand during the festive period.',
      'The railway will operate 10 additional special trains on high-demand routes including Dhaka-Chittagong, Dhaka-Sylhet, Dhaka-Rajshahi, and Dhaka-Khulna. These special trains will run from 7 days before Eid to 3 days after, providing much-needed additional capacity for holiday travelers.',
      'Departure times for several regular trains have been adjusted. The Padma Express on the Dhaka-Rajshahi route will now depart at 6:00 AM instead of the usual 8:00 AM, while the Suborno Express on the Dhaka-Chittagong route will have an additional evening departure at 6:00 PM.',
      'Ticket booking for Eid special trains opens 15 days before departure, compared to the usual 10-day advance booking window. Bangladesh Railway encourages passengers to book early as these tickets sell out within hours of becoming available.',
      'For those who miss official booking windows, our marketplace offers confirmed tickets from verified sellers. All train tickets listed on our platform are verified, and our escrow system ensures your payment is protected until you confirm the ticket is valid.',
    ],
    contentBn: [
      'বাংলাদেশ রেলওয়ে আগত ঈদ মৌসুমের জন্য ট্রেন সময়সূচীতে উল্লেখযোগ্য পরিবর্তন ঘোষণা করেছে। এই পরিবর্তনে অতিরিক্ত ট্রেন, পরিবর্তিত যাত্রা সময় এবং বিশেষ রুট অন্তর্ভুক্ত, উৎসবের সময় যাত্রী চাহিদার বিশাল বৃদ্ধি মেটাতে ডিজাইন করা।',
      'রেলওয়ে ঢাকা-চট্টগ্রাম, ঢাকা-সিলেট, ঢাকা-রাজশাহী এবং ঢাকা-খুলনার মতো উচ্চ-চাহিদা রুটে ১০ অতিরিক্ত বিশেষ ট্রেন চালাবে। এই বিশেষ ট্রেন ঈদের ৭ দিন আগে থেকে ৩ দিন পরে পর্যন্ত চলবে।',
      'বেশ কিছু নিয়মিত ট্রেনের যাত্রা সময় সংশোধন করা হয়েছে। ঢাকা-রাজশাহী রুটে পদ্মা এক্সপ্রেস এখন সাধারণ ৮:০০ এএম এর বদলে ৬:০০ এএম যাত্রা করবে, ঢাকা-চট্টগ্রাম রুটে সুবর্ণ এক্সপ্রেস ৬:০০ পিএম এ অতিরিক্ত সন্ধ্যা যাত্রা পাবে।',
      'ঈদ বিশেষ ট্রেনের টিকেট বুকিং যাত্রার ১৫ দিন আগে খোলে, সাধারণ ১০ দিনের বদলে। বাংলাদেশ রেলওয়ে যাত্রীদের আগে বুকিং করতে উৎসাহিত করে যেহেতু এই টিকেট উপলব্ধ হওয়ার কয়েক ঘন্টার মধ্যে বিক্রি হয়ে যায়।',
      'অফিসিয়াল বুকিং মিস করলে, আমাদের মার্কেটপ্লেসে যাচাইকৃত বিক্রেতাদের থেকে নিশ্চিত টিকেট পাওয়া যায়। আমাদের প্ল্যাটফর্মে তালিকাভুক্ত সমস্ত ট্রেন টিকেট যাচাইকৃত এবং এসক্রো সিস্টেম আপনার পেমেন্ট সুরক্ষিত করে।',
    ],
  },
  'invalid-ticket-guide': {
    category: 'buying-guide',
    titleEn: 'What to Do If Your Ticket Is Invalid',
    titleBn: 'আপনার টিকেট অবৈধ হলে কী করবেন',
    authorEn: 'Farida Begum',
    authorBn: 'ফরিদা বেগম',
    dateEn: '3 March 2025',
    dateBn: '৩ মার্চ ২০২৫',
    readTime: '5 min',
    readTimeBn: '৫ মিনিট',
    tagsEn: ['Invalid Ticket', 'Refund', 'Escrow', 'Protection'],
    tagsBn: ['অবৈধ টিকেট', 'ফেরত', 'এসক্রো', 'সুরক্ষা'],
    contentEn: [
      'Discovering that your purchased ticket doesn\'t work can be stressful, especially during Eid season when alternatives are scarce. But don\'t panic — our platform has built-in protections to help you get your money back quickly and find a replacement ticket.',
      'Step 1: Verify the ticket immediately. When you receive a ticket, verify it with the transport operator before your journey date. For train tickets, check on the Bangladesh Railway website. For bus tickets, contact the operator directly. Early verification gives you time to resolve any issues.',
      'Step 2: Report the issue on our platform. If the ticket is invalid, immediately report it through your order details page. Our support team will review the case within 24 hours. The escrow system means your payment hasn\'t been released to the seller yet — it\'s still protected.',
      'Step 3: Request a refund. Once our team confirms the ticket is invalid, a full refund is initiated automatically. The money is returned to your original payment method within 3-5 business days. There are no fees or penalties for legitimate refund requests.',
      'Step 4: Find a replacement ticket. While your refund is being processed, search for a new ticket on our marketplace. Verified sellers often have confirmed tickets available, and you can purchase with confidence knowing the same escrow protection applies.',
      'Prevention tips: Always check seller ratings and reviews before purchasing. Look for KYC-verified sellers with good track records. Verify ticket details carefully before confirming your purchase. Our platform makes all this information transparent and easy to check.',
    ],
    contentBn: [
      'কেনা টিকেট কাজ করে না দেখা চাপযুক্ত হতে পারে, বিশেষত ঈদ মৌসুমে যখন বিকল্প কম। কিন্তু আতঙ্কিত হবেন না — আমাদের প্ল্যাটফর্মে বিল্ট-ইন সুরক্ষা আছে যা আপনাকে দ্রুত অর্থ ফেরত এবং বিকল্প টিকেট খুঁজে পেতে সাহায্য করে।',
      'ধাপ ১: টিকেট অবিলম্বে যাচাই করুন। টিকেট পাওয়ার সাথে সাথে যাত্রা তারিখের আগে যানবাহন অপারেটরের সাথে যাচাই করুন। ট্রেন টিকেটের জন্য বাংলাদেশ রেলওয়ে ওয়েবসাইটে পরীক্ষা করুন। বাস টিকেটের জন্য অপারেটরের সাথে সরাসরি যোগাযোগ করুন।',
      'ধাপ ২: আমাদের প্ল্যাটফর্মে সমস্যা রিপোর্ট করুন। টিকেট অবৈধ হলে, অবিলম্বে আপনার অর্ডার বিবরণ পৃষ্ঠা থেকে রিপোর্ট করুন। আমাদের সাপোর্ট টিম ২৪ ঘন্টার মধ্যে কেস পর্যালোচনা করবে। এসক্রো সিস্টেম মানে আপনার পেমেন্ট বিক্রেতার কাছে যায়নি — এটি সুরক্ষিত।',
      'ধাপ ৩: ফেরত অনুরোধ করুন। আমাদের টিম টিকেট অবৈধ নিশ্চিত করলে, সম্পূর্ণ ফেরত স্বয়ংক্রিয়ভাবে শুরু হয়। অর্থ ৩-৫ কার্য দিবসের মধ্যে আপনার আসল পেমেন্ট পদ্ধতিতে ফেরত দেওয়া হয়।',
      'ধাপ ৪: বিকল্প টিকেট খুঁজুন। ফেরত প্রক্রিয়াকরণের সময়, আমাদের মার্কেটপ্লেসে নতুন টিকেট অনুসন্ধান করুন। যাচাইকৃত বিক্রেতাদের সাধারণত নিশ্চিত টিকেট উপলব্ধ আছে।',
      'প্রতিরোধ টিপস: ক্রয়ের আগে সর্বদা বিক্রেতা রেটিং এবং পর্যালোচনা পরীক্ষা করুন। ভাল ট্র্যাক রেকর্ড সহ কেওয়াইসি-যাচাইকৃত বিক্রেতা খুঁজুন। টিকেট বিবরণ ক্রয় নিশ্চিত করার আগে যত্নসহকারে যাচাই করুন।',
    ],
  },
  'launch-dhaka-barishal': {
    category: 'travel-tips',
    titleEn: 'Launch Travel: Dhaka to Barishal Route Guide',
    titleBn: 'লঞ্চ ভ্রমণ: ঢাকা থেকে বরিশাল রুট নির্দেশিকা',
    authorEn: 'Hasib Molla',
    authorBn: 'হাসিব মোল্লা',
    dateEn: '28 February 2025',
    dateBn: '২৮ ফেব্রুয়ারি ২০২৫',
    readTime: '6 min',
    readTimeBn: '৬ মিনিট',
    tagsEn: ['Launch', 'Dhaka', 'Barishal', 'River Travel'],
    tagsBn: ['লঞ্চ', 'ঢাকা', 'বরিশাল', 'নদী ভ্রমণ'],
    contentEn: [
      'The Dhaka-Barishal launch route is one of the most popular and scenic river journeys in Bangladesh. Operating daily from Sadarghat terminal in Dhaka, these launches offer a unique travel experience through the heart of Bangladesh\'s river network.',
      'Several launch operators serve this route, including the well-known MV Sattar Khan, MV Khan Jahan Ali, and MV Obaidullah. Departures typically begin between 6:00 PM and 8:00 PM, arriving in Barishal early the next morning between 5:00 AM and 7:00 AM. The overnight journey lets you rest while traveling.',
      'Cabin options range from budget-friendly deck class to comfortable first-class cabins. Deck class costs around Tk 150-250, while first-class cabins with attached bathrooms can cost Tk 1,500-3,000 depending on the season. During Eid, prices increase and advance booking is essential.',
      'The journey takes you through the beautiful rivers of southern Bangladesh. You\'ll pass through the Buriganga, Meghna, and Padma rivers before entering the smaller waterways of the Barishal region. The sunset and sunrise views from the launch are spectacular.',
      'For a comfortable trip, book a cabin rather than deck class, especially if traveling with family. Carry light bedding, snacks, and drinking water. Arrive at Sadarghat at least an hour before departure. Our marketplace offers confirmed launch tickets from verified sellers during peak season when official tickets sell out.',
    ],
    contentBn: [
      'ঢাকা-বরিশাল লঞ্চ রুট বাংলাদেশের সবচেয়ে জনপ্রিয় এবং দৃশ্যমান নদী যাত্রা। ঢাকার সদরগাট টার্মিনাল থেকে প্রতিদিন চালানো এই লঞ্চ বাংলাদেশের নদী নেটওয়ার্কের কেন্দ্র দিয়ে একটি অনন্য ভ্রমণ অভিজ্ঞতা দেয়।',
      'বেশ কয়েকটি লঞ্চ অপারেটর এই রুটে সেবা দেয়, এমভি সাত্তার খান, এমভি খান জাহান আলী এবং এমভি ওবাইদুল্লাহ অন্তর্ভুক্ত। যাত্রা সাধারণত ৬:০০ পিএম থেকে ৮:০০ পিএম এর মধ্যে শুরু হয়, পরের দিন সকালে ৫:০০ এএম থেকে ৭:০০ এএম এর মধ্যে বরিশালে পৌঁছায়।',
      'কেবিন বিকল্প বাজেট-সহজ ডেক ক্লাস থেকে আরামদায়ক ফার্স্ট-ক্লাস কেবিন পর্যন্ত। ডেক ক্লাস প্রায় ১৫০-২৫০ টাকা, যখন সংযুক্ত বাথরুম সহ ফার্স্ট-ক্লাস কেবিন মৌসুম অনুযায়ী ১,৫০০-৩,০০০ টাকা। ঈদের সময় মূল্য বৃদ্ধি পায় এবং আগে বুকিং অত্যন্ত প্রয়োজনীয়।',
      'যাত্রা বাংলাদেশের দক্ষিণের সুন্দর নদী দিয়ে নিয়ে যায়। বরিশাল অঞ্চলের ছোট জলপথে প্রবেশের আগে বুড়িগঙ্গা, মেঘনা এবং পদ্মা নদী পার হবেন। লঞ্চ থেকে সূর্যাস্ত এবং সূর্যোদয় দৃশ্য অসাধারণ।',
      'আরামদায়ক যাত্রার জন্য, পরিবারের সাথে ভ্রমণ করলে ডেক ক্লাসের বদলে কেবিন বুকিং করুন। হালকা বিছানা, স্ন্যাকস এবং পানীয় জল বহন করুন। যাত্রার কমপক্ষে এক ঘন্টা আগে সদরগাটে পৌঁছান।',
    ],
  },
  'festival-travel-eid': {
    category: 'festival-travel',
    titleEn: 'Festival Travel: Making the Most of Eid Holidays',
    titleBn: 'উৎসব ভ্রমণ: ঈদ ছুটির সর্বোচ্চ ব্যবহার',
    authorEn: 'Taslima Nasrin',
    authorBn: 'তাসলিমা নাসরিন',
    dateEn: '25 February 2025',
    dateBn: '২৫ ফেব্রুয়ারি ২০২৫',
    readTime: '4 min',
    readTimeBn: '৪ মিনিট',
    tagsEn: ['Eid', 'Festival', 'Holidays', 'Family'],
    tagsBn: ['ঈদ', 'উৎসব', 'ছুটি', 'পরিবার'],
    contentEn: [
      'Eid holidays are more than just traveling home — they\'re an opportunity to create lasting memories with family and explore Bangladesh\'s diverse destinations. Here\'s how to make the most of your Eid break while staying within budget.',
      'Plan a multi-stop journey if your family is spread across different cities. Instead of a direct trip, consider visiting relatives in multiple locations. Our marketplace makes it easy to find tickets for each leg of your journey, all protected by escrow.',
      'Explore tourist destinations near your hometown. Cox\'s Bazar, Sylhet\'s tea gardens, Rangamati\'s lake district, and Sundarbans are all reachable from major cities. A short side trip can turn a routine family visit into an exciting holiday.',
      'Combine transport types for the best experience. Take a launch to Barishal, then a bus to Cox\'s Bazar, or ride the train to Sylhet and hire a local car to the tea estates. Mixing transport modes adds adventure and can be more cost-effective.',
      'Capture the moments. Keep a travel journal, take photos at scenic stops, and share your experiences. The journey itself is part of the Eid celebration. Share your travel tips with our community and help others plan their perfect Eid trip.',
    ],
    contentBn: [
      'ঈদ ছুটি শুধু বাড়ি যাত্রা নয় — এটি পরিবারের সাথে স্মরণীয় মুহূর্ত তৈরি এবং বাংলাদেশের বিচিত্র গন্তব্য অনুসন্ধানের সুযোগ। বাজেটের মধ্যে থেকে ঈদ বিরতির সর্বোচ্চ ব্যবহার করার উপায়।',
      'পরিবার বিভিন্ন শহরে ছড়িয়ে থাকলে মাল্টি-স্টপ যাত্রা পরিকল্পনা করুন। সরাসরি ট্রিপের বদলে একাধিক স্থানে আত্মীয়দের সাথে দেখা করার কথা বিবেচনা করুন। আমাদের মার্কেটপ্লেস যাত্রার প্রতিটি পর্যায়ে টিকেট খুঁজে পাওয়া সহজ করে।',
      'আপনার শহরের কাছে পর্যটন গন্তব্য অনুসন্ধান করুন। কক্সবাজার, সিলেটের চা বাগান, রাঙ্গামাটির লেক ডিস্ট্রিক্ট এবং সুন্দরবন প্রধান শহর থেকে পৌঁছানো যায়। একটি ছোট সাইড ট্রিপ সাধারণ পারিবারিক সাক্ষাৎ উত্তেজনাপূর্ণ ছুটিতে পরিণত করতে পারে।',
      'সর্বোত্তম অভিজ্ঞতার জন্য যানবাহন প্রকার মিশ্রিত করুন। বরিশালে লঞ্চ, তারপর কক্সবাজারে বাস, অথবা সিলেটে ট্রেন এবং চা বাগানে স্থানীয় গাড়ি। যানবাহন মোড মিশ্রিত করা অ্যাডভেনচার যোগ করে।',
      'মুহূর্ত ধরে রাখুন। ট্রাভেল জার্নাল রাখুন, দৃশ্যমান স্টপে ছবি নিন এবং আপনার অভিজ্ঞতা শেয়ার করুন। যাত্রা নিজেই ঈদ উদযাপনের অংশ। আমাদের কমিউনিটির সাথে ভ্রমণ টিপস শেয়ার করুন।',
    ],
  },
  'bkash-payment-guide': {
    category: 'buying-guide',
    titleEn: 'bKash Payment Guide for Ticket Purchases',
    titleBn: 'টিকেট ক্রয়ের জন্য বিকাশ পেমেন্ট নির্দেশিকা',
    authorEn: 'Ashraf Ali',
    authorBn: 'আশরাফ আলী',
    dateEn: '20 February 2025',
    dateBn: '২০ ফেব্রুয়ারি ২০২৫',
    readTime: '3 min',
    readTimeBn: '৩ মিনিট',
    tagsEn: ['bKash', 'Payment', 'Mobile Banking', 'Guide'],
    tagsBn: ['বিকাশ', 'পেমেন্ট', 'মোবাইল ব্যাংকিং', 'নির্দেশিকা'],
    contentEn: [
      'bKash is the most widely used mobile financial service in Bangladesh, making it the ideal payment method for buying tickets on our platform. This guide walks you through using bKash to securely purchase tickets with our escrow protection.',
      'Setting up bKash: If you don\'t have a bKash account, download the bKash app from the Play Store or App Store. Registration requires your NID and a verified mobile number. The setup process takes about 10 minutes and you can start using it immediately.',
      'Making a payment: When you select bKash as your payment method on our checkout page, a bKash payment portal opens. Enter your bKash account number and the PIN. The payment amount is automatically filled. Confirm the transaction, and you\'ll receive an SMS verification from bKash.',
      'Security features: bKash transactions are protected by their own security protocols, and our platform adds an extra layer with escrow protection. Your payment is held in escrow until you verify the ticket is valid. This double protection ensures your money is completely safe.',
      'Tips for smooth transactions: Ensure your bKash account has sufficient balance before initiating payment. Keep your PIN confidential and never share it. Enable transaction notifications on your bKash app. If a transaction fails, wait 5 minutes before trying again to avoid duplicate payments.',
    ],
    contentBn: [
      'বিকাশ বাংলাদেশের সবচেয়ে ব্যাপকভাবে ব্যবহৃত মোবাইল ফিন্যান্সিয়াল সেবা, আমাদের প্ল্যাটফর্মে টিকেট ক্রয়ের আদর্শ পেমেন্ট পদ্ধতি। এই নির্দেশিকা বিকাশ ব্যবহার করে আমাদের এসক্রো সুরক্ষা দিয়ে নিরাপদে টিকেট ক্রয়ের প্রক্রিয়া।',
      'বিকাশ সেটআপ: বিকাশ একাউন্ট না থাকলে, প্লে স্টোর বা আপ স্টোর থেকে বিকাশ অ্যাপ ডাউনলোড করুন। রেজিস্ট্রেশনে আপনার এনআইডি এবং যাচাইকৃত মোবাইল নম্বর প্রয়োজন। সেটআপ প্রক্রিয়া প্রায় ১০ মিনিট সময় নেয়।',
      'পেমেন্ট করা: আমাদের চেকআউট পৃষ্ঠায় বিকাশ পেমেন্ট পদ্ধতি নির্বাচন করলে, বিকাশ পেমেন্ট পোর্টাল খোলে। বিকাশ একাউন্ট নম্বর এবং পিন প্রবেশ করুন। পেমেন্ট পরিমাণ স্বয়ংক্রিয়ভাবে পূরণ হয়। লেনদেন নিশ্চিত করুন।',
      'নিরাপত্তা ফিচার: বিকাশ লেনদেন তাদের নিজস্ব নিরাপত্তা প্রোটোকল দিয়ে সুরক্ষিত, আমাদের প্ল্যাটফর্ম এসক্রো সুরক্ষা দিয়ে অতিরিক্ত স্তর যোগ করে। আপনার পেমেন্ট এসক্রোতে ধরে রাখা হয় যতক্ষণ না আপনি টিকেট বৈধ যাচাই করেন।',
      'মসৃণ লেনদেনের টিপস: পেমেন্ট শুরু করার আগে বিকাশ একাউন্টে পর্যাপ্ত ব্যালেন্স নিশ্চিত করুন। পিন গোপন রাখুন এবং কখনো শেয়ার করবেন না। বিকাশ অ্যাপে লেনদেন নোটিফিকেশন সক্রিয় করুন। লেনদেন ব্যর্থ হলে, ৫ মিনিট অপেক্ষা করে আবার চেষ্টা করুন।',
    ],
  },
};

// ─── Related posts (3 cards, excluding current) ────────────────────
const allBlogSlugs = Object.keys(blogContentMap);

function getRelatedPosts(currentSlug: string): string[] {
  const currentCategory = blogContentMap[currentSlug]?.category;
  // First try same category, then different categories
  const sameCategory = allBlogSlugs.filter(s => s !== currentSlug && blogContentMap[s]?.category === currentCategory);
  const differentCategory = allBlogSlugs.filter(s => s !== currentSlug && blogContentMap[s]?.category !== currentCategory);
  return [...sameCategory, ...differentCategory].slice(0, 3);
}

// ─── Component ──────────────────────────────────────────────────────
export default function BlogDetailPage({ slug }: BlogDetailPageProps) {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const blog = blogContentMap[slug];

  // Fallback for unknown slug
  if (!blog) {
    return (
      <div className={`min-h-screen bg-background ${fontClass} flex items-center justify-center`}>
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            {isBn ? 'পোস্ট পাওয়া যায়নি' : 'Post Not Found'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isBn ? 'আপনি অনুসন্ধান করা ব্লগ পোস্ট পাওয়া যায়নি' : 'The blog post you are looking for could not be found'}
          </p>
          <Button onClick={() => navigate('blog')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isBn ? 'ব্লগে ফিরুন' : 'Back to Blog'}
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIconMap[blog.category] || BookOpen;
  const categoryLabel = categoryLabelMap[blog.category];
  const content = isBn ? blog.contentBn : blog.contentEn;
  const tags = isBn ? blog.tagsBn : blog.tagsEn;
  const relatedSlugs = getRelatedPosts(slug);

  // ─── Share URL builder ───────────────────────────────────────
  const shareUrl = `https://eidticketresell.com/${language}/blog/${slug}`;
  const shareTitle = isBn ? blog.titleBn : blog.titleEn;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
    }
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-background ${fontClass}`}>
      {/* ─── Hero Image Placeholder ───────────────────── */}
      <section className={`relative h-64 md:h-80 bg-gradient-to-br ${categoryGradientMap[blog.category] || 'from-gray-400 to-gray-600'} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30" />
        <CategoryIcon className="h-24 w-24 md:h-32 md:w-32 text-white/40" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-10">
          <Badge className={categoryBadgeMap[blog.category]}>
            {categoryLabel ? (isBn ? categoryLabel.bn : categoryLabel.en) : blog.category}
          </Badge>
        </div>
      </section>

      {/* ─── Article Content ─────────────────────────── */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('blog')}
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isBn ? 'ব্লগে ফিরুন' : 'Back to Blog'}
          </Button>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">
            {isBn ? blog.titleBn : blog.titleEn}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {isBn ? blog.authorBn : blog.authorEn}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {isBn ? blog.dateBn : blog.dateEn}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {isBn ? blog.readTimeBn : blog.readTime} {isBn ? 'পড়া' : 'read'}
            </span>
          </div>

          <Separator className="mb-8" />

          {/* Content paragraphs */}
          <div className="space-y-6">
            {content.map((paragraph, idx) => (
              <p key={idx} className="text-base md:text-lg leading-relaxed text-foreground/80">
                {paragraph}
              </p>
            ))}
          </div>

          <Separator className="my-8" />

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {isBn ? 'সম্পর্কিত টপিক' : 'Related Topics'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Share buttons */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {isBn ? 'শেয়ার করুন' : 'Share This Article'}
            </h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/20"
              >
                <Facebook className="h-4 w-4 mr-2" />
                {isBn ? 'ফেসবুক' : 'Facebook'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 dark:hover:bg-sky-900/20"
              >
                <Twitter className="h-4 w-4 mr-2" />
                {isBn ? 'টুইটার' : 'Twitter / X'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('whatsapp')}
                className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-900/20"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}
              </Button>
            </div>
          </div>
        </motion.div>
      </article>

      {/* ─── Related Posts ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Separator className="mb-8" />
        <h2 className="text-xl md:text-2xl font-bold mb-6">
          {isBn ? 'সম্পর্কিত পোস্ট' : 'Related Posts'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedSlugs.map((relSlug) => {
            const relBlog = blogContentMap[relSlug];
            if (!relBlog) return null;
            const RelIcon = categoryIconMap[relBlog.category] || BookOpen;
            return (
              <Card
                key={relSlug}
                className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20"
                onClick={() => navigate('blog', { slug: relSlug })}
              >
                <div className={`relative h-40 bg-gradient-to-br ${categoryGradientMap[relBlog.category] || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                  <RelIcon className="h-12 w-12 text-white/50 group-hover:scale-110 transition-transform duration-300" />
                  <Badge className={`absolute top-3 left-3 ${categoryBadgeMap[relBlog.category]}`}>
                    {categoryLabelMap[relBlog.category] ? (isBn ? categoryLabelMap[relBlog.category].bn : categoryLabelMap[relBlog.category].en) : relBlog.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {isBn ? relBlog.titleBn : relBlog.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {isBn ? relBlog.excerptBn : relBlog.excerptEn}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {isBn ? relBlog.dateBn : relBlog.dateEn}
                    <Clock className="h-3 w-3 ml-2" />
                    {isBn ? relBlog.readTimeBn : relBlog.readTime}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
