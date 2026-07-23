'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import {
  Search, BookOpen, Shield, ShoppingCart, Tag, Newspaper,
  CalendarDays, Clock, User, ArrowRight, MapPin, Plane,
  ChevronLeft, ChevronRight, MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis,
} from '@/components/ui/pagination';

// ─── Blog category definitions ─────────────────────────────────────
type BlogCategory = 'all' | 'travel-tips' | 'safety' | 'buying-guide' | 'selling-guide' | 'transport-news' | 'festival-travel';

const categories: { id: BlogCategory; en: string; bn: string }[] = [
  { id: 'all', en: 'All', bn: 'সব' },
  { id: 'travel-tips', en: 'Travel Tips', bn: 'ভ্রমণ টিপস' },
  { id: 'safety', en: 'Safety', bn: 'নিরাপত্তা' },
  { id: 'buying-guide', en: 'Buying Guide', bn: 'ক্রয় নির্দেশিকা' },
  { id: 'selling-guide', en: 'Selling Guide', bn: 'বিক্রয় নির্দেশিকা' },
  { id: 'transport-news', en: 'Transport News', bn: 'যানবাহন সংবাদ' },
  { id: 'festival-travel', en: 'Festival Travel', bn: 'উৎসব ভ্রমণ' },
];

// ─── Category icon mapping ─────────────────────────────────────────
const categoryIconMap: Record<string, React.ElementType> = {
  'travel-tips': MapPin,
  'safety': Shield,
  'buying-guide': ShoppingCart,
  'selling-guide': Tag,
  'transport-news': Newspaper,
  'festival-travel': Plane,
};

// ─── Category gradient mapping ─────────────────────────────────────
const categoryGradientMap: Record<string, string> = {
  'travel-tips': 'from-green-400 to-emerald-600',
  'safety': 'from-red-400 to-rose-600',
  'buying-guide': 'from-orange-400 to-amber-600',
  'selling-guide': 'from-purple-400 to-violet-600',
  'transport-news': 'from-blue-400 to-cyan-600',
  'festival-travel': 'from-yellow-400 to-orange-600',
};

