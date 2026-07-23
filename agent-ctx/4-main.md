# Task 4: Update Admin Pages to Fetch Real Data from Database

## Summary
Updated all admin page components to fetch real data from database API routes instead of using hardcoded mock/demo data. Created 13 new API routes and updated 14 admin page components.

## New API Routes Created
All at `/src/app/api/admin/`:
- `refunds/route.ts` - GET refunds (orders with refund/cancelled status)
- `disputes/route.ts` - GET disputes with order info
- `reviews/route.ts` - GET reviews with author/target
- `messages/route.ts` - GET conversations + messages per chatId
- `blog/route.ts` - GET posts, categories, tags
- `faqs/route.ts` - GET FAQ categories
- `ads/route.ts` - GET ads from Ad model
- `marketing/route.ts` - GET coupons + referrals
- `analytics/route.ts` - GET analytics computed from real DB
- `reports/route.ts` - GET report data (sales, revenue, etc.)
- `admins/route.ts` - GET admin accounts
- `settings/route.ts` - GET + PUT settings
- `security/route.ts` - GET login history

## Admin Pages Updated (14)
All mock data removed, replaced with API fetch:
1. AdminDashboard - Removed mock activity fallback
2. AdminRefundsPage - Fetches refunds + disputes from APIs
3. AdminReviewsPage - Fetches from /api/admin/reviews
4. AdminMessagesPage - Fetches from /api/admin/messages
5. AdminBlogPage - Fetches from /api/admin/blog
6. AdminFaqsPage - Fetches categories from /api/admin/faqs
7. AdminAdsPage - Fetches from /api/admin/ads
8. AdminMarketingPage - Fetches from /api/admin/marketing
9. AdminSettingsGeneralPage - Fetches from /api/admin/settings
10. AdminSettingsPaymentsPage - Fetches from /api/admin/settings?group=payments
11. AdminSecurityPage - Fetches from /api/admin/security
12. AdminReportsPage - Fetches from /api/admin/reports
13. AdminAnalyticsPage - Fetches from /api/admin/analytics
14. AdminAdminsPage - Fetches from /api/admin/admins

## Pages Left As-Is (admin-editable/config)
- AdminPagesPage, AdminHomepagePage, AdminSeoPage, AdminSettingsEmailPage, AdminSettingsSmsPage, AdminRolesPage, AdminMediaPage, AdminSystemPage

## Lint Status
bun run lint passes clean (0 errors, 0 warnings)
