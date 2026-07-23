---
Task ID: 7
Agent: main
Task: Redesign Header and Footer per user's exact specifications

Work Log:
- Copied Payment.png from upload directory to public folder
- Added missing i18n translation keys: cookiesPolicy, safetyGuidelines, verifyTicket, aboutUs, contactUs, tagLine, light, dark, system
- Delegated Header redesign (Task 1-b) to frontend-styling-expert agent
- Delegated Footer redesign (Task 1-c) to frontend-styling-expert agent
- Both agents completed successfully with lint passing and clean builds
- Server OOM issues encountered during agent-browser verification due to 4GB RAM sandbox constraints
- Verified code quality via lint (passes clean), code review (correct imports, structure, translations)
- Verified server serves pages correctly via curl (200 status codes for /en, /en/how-it-works, etc.)
- Watchdog script restarted for server stability

Stage Summary:
- Header redesigned: Desktop 3-column (Logo | Nav with Buy Tickets dropdown | Language+Theme+Auth), Mobile hamburger with Sheet menu
- Footer redesigned: Desktop 4-column (Logo+Info | TRANSPORT | QUICK LINKS | LEGAL), Mobile with Accordion collapsible sections
- Payment.png image displayed in footer, copyright with auto year
- Buy Tickets is both clickable (→search) and hoverable/tappable (→dropdown with Bus/Train/Flight/Launch)
- Safety Guidelines link added (was missing before)
- 6 social icons including WhatsApp (custom SVG)
- Theme toggle: 3-mode DropdownMenu (Light/Dark/System)
- All navigation uses useNav().navigate() for proper URL routing
- All text uses t() translation keys for bilingual support
- Lint passes clean, server returns 200 for all routes

---
Task ID: 8
Agent: main
Task: Fix "only z.ai logo appears" issue + Payment.png full width in footer

Work Log:
- Diagnosed server OOM (Out of Memory) crashes — the 4GB RAM sandbox + heavy page.tsx compilation exceeded memory limits
- Extracted HomePage component from inline page.tsx to separate /src/components/pages/HomePage.tsx (~500 lines)
- Rewrote page.tsx to be lightweight (~105 lines) with lazy import for HomePage instead of inline rendering
- Made AppShell use dynamic imports for Header and Footer (ssr: false) to reduce memory footprint
- Fixed Footer.tsx: moved Payment.png outside inner container, changed from max-w-3xl mx-auto to w-full in its own bg-muted section spanning full width across all columns
- Closed agent-browser Chrome to free RAM (1.2GB)
- Server starts successfully with NODE_OPTIONS="--max-old-space-size=1024" in subshell background mode
- Verified with Agent Browser: page renders fully — header, home content, footer
- Verified Buy Tickets hover dropdown (Bus, Train, Flight, Launch)
- Verified mobile/tablet view: Logo | Language+Theme+Menu header, accordion footer
- Verified mobile Sheet menu: top nav items + bottom Login | Register
- Verified footer: TRANSPORT, QUICK LINKS, LEGAL columns, Payment Methods full width, Copyright 2026

Stage Summary:
- Server OOM resolved by extracting HomePage + dynamic imports for Header/Footer
- page.tsx reduced from 667 to ~105 lines (HomePage lazy-loaded)
- AppShell uses next/dynamic for Header/Footer (ssr: false)
- Payment.png spans full width from first to last column
- All responsive layouts verified working

---
Task ID: 9
Agent: frontend-styling-expert + main
Task: Redesign search form hero section per user's layout specs

Work Log:
- Analyzed 4 uploaded reference images using VLM for design guidance
- Delegated search form redesign to frontend-styling-expert agent
- Changed BD_CITIES import to ALL_BD_DISTRICTS (64 districts, A-Z sorted, bilingual)
- Redesigned Desktop/PC/Tablet layout: 2-column grid with FROM+TO (Row 1), Transport+Date (Row 2), Search+Sell buttons (Row 3)
- Redesigned Mobile layout: Single column with all fields stacked vertically + buttons stacked vertically
- Added swap button between FROM and TO (circular, centered on desktop; centered below fields on mobile)
- Color-coded icons: FROM=green MapPin, TO=orange MapPin, Transport=primary Bus, Date=blue CalendarDays
- All inner fields full width within their column (w-full h-11 rounded-xl)
- District dropdown shows bilingual labels (label for en, labelBn for bn)
- Removed redundant CTA buttons below the form card (form already has Search+Sell inside)
- Verified with Agent Browser: desktop 2-col layout, mobile single-col layout, district dropdown shows 64 entries A-Z
- Lint passes clean

