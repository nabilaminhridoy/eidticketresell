'use client';

import { motion } from 'framer-motion';
import {
  MoonStar, Bus, TrainFront, Plane, Ship,
  Facebook, Twitter, Instagram, Youtube, Mail,
  Phone, MapPin, Heart
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
  { labelKey: 'bus' as const, page: 'bus' as const, icon: Bus },
  { labelKey: 'train' as const, page: 'train' as const, icon: TrainFront },
  { labelKey: 'flight' as const, page: 'flight' as const, icon: Plane },
  { labelKey: 'launch' as const, page: 'launch' as const, icon: Ship },
];

const legalLinks = [
  { labelKey: 'terms' as const, page: 'terms' as const },
  { labelKey: 'privacy' as const, page: 'privacy' as const },
  { labelKey: 'refund' as const, page: 'refund' as const },
  { labelKey: 'paymentPolicy' as const, page: 'payment-policy' as const },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const { navigate } = useAppStore();
  const { language } = useLanguageStore();

  const currentYear = new Date().getFullYear();

  const handleNavigate = (page: string) => {
    navigate(page as Parameters<typeof navigate>[0]);
  };

  return (
    <footer className="mt-auto border-t bg-muted/30">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
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
                className="flex items-center gap-2 mb-4 group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md group-hover:shadow-primary/30 transition-shadow">
                  <MoonStar className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className={`text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent ${language === 'bn' ? 'font-bangla' : ''}`}>
                  {t('appName', language)}
                </span>
              </button>

              <p className={`text-sm text-muted-foreground leading-relaxed mb-6 ${language === 'bn' ? 'font-bangla' : ''}`}>
                {language === 'en'
                  ? 'The most trusted marketplace for buying and selling Bus, Train, Flight & Launch tickets in Bangladesh. Secure transactions with escrow protection.'
                  : 'বাংলাদেশে বাস, ট্রেন, ফ্লাইট ও লঞ্চ টিকেট কেনাবেচার সবচেয়ে বিশ্বস্ত মার্কেটপ্লেস। এসক্রো সুরক্ষায় নিরাপদ লেনদেন।'}
              </p>

              {/* Contact Info */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>support@eidticketresell.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+880 1XXX-XXXXXX</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
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
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Links Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className={`text-sm font-semibold text-foreground mb-4 uppercase tracking-wider ${language === 'bn' ? 'font-bangla' : ''}`}>
              {language === 'en' ? 'Quick Links' : 'দ্রুত লিংক'}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.labelKey}>
                  <button
                    onClick={() => handleNavigate(link.page)}
                    className={`text-sm text-muted-foreground hover:text-primary transition-colors ${language === 'bn' ? 'font-bangla' : ''}`}
                  >
                    {t(link.labelKey, language)}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Transport Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className={`text-sm font-semibold text-foreground mb-4 uppercase tracking-wider ${language === 'bn' ? 'font-bangla' : ''}`}>
              {t('transport', language)}
            </h3>
            <ul className="space-y-2.5">
              {transportLinks.map((link) => (
                <li key={link.labelKey}>
                  <button
                    onClick={() => handleNavigate(link.page)}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <link.icon className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <span className={language === 'bn' ? 'font-bangla' : ''}>
                      {t(link.labelKey, language)}
                    </span>
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
            <h3 className={`text-sm font-semibold text-foreground mb-4 uppercase tracking-wider ${language === 'bn' ? 'font-bangla' : ''}`}>
              {language === 'en' ? 'Legal' : 'আইনি'}
            </h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.labelKey}>
                  <button
                    onClick={() => handleNavigate(link.page)}
                    className={`text-sm text-muted-foreground hover:text-primary transition-colors ${language === 'bn' ? 'font-bangla' : ''}`}
                  >
                    {t(link.labelKey, language)}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className={`text-xs text-muted-foreground text-center sm:text-left ${language === 'bn' ? 'font-bangla' : ''}`}>
              © {currentYear} {t('appName', language)}. {t('allRightsReserved', language)}.
            </p>

            {/* Payment Partners */}
            <div className="flex items-center gap-3">
              <span className={`text-xs text-muted-foreground ${language === 'bn' ? 'font-bangla' : ''}`}>
                {language === 'en' ? 'Payment Partners:' : 'পেমেন্ট পার্টনার:'}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 hover:bg-pink-100">
                  bKash
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100">
                  SSLCommerz
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100">
                  Nagad
                </Badge>
                <Badge variant="secondary" className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">
                  Rocket
                </Badge>
              </div>
            </div>

            {/* Made with love */}
            <div className={`flex items-center gap-1 text-xs text-muted-foreground ${language === 'bn' ? 'font-bangla' : ''}`}>
              <span>{language === 'en' ? 'Made with' : 'তৈরি হয়েছে'}</span>
              <Heart className="w-3 h-3 text-primary fill-primary" />
              <span>{language === 'en' ? 'in Bangladesh' : 'বাংলাদেশে'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
