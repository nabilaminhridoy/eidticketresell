import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from './i18n';

// App Store
type Page =
  | 'home'
  | 'about'
  | 'contact'
  | 'how-it-works'
  | 'search'
  | 'ticket-details'
  | 'bus'
  | 'train'
  | 'flight'
  | 'launch'
  | 'blog'
  | 'faq'
  | 'support'
  | 'terms'
  | 'privacy'
  | 'refund'
  | 'payment-policy'
  | 'cookies-policy'
  | 'verify-ticket'
  | 'checkout'
  | 'order-successful'
  | 'order-cancelled'
  | 'order-failed'
  | 'order-pending'
  | 'safety-guidelines'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-otp'
  | 'profile'
  | 'dashboard'
  | 'settings'
  | 'kyc'
  | 'ekyc-verification'
  | 'wallet'
  | 'wallet-balance'
  | 'wallet-payout'
  | 'withdraw-history'
  | 'transactions'
  | 'reviews'
  | 'address'
  | 'message'
  | 'security'
  | 'my-tickets'
  | 'my-orders'
  | 'create-ticket'
  | 'sell-ticket'
  | 'chat'
  | 'order-details'
  | 'logout'
  | 'notifications'
  | 'admin'
  | 'admin-users'
  | 'admin-kyc'
  | 'admin-tickets'
  | 'admin-orders'
  | 'admin-payments'
  | 'admin-escrow'
  | 'admin-wallets'
  | 'admin-withdrawals'
  | 'admin-reviews'
  | 'admin-reports'
  | 'admin-settings'
  | 'admin-activity-logs';

interface AppState {
  currentPage: Page;
  pageParams: Record<string, string>;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  navigate: (page: Page, params?: Record<string, string>) => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  pageParams: {},
  sidebarOpen: false,
  mobileMenuOpen: false,
  navigate: (page, params = {}) => set({ currentPage: page, pageParams: params, mobileMenuOpen: false }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));

// Auth Store
interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  role: string;
  isKycVerified: boolean;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    { name: 'eid-auth' }
  )
);

// Language Store
interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'eid-language' }
  )
);
