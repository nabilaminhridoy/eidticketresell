'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Moon, Sun, Monitor, Globe, Menu, ChevronDown,
  Bus, TrainFront, Plane, Ship, Ticket, LogOut,
  User, Wallet, Settings, Shield, Bell, LayoutDashboard,
  MoonStar
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
  { id: 'bus' as const, icon: Bus, labelKey: 'bus' as const },
  { id: 'train' as const, icon: TrainFront, labelKey: 'train' as const },
  { id: 'flight' as const, icon: Plane, labelKey: 'flight' as const },
  { id: 'launch' as const, icon: Ship, labelKey: 'launch' as const },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const handleNavigate = (page: string, params?: Record<string, string>) => {
    navigate(page as Page, params);
    setMobileOpen(false);
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
          ? 'glass shadow-lg border-b border-border/50'
          : 'bg-background/95 backdrop-blur-sm border-b border-border/30'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 lg:px-8 overflow-hidden">
        {/* Logo */}
        <motion.button
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-2 group min-w-0 shrink-0 sm:shrink"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md group-hover:shadow-primary/30 transition-shadow shrink-0">
            <MoonStar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-sm sm:text-lg font-bold leading-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate ${language === 'bn' ? 'font-bangla' : ''}`}>
              {t('appName', language)}
            </span>
            <span className={`text-[9px] sm:text-[10px] text-muted-foreground leading-tight truncate hidden sm:block ${language === 'bn' ? 'font-bangla' : ''}`}>
              {t('appSlogan', language)}
            </span>
          </div>
        </motion.button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavButton
            active={isActive('home')}
            onClick={() => handleNavigate('home')}
            label={t('home', language)}
            lang={language}
          />

          {/* Buy Tickets Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  ['bus', 'train', 'flight', 'launch'].includes(currentPage)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                } ${language === 'bn' ? 'font-bangla' : ''}`}
              >
                <Ticket className="w-4 h-4" />
                {t('buyTickets', language)}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-52">
              <DropdownMenuLabel className={language === 'bn' ? 'font-bangla' : ''}>
                {t('transport', language)}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {transportItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`cursor-pointer gap-3 ${language === 'bn' ? 'font-bangla' : ''}`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{t(item.labelKey, language)}</span>
                    <span className="text-xs text-muted-foreground">
                      {language === 'bn'
                        ? `${t(item.labelKey, language)} টিকেট`
                        : `${t(item.labelKey, language)} Tickets`}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
            active={isActive('faq')}
            onClick={() => handleNavigate('faq')}
            label={t('faq', language)}
            lang={language}
          />
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Language Switcher */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-1.5 text-sm font-medium min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
            >
              <Globe className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
                <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Sun className="w-4 h-4 mr-2" />
                {t('lightMode', language)}
                {theme === 'light' && <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Moon className="w-4 h-4 mr-2" />
                {t('darkMode', language)}
                {theme === 'dark' && <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className={language === 'bn' ? 'font-bangla' : ''}>
                <Monitor className="w-4 h-4 mr-2" />
                {t('systemMode', language)}
                {theme === 'system' && <Badge variant="secondary" className="ml-auto text-[10px]">Active</Badge>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Buttons or User Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
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
                      <Badge variant="secondary" className="w-fit mt-1 gap-1">
                        <Shield className="w-3 h-3" />
                        {t('verified', language)}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigate('profile')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <User className="w-4 h-4 mr-2" />
                  {t('profile', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('settings')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t('settings', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('wallet')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <Wallet className="w-4 h-4 mr-2" />
                  {t('wallet', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('my-tickets')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <Ticket className="w-4 h-4 mr-2" />
                  {t('myTickets', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('my-orders')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  {t('myOrders', language)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigate('notifications')} className={language === 'bn' ? 'font-bangla' : ''}>
                  <Bell className="w-4 h-4 mr-2" />
                  {t('notifications', language)}
                </DropdownMenuItem>
                {!user.isKycVerified && (
                  <DropdownMenuItem onClick={() => handleNavigate('kyc')} className={language === 'bn' ? 'font-bangla' : ''}>
                    <Shield className="w-4 h-4 mr-2" />
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
                className={language === 'bn' ? 'font-bangla' : ''}
              >
                {t('login', language)}
              </Button>
              <Button
                size="sm"
                onClick={() => handleNavigate('register')}
                className="bg-gradient-to-r from-primary to-primary/90 shadow-md hover:shadow-primary/25 transition-shadow"
              >
                {t('register', language)}
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px]">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 overflow-y-auto">
              <SheetHeader className="p-5 pb-3">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                    <MoonStar className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className={`text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent ${language === 'bn' ? 'font-bangla' : ''}`}>
                    {t('appName', language)}
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-[calc(100%-80px)] overflow-y-auto custom-scrollbar">
                {/* Mobile User Info */}
                {isAuthenticated && user && (
                  <div className="px-5 py-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {user.isKycVerified && (
                        <Badge variant="secondary" className="gap-1 shrink-0">
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
                    icon={<Ticket className="w-5 h-5" />}
                    label={t('home', language)}
                    active={isActive('home')}
                    onClick={() => handleNavigate('home')}
                    lang={language}
                  />

                  {/* Buy Tickets Section */}
                  <div className="px-2 py-2 mt-1">
                    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${language === 'bn' ? 'font-bangla' : ''}`}>
                      {t('buyTickets', language)}
                    </p>
                  </div>
                  {transportItems.map((item) => (
                    <MobileNavItem
                      key={item.id}
                      icon={<item.icon className="w-5 h-5" />}
                      label={`${t(item.labelKey, language)} ${t('tickets', language)}`}
                      active={isActive(item.id)}
                      onClick={() => handleNavigate(item.id)}
                      lang={language}
                    />
                  ))}

                  <div className="px-2 py-2 mt-1">
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
                  />

                  <div className="px-2 py-2 mt-1">
                    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider`}>
                      Info
                    </p>
                  </div>
                  <MobileNavItem
                    icon={<Ticket className="w-5 h-5" />}
                    label={t('howItWorks', language)}
                    active={isActive('how-it-works')}
                    onClick={() => handleNavigate('how-it-works')}
                    lang={language}
                  />
                  <MobileNavItem
                    icon={<Ticket className="w-5 h-5" />}
                    label={t('faq', language)}
                    active={isActive('faq')}
                    onClick={() => handleNavigate('faq')}
                    lang={language}
                  />
                  <MobileNavItem
                    icon={<Ticket className="w-5 h-5" />}
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
                    />
                    <MobileNavItem
                      icon={<Ticket className="w-5 h-5" />}
                      label={t('myTickets', language)}
                      active={isActive('my-tickets')}
                      onClick={() => handleNavigate('my-tickets')}
                      lang={language}
                    />
                    <MobileNavItem
                      icon={<LayoutDashboard className="w-5 h-5" />}
                      label={t('myOrders', language)}
                      active={isActive('my-orders')}
                      onClick={() => handleNavigate('my-orders')}
                      lang={language}
                    />
                    <MobileNavItem
                      icon={<Bell className="w-5 h-5" />}
                      label={t('notifications', language)}
                      active={isActive('notifications')}
                      onClick={() => handleNavigate('notifications')}
                      lang={language}
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
                      className="w-full min-h-[44px]"
                      onClick={() => handleNavigate('login')}
                    >
                      {t('login', language)}
                    </Button>
                    <Button
                      className="w-full min-h-[44px] bg-gradient-to-r from-primary to-primary/90"
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
                    className="gap-1.5 min-h-[44px]"
                  >
                    <Globe className="w-4 h-4 text-primary" />
                    {language === 'en' ? 'বাংলা' : 'English'}
                  </Button>
                  <div className="flex items-center gap-1">
                    {(['light', 'dark', 'system'] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={theme === mode ? 'default' : 'ghost'}
                        size="icon"
                        className="h-10 w-10 min-h-[44px] min-w-[44px]"
                        onClick={() => setTheme(mode)}
                      >
                        {mode === 'light' && <Sun className="w-4 h-4" />}
                        {mode === 'dark' && <Moon className="w-4 h-4" />}
                        {mode === 'system' && <Monitor className="w-4 h-4" />}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
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
      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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

// Mobile Nav Item
function MobileNavItem({
  icon,
  label,
  active,
  onClick,
  lang,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  lang: Language;
  destructive?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left min-h-[44px] ${
        active
          ? 'bg-primary/10 text-primary'
          : destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-accent'
      } ${lang === 'bn' ? 'font-bangla' : ''}`}
      whileTap={{ scale: 0.98 }}
    >
      <span className={active ? 'text-primary' : destructive ? 'text-destructive' : 'text-muted-foreground'}>
        {icon}
      </span>
      {label}
    </motion.button>
  );
}
