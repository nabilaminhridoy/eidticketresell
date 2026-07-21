'use client';

import { motion } from 'framer-motion';
import {
  MoonStar, Bus, TrainFront, Plane, Ship,
  Facebook, Twitter, Instagram, Youtube, Mail,
  Phone, MapPin, Heart, ArrowRight, Shield, Zap
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppStore, useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const quickLinks = [
  { labelKey: 'home' as const, page: 'home' as const },
  { labelKey: 'about' as const, page: 'about' as const },
  { labelKey: 'howItWorks' as const, page: 'how-it-works' as const },
  { labelKey: 'faq' as const, page: 'faq' as const },
  { labelKey: 'blog' as const, page: 'blog' as const },
  { labelKey: 'support' as const, page: 'support' as const },
];

const transportLinks = [
  { labelKey: 'bus' as const, page: 'bus' as const, icon: Bus, color: 'icon-bg-green' },
  { labelKey: 'train' as const, page: 'train' as const, icon: TrainFront, color: 'icon-bg-blue' },
  { labelKey: 'flight' as const, page: 'flight' as const, icon: Plane, color: 'icon-bg-orange' },
  { labelKey: 'launch' as const, page: 'launch' as const, icon: Ship, color: 'icon-bg-green' },
];

const legalLinks = [
  { labelKey: 'terms' as const, page: 'terms' as const },
  { labelKey: 'privacy' as const, page: 'privacy' as const },
  { labelKey: 'refund' as const, page: 'refund' as const },
  { labelKey: 'paymentPolicy' as const, page: 'payment-policy' as const },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue hover:text-blue-foreground' },
  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-blue hover:text-blue-foreground' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-orange hover:text-orange-foreground' },
  { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:bg-orange hover:text-orange-foreground' },
];

export default function Footer() {
  const { navigate } = useAppStore();
  const { language } = useLanguageStore();

  const currentYear = new Date().getFullYear();

  const handleNavigate = (page: string) => {
    navigate(page as Parameters<typeof navigate>[0]);
  };

  return (
    <footer className="mt-auto">
      {/* Gradient divider above footer */}
      <div className="divider-gradient" />

      {/* Main Footer Content */}
      <div className="bg-gradient-mesh">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

            {/* About Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {/* Logo */}
                <button
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-2.5 mb-5 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow">
                    <MoonStar className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className={`text-lg font-bold text-gradient-spectrum ${language === 'bn' ? 'font-bangla' : ''}`}>
                    {t('appName', language)}
                  </span>
                </button>

                <p className={`text-sm text-muted-foreground leading-relaxed mb-6 ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {language === 'en'
                    ? 'The most trusted marketplace for buying and selling Bus, Train, Flight & Launch tickets in Bangladesh. Secure transactions with escrow protection.'
                    : 'বাংলাদেশে বাস, ট্রেন, ফ্লাইট ও লঞ্চ টিকেট কেনাবেচার সবচেয়ে বিশ্বস্ত মার্কেটপ্লেস। এসক্রো সুরক্ষায় নিরাপদ লেনদেন।'}
                </p>

                {/* Trust badges */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Escrow</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange/10 text-orange">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Instant</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>support@eidticketresell.com</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-orange transition-colors">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-orange/10">
                      <Phone className="w-3.5 h-3.5 text-orange" />
                    </div>
                    <span>+880 1XXX-XXXXXX</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-blue transition-colors">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue/10">
                      <MapPin className="w-3.5 h-3.5 text-blue" />
                    </div>
                    <span className={language === 'bn' ? 'font-bangla' : ''}>
                      {language === 'en' ? 'Dhaka, Bangladesh' : 'ঢাকা, বাংলাদেশ'}
                    </span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary transition-all duration-300 icon-hover-gradient ${social.color}`}
                      aria-label={social.label}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Transport Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className={`text-sm font-semibold text-foreground mb-5 uppercase tracking-wider flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
                <div className="w-1.5 h-5 rounded-full bg-gradient-spectrum" />
                {t('transport', language)}
              </h3>
              <ul className="space-y-3">
                {transportLinks.map((link) => (
                  <li key={link.labelKey}>
                    <button
                      onClick={() => handleNavigate(link.page)}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group w-full hover-gradient-underline"
                    >
                      <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${link.color} text-[0.65rem] shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all`}>
                        <link.icon className="w-4 h-4 text-white" />
                      </span>
                      <span className={language === 'bn' ? 'font-bangla' : ''}>
                        {t(link.labelKey, language)}
                      </span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Quick Links Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className={`text-sm font-semibold text-foreground mb-5 uppercase tracking-wider flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
                <div className="w-1.5 h-5 rounded-full bg-gradient-brand" />
                {language === 'en' ? 'Quick Links' : 'দ্রুত লিংক'}
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.labelKey}>
                    <button
                      onClick={() => handleNavigate(link.page)}
                      className={`text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group hover-gradient-underline ${language === 'bn' ? 'font-bangla' : ''}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-brand group-hover:opacity-100 transition-opacity opacity-40" />
                      {t(link.labelKey, language)}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className={`text-sm font-semibold text-foreground mb-5 uppercase tracking-wider flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
                <div className="w-1.5 h-5 rounded-full bg-gradient-cool" />
                {language === 'en' ? 'Legal' : 'আইনি'}
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.labelKey}>
                    <button
                      onClick={() => handleNavigate(link.page)}
                      className={`text-sm text-muted-foreground hover:text-blue transition-colors flex items-center gap-2 group hover-gradient-underline ${language === 'bn' ? 'font-bangla' : ''}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-cool group-hover:opacity-100 transition-opacity opacity-40" />
                      {t(link.labelKey, language)}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gradient-spectrum shadow-gradient-spectrum">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className={`text-xs text-primary-foreground/90 text-center sm:text-left ${language === 'bn' ? 'font-bangla' : ''}`}>
              © {currentYear} {t('appName', language)}. {t('allRightsReserved', language)}.
            </p>

            {/* Payment Partners */}
            <div className="flex items-center gap-3">
              <span className={`text-xs text-primary-foreground/70 ${language === 'bn' ? 'font-bangla' : ''}`}>
                {language === 'en' ? 'Payment Partners:' : 'পেমেন্ট পার্টনার:'}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge className="text-xs font-semibold bg-white/20 text-white hover:bg-white/30 border-0">
                  bKash
                </Badge>
                <Badge className="text-xs font-semibold bg-white/20 text-white hover:bg-white/30 border-0">
                  SSLCommerz
                </Badge>
                <Badge className="text-xs font-semibold bg-white/20 text-white hover:bg-white/30 border-0">
                  Nagad
                </Badge>
                <Badge className="text-xs font-semibold bg-white/20 text-white hover:bg-white/30 border-0">
                  Rocket
                </Badge>
              </div>
            </div>

            {/* Made with love */}
            <div className={`flex items-center gap-1 text-xs text-primary-foreground/80 ${language === 'bn' ? 'font-bangla' : ''}`}>
              <span>{language === 'en' ? 'Made with' : 'তৈরি হয়েছে'}</span>
              <Heart className="w-3 h-3 text-orange fill-orange" />
              <span>{language === 'en' ? 'in Bangladesh' : 'বাংলাদেশে'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
