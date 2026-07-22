'use client';

import { useState, useEffect, lazy, Suspense, ComponentType, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import { useAppStore, useLanguageStore } from '@/lib/store';
import {
  MoonStar, Ticket, ArrowRight, Bus, TrainFront, Plane, Ship,
  Shield, Star, Users, Zap, Search, ChevronRight, TrendingUp,
  Clock, MapPin, Heart, CheckCircle2, Sparkles, ArrowLeftRight,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { t } from '@/lib/i18n';
import { POPULAR_ROUTES, BD_CITIES } from '@/lib/constants';

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Pre-created lazy page components (declared outside render to avoid re-creation)
const LazyLoginPage = lazy(() => import('@/components/pages/LoginPage'));
const LazyRegisterPage = lazy(() => import('@/components/pages/RegisterPage'));
const LazyKycPage = lazy(() => import('@/components/pages/KycPage'));
const LazySearchPage = lazy(() => import('@/components/pages/SearchPage'));
const LazyTicketDetailsPage = lazy(() => import('@/components/pages/TicketDetailsPage'));
const LazySellTicketPage = lazy(() => import('@/components/pages/SellTicketPage'));
const LazyDashboardPage = lazy(() => import('@/components/pages/DashboardPage'));
const LazyAdminPage = lazy(() => import('@/components/pages/AdminPage'));
const LazyInfoPage = lazy(() => import('@/components/pages/InfoPage'));

const pageComponents: Record<string, ComponentType> = {
  login: LazyLoginPage,
  register: LazyRegisterPage,
  search: LazySearchPage,
  bus: LazySearchPage,
  train: LazySearchPage,
  flight: LazySearchPage,
  launch: LazySearchPage,
  'ticket-details': LazyTicketDetailsPage,
  'sell-ticket': LazySellTicketPage,
  profile: LazyDashboardPage,
  kyc: LazyKycPage,
  wallet: LazyDashboardPage,
  'my-tickets': LazyDashboardPage,
  'my-orders': LazyDashboardPage,
  settings: LazyDashboardPage,
  notifications: LazyDashboardPage,
  admin: LazyAdminPage,
  'admin-users': LazyAdminPage,
  'admin-kyc': LazyAdminPage,
  'admin-tickets': LazyAdminPage,
  'admin-orders': LazyAdminPage,
  'admin-payments': LazyAdminPage,
  'admin-escrow': LazyAdminPage,
  'admin-wallets': LazyAdminPage,
  'admin-withdrawals': LazyAdminPage,
  'admin-reviews': LazyAdminPage,
  'admin-reports': LazyAdminPage,
  'admin-settings': LazyAdminPage,
  'admin-activity-logs': LazyAdminPage,
  about: LazyInfoPage,
  contact: LazyInfoPage,
  'how-it-works': LazyInfoPage,
  faq: LazyInfoPage,
  blog: LazyInfoPage,
  support: LazyInfoPage,
  terms: LazyInfoPage,
  privacy: LazyInfoPage,
  refund: LazyInfoPage,
  'payment-policy': LazyInfoPage,
  chat: LazyInfoPage,
};

// Lazy page loader - only imports the page when needed
function LazyPage({ pageName }: { pageName: string }) {
  const PageComponent = pageComponents[pageName];
  if (!PageComponent) return <div>Page not found</div>;
  return (
    <Suspense fallback={<PageLoader />}>
      <PageComponent />
    </Suspense>
  );
}

// Auth pages (no header/footer shell)
const authPages = new Set(['login', 'register', 'forgot-password']);

// Home Page (inline for fast initial load - no dynamic import needed)
function HomePage() {
  const { navigate } = useAppStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  // Search form state
  const [transportType, setTransportType] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [journeyDate, setJourneyDate] = useState('');

  const swapCities = useCallback(() => {
    setFromCity(toCity);
    setToCity(fromCity);
  }, [fromCity, toCity]);

  const handleSearch = () => {
    navigate('search', {
      ...(transportType && { transportType }),
      ...(fromCity && { from: fromCity }),
      ...(toCity && { to: toCity }),
      ...(journeyDate && { date: journeyDate }),
    });
  };

  const transportTypes = [
    { id: 'bus' as const, icon: Bus, labelKey: 'bus' as const, iconBg: 'bg-primary text-primary-foreground', lightBg: 'bg-primary/10', hoverBorder: 'hover:border-primary/30' },
    { id: 'train' as const, icon: TrainFront, labelKey: 'train' as const, iconBg: 'bg-blue text-blue-foreground', lightBg: 'bg-blue/10', hoverBorder: 'hover:border-blue/30' },
    { id: 'flight' as const, icon: Plane, labelKey: 'flight' as const, iconBg: 'bg-orange text-orange-foreground', lightBg: 'bg-orange/10', hoverBorder: 'hover:border-orange/30' },
    { id: 'launch' as const, icon: Ship, labelKey: 'launch' as const, iconBg: 'bg-primary text-primary-foreground', lightBg: 'bg-primary/10', hoverBorder: 'hover:border-primary/30' },
  ];

  const features = [
    {
      icon: Shield, title: t('verified', language) + ' ' + t('seller', language),
      desc: language === 'en' ? 'All sellers go through KYC verification for your safety' : 'আপনার নিরাপত্তার জন্য সকল বিক্রেতা কেওয়াইসি যাচাইয় যান',
      iconBg: 'bg-primary text-primary-foreground'
    },
    {
      icon: Star, title: language === 'en' ? 'Escrow Protection' : 'এসক্রো সুরক্ষা',
      desc: language === 'en' ? 'Your payment is held securely until the journey is complete' : 'যাত্রা সম্পন্ন না হওয়া পর্যন্ত আপনার পেমেন্ট নিরাপদে রাখা হয়',
      iconBg: 'bg-orange text-orange-foreground'
    },
    {
      icon: Zap, title: language === 'en' ? 'Instant Delivery' : 'তাৎক্ষণিক ডেলিভারি',
      desc: language === 'en' ? 'Get your tickets delivered instantly to your device' : 'আপনার ডিভাইসে তাৎক্ষণিক টিকেট ডেলিভারি',
      iconBg: 'bg-blue text-blue-foreground'
    },
    {
      icon: Users, title: language === 'en' ? '24/7 Support' : '২৪/৭ সাহায্য',
      desc: language === 'en' ? 'Our support team is always here to help you' : 'আমাদের সাহায্য দল সবসময় আপনাকে সাহায্য করতে এখানে',
      iconBg: 'bg-primary text-primary-foreground'
    },
  ];

  const stats = [
    { value: '10,000+', label: language === 'en' ? 'Tickets Sold' : 'টিকেট বিক্রি', color: 'text-white' },
    { value: '5,000+', label: language === 'en' ? 'Happy Users' : 'সুখী ব্যবহারকারী', color: 'text-white' },
    { value: '500+', label: language === 'en' ? 'Verified Sellers' : 'যাচাইকৃত বিক্রেতা', color: 'text-white' },
    { value: '64+', label: language === 'en' ? 'Cities Covered' : 'শহর কভারেজ', color: 'text-white' },
  ];

  const steps = [
    {
      step: '01', title: t('step1Title', language), desc: t('step1Desc', language),
      iconBg: 'bg-primary text-primary-foreground', accent: 'bg-primary/10 border-primary/20'
    },
    {
      step: '02', title: t('step2Title', language), desc: t('step2Desc', language),
      iconBg: 'bg-orange text-orange-foreground', accent: 'bg-orange/10 border-orange/20'
    },
    {
      step: '03', title: t('step3Title', language), desc: t('step3Desc', language),
      iconBg: 'bg-blue text-blue-foreground', accent: 'bg-blue/10 border-blue/20'
    },
    {
      step: '04', title: t('step4Title', language), desc: t('step4Desc', language),
      iconBg: 'bg-primary text-primary-foreground', accent: 'bg-primary/10 border-primary/20'
    },
  ];

  return (
    <>
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-28 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {language === 'en' ? 'Eid Special 2025' : 'ঈদ স্পেশাল ২০২৫'}
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              className={`text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] ${language === 'bn' ? 'font-bangla' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-primary">
                {t('heroTitle', language)}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={`text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('heroSubtitle', language)}
            </motion.p>

            {/* Transport Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-3xl mx-auto mb-8"
            >
              <div className="rounded-2xl bg-card border-2 border-primary/15 shadow-xl shadow-primary/5 p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Transport Type */}
                  <div className="space-y-2">
                    <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                      {t('transportType', language)}
                    </Label>
                    <Select value={transportType} onValueChange={setTransportType}>
                      <SelectTrigger className={`h-11 rounded-xl border-primary/20 bg-background ${fontClass}`}>
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-primary shrink-0" />
                          <SelectValue placeholder={t('selectTransport', language)} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {transportTypes.map((tp) => (
                          <SelectItem key={tp.id} value={tp.id} className={fontClass}>
                            <div className="flex items-center gap-2">
                              <tp.icon className="w-4 h-4" />
                              {t(tp.labelKey, language)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* From */}
                  <div className="space-y-2">
                    <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                      {t('from', language)}
                    </Label>
                    <Select value={fromCity} onValueChange={setFromCity}>
                      <SelectTrigger className={`h-11 rounded-xl border-primary/20 bg-background ${fontClass}`}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <SelectValue placeholder={t('selectCity', language)} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {BD_CITIES.map((city) => (
                          <SelectItem key={city} value={city} className={fontClass}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* To + Swap */}
                  <div className="space-y-2 relative">
                    <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                      {t('to', language)}
                    </Label>
                    <Select value={toCity} onValueChange={setToCity}>
                      <SelectTrigger className={`h-11 rounded-xl border-primary/20 bg-background ${fontClass}`}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange shrink-0" />
                          <SelectValue placeholder={t('selectCity', language)} />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {BD_CITIES.map((city) => (
                          <SelectItem key={city} value={city} className={fontClass}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Swap button */}
                    <button
                      type="button"
                      onClick={swapCities}
                      className="absolute -left-6 top-[38px] z-10 w-8 h-8 rounded-full bg-card border-2 border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm hover:shadow-md"
                      title={isBn ? 'শহর অদলাবদল' : 'Swap cities'}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Journey Date */}
                  <div className="space-y-2">
                    <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                      {t('journeyDate', language)}
                    </Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue pointer-events-none" />
                      <Input
                        type="date"
                        value={journeyDate}
                        onChange={(e) => setJourneyDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`h-11 rounded-xl border-primary/20 bg-background pl-9 ${fontClass}`}
                        placeholder={t('selectDate', language)}
                      />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <div className="mt-5 flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    className="rounded-xl text-base px-10 h-12 transition-all duration-300 w-full sm:w-auto"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {t('searchTickets', language)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button size="lg" onClick={() => navigate('search')} className="rounded-xl text-base px-8 h-12">
                <Ticket className="w-5 h-5 mr-2" />
                {t('searchTickets', language)}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('sell-ticket')} className="text-base px-8 h-12 rounded-xl border-orange/30 hover:bg-orange/10 hover:text-orange hover:border-orange">
                {t('sellTickets', language)}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 38.3C1248 33.3 1344 26.7 1392 23.3L1440 20V60H0Z" className="fill-muted" />
          </svg>
        </div>
      </section>

      {/* ========== TRANSPORT TYPES ========== */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20">
            {t('allTransport', language)}
          </Badge>
          <h2 className={`text-2xl lg:text-4xl font-bold ${language === 'bn' ? 'font-bangla' : ''}`}>
            {language === 'en' ? 'Choose Your Transport' : 'আপনার যানবাহন বেছে নিন'}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {transportTypes.map((transport, index) => (
            <motion.div
              key={transport.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                className={`group cursor-pointer border-2 border-transparent ${transport.hoverBorder} transition-all duration-300 hover:shadow-lg`}
                onClick={() => navigate('search', { transportType: transport.id })}
              >
                <CardContent className="p-6 lg:p-8 flex flex-col items-center text-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${transport.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    <transport.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>
                    {t(transport.labelKey, language)}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    <span className={language === 'bn' ? 'font-bangla' : ''}>
                      {language === 'en' ? 'Browse tickets' : 'টিকেট দেখুন'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-3 bg-orange/10 text-orange border-orange/20">
              {t('howItWorks', language)}
            </Badge>
            <h2 className={`text-2xl lg:text-4xl font-bold ${language === 'bn' ? 'font-bangla' : ''}`}>
              {t('howItWorksTitle', language)}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={`h-full border-transparent hover:border-primary/20 transition-all hover:shadow-lg ${item.accent}`}>
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {item.step}
                    </div>
                    <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>{item.title}</h3>
                    <p className={`text-sm text-muted-foreground leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}>{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHY CHOOSE US ========== */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-3 bg-blue/10 text-blue border-blue/20">
            {t('whyChooseUs', language)}
          </Badge>
          <h2 className={`text-2xl lg:text-4xl font-bold ${language === 'bn' ? 'font-bangla' : ''}`}>
            {t('whyChooseUs', language)}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full border-transparent hover:border-primary/20 transition-all hover:shadow-lg">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>{feature.title}</h3>
                  <p className={`text-sm text-muted-foreground leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}>{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="text-3xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className={`text-white/80 text-sm lg:text-base ${language === 'bn' ? 'font-bangla' : ''}`}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== POPULAR ROUTES ========== */}
      <section className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-3 bg-orange/10 text-orange border-orange/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            {t('popularRoutes', language)}
          </Badge>
          <h2 className={`text-2xl lg:text-4xl font-bold ${language === 'bn' ? 'font-bangla' : ''}`}>
            {t('popularRoutes', language)}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_ROUTES.map((route, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className="group cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                onClick={() => navigate('search', { from: route.from, to: route.to })}
              >
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`font-medium truncate ${language === 'bn' ? 'font-bangla' : ''}`}>
                      {language === 'bn' ? route.fromBn : route.from}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className={`font-medium truncate ${language === 'bn' ? 'font-bangla' : ''}`}>
                      {language === 'bn' ? route.toBn : route.to}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-20 relative">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-orange/15 text-orange border-orange/20">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {language === 'en' ? 'Start Earning' : 'আয় শুরু করুন'}
              </Badge>
              <h2 className={`text-2xl lg:text-4xl font-bold mb-4 ${language === 'bn' ? 'font-bangla' : ''}`}>
                <span className="text-primary">
                  {language === 'en' ? 'Start Selling Your Tickets Today' : 'আজই আপনার টিকেট বিক্রি শুরু করুন'}
                </span>
              </h2>
              <p className={`text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}>
                {language === 'en' ? 'Join thousands of verified sellers and reach millions of travelers across Bangladesh' : 'হাজার হাজার যাচাইকৃত বিক্রেতাদের সাথে যোগ দিন এবং বাংলাদেশ জুড়ে লক্ষ লক্ষ যাত্রীর কাছে পৌঁছান'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate('sell-ticket')} className="bg-orange text-orange-foreground hover:bg-orange/90 rounded-xl px-8 h-12 text-base">
                  <Ticket className="w-5 h-5 mr-2" />
                  {t('sellTickets', language)}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('how-it-works')} className="rounded-xl px-8 h-12 text-base border-blue/30 hover:bg-blue/10 hover:text-blue hover:border-blue">
                  {language === 'en' ? 'Learn More' : 'আরও জানুন'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

// Page Router
function PageRouter() {
  const { currentPage } = useAppStore();

  // Home page renders inline (no dynamic import)
  if (currentPage === 'home') {
    return (
      <AppShell>
        <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <HomePage />
        </motion.div>
      </AppShell>
    );
  }

  // Auth pages (no shell)
  if (authPages.has(currentPage)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <LazyPage pageName={currentPage} />
        </motion.div>
      </Suspense>
    );
  }

  // All other pages (with shell)
  if (pageComponents[currentPage]) {
    return (
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <motion.div key={currentPage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <LazyPage pageName={currentPage} />
          </motion.div>
        </Suspense>
      </AppShell>
    );
  }

  // Fallback to home
  return (
    <AppShell>
      <HomePage />
    </AppShell>
  );
}

export default function Home() {
  return <PageRouter />;
}
