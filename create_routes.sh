#!/bin/bash

BASE="/home/z/my-project/src/app/admin"

# Helper function to create route file
create_route() {
  local filepath="$1"
  local component="$2"
  local extra_props="$3"
  
  # Ensure directory exists
  mkdir -p "$(dirname "$filepath")"
  
  # Write route file
  if [ -n "$extra_props" ]; then
    cat > "$filepath" << EOF
'use client';
import dynamic from 'next/dynamic';
const $component = dynamic(() => import('@/components/admin/$component'), { ssr: false });
export default function Page() { return <$component $extra_props />; }
EOF
  else
    cat > "$filepath" << EOF
'use client';
import dynamic from 'next/dynamic';
const $component = dynamic(() => import('@/components/admin/$component'), { ssr: false });
export default function Page() { return <$component />; }
EOF
  fi
  echo "Created: $filepath"
}

# Helper for section routes
create_section_route() {
  local filepath="$1"
  local component="$2"
  local section="$3"
  
  mkdir -p "$(dirname "$filepath")"
  cat > "$filepath" << EOF
'use client';
import dynamic from 'next/dynamic';
const $component = dynamic(() => import('@/components/admin/$component'), { ssr: false });
export default function Page() { return <$component section="$section" />; }
EOF
  echo "Created: $filepath"
}

# Helper for dynamic id routes
create_id_route() {
  local filepath="$1"
  local component="$2"
  local action="$3"
  
  mkdir -p "$(dirname "$filepath")"
  cat > "$filepath" << EOF
'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
const $component = dynamic(() => import('@/components/admin/$component'), { ssr: false });
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <$component action="$action" itemId={id} />;
}
EOF
  echo "Created: $filepath"
}

# Helper for dynamic pageSlug routes
create_slug_route() {
  local filepath="$1"
  local component="$2"
  
  mkdir -p "$(dirname "$filepath")"
  cat > "$filepath" << EOF
'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
const $component = dynamic(() => import('@/components/admin/$component'), { ssr: false });
export default function Page({ params }: { params: Promise<{ pageSlug: string }> }) {
  const { pageSlug } = use(params);
  return <$component pageSlug={pageSlug} />;
}
EOF
  echo "Created: $filepath"
}

# ============ BLOG ============
create_route "$BASE/blog/page.tsx" "AdminBlogPage"
create_route "$BASE/blog/create/page.tsx" "AdminBlogPage" 'action="create"'
create_id_route "$BASE/blog/[id]/page.tsx" "AdminBlogPage" "view"
create_id_route "$BASE/blog/[id]/edit/page.tsx" "AdminBlogPage" "edit"
create_section_route "$BASE/blog/categories/page.tsx" "AdminBlogPage" "categories"
create_section_route "$BASE/blog/tags/page.tsx" "AdminBlogPage" "tags"

# ============ FAQS ============
create_route "$BASE/faqs/page.tsx" "AdminFaqsPage"
create_route "$BASE/faqs/create/page.tsx" "AdminFaqsPage" 'action="create"'
create_id_route "$BASE/faqs/[id]/edit/page.tsx" "AdminFaqsPage" "edit"
create_section_route "$BASE/faqs/categories/page.tsx" "AdminFaqsPage" "categories"

# ============ PAGES (CMS) ============
create_route "$BASE/pages/page.tsx" "AdminPagesPage"
create_slug_route "$BASE/pages/[pageSlug]/page.tsx" "AdminPagesPage"

# ============ HOMEPAGE ============
create_route "$BASE/homepage/page.tsx" "AdminHomepagePage"
create_section_route "$BASE/homepage/hero/page.tsx" "AdminHomepagePage" "hero"
create_section_route "$BASE/homepage/search/page.tsx" "AdminHomepagePage" "search"
create_section_route "$BASE/homepage/categories/page.tsx" "AdminHomepagePage" "categories"
create_section_route "$BASE/homepage/featured-tickets/page.tsx" "AdminHomepagePage" "featured-tickets"
create_section_route "$BASE/homepage/how-it-works/page.tsx" "AdminHomepagePage" "how-it-works"
create_section_route "$BASE/homepage/statistics/page.tsx" "AdminHomepagePage" "statistics"
create_section_route "$BASE/homepage/testimonials/page.tsx" "AdminHomepagePage" "testimonials"
create_section_route "$BASE/homepage/faqs/page.tsx" "AdminHomepagePage" "faqs"
create_section_route "$BASE/homepage/footer/page.tsx" "AdminHomepagePage" "footer"

