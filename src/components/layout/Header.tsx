'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Moon, Sun, Monitor, Globe, Menu, ChevronDown, X,
  Bus, TrainFront, Plane, Ship, Ticket, LogOut,
  User, Wallet, Settings, Shield, Bell, LayoutDashboard,
  MoonStar, HelpCircle, Info, HeadphonesIcon, ArrowRight
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
import { useAppStore, useAuthStore, useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

type Page = Parameters<ReturnType<typeof useAppStore>['getState']>[0] extends { navigate: (page: infer P) => void } ? P : never;

const transportItems = [
  { id: 'bus' as const, icon: Bus, labelKey: 'bus' as const, desc: 'Bus Tickets' },
  { id: 'train' as const, icon: TrainFront, labelKey: 'train' as const, desc: 'Train Tickets' },
  { id: 'flight' as const, icon: Plane, labelKey: 'flight' as const, desc: 'Flight Tickets' },
  { id: 'launch' as const, icon: Ship, labelKey: 'launch' as const, desc: 'Launch Tickets' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [buyTicketsHover, setBuyTicketsHover] = useState(false);
  const buyTicketsRef = useRef<HTMLDivElement>(null);
  const buyTicketsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, setTheme } = useTheme();
  const { currentPage, navigate } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (buyTicketsRef.current && !buyTicketsRef.current.contains(e.target as Node)) {
        setBuyTicketsHover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const handleNavigate = (page: string, params?: Record<string, string>) => {
    navigate(page as Page, params);
    setMobileOpen(false);
    setBuyTicketsHover(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (page: string) => currentPage === page;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg border-b-0'
          : 'bg-background/80 backdrop-blur-md border-b border-border/30'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">

        {/* === LEFT: Logo === */}
        <motion.button
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-2.5 group min-w-0 shrink-0"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-primary shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow shrink-0">
            <MoonStar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-base font-bold leading-tight text-gradient-spectrum truncate ${language === 'bn' ? 'font-bangla' : ''}`}>
              {t('appName', language)}
            </span>
            <span className={`text-[10px] text-muted-foreground leading-tight truncate hidden sm:block ${language === 'bn' ? 'font-bangla' : ''}`}>
              {t('appSlogan', language)}
            </span>
          </div>
        </motion.button>

        {/* === CENTER: Desktop Navigation === */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Buy Tickets - Hover Dropdown + Clickable */}
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
                ['bus', 'train', 'flight', 'launch', 'search'].includes(currentPage)
                  ? 'text-primary bg-gradient-to-r from-primary/10 to-primary/5'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover-gradient-brand'
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
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-sm ${
                        index === 0 ? 'icon-bg-green' :
                        index === 1 ? 'icon-bg-blue' :
                        index === 2 ? 'icon-bg-orange' :
                        'icon-bg-green'
                      }`}>
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

          <NavButton
            active={isActive('sell-ticket') || isActive('create-ticket')}
            onClick={() => handleNavigate('sell-ticket')}
            label={t('sellTickets', language)}
            lang={language}
          />

          <NavButton
            active={isActive('how-it-works')}
            onClick={() => handleNavigate('how-it-works')}
            label={t('howItWorks', language)}
            lang={language}
          />

          <NavButton
            active={isActive('support')}
            onClick={() => handleNavigate('support')}
            label={t('support', language)}
            lang={language}
          />

          <NavButton
            active={isActive('faq')}
            onClick={() => handleNavigate('faq')}
            label={t('faq', language)}
            lang={language}
          />
        </nav>

        {/* === RIGHT: Language + Theme + Auth === */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Switcher */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-1.5 text-sm font-medium min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 hover:bg-primary/10 hover:text-primary"
            >
              <Globe className="w-4 h-4 text-blue" />
              <span className="hidden sm:inline">{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 hover:bg-primary/10">
                <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange" />
                <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Sun className="w-4 h-4 mr-2 text-orange" />
                {t('lightMode', language)}
                {theme === 'light' && <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Moon className="w-4 h-4 mr-2 text-blue" />
                {t('darkMode', language)}
                {theme === 'dark' && <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Monitor className="w-4 h-4 mr-2 text-primary" />
                {t('systemMode', language)}
                {theme === 'system' && <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary">Active</Badge>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Buttons or User Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
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
                <DropdownMenuItem onClick={() => handleNavigate('profile')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <User className="w-4 h-4 mr-2 text-primary" />
                  {t('profile', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('settings')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                  {t('settings', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('wallet')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <Wallet className="w-4 h-4 mr-2 text-orange" />
                  {t('wallet', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('my-tickets')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <Ticket className="w-4 h-4 mr-2 text-green" />
                  {t('myTickets', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('my-orders')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <LayoutDashboard className="w-4 h-4 mr-2 text-blue" />
                  {t('myOrders', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('notifications')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <Bell className="w-4 h-4 mr-2 text-orange" />
                  {t('notifications', language)}
                </DropdownMenuItem>
                {!user.isKycVerified && (
                  <DropdownMenuItem onClick={() => handleNavigate('kyc')} className={language === 'bn' ? 'font-bangla' : ''}>
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    {t('kycVerification', language)}
                  </DropdownMenuItem>
                )}
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
            <div className="hidden sm:flex items-center gap-2">
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
                className="btn-gradient-brand rounded-lg shadow-gradient-brand hover:shadow-gradient-spectrum"
              >
                {t('register', language)}
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
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
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-primary shadow-md">
                    <MoonStar className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className={`text-lg text-gradient-spectrum font-bold ${language === 'bn' ? 'font-bangla' : ''}`}>
                    {t('appName', language)}
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-[calc(100%-80px)] overflow-y-auto">
                {/* Mobile User Info */}
                {isAuthenticated && user && (
                  <div className="px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-orange/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
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
                  </div>
                )}

                {/* Mobile Nav Links */}
                <nav className="flex flex-col px-3 py-2">
                  <MobileNavItem
                    icon={<MoonStar className="w-5 h-5" />}
                    label={t('home', language)}
                    active={isActive('home')}
                    onClick={() => handleNavigate('home')}
                    lang={language}
                  />

                  {/* Buy Tickets Section */}
                  <div className="px-3 py-2 mt-2">
                    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${language === 'bn' ? 'font-bangla' : ''}`}>
                      {t('buyTickets', language)}
                    </p>
                  </div>
                  {transportItems.map((item, index) => (
                    <MobileNavItem
                      key={item.id}
                      icon={<item.icon className="w-5 h-5" />}
                      label={`${t(item.labelKey, language)} ${t('tickets', language)}`}
                      active={isActive(item.id)}
                      onClick={() => handleNavigate(item.id)}
                      lang={language}
                      iconBg={index === 0 ? 'icon-bg-green' : index === 1 ? 'icon-bg-blue' : index === 2 ? 'icon-bg-orange' : 'icon-bg-green'}
                    />
                  ))}

                  <div className="px-3 py-2 mt-2">
                    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${language === 'bn' ? 'font-bangla' : ''}`}>
                      {t('sellTickets', language)}
                    </p>
                  </div>
                  <MobileNavItem
                    icon={<Ticket className="w-5 h-5" />}
                    label={t('sellTickets', language)}
                    active={isActive('sell-ticket') || isActive('create-ticket')}
                    onClick={() => handleNavigate('sell-ticket')}
                    lang={language}
                    iconBg="icon-bg-orange"
                  />

                  <div className="px-3 py-2 mt-2">
                    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider`}>
                      Info
                    </p>
                  </div>
                  <MobileNavItem
                    icon={<Info className="w-5 h-5" />}
                    label={t('howItWorks', language)}
                    active={isActive('how-it-works')}
                    onClick={() => handleNavigate('how-it-works')}
                    lang={language}
                  />
                  <MobileNavItem
                    icon={<HelpCircle className="w-5 h-5" />}
                    label={t('faq', language)}
                    active={isActive('faq')}
                    onClick={() => handleNavigate('faq')}
                    lang={language}
                  />
                  <MobileNavItem
                    icon={<HeadphonesIcon className="w-5 h-5" />}
                    label={t('support', language)}
                    active={isActive('support')}
                    onClick={() => handleNavigate('support')}
                    lang={language}
                  />
                </nav>

                {/* Mobile Auth / User Actions */}
                <Separator className="my-1" />
                {isAuthenticated && user ? (
                  <nav className="flex flex-col px-3 py-2">
                    <MobileNavItem
                      icon={<User className="w-5 h-5" />}
                      label={t('profile', language)}
                      active={isActive('profile')}
                      onClick={() => handleNavigate('profile')}
                      lang={language}
                    />
                    <MobileNavItem
                      icon={<Wallet className="w-5 h-5" />}
                      label={t('wallet', language)}
                      active={isActive('wallet')}
                      onClick={() => handleNavigate('wallet')}
                      lang={language}
                      iconBg="icon-bg-orange"
                    />
                    <MobileNavItem
                      icon={<Ticket className="w-5 h-5" />}
                      label={t('myTickets', language)}
                      active={isActive('my-tickets')}
                      onClick={() => handleNavigate('my-tickets')}
                      lang={language}
                      iconBg="icon-bg-green"
                    />
                    <MobileNavItem
                      icon={<LayoutDashboard className="w-5 h-5" />}
                      label={t('myOrders', language)}
                      active={isActive('my-orders')}
                      onClick={() => handleNavigate('my-orders')}
                      lang={language}
                      iconBg="icon-bg-blue"
                    />
                    <MobileNavItem
                      icon={<Bell className="w-5 h-5" />}
                      label={t('notifications', language)}
                      active={isActive('notifications')}
                      onClick={() => handleNavigate('notifications')}
                      lang={language}
                      iconBg="icon-bg-orange"
                    />
                    {!user.isKycVerified && (
                      <MobileNavItem
                        icon={<Shield className="w-5 h-5" />}
                        label={t('kycVerification', language)}
                        active={isActive('kyc')}
                        onClick={() => handleNavigate('kyc')}
                        lang={language}
                      />
                    )}
                    <MobileNavItem
                      icon={<Settings className="w-5 h-5" />}
                      label={t('settings', language)}
                      active={isActive('settings')}
                      onClick={() => handleNavigate('settings')}
                      lang={language}
                    />
                    <Separator className="my-1" />
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
                  </nav>
                ) : (
                  <div className="px-5 py-4 flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="w-full min-h-[44px] border-primary/30 hover:bg-primary/10 hover:text-primary hover:border-primary"
                      onClick={() => handleNavigate('login')}
                    >
                      {t('login', language)}
                    </Button>
                    <Button
                      className="w-full min-h-[44px] btn-gradient-primary rounded-lg"
                      onClick={() => handleNavigate('register')}
                    >
                      {t('register', language)}
                    </Button>
                  </div>
                )}

                {/* Mobile Footer Controls */}
                <div className="mt-auto border-t px-5 py-4 flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLanguage}
                    className="gap-1.5 min-h-[44px] border-blue/30 hover:bg-blue/10 hover:text-blue hover:border-blue"
                  >
                    <Globe className="w-4 h-4 text-blue" />
                    {language === 'en' ? 'বাংলা' : 'English'}
                  </Button>
                  <div className="flex items-center gap-1">
                    {([
                      { mode: 'light' as const, icon: Sun, color: 'text-orange hover:bg-orange/10' },
                      { mode: 'dark' as const, icon: Moon, color: 'text-blue hover:bg-blue/10' },
                      { mode: 'system' as const, icon: Monitor, color: 'text-primary hover:bg-primary/10' }
                    ]).map(({ mode, icon: Icon, color }) => (
                      <Button
                        key={mode}
                        variant={theme === mode ? 'default' : 'ghost'}
                        size="icon"
                        className={`h-10 w-10 min-h-[44px] min-w-[44px] ${theme !== mode ? color : ''}`}
                        onClick={() => setTheme(mode)}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Gradient divider line under header when scrolled */}
      {scrolled && <div className="h-1 bg-gradient-spectrum" />}
    </motion.header>
  );
}

// Desktop Nav Button
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
          ? 'text-primary bg-gradient-to-r from-primary/10 to-primary/5'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover-gradient-brand'
      } ${lang === 'bn' ? 'font-bangla' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-gradient-spectrum rounded-full"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

// Mobile Nav Item
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
          ? 'bg-gradient-to-r from-primary/10 via-orange/5 to-primary/5 text-primary'
          : destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-accent hover-gradient-brand'
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