// ─── Category badge color mapping ──────────────────────────────────
const categoryBadgeMap: Record<string, string> = {
  'travel-tips': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'safety': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'buying-guide': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'selling-guide': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'transport-news': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'festival-travel': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

// ─── Blog posts data ───────────────────────────────────────────────
interface BlogPost {
  slug: string;
  category: BlogCategory;
  titleEn: string;
  titleBn: string;
  excerptEn: string;
  excerptBn: string;
  authorEn: string;
  authorBn: string;
  dateEn: string;
  dateBn: string;
  readTime: string;
  readTimeBn: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'eid-travel-tips',
    category: 'travel-tips',
    titleEn: 'Eid Travel Tips: How to Plan Your Journey',
    titleBn: 'ঈদ ভ্রমণ টিপস: আপনার যাত্রা কীভাবে পরিকল্পনা করবেন',
    excerptEn: 'Planning your Eid trip? Here are essential tips for booking tickets early, choosing the right transport, and ensuring a smooth journey home.',
    excerptBn: 'ঈদের ট্রিপ পরিকল্পনা করছেন? টিকেট আগে বুকিং, সঠিক যানবাহন নির্বাচন এবং মসৃণ যাত্রা নিশ্চিত করার জন্য এখানে প্রয়োজনীয় টিপস।',
    authorEn: 'Rahim Ahmed',
    authorBn: 'রহিম আহমেদ',
    dateEn: '15 Mar 2025',
    dateBn: '১৫ মার্চ ২০২৫',
    readTime: '5 min',
    readTimeBn: '৫ মিনিট',
  },
  {
    slug: 'bus-travel-safety',
    category: 'safety',
    titleEn: 'Safety Guide for Bus Travel in Bangladesh',
    titleBn: 'বাংলাদেশে বাস ভ্রমণের নিরাপত্তা নির্দেশিকা',
    excerptEn: 'Stay safe on Bangladesh roads. Learn about bus safety protocols, choosing reliable operators, and what to check before boarding.',
    excerptBn: 'বাংলাদেশের রাস্তায় নিরাপদ থাকুন। বাস নিরাপত্তা প্রোটোকল, নির্ভরযোগ্য অপারেটর নির্বাচন এবং বোর্ডিংয়ের আগে যা পরীক্ষা করতে হবে।',
    authorEn: 'Karim Hossain',
    authorBn: 'করিম হোসেন',
    dateEn: '12 Mar 2025',
    dateBn: '১২ মার্চ ২০২৫',
    readTime: '7 min',
    readTimeBn: '৭ মিনিট',
  },
  {
    slug: 'budget-tickets-eid',
    category: 'buying-guide',
    titleEn: 'How to Find Budget Tickets This Eid',
    titleBn: 'এই ঈদে বাজেট টিকেট কীভাবে খুঁজে পাবেন',
    excerptEn: 'Don\'t overpay for Eid travel. Discover strategies for finding affordable tickets, comparing prices, and using our marketplace effectively.',
    excerptBn: 'ঈদ ভ্রমণে অতিরিক্ত অর্থ দিন না। সাশ্রয়ী টিকেট খুঁজে পাওয়া, মূল্য তুলনা এবং আমাদের মার্কেটপ্লেস কার্যকরভাবে ব্যবহারের কৌশল।',
    authorEn: 'Nasreen Akter',
    authorBn: 'নাসরিন আক্তার',
    dateEn: '10 Mar 2025',
    dateBn: '১০ মার্চ ২০২৫',
    readTime: '6 min',
    readTimeBn: '৬ মিনিট',
  },
  {
    slug: 'seller-guide-first-ticket',
    category: 'selling-guide',
    titleEn: 'Complete Seller Guide: List Your First Ticket',
    titleBn: 'সম্পূর্ণ বিক্রেতা নির্দেশিকা: আপনার প্রথম টিকেট তালিকাভুক্ত করুন',
    excerptEn: 'Want to sell your unused ticket? This step-by-step guide covers everything from listing to completing a successful sale on our platform.',
    excerptBn: 'আপনার অব্যবহৃত টিকেট বিক্রি করতে চান? তালিকাভুক্তি থেকে আমাদের প্ল্যাটফর্মে সফল বিক্রি সম্পন্ন করার সম্পূর্ণ ধাপে ধাপে নির্দেশিকা।',
    authorEn: 'Imran Khan',
    authorBn: 'ইমরান খান',
    dateEn: '8 Mar 2025',
    dateBn: '৮ মার্চ ২০২৫',
    readTime: '8 min',
    readTimeBn: '৮ মিনিট',
  },
  {
    slug: 'train-schedule-eid',
    category: 'transport-news',
    titleEn: 'Train Schedule Changes During Eid Season',
    titleBn: 'ঈদ মৌসুমে ট্রেন সময়সূচী পরিবর্তন',
    excerptEn: 'Bangladesh Railway announces special Eid schedules. Know the changes, new routes, and extra trains to help you plan your journey.',
    excerptBn: 'বাংলাদেশ রেলওয়ে বিশেষ ঈদ সময়সূচী ঘোষণা করেছে। পরিবর্তন, নতুন রুট এবং অতিরিক্ত ট্রেন জানুন যা আপনার যাত্রা পরিকল্পনায় সাহায্য করবে।',
    authorEn: 'Sajid Rahman',
    authorBn: 'সাজিদ রহমান',
    dateEn: '5 Mar 2025',
    dateBn: '৫ মার্চ ২০২৫',
    readTime: '4 min',
    readTimeBn: '৪ মিনিট',
  },
  {
    slug: 'invalid-ticket-guide',
    category: 'buying-guide',
    titleEn: 'What to Do If Your Ticket Is Invalid',
    titleBn: 'আপনার টিকেট অবৈধ হলে কী করবেন',
    excerptEn: 'Bought a ticket that doesn\'t work? Learn the steps to take, how our escrow protection helps, and getting your money back quickly.',
    excerptBn: 'কাজ করে না এমন টিকেট কিনেছেন? নিতে হবে এমন পদক্ষেপ, আমাদের এসক্রো সুরক্ষা কীভাবে সাহায্য করে এবং দ্রুত অর্থ ফেরত পাওয়া।',
    authorEn: 'Farida Begum',
    authorBn: 'ফরিদা বেগম',
    dateEn: '3 Mar 2025',
    dateBn: '৩ মার্চ ২০২৫',
    readTime: '5 min',
    readTimeBn: '৫ মিনিট',
  },
  {
    slug: 'launch-dhaka-barishal',
    category: 'travel-tips',
    titleEn: 'Launch Travel: Dhaka to Barishal Route Guide',
    titleBn: 'লঞ্চ ভ্রমণ: ঢাকা থেকে বরিশাল রুট নির্দেশিকা',
    excerptEn: 'Complete guide to launch travel on the Dhaka-Barishal route. Timings, cabin types, pricing, and tips for a comfortable river journey.',
    excerptBn: 'ঢাকা-বরিশাল রুটে লঞ্চ ভ্রমণের সম্পূর্ণ নির্দেশিকা। সময়, কেবিন প্রকার, মূল্য এবং আরামদায়ক নদী যাত্রার টিপস।',
    authorEn: 'Hasib Molla',
    authorBn: 'হাসিব মোল্লা',
    dateEn: '28 Feb 2025',
    dateBn: '২৮ ফেব্রুয়ারি ২০২৫',
    readTime: '6 min',
    readTimeBn: '৬ মিনিট',
  },
  {
    slug: 'festival-travel-eid',
    category: 'festival-travel',
    titleEn: 'Festival Travel: Making the Most of Eid Holidays',
    titleBn: 'উৎসব ভ্রমণ: ঈদ ছুটির সর্বোচ্চ ব্যবহার',
    excerptEn: 'Make your Eid holidays memorable. Tips on combining travel with family visits, popular destinations, and creating unforgettable experiences.',
    excerptBn: 'আপনার ঈদ ছুটি স্মরণীয় করুন। ভ্রমণ ও পারিবারিক সাক্ষাৎ মিলিয়ে, জনপ্রিয় গন্তব্য এবং অবিস্মরণীয় অভিজ্ঞতা তৈরির টিপস।',
    authorEn: 'Taslima Nasrin',
    authorBn: 'তাসলিমা নাসরিন',
    dateEn: '25 Feb 2025',
    dateBn: '২৫ ফেব্রুয়ারি ২০২৫',
    readTime: '4 min',
    readTimeBn: '৪ মিনিট',
  },
  {
    slug: 'bkash-payment-guide',
    category: 'buying-guide',
    titleEn: 'bKash Payment Guide for Ticket Purchases',
    titleBn: 'টিকেট ক্রয়ের জন্য বিকাশ পেমেন্ট নির্দেশিকা',
    excerptEn: 'Step-by-step bKash payment guide for buying tickets on our platform. From setting up bKash to completing secure transactions.',
    excerptBn: 'আমাদের প্ল্যাটফর্মে টিকেট ক্রয়ের জন্য ধাপে ধাপে বিকাশ পেমেন্ট নির্দেশিকা। বিকাশ সেটআপ থেকে নিরাপদ লেনদেন সম্পন্ন করা।',
    authorEn: 'Ashraf Ali',
    authorBn: 'আশরাফ আলী',
    dateEn: '20 Feb 2025',
    dateBn: '২০ ফেব্রুয়ারি ২০২৫',
    readTime: '3 min',
    readTimeBn: '৩ মিনিট',
  },
];

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [activeCategory, setActiveCategory] = useState<BlogCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Filtered posts ──────────────────────────────────────────
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = !searchQuery || 
      (isBn ? post.titleBn : post.titleEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (isBn ? post.excerptBn : post.excerptEn).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleCategoryChange = (cat: BlogCategory) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? (isBn ? cat.bn : cat.en) : catId;
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-background ${fontClass}`}>
      {/* ─── Hero Section ───────────────────────────── */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder')] opacity-10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-8 w-8 md:h-10 md:w-10" />
              <h1 className="text-3xl md:text-5xl font-bold">
                {isBn ? 'ব্লগ ও ভ্রমণ টিপস' : 'Blog & Travel Tips'}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              {isBn
                ? 'বাংলাদেশে নিরাপদ ও সাশ্রয়ী ভ্রমণের জন্য প্রয়োজনীয় টিপস, নির্দেশিকা এবং সংবাদ'
                : 'Essential tips, guides, and news for safe and affordable travel in Bangladesh'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Search Bar ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={isBn ? 'ব্লগ পোস্ট অনুসন্ধান করুন...' : 'Search blog posts...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-background border-2 shadow-lg rounded-xl text-base"
            />
          </form>
        </motion.div>
      </section>

      {/* ─── Category Filter ────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const CatIcon = cat.id !== 'all' ? categoryIconMap[cat.id] : null;
            return (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(cat.id)}
                className={activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                }
              >
                {CatIcon && <CatIcon className="h-4 w-4 mr-1.5" />}
                {isBn ? cat.bn : cat.en}
              </Button>
            );
          })}
        </div>
      </section>

      {/* ─── Blog Posts Grid ───────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {paginatedPosts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {isBn ? 'কোনো ব্লগ পোস্ট পাওয়া যায়নি' : 'No blog posts found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPosts.map((post, index) => {
              const PostIcon = categoryIconMap[post.category];
              return (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card
                    className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/20 h-full flex flex-col"
                    onClick={() => navigate('blog', { slug: post.slug })}
                  >
                    {/* Featured image placeholder */}
                    <div className={`relative h-48 bg-gradient-to-br ${categoryGradientMap[post.category] || 'from-gray-400 to-gray-600'} flex items-center justify-center overflow-hidden`}>
                      {PostIcon && <PostIcon className="h-16 w-16 text-white/60 group-hover:scale-110 transition-transform duration-300" />}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />
                      <Badge className={`absolute top-3 left-3 ${categoryBadgeMap[post.category]}`}>
                        {getCategoryName(post.category)}
                      </Badge>
                    </div>

                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {isBn ? post.titleBn : post.titleEn}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                      {isBn ? post.excerptBn : post.excerptEn}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {isBn ? post.authorBn : post.authorEn}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {isBn ? post.dateBn : post.dateEn}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {isBn ? post.readTimeBn : post.readTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-primary text-sm font-medium mt-3 group-hover:gap-2 transition-all duration-200">
                      {isBn ? 'আরও পড়ুন' : t('readMore', language)}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Pagination ─────────────────────────────── */}
      {totalPages > 1 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-16">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer"
                  >
                    {isBn ? page.toLocaleString('bn-BD') : page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </section>
      )}
    </div>
  );
}
