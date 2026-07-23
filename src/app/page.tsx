'use client';

import { lazy, Suspense, ComponentType } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAppStore } from '@/lib/store';
import PageLoader from '@/components/ui/PageLoader';

// Pre-created lazy page components (declared outside render to avoid re-creation)
const LazyHomePage = lazy(() => import('@/components/pages/HomePage'));
const LazyLoginPage = lazy(() => import('@/components/pages/LoginPage'));
const LazyRegisterPage = lazy(() => import('@/components/pages/RegisterPage'));
const LazyKycPage = lazy(() => import('@/components/pages/KycPage'));
const LazySearchPage = lazy(() => import('@/components/pages/SearchPage'));
const LazyTicketDetailsPage = lazy(() => import('@/components/pages/TicketDetailsPage'));
const LazySellTicketPage = lazy(() => import('@/components/pages/SellTicketPage'));
const LazyDashboardPage = lazy(() => import('@/components/pages/DashboardPage'));
const LazyAdminPage = lazy(() => import('@/components/pages/AdminPage'));
const LazyInfoPage = lazy(() => import('@/components/pages/InfoPage'));
const LazySupportPage = lazy(() => import('@/components/pages/SupportPage'));

const pageComponents: Record<string, ComponentType> = {
  home: LazyHomePage,
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
  support: LazySupportPage,
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

// Page Router
function PageRouter() {
  const { currentPage } = useAppStore();

  // Home page
  if (currentPage === 'home') {
    return (
      <AppShell>
        <LazyPage pageName="home" />
      </AppShell>
    );
  }

  // Auth pages (no shell)
  if (authPages.has(currentPage)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LazyPage pageName={currentPage} />
      </Suspense>
    );
  }

  // All other pages (with shell)
  if (pageComponents[currentPage]) {
    return (
      <AppShell>
        <Suspense fallback={<PageLoader />}>
          <LazyPage pageName={currentPage} />
        </Suspense>
      </AppShell>
    );
  }

  // Fallback to home
  return (
    <AppShell>
      <LazyPage pageName="home" />
    </AppShell>
  );
}

export default function Home() {
  return <PageRouter />;
}
