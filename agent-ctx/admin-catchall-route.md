# Task: Create Catch-All Admin Page Route

## Summary

Created a comprehensive catch-all admin page routing system with authentication guards for the Next.js 16 admin panel.

## Files Created

1. **`/src/app/admin/[[...slug]]/page.tsx`** — Optional catch-all route that dynamically loads admin components based on the URL slug path. Uses `import()` with static paths for each route, ensuring only the needed component is fetched at runtime (memory-friendly for 4GB sandbox). Maps 35+ admin routes to their corresponding component modules with appropriate props (e.g., `section` for System/Media/Security sub-routes). Includes loading spinner, error fallback, and `notFound()` for unknown routes.

2. **`/src/components/admin/AdminAuthGuard.tsx`** — Client-side authentication guard that checks `localStorage` for `etr_admin_token` using `useSyncExternalStore` (avoids setState-in-effect lint rule). If no token, redirects to `/admin/login`. Shows a loading spinner while verifying auth. Prevents flash of unauthenticated content.

3. **`/src/components/admin/AdminDisputesPage.tsx`** — Stub component for the disputes management page (sidebar references this route but component didn't exist yet).

4. **`/src/components/admin/AdminSettingsLocalizationPage.tsx`** — Stub component for localization settings (sidebar references `/admin/settings/localization` but component didn't exist yet). Accepts `section` prop.

## Files Modified

1. **`/src/app/admin/layout.tsx`** — Updated to:
   - Keep `/admin/login` and `/admin/verify-otp` as public routes (no sidebar, no auth guard)
   - Wrap all other admin routes with `AdminAuthGuard` and `AdminLayout`
   - Both `AdminAuthGuard` and `AdminLayout` are dynamically imported with `ssr: false` to reduce memory pressure

## Design Decisions

- **`[[...slug]]`** (optional catch-all) instead of `[...slug]` (required catch-all) so that `/admin` (root, no slug segments) is also handled and maps to the Dashboard component.
- **Dynamic `import()` calls** inside a route config map instead of 30+ `next/dynamic()` definitions at module scope — each `import()` has a static path so Turbopack can still create separate chunks, but only one is actually executed per page visit.
- **`useSyncExternalStore`** for auth token reading instead of `useEffect + useState` — avoids the `react-hooks/set-state-in-effect` lint rule.
- **`notFound()` called after hooks** to maintain consistent hook call order, satisfying React's rules of hooks.
- **Route-specific props** passed through the route config (e.g., `section: 'api-keys'` for `/admin/security/api-keys`, `section: 'cache'` for `/admin/cache`).

## Lint Status

All new/modified files pass ESLint with zero errors. Pre-existing lint error in `AdminMediaPage.tsx` is unrelated to this task.
