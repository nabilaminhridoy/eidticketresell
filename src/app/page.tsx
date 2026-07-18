'use client';

import { useState, useEffect, lazy, Suspense, ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import { useAppStore, useLanguageStore } from '@/lib/store';
import { MoonStar, Ticket, ArrowRight, Bus, TrainFront, Plane, Ship, Shield, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';
import { POPULAR_ROUTES } from '@/lib/constants';

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
  kyc: LazyDashboardPage,
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

  const transportTypes = [
    { id: 'bus' as const, icon: Bus, labelKey: 'bus' as const, color: 'from-emerald-500 to-green-600' },
    { id: 'train' as const, icon: TrainFront, labelKey: 'train' as const, color: 'from-teal-500 to-cyan-600' },
    { id: 'flight' as const, icon: Plane, labelKey: 'flight' as const, color: 'from-sky-500 to-blue-600' },
    { id: 'launch' as const, icon: Ship, labelKey: 'launch' as const, color: 'from-violet-500 to-purple-600' },
  ];

  const features = [
    { icon: Shield, title: t('verified', language) + ' ' + t('seller', language), desc: language === 'en' ? 'All sellers go through KYC verification for your safety' : 'আপনার নিরাপত্তার জন্য সকল বিক্রেতা কেওয়াইসি যাচাইয় যান' },
    { icon: Star, title: language === 'en' ? 'Escrow Protection' : 'এসক্রো সুরক্ষা', desc: language === 'en' ? 'Your payment is held securely until the journey is complete' : 'যাত্রা সম্পন্ন না হওয়া পর্যন্ত আপনার পেমেন্ট নিরাপদে রাখা হয়' },
    { icon: Zap, title: language === 'en' ? 'Instant Delivery' : 'তাৎক্ষণিক ডেলিভারি', desc: language === 'en' ? 'Get your tickets delivered instantly to your device' : 'আপনার ডিভাইসে তাৎক্ষণিক টিকেট ডেলিভারি' },
    { icon: Users, title: language === 'en' ? '24/7 Support' : '২৪/৭ সাহায্য', desc: language === 'en' ? 'Our support team is always here to help you' : 'আমাদের সাহায্য দল সবসময় আপনাকে সাহায্য করতে এখানে' },
  ];

  const stats = [
    { value: '10,000+', label: language === 'en' ? 'Tickets Sold' : 'টিকেট বিক্রি' },
    { value: '5,000+', label: language === 'en' ? 'Happy Users' : 'সুখী ব্যবহারকারী' },
    { value: '500+', label: language === 'en' ? 'Verified Sellers' : 'যাচাইকৃত বিক্রেতা' },
    { value: '64+', label: language === 'en' ? 'Cities Covered' : 'শহর কভারেজ' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <motion.div className="absolute top-20 left-[10%] text-primary/10" animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity }}>
            <Bus className="w-12 h-12" />
          </motion.div>
          <motion.div className="absolute top-40 right-[15%] text-primary/10" animate={{ y: [10, -10, 10] }} transition={{ duration: 3.5, repeat: Infinity }}>
            <Plane className="w-10 h-10" />
          </motion.div>
          <motion.div className="absolute bottom-40 left-[20%] text-primary/10" animate={{ y: [-8, 8, -8] }} transition={{ duration: 5, repeat: Infinity }}>
            <TrainFront className="w-14 h-14" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20">
                🌙 {language === 'en' ? 'Eid Special 2025' : 'ঈদ স্পেশাল ২০২৫'}
              </Badge>
            </motion.div>

            <motion.h1
              className={`text-4xl lg:text-6xl font-bold tracking-tight mb-6 ${language === 'bn' ? 'font-bangla' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t('heroTitle', language)}
              </span>
            </motion.h1>

            <motion.p
              className={`text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto ${language === 'bn' ? 'font-bangla' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('heroSubtitle', language)}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button size="lg" onClick={() => navigate('search')} className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-primary/30 transition-shadow text-base px-8">
                <Ticket className="w-5 h-5 mr-2" />
                {t('searchTickets', language)}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('sell-ticket')} className="text-base px-8">
                {t('sellTickets', language)}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transport Types */}
      <section className="container mx-auto px-4 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className={`text-2xl lg:text-3xl font-bold mb-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
            {t('allTransport', language)}
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {transportTypes.map((transport, index) => (
            <Card key={transport.id} className="group cursor-pointer border-2 border-transparent hover:border-primary/30 transition-all hover:shadow-lg" onClick={() => navigate('search', { transportType: transport.id })}>
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${transport.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <transport.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>{t(transport.labelKey, language)}</h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className={`text-2xl lg:text-3xl font-bold mb-8 text-center ${language === 'bn' ? 'font-bangla' : ''}`}>{t('howItWorksTitle', language)}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: t('step1Title', language), desc: t('step1Desc', language) },
              { step: '2', title: t('step2Title', language), desc: t('step2Desc', language) },
              { step: '3', title: t('step3Title', language), desc: t('step3Desc', language) },
              { step: '4', title: t('step4Title', language), desc: t('step4Desc', language) },
            ].map((item, index) => (
              <Card key={index} className="h-full border-transparent hover:border-primary/20 transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg shadow-lg">{item.step}</div>
                  <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>{item.title}</h3>
                  <p className={`text-sm text-muted-foreground leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}>{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <h2 className={`text-2xl lg:text-3xl font-bold mb-8 text-center ${language === 'bn' ? 'font-bangla' : ''}`}>{t('whyChooseUs', language)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="h-full border-transparent hover:border-primary/20 transition-all hover:shadow-md">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><feature.icon className="w-6 h-6 text-primary" /></div>
                <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>{feature.title}</h3>
                <p className={`text-sm text-muted-foreground leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}>{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-2">{stat.value}</div>
                <div className={`text-primary-foreground/80 ${language === 'bn' ? 'font-bangla' : ''}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <h2 className={`text-2xl lg:text-3xl font-bold mb-8 text-center ${language === 'bn' ? 'font-bangla' : ''}`}>{t('popularRoutes', language)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_ROUTES.map((route, index) => (
            <Card key={index} className="group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all" onClick={() => navigate('search', { from: route.from, to: route.to })}>
              <CardContent className="p-4 flex items-center gap-3">
                <span className={`font-medium truncate ${language === 'bn' ? 'font-bangla' : ''}`}>{language === 'bn' ? route.fromBn : route.from}</span>
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                <span className={`font-medium truncate ${language === 'bn' ? 'font-bangla' : ''}`}>{language === 'bn' ? route.toBn : route.to}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className={`text-2xl lg:text-3xl font-bold mb-4 ${language === 'bn' ? 'font-bangla' : ''}`}>
            {language === 'en' ? 'Start Selling Your Tickets Today' : 'আজই আপনার টিকেট বিক্রি শুরু করুন'}
          </h2>
          <p className={`text-muted-foreground mb-8 max-w-lg mx-auto ${language === 'bn' ? 'font-bangla' : ''}`}>
            {language === 'en' ? 'Join thousands of verified sellers and reach millions of travelers' : 'হাজার হাজার যাচাইকৃত বিক্রেতাদের সাথে যোগ দিন'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('sell-ticket')} className="bg-gradient-to-r from-primary to-primary/90 shadow-lg px-8">{t('sellTickets', language)}</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('how-it-works')}>{language === 'en' ? 'Learn More' : 'আরও জানুন'}</Button>
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
