'use client';

import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Ticket,
  Home,
  Search,
  HelpCircle,
  Tag,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Bus,
} from 'lucide-react';

export default function NotFoundClient() {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const popularLinks = [
    {
      icon: Search,
      label: isBn ? 'টিকেট খুঁজুন' : 'Find Tickets',
      description: isBn ? 'বিক্রয়ের টিকেট দেখুন' : 'Browse available tickets',
      color: 'bg-primary',
      onClick: () => navigate('search'),
    },
    {
      icon: Tag,
      label: isBn ? 'টিকেট বিক্রি' : 'Sell Tickets',
      description: isBn ? 'অব্যবহৃত টিকেট তালিকা করুন' : 'List your unused tickets',
      color: 'bg-orange',
      onClick: () => navigate('sell-ticket'),
    },
    {
      icon: HelpCircle,
      label: isBn ? 'সাহায্য কেন্দ্র' : 'Help Center',
      description: isBn ? 'উত্তর ও সাহায্য পান' : 'Get answers & support',
      color: 'bg-blue',
      onClick: () => navigate('support'),
    },
    {
      icon: Ticket,
      label: isBn ? 'সাধারণ জিজ্ঞাসা' : 'FAQs',
      description: isBn ? 'সাধারণ প্রশ্ন' : 'Common questions',
      color: 'bg-primary',
      onClick: () => navigate('faq'),
    },
  ];

  return (
    <div className={`min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center overflow-hidden bg-background px-4 py-8 ${fontClass}`}>
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-[80px]" />
      </div>

      {/* Lost Ticket Illustration */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6">
        <div className="absolute inset-0 rounded-2xl bg-primary/10 dark:bg-primary/15 border-2 border-dashed border-primary/30 backdrop-blur-sm">
          <div className="p-5 sm:p-6 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Bus className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                ETR Express
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground/70">
                  {isBn ? 'ঢাকা' : 'Dhaka'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground/70">???</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {isBn ? 'হারিয়ে গেছে...' : 'Lost in transit...'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mx-5">
            <div className="border-t border-dashed border-primary/20" />
            <div className="absolute -left-7 -top-1.5 w-3 h-3 rounded-full bg-background" />
            <div className="absolute -right-7 -top-1.5 w-3 h-3 rounded-full bg-background" />
          </div>

          <div className="p-5 sm:p-6 pt-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {isBn ? 'সিট' : 'Seat'}
              </p>
              <p className="text-lg font-bold text-foreground/50">?</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {isBn ? 'স্ট্যাটাস' : 'Status'}
              </p>
              <span className="text-xs font-bold text-orange animate-pulse">
                {isBn ? 'পাওয়া যায়নি' : 'NOT FOUND'}
              </span>
            </div>
          </div>
        </div>

        {/* Floating question marks */}
        <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary animate-bounce">
          ?
        </div>
        <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-sm font-bold text-primary animate-bounce" style={{ animationDelay: '1s' }}>
          ?
        </div>
      </div>

      {/* Large 404 Number */}
      <h1 className="text-8xl sm:text-9xl font-extrabold text-primary text-center mb-3 leading-none animate-pulse">
        404
      </h1>

      {/* Page Not Found */}
      <div className="text-center mb-2">
        <h2 className={`text-xl sm:text-2xl font-bold text-foreground mb-2 ${fontClass}`}>
          {isBn ? 'পৃষ্ঠা খুঁজে পাওয়া যায়নি' : 'Page Not Found'}
        </h2>
        <p className={`text-muted-foreground text-sm sm:text-base leading-relaxed ${fontClass}`}>
          {isBn
            ? 'এই টিকেট যাত্রাপথে হারিয়ে গেছে!'
            : 'Looks like this ticket got lost in transit!'}
        </p>
      </div>

      {/* Fun decorative badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange/10 dark:bg-orange/20 border border-orange/20 dark:border-orange/30">
          <Sparkles className="w-3.5 h-3.5 text-orange" />
          <span className={`text-xs font-medium text-orange ${fontClass}`}>
            {isBn
              ? 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই'
              : "The page you're looking for doesn't exist"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full max-w-md">
        <Button
          onClick={() => navigate('home')}
          className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Home className="w-4 h-4" />
          {isBn ? 'হোম পৃষ্ঠায় যান' : 'Back to Home'}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('search')}
          className="flex-1 h-11 rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Search className="w-4 h-4" />
          {isBn ? 'টিকেট খুঁজুন' : 'Find Tickets'}
        </Button>
      </div>

      {/* Popular Links Section */}
      <div className="w-full max-w-md">
        <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-3 ${fontClass}`}>
          {isBn ? 'জনপ্রিয় গন্তব্য' : 'Popular Destinations'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {popularLinks.map((link) => (
            <div
              key={link.label}
              onClick={link.onClick}
              className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${link.color}`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1 ml-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="text-center mt-8">
        <p className={`text-xs text-muted-foreground ${fontClass}`}>
          {t('appName', language)} · {isBn ? 'অব্যবহৃত ঈদ ট্রাভেল টিকেট কেনাবেচা' : 'Buy & Sell Unused Eid Travel Tickets'}
        </p>
      </div>
    </div>
  );
}
