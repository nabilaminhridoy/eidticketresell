'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Moon, Sun, Monitor, Globe, Menu, ChevronDown,
  Bus, TrainFront, Plane, Ship, Ticket, LogOut,
  User, Wallet, Shield, LayoutDashboard,
  HelpCircle, HeadphonesIcon, ArrowRight, ChevronRight,
  ShieldCheck, FileText, Compass, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useAppStore, useAuthStore, useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

// ── Transport items for Buy Tickets dropdown ──────────────────────────────
const transportItems = [
  { id: 'bus' as const, icon: Bus, labelKey: 'bus' as const, color: 'bg-green-500 text-white', hoverColor: 'hover:bg-green-500/10' },
  { id: 'train' as const, icon: TrainFront, labelKey: 'train' as const, color: 'bg-teal-500 text-white', hoverColor: 'hover:bg-teal-500/10' },
  { id: 'flight' as const, icon: Plane, labelKey: 'flight' as const, color: 'bg-sky-500 text-white', hoverColor: 'hover:bg-sky-500/10' },
  { id: 'launch' as const, icon: Ship, labelKey: 'launch' as const, color: 'bg-violet-500 text-white', hoverColor: 'hover:bg-violet-500/10' },
];

// ── Center nav items (excluding Buy Tickets which has dropdown) ──────────
const centerNavItems = [
  { id: 'sell-ticket' as const, labelKey: 'sellTickets' as const, icon: Ticket },
  { id: 'how-it-works' as const, labelKey: 'howItWorks' as const, icon: Compass },
  { id: 'safety-guidelines' as const, labelKey: 'safetyGuidelines' as const, icon: AlertTriangle },
  { id: 'support' as const, labelKey: 'support' as const, icon: HeadphonesIcon },
  { id: 'faq' as const, labelKey: 'faq' as const, icon: HelpCircle },
];

// ── User dropdown menu items (logged-in state) ──────────────────────────
const userMenuItems = [
  { id: 'dashboard' as const, labelKey: 'dashboard' as const, icon: LayoutDashboard, color: 'text-primary' },
  { id: 'my-tickets' as const, labelKey: 'myTickets' as const, icon: Ticket, color: 'text-green-500' },
  { id: 'my-orders' as const, labelKey: 'myOrders' as const, icon: FileText, color: 'text-blue-500' },
  { id: 'wallet' as const, labelKey: 'wallet' as const, icon: Wallet, color: 'text-orange-500' },
  { id: 'kyc' as const, labelKey: 'kyc' as const, icon: ShieldCheck, color: 'text-violet-500' },
];

