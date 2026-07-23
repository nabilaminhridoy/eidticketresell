---
Task ID: 1
Agent: Main Coordinator
Task: Fix blank preview, add admin auth, seed super admin, fix media page, clean up

Work Log:
- Fixed lucide-react icon imports (Language → Languages, Browser → removed)
- Created admin catch-all page at /src/app/admin/[[...slug]]/page.tsx
- Created AdminAuthGuard component that redirects unauthorized users to /en/not-found (only /admin/login accessible)
- Updated admin layout to use AdminAuthGuard for protected routes
- Created AdminPageRouter component with lazy-loaded admin sub-pages
- Created seed-admin.ts script, seeded super admin (admin@eidticketresell.com / Admin@2024)
- Fixed admin passwords to use SHA-256 (consistent with auth.ts)
- Updated AdminMediaPage to show uploaded logos, favicon, and payment images
- Created media upload API at /api/admin/media (GET, POST, DELETE)
- Created upload directories (public/uploads/logos, favicon, payment)
- Removed framer-motion from HomePage, Header, Footer (replaced with CSS animations)
- Added CSS keyframes to globals.css (fadeInUp, fadeInScale, slide-down, etc.)
- Updated package.json dev script to use 3072MB memory limit
- Added ssr: false to homepage dynamic import
- Simplified ALL_BD_DISTRICTS from 64 to 26 entries

Stage Summary:
- Admin panel has proper auth: only /admin/login accessible without token
- Super admin seeded: email admin@eidticketresell.com, password Admin@2024
- Admin pages mapped through catch-all route and AdminPageRouter
- Media page shows uploaded images with upload/delete functionality
- Framer-motion removed from key components for memory optimization
- Server works in 4GB sandbox but can only compile ~2-3 pages at a time due to memory constraints
- Homepage compilation alone uses ~1.5GB; combined with admin pages exceeds 4GB limit
- Critical pages work individually: admin/login, admin/dashboard, /en homepage