# ============ ADS ============
create_route "$BASE/ads/page.tsx" "AdminAdsPage"
create_route "$BASE/ads/create/page.tsx" "AdminAdsPage" 'action="create"'
create_id_route "$BASE/ads/[id]/page.tsx" "AdminAdsPage" "view"

# ============ MARKETING ============
create_route "$BASE/marketing/page.tsx" "AdminMarketingPage"
create_section_route "$BASE/marketing/email-campaigns/page.tsx" "AdminMarketingPage" "email-campaigns"
create_section_route "$BASE/marketing/sms-campaigns/page.tsx" "AdminMarketingPage" "sms-campaigns"
create_section_route "$BASE/marketing/push-notifications/page.tsx" "AdminMarketingPage" "push-notifications"
create_section_route "$BASE/marketing/promo-codes/page.tsx" "AdminMarketingPage" "promo-codes"
create_section_route "$BASE/marketing/referrals/page.tsx" "AdminMarketingPage" "referrals"
create_section_route "$BASE/marketing/coupons/page.tsx" "AdminMarketingPage" "coupons"
create_section_route "$BASE/marketing/announcements/page.tsx" "AdminMarketingPage" "announcements"
create_section_route "$BASE/marketing/newsletters/page.tsx" "AdminMarketingPage" "newsletters"

# ============ SEO ============
create_route "$BASE/seo/page.tsx" "AdminSeoPage"
create_section_route "$BASE/seo/homepage/page.tsx" "AdminSeoPage" "homepage"
create_section_route "$BASE/seo/blog/page.tsx" "AdminSeoPage" "blog"
create_section_route "$BASE/seo/pages/page.tsx" "AdminSeoPage" "pages"
create_section_route "$BASE/seo/open-graph/page.tsx" "AdminSeoPage" "open-graph"
create_section_route "$BASE/seo/twitter-card/page.tsx" "AdminSeoPage" "twitter-card"
create_section_route "$BASE/seo/schema/page.tsx" "AdminSeoPage" "schema"
create_section_route "$BASE/seo/robots-txt/page.tsx" "AdminSeoPage" "robots-txt"
create_section_route "$BASE/seo/sitemap/page.tsx" "AdminSeoPage" "sitemap"
create_section_route "$BASE/seo/redirects/page.tsx" "AdminSeoPage" "redirects"
create_section_route "$BASE/seo/404-monitor/page.tsx" "AdminSeoPage" "404-monitor"

# ============ SETTINGS ============
create_section_route "$BASE/settings/general/page.tsx" "AdminSettingsGeneralPage" "general"
create_section_route "$BASE/settings/localization/page.tsx" "AdminSettingsGeneralPage" "localization"
create_section_route "$BASE/settings/languages/page.tsx" "AdminSettingsGeneralPage" "languages"
create_section_route "$BASE/settings/currency/page.tsx" "AdminSettingsGeneralPage" "currency"
create_section_route "$BASE/settings/timezone/page.tsx" "AdminSettingsGeneralPage" "timezone"
create_section_route "$BASE/settings/logo/page.tsx" "AdminSettingsGeneralPage" "logo"
create_section_route "$BASE/settings/favicon/page.tsx" "AdminSettingsGeneralPage" "favicon"
create_section_route "$BASE/settings/email/page.tsx" "AdminSettingsEmailPage" "smtp"
create_section_route "$BASE/settings/email/smtp/page.tsx" "AdminSettingsEmailPage" "smtp"
create_section_route "$BASE/settings/email/templates/page.tsx" "AdminSettingsEmailPage" "templates"
create_section_route "$BASE/settings/email/test/page.tsx" "AdminSettingsEmailPage" "test"
create_section_route "$BASE/settings/email/logs/page.tsx" "AdminSettingsEmailPage" "logs"
create_section_route "$BASE/settings/sms/page.tsx" "AdminSettingsSmsPage" "provider"
create_section_route "$BASE/settings/sms/provider/page.tsx" "AdminSettingsSmsPage" "provider"
create_section_route "$BASE/settings/sms/templates/page.tsx" "AdminSettingsSmsPage" "templates"
create_section_route "$BASE/settings/sms/test/page.tsx" "AdminSettingsSmsPage" "test"
create_section_route "$BASE/settings/sms/logs/page.tsx" "AdminSettingsSmsPage" "logs"
create_route "$BASE/settings/payments/page.tsx" "AdminSettingsPaymentsPage"
create_section_route "$BASE/settings/payments/bkash/page.tsx" "AdminSettingsPaymentsPage" "bkash"
create_section_route "$BASE/settings/payments/sslcommerz/page.tsx" "AdminSettingsPaymentsPage" "sslcommerz"
create_section_route "$BASE/settings/payments/platform-fee/page.tsx" "AdminSettingsPaymentsPage" "platform-fee"
create_section_route "$BASE/settings/payments/payout-settings/page.tsx" "AdminSettingsPaymentsPage" "payout-settings"
create_section_route "$BASE/settings/payments/webhooks/page.tsx" "AdminSettingsPaymentsPage" "webhooks"