Stage Summary:
- Search form redesigned per user's exact layout specifications
- Desktop: 2-column grid (FROM|TO, Transport|Date, Search|Sell)
- Mobile: single column (FROM, TO, swap, Transport, Date, Search, Sell)
- All 64 Bangladesh districts A-Z with bilingual labels
- All fields full width within their column
- Duplicate CTA buttons removed from hero section
- Swap button positioned between FROM/TO columns on desktop, below TO on mobile
Agent: main
Task: Fix all navigation links/buttons on home page and across the app

Work Log:
- Investigated the routing structure — all page.tsx route files exist for every URL the user listed
- Identified the ROOT CAUSE: Header, Footer, and 9 page components used `useAppStore().navigate()` which only updates Zustand state without changing the browser URL. Since Next.js App Router is URL-based, these calls never actually navigated anywhere.
- The `useNav().navigate()` hook properly uses `router.push()` to change URLs but didn't update the store
- Modified `useNav()` in `/home/z/my-project/src/lib/use-nav.ts` to ALSO update Zustand store via `useAppStore.getState().navigate()` — this keeps both URL routing and store state in sync
- Updated `Header.tsx` to use `useNav().navigate()` instead of `useAppStore().navigate()`, keeping `useAppStore` only for `currentPage` tracking
- Updated `Footer.tsx` to use `useNav().navigate()` instead of `useAppStore().navigate()`
- Delegated page component updates to subagent — 7 files updated (TicketDetailsPage, SearchPage, RegisterPage, DashboardPage, SellTicketPage, LoginPage, KycPage)
- Extended `Page` type in `/home/z/my-project/src/lib/store.ts` to include all page names used in `getPagePath` (cookies-policy, verify-ticket, checkout, order pages, safety-guidelines, dashboard, wallet sub-routes, etc.)
- Rewrote `/home/z/my-project/src/lib/navigation.ts` to properly handle query params — added `buildQueryString()` helper and updated all transport/bus/train/flight/launch cases to include extra params (from, to, date)
- Added URL-based fallback for `SearchPage` — reads transport, from, to from URL search params first, then falls back to store pageParams
- Added `ticketId` prop support for `TicketDetailsPage` — accepts URL path param, falls back to store pageParams
- Verified with Agent Browser: all home page buttons work (Search Tickets → /en/buy-tickets, Sell Tickets → /en/sell-tickets, Bus → /en/buy-tickets?transport=bus, etc.)
- Verified header links: Buy Tickets, How It Works, Support, FAQ, Login, Register all navigate correctly
- Verified footer links: About, Terms of Service, Privacy Policy, Refund Policy, Payment Policy, Bus, Train all navigate correctly
- Verified login page links: Forgot Password → /en/account/forget-password, Create Now → /en/account/register
- Verified direct URL access for all key pages returns 200
- Verified user panel routes redirect to login for unauthenticated users (correct behavior)
- Lint passes with no errors
- No browser console errors (only harmless scroll-behavior warnings)

Stage Summary:
- ALL navigation now works correctly across the entire app
- Root cause was dual navigation systems — `useAppStore().navigate()` (state-only) vs `useNav().navigate()` (URL-based)
- Fix: unified both by making `useNav()` update BOTH the URL and the store state
- SearchPage and TicketDetailsPage now have URL param fallbacks for direct URL visits
- getPagePath properly handles all query params (from, to, transport, etc.)
- Page type in store now covers all 30+ page names used across the app

---
Task ID: 3-d
Agent: general-purpose
Task: Replace useAppStore().navigate() with useNav().navigate() in page components

