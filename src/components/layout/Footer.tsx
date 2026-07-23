'use client';

import { motion } from 'framer-motion';
import {
  Bus, TrainFront, Plane, Ship,
  Facebook, Instagram, Linkedin, Twitter, Youtube,
  Mail, Phone, MapPin, ArrowRight, ChevronDown,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';

// ─── WhatsApp SVG icon (inline) ───
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.323.297-.522.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.504-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.637 0 5.137 1.03 7.013 2.905a9.825 9.825 0 012.9 7.008c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Data ───

const transportLinks = [
  { labelKey: 'allTransport' as const, page: 'search' as const, icon: null, color: '' },
  { labelKey: 'bus' as const, page: 'bus' as const, icon: Bus, color: 'bg-green-600 text-white' },
  { labelKey: 'train' as const, page: 'train' as const, icon: TrainFront, color: 'bg-teal-600 text-white' },
  { labelKey: 'flight' as const, page: 'flight' as const, icon: Plane, color: 'bg-sky-500 text-white' },
  { labelKey: 'launch' as const, page: 'launch' as const, icon: Ship, color: 'bg-violet-600 text-white' },
];

const quickLinks = [
  { labelKey: 'blog' as const, page: 'blog' as const },
  { labelKey: 'aboutUs' as const, page: 'about' as const },
  { labelKey: 'contactUs' as const, page: 'contact' as const },
  { labelKey: 'verifyTicket' as const, page: 'verify-ticket' as const },
  { labelKey: 'faq' as const, page: 'faq' as const },
];

const legalLinks = [
  { labelKey: 'paymentPolicy' as const, page: 'payment-policy' as const },
  { labelKey: 'refund' as const, page: 'refund' as const },
  { labelKey: 'terms' as const, page: 'terms' as const },
  { labelKey: 'privacy' as const, page: 'privacy' as const },
  { labelKey: 'cookiesPolicy' as const, page: 'cookies-policy' as const },
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/eidticketresell', label: 'Facebook', hoverColor: 'hover:bg-[#1877F2] hover:text-white' },
  { icon: Instagram, href: 'https://instagram.com/eidticketresell', label: 'Instagram', hoverColor: 'hover:bg-[#E4405F] hover:text-white' },
  { icon: WhatsAppIcon, href: 'https://wa.me/8801XXXXXXXX', label: 'WhatsApp', hoverColor: 'hover:bg-[#25D366] hover:text-white' },
  { icon: Twitter, href: 'https://x.com/eidticketresell', label: 'X (Twitter)', hoverColor: 'hover:bg-[#1DA1F2] hover:text-white' },
  { icon: Linkedin, href: 'https://linkedin.com/company/eidticketresell', label: 'LinkedIn', hoverColor: 'hover:bg-[#0A66C2] hover:text-white' },
  { icon: Youtube, href: 'https://youtube.com/@eidticketresell', label: 'YouTube', hoverColor: 'hover:bg-[#FF0000] hover:text-white' },
];

export default function Footer() {
  const { navigate } = useNav();
  const { language } = useLanguageStore();
  const currentYear = new Date().getFullYear();

  const handleNavigate = (page: string) => {
    navigate(page);
  };

  return (
    <footer className="mt-auto">
      {/* Separator above footer */}
      <Separator className="h-0.5" />

      {/* Main Footer Content */}
      <div className="bg-muted">
        <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-14">

          {/* ── Desktop Layout: 4-column grid ── */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-10 lg:gap-12">

            {/* Column 1 ─ Logo + Info + Social */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              {/* Logo */}
              <button
                onClick={() => handleNavigate('home')}
                className="flex items-center gap-2.5 mb-4 group"
              >
                <img
                  src={language === 'bn' ? '/logo-bn.svg' : '/logo-en.svg'}
                  alt={t('appName', language)}
                  className="h-10 w-auto object-contain group-hover:scale-[1.02] transition-transform"
                />
              </button>

              {/* Tag line */}
              <p className={`text-sm text-muted-foreground leading-relaxed mb-5 ${language === 'bn' ? 'font-bangla' : ''}`}>
                {t('tagLine', language)}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>+880 1XXX-XXXXXX</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>support@eidticketresell.com</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className={language === 'bn' ? 'font-bangla' : ''}>
                    {language === 'en' ? 'Dhaka, Bangladesh' : 'ঢাকা, বাংলাদেশ'}
                  </span>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg bg-background border border-border text-muted-foreground transition-all duration-300 ${social.hoverColor}`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Column 2 ─ TRANSPORT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className={`text-sm font-semibold text-foreground mb-5 uppercase tracking-wider flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
                <div className="w-1.5 h-5 rounded-full bg-green-600" />
                {t('transport', language)}
              </h3>
              <ul className="space-y-3">
                {transportLinks.map((link) => (
                  <li key={link.labelKey}>
                    <button
                      onClick={() => handleNavigate(link.page)}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group w-full"
                    >
                      {link.icon ? (
                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${link.color} shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all`}>
                          <link.icon className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600/10 text-green-600 shadow-sm group-hover:scale-105 transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                      <span className={language === 'bn' ? 'font-bangla' : ''}>
                        {t(link.labelKey, language)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 3 ─ QUICK LINKS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className={`text-sm font-semibold text-foreground mb-5 uppercase tracking-wider flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
                <div className="w-1.5 h-5 rounded-full bg-green-600" />
                {language === 'en' ? 'Quick Links' : 'দ্রুত লিংক'}
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.labelKey}>
                    <button
                      onClick={() => handleNavigate(link.page)}
                      className={`text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group ${language === 'bn' ? 'font-bangla' : ''}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all" />
                      {t(link.labelKey, language)}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 4 ─ LEGAL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className={`text-sm font-semibold text-foreground mb-5 uppercase tracking-wider flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : ''}`}>
                <div className="w-1.5 h-5 rounded-full bg-blue-600" />
                {language === 'en' ? 'Legal' : 'আইনি'}
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.labelKey}>
                    <button
                      onClick={() => handleNavigate(link.page)}
                      className={`text-sm text-muted-foreground hover:text-blue-600 transition-colors flex items-center gap-2 group ${language === 'bn' ? 'font-bangla' : ''}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600/40 group-hover:bg-blue-600 transition-all" />
                      {t(link.labelKey, language)}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* ── Mobile/Tablet Layout: Logo info + Accordions ── */}
          <div className="lg:hidden space-y-6">

            {/* Always visible: Logo + Tag line + Contact + Social */}
            <div className="flex flex-col">
              {/* Logo */}
              <button
                onClick={() => handleNavigate('home')}
                className="flex items-center gap-2.5 mb-4 group"
              >
                <img
                  src={language === 'bn' ? '/logo-bn.svg' : '/logo-en.svg'}
                  alt={t('appName', language)}
                  className="h-10 w-auto object-contain group-hover:scale-[1.02] transition-transform"
                />
              </button>

              {/* Tag line */}
              <p className={`text-sm text-muted-foreground leading-relaxed mb-5 ${language === 'bn' ? 'font-bangla' : ''}`}>
                {t('tagLine', language)}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>+880 1XXX-XXXXXX</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>support@eidticketresell.com</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className={language === 'bn' ? 'font-bangla' : ''}>
                    {language === 'en' ? 'Dhaka, Bangladesh' : 'ঢাকা, বাংলাদেশ'}
                  </span>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg bg-background border border-border text-muted-foreground transition-all duration-300 ${social.hoverColor}`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Accordion sections */}
            <Accordion type="single" collapsible className="w-full">

              {/* TRANSPORT accordion */}
              <AccordionItem value="transport">
                <AccordionTrigger className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 hover:no-underline ${language === 'bn' ? 'font-bangla' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-green-600" />
                    {t('transport', language)}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3">
                    {transportLinks.map((link) => (
                      <li key={link.labelKey}>
                        <button
                          onClick={() => handleNavigate(link.page)}
                          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group w-full"
                        >
                          {link.icon ? (
                            <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${link.color} shadow-sm group-hover:scale-105 transition-all`}>
                              <link.icon className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600/10 text-green-600 shadow-sm group-hover:scale-105 transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                          <span className={language === 'bn' ? 'font-bangla' : ''}>
                            {t(link.labelKey, language)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* QUICK LINKS accordion */}
              <AccordionItem value="quick-links">
                <AccordionTrigger className={`text-sm font-semibold uppercase tracking-wider hover:no-underline ${language === 'bn' ? 'font-bangla' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-green-600" />
                    {language === 'en' ? 'Quick Links' : 'দ্রুত লিংক'}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3">
                    {quickLinks.map((link) => (
                      <li key={link.labelKey}>
                        <button
                          onClick={() => handleNavigate(link.page)}
                          className={`text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group ${language === 'bn' ? 'font-bangla' : ''}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-all" />
                          {t(link.labelKey, language)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* LEGAL accordion */}
              <AccordionItem value="legal">
                <AccordionTrigger className={`text-sm font-semibold uppercase tracking-wider hover:no-underline ${language === 'bn' ? 'font-bangla' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full bg-blue-600" />
                    {language === 'en' ? 'Legal' : 'আইনি'}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3">
                    {legalLinks.map((link) => (
                      <li key={link.labelKey}>
                        <button
                          onClick={() => handleNavigate(link.page)}
                          className={`text-sm text-muted-foreground hover:text-blue-600 transition-colors flex items-center gap-2 group ${language === 'bn' ? 'font-bangla' : ''}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600/40 group-hover:bg-blue-600 transition-all" />
                          {t(link.labelKey, language)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>
      </div>

      {/* ── Payment Method Image (full width from first to last column) ── */}
      <div className="bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <img
            src="/Payment.png"
            alt="Payment Methods"
            className="w-full"
          />
        </div>
      </div>

      {/* ── Copyright Bar ── */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 lg:px-8 py-3 text-center">
          <p className={`text-xs text-primary-foreground ${language === 'bn' ? 'font-bangla' : ''}`}>
            © {currentYear} {t('appName', language)}. {t('allRightsReserved', language)}.
          </p>
        </div>
      </div>
    </footer>
  );
}