# ============ SECURITY ============
create_route "$BASE/security/page.tsx" "AdminSecurityPage"
create_section_route "$BASE/security/login-history/page.tsx" "AdminSecurityPage" "login-history"
create_section_route "$BASE/security/two-factor/page.tsx" "AdminSecurityPage" "two-factor"
create_section_route "$BASE/security/ip-blocklist/page.tsx" "AdminSecurityPage" "ip-blocklist"
create_section_route "$BASE/security/api-keys/page.tsx" "AdminSecurityPage" "api-keys"

# ============ REPORTS ============
create_route "$BASE/reports/page.tsx" "AdminReportsPage"
create_section_route "$BASE/reports/sales/page.tsx" "AdminReportsPage" "sales"
create_section_route "$BASE/reports/revenue/page.tsx" "AdminReportsPage" "revenue"
create_section_route "$BASE/reports/users/page.tsx" "AdminReportsPage" "users"
create_section_route "$BASE/reports/tickets/page.tsx" "AdminReportsPage" "tickets"
create_section_route "$BASE/reports/payments/page.tsx" "AdminReportsPage" "payments"
create_section_route "$BASE/reports/refunds/page.tsx" "AdminReportsPage" "refunds"
create_section_route "$BASE/reports/withdrawals/page.tsx" "AdminReportsPage" "withdrawals"

# ============ MEDIA ============
create_route "$BASE/media/page.tsx" "AdminMediaPage"
create_section_route "$BASE/media/upload/page.tsx" "AdminMediaPage" "upload"
create_section_route "$BASE/media/folders/page.tsx" "AdminMediaPage" "folders"

# ============ SYSTEM ============
create_section_route "$BASE/cache/page.tsx" "AdminSystemPage" "cache"
create_section_route "$BASE/logs/page.tsx" "AdminSystemPage" "logs"
create_section_route "$BASE/cron-jobs/page.tsx" "AdminSystemPage" "cron-jobs"
create_section_route "$BASE/backups/page.tsx" "AdminSystemPage" "backups"
create_section_route "$BASE/system/update/page.tsx" "AdminSystemPage" "update"

# ============ OTHER ============
create_route "$BASE/activity-log/page.tsx" "AdminActivityLogPage"
create_route "$BASE/analytics/page.tsx" "AdminAnalyticsPage"
create_route "$BASE/verify-ticket/page.tsx" "AdminVerifyTicketPage"
create_section_route "$BASE/fraud-reports/page.tsx" "AdminVerifyTicketPage" "fraud-reports"

# ============ ADMINS ============
create_route "$BASE/admins/page.tsx" "AdminAdminsPage"
create_route "$BASE/admins/create/page.tsx" "AdminAdminsPage" 'action="create"'
create_id_route "$BASE/admins/[id]/page.tsx" "AdminAdminsPage" "view"
create_id_route "$BASE/admins/[id]/edit/page.tsx" "AdminAdminsPage" "edit"

# ============ ROLES ============
create_route "$BASE/roles/page.tsx" "AdminRolesPage"
create_section_route "$BASE/permissions/page.tsx" "AdminRolesPage" "permissions"

echo "All route files created!"