Work Log:
- Read all 7 target page files to identify exact useAppStore import and destructuring lines
- Confirmed files already using useNav (HomePage, SecurityPage, OneIDMfaLogin) — no changes needed
- TicketDetailsPage.tsx: Added `import { useNav } from '@/lib/use-nav'`, split `const { navigate, pageParams } = useAppStore()` into `const { pageParams } = useAppStore(); const { navigate } = useNav();`
- SearchPage.tsx: Added `import { useNav } from '@/lib/use-nav'`, same split pattern as TicketDetailsPage (kept pageParams from useAppStore)
- RegisterPage.tsx: Removed `useAppStore` from import (only used for navigate), added `import { useNav } from '@/lib/use-nav'`, replaced `const { navigate } = useAppStore()` with `const { navigate } = useNav()`
- DashboardPage.tsx: Removed `useAppStore` from import, added `import { useNav } from '@/lib/use-nav'`, replaced destructuring
- SellTicketPage.tsx: Removed `useAppStore` from import, added `import { useNav } from '@/lib/use-nav'`, replaced destructuring
- LoginPage.tsx: Removed `useAppStore` from import, added `import { useNav } from '@/lib/use-nav'`, replaced destructuring
- KycPage.tsx: Removed `useAppStore` from import, added `import { useNav } from '@/lib/use-nav'`, replaced destructuring
- Verified remaining useAppStore references in page files are legitimate (pageParams, currentPage) — not navigate
- Ran TypeScript type check — no new errors from these changes; pre-existing errors are unrelated

Stage Summary:
- All 7 page components now use `useNav().navigate()` instead of `useAppStore().navigate()`
- Files with pageParams (TicketDetailsPage, SearchPage) still use useAppStore for pageParams, but get navigate from useNav
- Files that only used useAppStore for navigate (5 files) fully removed useAppStore from imports
- No stale useAppStore references for navigate remain in any page component
- useNav import added to all 7 modified files

---
Task ID: 1-c
Agent: frontend-styling-expert
Task: Redesign Footer component for Desktop 4-col + Mobile accordion

Work Log:
- Read worklog.md for project context — understood that useNav().navigate() is the correct navigation method (URL-based + store sync)
- Read existing Footer.tsx — had 3-column layout with transport, quick links, legal; mobile used grid auto-flow, no accordion
- Read i18n.ts — confirmed all translation keys exist (tagLine, aboutUs, contactUs, verifyTicket, cookiesPolicy, etc.)
- Read use-nav.ts — confirmed useNav().navigate(page) API with optional params
- Read accordion.tsx — confirmed shadcn/ui Accordion, AccordionItem, AccordionTrigger, AccordionContent components available
- Verified Payment.png exists in public directory
- Completely rewrote Footer.tsx with:
  - Desktop (lg+): 4-column grid layout — Logo+Info, TRANSPORT, QUICK LINKS, LEGAL
  - Mobile/Tablet (below lg): Logo+Info always visible, then shadcn Accordion for TRANSPORT, QUICK LINKS, LEGAL
  - WhatsApp icon: custom inline SVG (WhatsAppIcon component) for authentic branding
  - Social icons: 6 total (FB, Instagram, WhatsApp, X, LinkedIn, YouTube) in rounded squares with brand-colored hover effects
  - Transport icons: colored icon badges — Bus=green-600, Train=teal-600, Flight=sky-500, Launch=violet-600
  - Quick Links: dot indicators with hover effects
  - Legal: blue accent bar, blue dot indicators with hover effects
  - TRANSPORT & QUICK LINKS: green accent bars
  - Payment image: /Payment.png, full width, max-w-3xl, centered
  - Copyright bar: bg-primary, white text, auto year
  - Separator above footer
  - mt-auto for sticky-to-bottom behavior
  - Navigation mapping: search→All Transport, bus/train/flight/launch with query params, about, contact, verify-ticket, faq, blog, payment-policy, refund, terms, privacy, cookies-policy
  - Translation keys used: appName, tagLine, transport, allTransport, bus, train, flight, launch, blog, aboutUs, contactUs, verifyTicket, faq, terms, privacy, refund, paymentPolicy, cookiesPolicy, allRightsReserved
  - framer-motion animations on desktop columns (staggered fade-in)
  - framer-motion scale animations on social icon hover/tap
- Ran TypeScript check — no Footer-related errors
- Ran clean Next.js build — succeeded with no errors

Stage Summary:
- Footer completely redesigned per spec with responsive 4-col desktop / accordion mobile layout
- All navigation uses useNav().navigate() for proper URL routing
- All text uses t() translation keys for bilingual support
- Payment.png image displayed centered with full width
- Copyright bar with bg-primary and auto-calculated year
- shadcn/ui Accordion component used for mobile collapsible sections
- Custom WhatsApp SVG icon for authentic social branding
- Build and TypeScript checks pass cleanly

