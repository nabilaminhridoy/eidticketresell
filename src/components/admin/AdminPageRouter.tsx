'use client';

import { useState, useEffect, lazy, Suspense, ComponentType } from 'react';
import { useRouter } from 'next/navigation';

// Lazy load admin components - only one will be loaded at a time
// This reduces initial bundle size and Turbopack memory usage
// since the imports are spread across this single file but only loaded on demand

const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AdminAnalyticsPage = lazy(() => import('./AdminAnalyticsPage'));
const AdminActivityLogPage = lazy(() => import('./AdminActivityLogPage'));
const AdminTicketsPage = lazy(() => import('./AdminTicketsPage'));
const AdminOrdersPage = lazy(() => import('./AdminOrdersPage'));
const AdminPaymentsPage = lazy(() => import('./AdminPaymentsPage'));
const AdminPayoutPage = lazy(() => import('./AdminPayoutPage'));
const AdminRefundsPage = lazy(() => import('./AdminRefundsPage'));
const AdminDisputesPage = lazy(() => import('./AdminDisputesPage'));
const AdminUsersPage = lazy(() => import('./AdminUsersPage'));
const AdminKycPage = lazy(() => import('./AdminKycPage'));
const AdminMessagesPage = lazy(() => import('./AdminMessagesPage'));
const AdminReviewsPage = lazy(() => import('./AdminReviewsPage'));
const AdminVerifyTicketPage = lazy(() => import('./AdminVerifyTicketPage'));
const AdminJourneyVerifyPage = lazy(() => import('./AdminJourneyVerifyPage'));
const AdminBlogPage = lazy(() => import('./AdminBlogPage'));
const AdminFaqsPage = lazy(() => import('./AdminFaqsPage'));
const AdminPagesPage = lazy(() => import('./AdminPagesPage'));
const AdminHomepagePage = lazy(() => import('./AdminHomepagePage'));
const AdminAdsPage = lazy(() => import('./AdminAdsPage'));
const AdminMarketingPage = lazy(() => import('./AdminMarketingPage'));
const AdminSeoPage = lazy(() => import('./AdminSeoPage'));
const AdminReportsPage = lazy(() => import('./AdminReportsPage'));
const AdminMediaPage = lazy(() => import('./AdminMediaPage'));
const AdminSettingsGeneralPage = lazy(() => import('./AdminSettingsGeneralPage'));
const AdminSettingsLocalizationPage = lazy(() => import('./AdminSettingsLocalizationPage'));
const AdminSettingsEmailPage = lazy(() => import('./AdminSettingsEmailPage'));
const AdminSettingsSmsPage = lazy(() => import('./AdminSettingsSmsPage'));
const AdminSettingsPaymentsPage = lazy(() => import('./AdminSettingsPaymentsPage'));
const AdminSecurityPage = lazy(() => import('./AdminSecurityPage'));
const AdminAdminsPage = lazy(() => import('./AdminAdminsPage'));
const AdminRolesPage = lazy(() => import('./AdminRolesPage'));
const AdminSystemPage = lazy(() => import('./AdminSystemPage'));
const AdminProfilePage = lazy(() => import('./AdminProfilePage'));
const AdminSupportTicketsPage = lazy(() => import('./AdminSupportTicketsPage'));

function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}

function NotFoundRedirect({ router: routerProp }: { router: useRouter }) {
  const router = useRouter();
  useEffect(() => {
    router.replace('/en/404');
  }, [router]);
  return <Loader />;
}

interface RouteConfig {
  component: ComponentType<any>;
  props?: Record<string, any>;
}

const routeConfig: Record<string, RouteConfig> = {
  '':               { component: AdminDashboard },
  'profile':        { component: AdminProfilePage },
  'support-tickets': { component: AdminSupportTicketsPage },
  'dashboard':      { component: AdminDashboard },
  'analytics':      { component: AdminAnalyticsPage },
  'activity-log':   { component: AdminActivityLogPage },
  'tickets':        { component: AdminTicketsPage },
  'orders':         { component: AdminOrdersPage },
  'payments':       { component: AdminPaymentsPage },
  'payout/withdraws': { component: AdminPayoutPage },
  'refunds':        { component: AdminRefundsPage },
  'disputes':       { component: AdminDisputesPage },
  'users':          { component: AdminUsersPage },
  'kyc':            { component: AdminKycPage },
  'messages':       { component: AdminMessagesPage },
  'reviews':        { component: AdminReviewsPage },
  'verify-ticket':  { component: AdminVerifyTicketPage },
  'journey-verify': { component: AdminJourneyVerifyPage },
  'blog':           { component: AdminBlogPage },
  'faqs':           { component: AdminFaqsPage },
  'pages':          { component: AdminPagesPage },
  'homepage':       { component: AdminHomepagePage },
  'ads':            { component: AdminAdsPage },
  'marketing':      { component: AdminMarketingPage },
  'seo':            { component: AdminSeoPage },
  'reports':        { component: AdminReportsPage },
  'media':          { component: AdminMediaPage },
  'media/upload':   { component: AdminMediaPage, props: { section: 'upload' } },
  'media/folders':  { component: AdminMediaPage, props: { section: 'folders' } },
  'settings/general':      { component: AdminSettingsGeneralPage },
  'settings/localization': { component: AdminSettingsLocalizationPage },
  'settings/email':        { component: AdminSettingsEmailPage },
  'settings/sms':          { component: AdminSettingsSmsPage },
  'settings/payments':     { component: AdminSettingsPaymentsPage },
  'security':             { component: AdminSecurityPage },
  'security/api-keys':    { component: AdminSecurityPage, props: { section: 'api-keys' } },
  'admins':    { component: AdminAdminsPage },
  'roles':     { component: AdminRolesPage },
  'cache':     { component: AdminSystemPage, props: { section: 'cache' } },
  'logs':      { component: AdminSystemPage, props: { section: 'logs' } },
  'backups':   { component: AdminSystemPage, props: { section: 'backups' } },
  'cron-jobs': { component: AdminSystemPage, props: { section: 'cron-jobs' } },
};

export default function AdminPageRouter({
  slugPath,
  pathname,
  router: routerProp,
}: {
  slugPath: string;
  pathname: string;
  router: useRouter;
}) {
  const route = routeConfig[slugPath];

  if (!route) {
    return <NotFoundRedirect router={routerProp} />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <route.component {...(route.props || {})} />
    </Suspense>
  );
}
