'use client';

import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { POPULAR_ROUTES } from '@/lib/constants';
import { MoonStar, Ticket, ArrowRight, Bus, TrainFront, Plane, Ship, Shield, Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { navigate } = useNav();
  const { language } = useLanguageStore();

  const transportTypes = [
    { id: 'bus' as const, icon: Bus, labelKey: 'bus' as const, bg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400' },
    { id: 'train' as const, icon: TrainFront, labelKey: 'train' as const, bg: 'bg-teal-50 dark:bg-teal-900/20', iconColor: 'text-teal-600 dark:text-teal-400' },
    { id: 'flight' as const, icon: Plane, labelKey: 'flight' as const, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
    { id: 'launch' as const, icon: Ship, labelKey: 'launch' as const, bg: 'bg-indigo-50 dark:bg-indigo-900/20', iconColor: 'text-indigo-600 dark:text-indigo-400' },
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
      {/* Hero Section — Clean white/very-subtle-green-tinted background */}
      <section className="relative overflow-hidden bg-white dark:bg-background">
        {/* Minimal decorative elements at very low opacity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-[8%] text-primary/[0.04]">
            <Bus className="w-14 h-14" />
          </div>
          <div className="absolute top-32 right-[12%] text-primary/[0.04]">
            <Plane className="w-11 h-11" />
          </div>
          <div className="absolute bottom-24 left-[18%] text-primary/[0.04]">
            <TrainFront className="w-12 h-12" />
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-20 lg:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Eid Special Badge */}
            <div className="mb-6">
              <Badge
                variant="secondary"
                className="px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors duration-200"
              >
                <MoonStar className="w-3.5 h-3.5 mr-1.5" />
                {language === 'en' ? 'Eid Special 2025' : 'ঈদ স্পেশাল ২০২৫'}
              </Badge>
            </div>

            {/* Headline */}
            <h1
              className={`text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground ${language === 'bn' ? 'font-bangla' : ''}`}
            >
              {t('heroTitle', language)}
            </h1>

            {/* Subtitle */}
            <p
              className={`text-lg text-muted-foreground mb-10 max-w-2xl mx-auto ${language === 'bn' ? 'font-bangla' : ''}`}
            >
              {t('heroSubtitle', language)}
            </p>

            {/* Two CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('search')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Ticket className="w-5 h-5 mr-2" />
                {t('searchTickets', language)}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('sell-ticket')}
                className="text-base px-8 transition-all duration-200"
              >
                {t('sellTickets', language)}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Transport Types — Clean white bg, subtle tinted icon backgrounds */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className={`text-2xl lg:text-3xl font-bold mb-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
            {t('allTransport', language)}
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {transportTypes.map((transport) => (
            <Card
              key={transport.id}
              className="group cursor-pointer border hover:border-primary/30 hover:shadow-sm transition-all duration-200"
              onClick={() => navigate(transport.id)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`w-14 h-14 rounded-xl ${transport.bg} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                  <transport.icon className={`w-7 h-7 ${transport.iconColor}`} />
                </div>
                <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {t(transport.labelKey, language)}
                </h3>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works — Alternating bg-muted/30 background */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className={`text-2xl lg:text-3xl font-bold mb-10 text-center ${language === 'bn' ? 'font-bangla' : ''}`}>
            {t('howItWorksTitle', language)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: t('step1Title', language), desc: t('step1Desc', language) },
              { step: '2', title: t('step2Title', language), desc: t('step2Desc', language) },
              { step: '3', title: t('step3Title', language), desc: t('step3Desc', language) },
              { step: '4', title: t('step4Title', language), desc: t('step4Desc', language) },
            ].map((item, index) => (
              <Card
                key={index}
                className="h-full bg-white dark:bg-card border hover:border-primary/20 hover:shadow-sm transition-all duration-200"
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {item.step}
                  </div>
                  <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm text-muted-foreground leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}>
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us — Clean white background */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <h2 className={`text-2xl lg:text-3xl font-bold mb-10 text-center ${language === 'bn' ? 'font-bangla' : ''}`}>
          {t('whyChooseUs', language)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="h-full border hover:border-primary/20 hover:shadow-sm transition-all duration-200"
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className={`font-semibold text-lg ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm text-muted-foreground leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats — Green gradient background (only section with gradient) */}
      <section className="bg-gradient-to-r from-primary to-primary/90 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl lg:text-4xl font-bold text-white mb-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {stat.value}
                </div>
                <div className={`text-white/80 ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes — Clean white background */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <h2 className={`text-2xl lg:text-3xl font-bold mb-10 text-center ${language === 'bn' ? 'font-bangla' : ''}`}>
          {t('popularRoutes', language)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_ROUTES.map((route, index) => (
            <Card
              key={index}
              className="group cursor-pointer border hover:border-primary/30 hover:shadow-sm transition-all duration-200"
              onClick={() => navigate('search', { from: route.from, to: route.to })}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <span className={`font-medium truncate ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {language === 'bn' ? route.fromBn : route.from}
                </span>
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                <span className={`font-medium truncate ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {language === 'bn' ? route.toBn : route.to}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section — Subtle green-tinted background */}
      <section className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className={`text-2xl lg:text-3xl font-bold mb-4 ${language === 'bn' ? 'font-bangla' : ''}`}>
            {language === 'en' ? 'Start Selling Your Tickets Today' : 'আজই আপনার টিকেট বিক্রি শুরু করুন'}
          </h2>
          <p className={`text-muted-foreground mb-8 max-w-lg mx-auto ${language === 'bn' ? 'font-bangla' : ''}`}>
            {language === 'en' ? 'Join thousands of verified sellers and reach millions of travelers' : 'হাজার হাজার যাচাইকৃত বিক্রেতাদের সাথে যোগ দিন'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('sell-ticket')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {t('sellTickets', language)}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('how-it-works')}
              className="transition-all duration-200"
            >
              {language === 'en' ? 'Learn More' : 'আরও জানুন'}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