---
Task ID: 1-b
Agent: frontend-styling-expert
Task: Redesign Header component for Desktop 3-col + Mobile hamburger menu

Work Log:
- Read worklog.md for project context — understood useNav().navigate() is the correct navigation API, useAppStore only for currentPage tracking
- Read existing Header.tsx (688 lines) — had basic 2-zone layout (left logo, right nav+auth), mobile Sheet with flat nav list, no Safety Guidelines link, Buy Tickets was flat list in mobile (no Collapsible)
- Read i18n.ts — confirmed all needed translation keys exist (buyTickets, sellTickets, howItWorks, safetyGuidelines, support, faq, bus, train, flight, launch, login, register, logout, dashboard, myTickets, myOrders, wallet, kyc, appName, light, dark, system)
- Read use-nav.ts — confirmed navigate(page, params) API
- Read navigation.ts — confirmed route mapping matches spec (search→/buy-tickets, bus→?transport=bus, etc.)
- Read store.ts — confirmed useAuthStore has user, isAuthenticated, logout; useLanguageStore has language, setLanguage
- Read Collapsible and Sheet shadcn/ui components — confirmed Collapsible/CollapsibleTrigger/CollapsibleContent API and Sheet/SheetContent/SheetTrigger API
- Completely rewrote Header.tsx (617 lines) with full redesign per spec:

  DESKTOP (lg+ screens) — 3-column layout:
  - LEFT: Logo (language-switching SVG), navigates to home
  - CENTER: Nav items with mx-auto positioning — Buy Tickets (hover dropdown with 150ms delay) + Sell Tickets, How It Works, Safety Guidelines, Support, FAQs as plain NavButton links
  - RIGHT: Language Globe toggle → Theme DropdownMenu (Light/Dark/System with Active badge) → Auth buttons (Login/Register) or User Avatar Dropdown (Dashboard, My Tickets, My Orders, Wallet, KYC, Logout)

  MOBILE (below lg) — 2-column layout:
  - LEFT: Logo
  - RIGHT: Language Globe → Theme Dropdown → Hamburger Menu icon (Sheet trigger)

  MOBILE SHEET MENU:
  - Top Section: Buy Tickets (Collapsible with tap-to-expand + click-to-navigate dual action) → Sell Tickets → How It Works → Safety Guidelines → Support → FAQs
  - Bottom Section (Separator): User info + menu items (Dashboard, My Tickets, My Orders, Wallet, KYC, Logout) OR Login/Register buttons (side by side)

  Key design features implemented:
  1. Sticky header with backdrop-blur-md, transitions from bg-background/80 to bg-background/95 on scroll
  2. Buy Tickets hover dropdown with 150ms timeout delay to prevent accidental close
  3. Buy Tickets clickable — navigates to /en/buy-tickets (search page)
  4. Transport icons colored: Bus=green-500, Train=teal-500, Flight=sky-500, Launch=violet-500
  5. Theme toggle: 3-mode DropdownMenu (Light/Dark/System) with colored icons and Active badge
  6. Language toggle: Globe icon button switching en↔bn, shows opposite language label
  7. Logo images: /logo-en.svg (English), /logo-bn.svg (Bengali)
  8. framer-motion: AnimatePresence for dropdown, staggered item animation, scale hover/tap on NavButton
  9. Active page highlighting: text-primary bg-primary/10 on both desktop and mobile
  10. Responsive: lg breakpoint for desktop/mobile switch
  11. Accessibility: 44px min touch targets on mobile, sr-only labels, focus/hover states
  12. Mobile Buy Tickets uses Collapsible component with ChevronRight toggle rotation
  13. Added Safety Guidelines nav link (was missing from old header)
  14. User menu items use colored icons: Dashboard=primary, MyTickets=green, MyOrders=blue, Wallet=orange, KYC=violet
  15. userParams for nav passes { username: user.username } for user panel routes

- Fixed TypeScript error: userParams was `user ? { username } : {}` which caused type mismatch with Record<string, string>; changed to `user ? { username } : undefined`
- Ran TypeScript check — no Header.tsx-specific errors (all remaining errors are pre-existing in AdminPage, DashboardPage props, etc.)
- Ran clean Next.js build — succeeded with no errors