// ── Main Header Component ────────────────────────────────────────────────
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [buyTicketsHover, setBuyTicketsHover] = useState(false);
  const [mobileBuyTicketsOpen, setMobileBuyTicketsOpen] = useState(false);
  const buyTicketsRef = useRef<HTMLDivElement>(null);
  const buyTicketsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, setTheme } = useTheme();
  const { currentPage } = useAppStore();
  const { navigate: navNavigate } = useNav();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();

  // ── Scroll detection for sticky header backdrop ──────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close Buy Tickets dropdown on click outside ─────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (buyTicketsRef.current && !buyTicketsRef.current.contains(e.target as Node)) {
        setBuyTicketsHover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Language toggle ──────────────────────────────────────────────────
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  }, [language, setLanguage]);

  // ── Navigation handler ──────────────────────────────────────────────
  const handleNavigate = useCallback((page: string, params?: Record<string, string>) => {
    navNavigate(page, params);
    setMobileOpen(false);
    setBuyTicketsHover(false);
    setMobileBuyTicketsOpen(false);
  }, [navNavigate]);

  // ── Get user initials ────────────────────────────────────────────────
  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // ── Active page check ────────────────────────────────────────────────
  const isActive = (page: string) => currentPage === page;
  const isBuyTicketsActive = ['bus', 'train', 'flight', 'launch', 'search'].includes(currentPage);

  // ── User params for nav ──────────────────────────────────────────────
  const userParams = user ? { username: user.username } : undefined;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md border-b border-border'
          : 'bg-background/80 backdrop-blur-md border-b border-border/30'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center px-4 lg:px-8">

        {/* ═══════════════════════════════════════════════════════════════
            LEFT COLUMN — Logo (always visible)
        ═══════════════════════════════════════════════════════════════ */}
        <motion.button
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-2.5 group shrink-0"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img
            src={language === 'bn' ? '/logo-bn.svg' : '/logo-en.svg'}
            alt={t('appName', language)}
            className="h-9 w-auto object-contain shrink-0 group-hover:scale-[1.02] transition-transform"
          />
        </motion.button>

        {/* ═══════════════════════════════════════════════════════════════
            CENTER COLUMN — Desktop Navigation (lg+ only)
        ═══════════════════════════════════════════════════════════════ */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {/* Buy Tickets — Hover Dropdown + Clickable */}
          <div
            ref={buyTicketsRef}
            className="relative"
            onMouseEnter={() => {
              if (buyTicketsTimeoutRef.current) clearTimeout(buyTicketsTimeoutRef.current);
              setBuyTicketsHover(true);
            }}
            onMouseLeave={() => {
              buyTicketsTimeoutRef.current = setTimeout(() => setBuyTicketsHover(false), 150);
            }}
          >
            <button
              onClick={() => handleNavigate('search')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isBuyTicketsActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              } ${language === 'bn' ? 'font-bangla' : ''}`}
            >
              <Ticket className="w-4 h-4" />
              {t('buyTickets', language)}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${buyTicketsHover ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {buyTicketsHover && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-xl border bg-popover p-2 shadow-xl"
                  onMouseEnter={() => {
                    if (buyTicketsTimeoutRef.current) clearTimeout(buyTicketsTimeoutRef.current);
                    setBuyTicketsHover(true);
                  }}
                  onMouseLeave={() => {
                    buyTicketsTimeoutRef.current = setTimeout(() => setBuyTicketsHover(false), 150);
                  }}
                >
                  <div className="px-3 py-2 mb-1">
                    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${language === 'bn' ? 'font-bangla' : ''}`}>
                      {t('transport', language)}
                    </p>
                  </div>
                  {transportItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-left ${item.hoverColor}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-sm ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${language === 'bn' ? 'font-bangla' : ''}`}>
                          {t(item.labelKey, language)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'bn'
                            ? `${t(item.labelKey, language)} টিকেট`
                            : `${t(item.labelKey, language)} Tickets`}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other Center Nav Items */}
          {centerNavItems.map((item) => (
            <NavButton
              key={item.id}
              active={isActive(item.id)}
              onClick={() => handleNavigate(item.id)}
              label={t(item.labelKey, language)}
              lang={language}
            />
          ))}
        </nav>

        {/* ═══════════════════════════════════════════════════════════════
            RIGHT COLUMN — Language | Theme | Auth (lg+) or Language | Theme | Menu (mobile)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto lg:ml-0">

          {/* Language Switcher — always visible */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-1.5 text-sm font-medium min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 hover:bg-primary/10 hover:text-primary"
            >
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </Button>
          </motion.div>

          {/* Theme Toggle Dropdown — always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 hover:bg-primary/10">
                <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
                <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-500" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Sun className="w-4 h-4 mr-2 text-orange-500" />
                {t('light', language)}
                {theme === 'light' && <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Moon className="w-4 h-4 mr-2 text-blue-500" />
                {t('dark', language)}
                {theme === 'dark' && <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Monitor className="w-4 h-4 mr-2 text-primary" />
                {t('system', language)}
                {theme === 'system' && <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary">Active</Badge>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ─── Desktop Auth Buttons / User Menu (lg+ only) ────────── */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hidden lg:flex">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {user.isKycVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <Shield className="w-3.5 h-3.5 text-primary fill-primary" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {user.isKycVerified && (
                      <Badge variant="secondary" className="w-fit mt-1 gap-1 bg-primary/10 text-primary">
                        <Shield className="w-3 h-3" />
                        {t('verified', language)}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userMenuItems.map((menuItem) => (
                  <DropdownMenuItem
                    key={menuItem.id}
                    onClick={() => handleNavigate(menuItem.id, menuItem.id === 'dashboard' || menuItem.id === 'my-tickets' || menuItem.id === 'my-orders' || menuItem.id === 'wallet' || menuItem.id === 'kyc' ? userParams : undefined)}
                    className={language === 'bn' ? 'font-bangla' : ''}
                  >
                    <menuItem.icon className={`w-4 h-4 mr-2 ${menuItem.color}`} />
                    {t(menuItem.labelKey, language)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    handleNavigate('home');
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout', language)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('login')}
                className={`hover:bg-primary/10 hover:text-primary ${language === 'bn' ? 'font-bangla' : ''}`}
              >
                {t('login', language)}
              </Button>
              <Button
                size="sm"
                onClick={() => handleNavigate('register')}
                className="rounded-lg"
              >
                {t('register', language)}
              </Button>
            </div>
          )}

          {/* ─── Mobile Menu Button (below lg only) ──────────────────── */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px] hover:bg-primary/10">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 overflow-y-auto">
              <SheetHeader className="p-5 pb-3 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <img
                    src={language === 'bn' ? '/logo-bn.svg' : '/logo-en.svg'}
                    alt={t('appName', language)}
                    className="h-9 w-auto object-contain"
                  />
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-[calc(100%-80px)]">
                {/* ─── Top Section: Navigation Links ──────────────── */}
                <nav className="flex-1 overflow-y-auto px-3 py-3">
                  {/* Buy Tickets — Collapsible Dropdown */}
                  <Collapsible
                    open={mobileBuyTicketsOpen}
                    onOpenChange={setMobileBuyTicketsOpen}
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => handleNavigate('search')}
                        className={`flex items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-medium transition-colors flex-1 min-h-[44px] ${
                          isBuyTicketsActive
                            ? 'text-primary bg-primary/10'
                            : 'text-foreground hover:bg-accent'
                        } ${language === 'bn' ? 'font-bangla' : ''}`}
                      >
                        <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${isBuyTicketsActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Ticket className="w-5 h-5" />
                        </span>
                        {t('buyTickets', language)}
                      </button>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0"
                        >
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${mobileBuyTicketsOpen ? 'rotate-90' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                      <div className="pl-4 mt-1 mb-2">
                        {transportItems.map((item) => (
                          <MobileNavItem
                            key={item.id}
                            icon={<item.icon className="w-5 h-5" />}
                            label={`${t(item.labelKey, language)} ${t('tickets', language)}`}
                            active={isActive(item.id)}
                            onClick={() => handleNavigate(item.id)}
                            lang={language}
                            iconBg={item.color}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Other Center Nav Items */}
                  <MobileNavItem
                    icon={<Ticket className="w-5 h-5" />}
                    label={t('sellTickets', language)}
                    active={isActive('sell-ticket') || isActive('create-ticket')}
                    onClick={() => handleNavigate('sell-ticket')}
                    lang={language}
                  />
                  <MobileNavItem
                    icon={<Compass className="w-5 h-5" />}
                    label={t('howItWorks', language)}
                    active={isActive('how-it-works')}
                    onClick={() => handleNavigate('how-it-works')}
                    lang={language}
                  />
                  <MobileNavItem
                    icon={<AlertTriangle className="w-5 h-5" />}
                    label={t('safetyGuidelines', language)}
                    active={isActive('safety-guidelines')}
                    onClick={() => handleNavigate('safety-guidelines')}
                    lang={language}
                  />
                  <MobileNavItem
                    icon={<HeadphonesIcon className="w-5 h-5" />}
                    label={t('support', language)}
                    active={isActive('support')}
                    onClick={() => handleNavigate('support')}
                    lang={language}
                  />
                  <MobileNavItem
                    icon={<HelpCircle className="w-5 h-5" />}
                    label={t('faq', language)}
                    active={isActive('faq')}
                    onClick={() => handleNavigate('faq')}
                    lang={language}
                  />
                </nav>

                {/* ─── Bottom Section: Auth or User Menu ──────────── */}
                <Separator />
                {isAuthenticated && user ? (
                  <div className="px-4 py-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {user.isKycVerified && (
                        <Badge variant="secondary" className="gap-1 shrink-0 bg-primary/10 text-primary">
                          <Shield className="w-3 h-3" />
                          {t('verified', language)}
                        </Badge>
                      )}
                    </div>
                    {/* User Menu Items */}
                    <div className="space-y-1">
                      {userMenuItems.map((menuItem) => (
                        <MobileNavItem
                          key={menuItem.id}
                          icon={<menuItem.icon className="w-5 h-5" />}
                          label={t(menuItem.labelKey, language)}
                          active={isActive(menuItem.id)}
                          onClick={() => handleNavigate(menuItem.id, userParams)}
                          lang={language}
                        />
                      ))}
                      <Separator className="my-2" />
                      <MobileNavItem
                        icon={<LogOut className="w-5 h-5" />}
                        label={t('logout', language)}
                        active={false}
                        onClick={() => {
                          logout();
                          handleNavigate('home');
                        }}
                        lang={language}
                        destructive
                      />
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-4 flex gap-3">
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px] border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary"
                      onClick={() => handleNavigate('login')}
                    >
                      {t('login', language)}
                    </Button>
                    <Button
                      className="w-full min-h-[44px] rounded-lg"
                      onClick={() => handleNavigate('register')}
                    >
                      {t('register', language)}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Accent line under header when scrolled */}
      {scrolled && <div className="h-0.5 bg-primary" />}
    </motion.header>
  );
}

// ── Desktop Nav Button ────────────────────────────────────────────────────
function NavButton({
  active,
  onClick,
  label,
  lang,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  lang: Language;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      } ${lang === 'bn' ? 'font-bangla' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-primary rounded-full"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

// ── Mobile Nav Item ───────────────────────────────────────────────────────
function MobileNavItem({
  icon,
  label,
  active,
  onClick,
  lang,
  destructive = false,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  lang: Language;
  destructive?: boolean;
  iconBg?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left min-h-[44px] ${
        active
          ? 'bg-primary/10 text-primary'
          : destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-accent'
      } ${lang === 'bn' ? 'font-bangla' : ''}`}
      whileTap={{ scale: 0.98 }}
    >
      <span className={`flex items-center justify-center w-9 h-9 rounded-lg ${
        iconBg
          ? iconBg
          : active
          ? 'bg-primary/15 text-primary'
          : destructive
          ? 'bg-destructive/10 text-destructive'
          : 'bg-muted text-muted-foreground'
      }`}>
        {icon}
      </span>
      {label}
    </motion.button>
  );
}