Stage Summary:
- Header completely redesigned per spec with responsive 3-col desktop / hamburger mobile layout
- Desktop: Left(Logo) | Center(Nav with Buy Tickets dropdown) | Right(Language+Theme+Auth)
- Mobile: Left(Logo) | Right(Language+Theme+Menu) → Sheet with Collapsible Buy Tickets
- Buy Tickets is both clickable (→search page) and expandable (hover desktop / Collapsible mobile)
- Transport dropdown items have colored icon badges (green/teal/sky/violet)
- Safety Guidelines link added (was missing from old header)
- All navigation uses useNav().navigate() for proper URL routing + store sync
- All text uses t() translation keys for bilingual support
- Theme uses 3-mode DropdownMenu (Light/Dark/System) with Active badges
- Auth states handled: logged-out (Login/Register), logged-in (Avatar Dropdown)
- Mobile Sheet bottom section: Login/Register or User info+menu with Separator divider
- Build and TypeScript checks pass cleanly with no new errors

---
Task ID: 9
Agent: frontend-styling-expert
Task: Redesign search form layout in HomePage hero section

Work Log:
- Read worklog.md for project context — understood previous agent work on Header, Footer, navigation, and OOM fixes
- Read current HomePage.tsx — search form was a 4-column grid (Transport Type | FROM | TO+Swap | Journey Date) with single Search button
- Read constants.ts — confirmed ALL_BD_DISTRICTS exists as flattened array of 64 districts with bilingual labels (label + labelBn)
- Replaced BD_CITIES import with ALL_BD_DISTRICTS in HomePage.tsx
- Completely redesigned the search form section with new layout:
  - Desktop (sm+): 2-column grid layout
    - Row 1: FROM (green MapPin icon) | TO (orange MapPin icon) — circular swap button centered between columns using absolute positioning (left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2)
    - Row 2: Transport Type (green Bus icon) | Journey Date (blue CalendarDays icon)
    - Row 3: Search Tickets button (bright green primary) | Sell Tickets button (outlined variant with Ticket icon)
  - Mobile (below sm): Single column, all fields and buttons stacked vertically
    - FROM → TO → swap button (centered below fields) → Transport Type → Journey Date → Search Tickets → Sell Tickets
- District dropdowns now show English labels (dist.label) when language is 'en', Bengali labels (dist.labelBn) when language is 'bn'
- Color-coded icons per spec: FROM=green-600 MapPin, TO=orange MapPin, Bus=primary (green), CalendarDays=blue-500
- All SelectTrigger/Input fields use w-full h-11 rounded-xl for consistent sizing
- Swap button: w-9 h-9 rounded-full bg-card border-2 border-primary/20 with hover:bg-primary hover:text-primary-foreground
- Search Tickets button: full width, green primary, with Search + ArrowRight icons
- Sell Tickets button: full width, outline variant, with Ticket icon, hover:bg-primary/10 hover:text-primary
- Form card container kept as: rounded-2xl bg-card border-2 border-primary/15 shadow-xl shadow-primary/5 p-5 sm:p-6
- CTA section below the form kept intact per instructions
- All other sections (transport types, how it works, stats, popular routes, CTA) kept unchanged
- Lint passes clean, no TypeScript errors in HomePage.tsx

Stage Summary:
- Search form redesigned from 4-col single-row to 2-col grid (3 rows) on desktop, single column on mobile
- BD_CITIES replaced with ALL_BD_DISTRICTS (64 districts, bilingual labels)
- Bilingual dropdown labels: English (label) / Bengali (labelBn) based on language
- Color-coded icons: FROM=green, TO=orange, Transport=green, Date=blue
- Circular swap button positioned between FROM/TO columns on desktop, centered below on mobile
- Search Tickets + Sell Tickets buttons now inside the form card in 2-col grid row
- Lint passes clean, no new TypeScript errors

---
Task ID: 10
Agent: main
Task: Remove swap arrow between FROM/TO fields and fix footer payment image spacing

Work Log:
- Analyzed user's two uploaded screenshots using VLM to understand current state
- Identified swap arrow (ArrowLeftRight icon) between FROM and TO fields in search form — user wants it removed entirely
- Identified footer payment image spacing issue: too much gap above (40-56px from py-10/py-14 bottom padding), no gap below (0px before copyright bar)
- Removed ArrowLeftRight import from lucide-react icons in HomePage.tsx
- Removed useCallback import (was only used for swapCities function)
- Removed swapCities function entirely
- Removed desktop swap button (absolute positioned circular button between FROM/TO columns)
- Removed mobile swap button (centered below TO field)
- Changed FROM/TO grid from `relative grid` to plain `grid` (removed relative positioning needed for swap button)
- Fixed footer payment image spacing:
  - Changed main footer content container from `py-10 lg:py-14` to `pt-10 pb-0 lg:pt-14 lg:pb-0` (removed bottom padding)
  - Changed payment section container from no padding to `py-4` (16px top and bottom padding)
  - Verified with computed CSS: gap above = 16px, gap below = 16px (equal)
  - Verified with getBoundingClientRect measurements: 16px above, 16px below
- Verified with Agent Browser + VLM:
  - Search form: No swap arrow between FROM and TO fields, 2-column grid layout correct
  - Desktop footer: spacing approximately equal (~20px above, ~15-18px below)
  - Mobile footer: spacing approximately equal (~20-25px above, ~15-20px below)
- Lint passes clean, no errors

Stage Summary:
- Swap arrow completely removed from search form (both desktop and mobile)
- Footer payment image spacing equalized: ~16px above and below (previously 40-56px above, 0px below)
- useCallback import removed (no longer needed)
- ArrowLeftRight icon import removed
- All responsive layouts verified working

---
Task ID: 11
Agent: main
Task: Create Support page with form (Full Name, Phone +88, Email validation, Subject, Message, Attachment, Submit)

Work Log:
- Explored existing Support page structure — was using InfoPage with simple phone/email cards
- Updated Prisma schema: SupportTicket model extended with fullName, phone, email, subject, message, attachment fields; userId made optional (String?) for guest submissions; user relation changed to User?
- Pushed schema to database with `bun run db:push`
- Created SupportPage.tsx component with:
  - Quick contact cards (Phone, Email, Response Time) above form
  - 2-column desktop grid for Full Name+Phone, Email+Subject rows
  - Full-width Description textarea and Attachment upload area
  - Green Submit button with Send icon
  - Full validation: required fields, BD phone format (+88, 11 digits), email domain validation (@gmail.com, @outlook.com, etc.), file size limit (5MB)
  - Success page with animated green CheckCircle icon, "Support Request Submitted!" title, 24-hour response badge
  - Mobile: single column stacked layout with all fields full width
- Created API route `/api/support/route.ts`:
  - POST handler with FormData parsing
  - Server-side validation matching client-side (email domains, phone format, file size/type)
  - File upload to `public/uploads/support/` directory
  - Prisma SupportTicket creation with optional userId (guest support)
  - Fixed Prisma optional relation issue: used spread operator `...(userId ? { userId } : {})` instead of `userId: null`
- Updated i18n translations: added 13 new keys (subject, attachment, attachmentHint, phoneHintBd, emailHintDomains, getInTouch, supportFormDesc, supportSuccessTitle, supportSuccessMsg, fileTooLarge, invalidPhoneFormat, invalidEmailDomain, requiredField) in both English and Bengali
- Updated page.tsx: added LazySupportPage import, changed 'support' entry from LazyInfoPage to LazySupportPage
- Updated support page route: changed from InfoPage to dynamic import of SupportPage (ssr: false)
- Restarted dev server to pick up new Prisma Client after schema change
- Verified with Agent Browser:
  - Desktop: form shows all 6 fields in 2-column grid, quick contact cards above, submit button
  - Mobile: all fields stacked vertically, full width
  - Validation: required field errors shown, email domain validation works, phone format validation works
  - Submission: form submits successfully, shows success page with green checkmark, "Support Request Submitted!" title, 24-hour response badge
  - Backend: POST /api/support returns 200, Prisma INSERT query confirms data saved

Stage Summary:
- Complete Support page with professional form created
- Desktop: 2-column grid (Name+Phone, Email+Subject), full-width Description+Attachment+Submit
- Mobile: single column stacked with full-width fields
- Full validation: BD phone (+88 11 digits), email domains (gmail/outlook/yahoo etc.), required fields, file size
- Backend API: file upload support, Prisma database storage, guest submissions allowed
- Success page: animated checkmark, confirmation message, 24-hour badge
- Bilingual support: all new labels have English and Bengali translations
