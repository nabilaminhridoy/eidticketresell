---
Task ID: 1
Agent: Main Coordinator
Task: Build Eid Ticket Resell - Complete MERN Stack Marketplace

Work Log:
- Analyzed existing Next.js 16 project structure
- Designed comprehensive Prisma database schema with 18 models
- Pushed schema to SQLite database
- Built core infrastructure: i18n (EN/BN), Zustand stores, theme system
- Created layout components: Header, Footer, AppShell
- Built Home page with Hero, Transport Categories, How It Works, Why Choose Us, Stats, Popular Routes, CTA sections
- Built authentication pages: Login, Register
- Built ticket pages: Search, Ticket Details, Sell Ticket, My Tickets, My Orders
- Built user dashboard: Profile, KYC, Wallet, Settings, Notifications, Chat
- Built Admin Panel with Dashboard, Users, KYC, Tickets, Orders, Settings tabs
- Built info pages: About, Contact, How It Works, FAQ, Blog, Support, Terms, Privacy, Refund, Payment Policy
- Created 15 API routes: Auth, Tickets, Orders, Wallet, KYC, Admin, Notifications, Settings, Seed
- Built Socket.io chat mini-service on port 3003
- Seeded database with admin, users, sellers, tickets, transport companies
- Consolidated pages to reduce memory footprint for sandbox environment
- Verified app renders correctly through browser (title, navigation, all sections)
- Verified API endpoints return correct data (tickets, auth, admin stats)

Stage Summary:
- Complete Eid Ticket Resell marketplace built on Next.js 16
- 25+ page components with full i18n support (English/Bangla)
- 15 API route handlers with Prisma ORM
- Socket.io chat service on port 3003
- Database seeded with sample data (admin@eidticket.com / admin123)
- App verified working through browser and curl
- Memory constraints in sandbox cause server instability under browser load

---
Task ID: auth-pages
Agent: main
Task: Build comprehensive Register and Login pages for Eid Ticket Resell

Work Log:
- Updated Prisma schema: Added `username`, `gender`, `dateOfBirth` fields to User model; Added `OtpVerification` model for OTP tracking
- Force-reset DB and pushed new schema
- Added 50+ new i18n translation keys for both English and Bangla (fullName, username, gender, dateOfBirth, male/female/other, OTP-related, password strength, agreements, step labels, etc.)
- Updated auth store User type to include username, gender, dateOfBirth, emailVerified, phoneVerified
- Rewrote register API with comprehensive validation: email domain whitelist (gmail, outlook, yahoo, etc.), BD phone format (+88+11digits), username format (3-20 chars, lowercase), password strength regex (8+ chars, upper, lower, digit, special), age verification (18+), agreement checks, duplicate detection
- Rewrote login API to accept identifier (email/phone/username) with both password and OTP login modes
- Created OTP send API (/api/auth/otp/send) with rate limiting (3 per 10min), 5min expiry, type support (email_verification, phone_verification, login, forgot_password)
- Created OTP verify API (/api/auth/otp/verify) with expiry check and auto user status update
- Created username availability check API (/api/auth/check-username) with regex validation
- Built comprehensive RegisterPage with 3-step wizard (Personal Info → Agreement → OTP Verification)
- Built comprehensive LoginPage with Password/OTP toggle, Google login placeholder, dynamic identifier icon
- Updated page.tsx routing to use separate LazyRegisterPage component
- Updated /api/auth/me, /api/admin/users, /api/seed routes to include new username field
- Browser verified: all features working - form validation, password strength meter, username availability, OTP send/verify, step navigation, Bangla/English translations

Stage Summary:
- Register page: 3-step wizard with all specified fields, password strength indicator, username availability check, agreements, email+phone OTP verification
- Login page: Phone/Email/Username login with Password or OTP mode, Google SSO placeholder
- Full i18n support for both pages (English + বাংলা)
- All APIs properly validate and secure user inputs

---
Task ID: kyc-verification
Agent: main
Task: Build comprehensive KYC Verification system for Eid Ticket Resell

Work Log:
- Updated Prisma KYC schema: Added kycName, kycDob, kycGender, nameChanged, dobChanged, genderChanged (once-only change tracking), houseRoadVillage, upazilaThana, district, division, postalCode (address), selfieRight, selfieLeft, selfieSmile, selfieBlink (pose captures)
- Force-reset DB and pushed new schema
- Added 50+ new i18n translation keys for KYC in both English and Bangla (address fields, selfie poses, GPS, change-once warnings, status messages, verified seller benefits)
- Added BD_DIVISIONS (8 divisions) and BD_DISTRICTS (cascading districts per division) to constants
- Created file upload API (/api/upload) with file type validation (JPEG/PNG/WebP), 5MB size limit, unique filename generation
- Rewrote KYC API with comprehensive validation: NID 10/13/17 digit validation, passport front-only rule, required address fields, name/dob/gender once-only change enforcement, auto user profile update on change
- Built comprehensive KycPage component with 2-step wizard:
  - Step 1: Personal Info (auto from profile, change-once locks), Document Upload (type-dependent UI), Present Address (cascading division→district)
  - Step 2: Live Selfie Capture with 5 poses (Front, Right, Left, Smile, Blink), GPS location, camera API integration
- Added KYC status pages: Pending (with spinner), Approved (with verified benefits), Rejected (with resubmit)
- Updated DashboardPage KYC tab to link to dedicated KYC page with verified seller benefits display
- Updated page.tsx routing to use LazyKycPage
- Updated admin KYC API and seed data for new schema
- Browser verified: all features working - auto-fill, change-once locks, document type switching, NID validation, passport front-only, cascading dropdowns, file uploads, selfie/GPS page

Stage Summary:
- Complete KYC verification system with 2-step wizard
- Personal info auto-filled from profile with once-only change warnings
- Document upload: NID (10/13/17 digits, front+back), Driving Licence (front+back), Passport (front only)
- Present address with cascading Bangladesh Division→District dropdowns
- Live selfie capture with 5 poses (Front, Right, Left, Smile, Blink) and GPS verification
- After admin approval: seller gets verified badge, can sell tickets, use wallet & withdraw
- Full i18n support (English + বাংলা)

---
Task ID: ticket-system
Agent: main
Task: Build comprehensive ticket selling system with escrow, platform fee, QR delivery, review, and chat

Work Log:
- Updated Prisma Ticket schema: Added pnrNumber, ticketDocument, boardingPoint, droppingPoint, seatClass, deckType, originalPrice, deliveryType, meetingPlace, courierName, deliverySpeed, deliveryChargePaidBy, deliveryCharge, sellerNotes, isConfirmed; Changed default status to 'pending_review'
- Updated Prisma Order schema: Added isQrScanned, clarified amount/totalAmount/platformFee fields for escrow logic
- Force-reset DB and pushed new schema
- Added ALL_BD_DISTRICTS (all 64), BUS_CLASSES (6), DECK_TYPES (2), COURIER_COMPANIES (6), DELIVERY_SPEEDS (2), DECK_REQUIRED_CLASSES constants
- Rewrote ticket creation API with comprehensive validation: KYC check, ticket type-dependent file validation, conditional delivery fields, platform fee calculation, seller confirmation checkboxes
- Rewrote ticket detail API with sensitive info hiding: PNR, document, seller name/phone hidden until purchase; hasPurchased/isSeller flags returned
- Rewrote orders API with escrow logic: Online Copy buyer pays full price (platform fee deducted from seller), Counter Copy buyer pays only platform fee; QR code generation for counter copy delivery; chat auto-creation on order
- Built comprehensive SellTicketPage: 6 sections (Ticket Info, Route, Class/Seat, Pricing, Delivery, Details), conditional UI (deck type for certain bus classes, delivery only for counter copy, PDF-only upload for online copy, image-only for counter copy), ticket preview, 3 agreement checkboxes
- Built TicketDetailsPage: blur/hide sensitive info until payment, escrow explanation (Online Copy vs Counter Copy), platform fee calculation, purchase flow with confirmation dialog, QR code display for counter copy, chat with seller after purchase
- Updated seed data for new ticket schema fields
- Lint passes, dev server running

Stage Summary:
- Complete ticket creation with all specified fields and conditional UI
- Sensitive info hidden/blurred until platform fee paid
- Platform fee: 2% min 20 BDT; Online Copy=full payment held in escrow; Counter Copy=platform fee only
- Escrow: Money held until travel date; refund if fraudulent; release after successful journey
- QR code generation for counter copy delivery verification (in-person and courier)
- Auto chat creation between buyer and seller on order
- Review system and E2E encrypted chat inbox remain as next priorities

---
Task ID: 4-a
Agent: main
Task: Fix Header component mobile responsiveness

Work Log:
- Read existing Header.tsx (619 lines) and identified all 6 issues
- Fixed logo area overflow on small screens: hidden slogan below 640px (`hidden sm:block`), smaller logo icon on mobile (`w-8 h-8 sm:w-9 sm:h-9`), smaller app name text (`text-sm sm:text-lg`), added `truncate` and `min-w-0` for graceful text truncation
- Ensured all interactive touch targets are minimum 44px on mobile:
  - Language switcher button: `min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0`
  - Theme toggle button: `min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0`
  - Mobile hamburger button: `min-h-[44px] min-w-[44px]`
  - MobileNavItem component: changed `py-2.5` to `py-3` and added `min-h-[44px]`
  - Mobile auth buttons (login/register): added `min-h-[44px]`
  - Mobile footer theme toggle buttons: `h-10 w-10 min-h-[44px] min-w-[44px]`
  - Mobile footer language button: `min-h-[44px]`
- Improved mobile menu sheet padding and spacing:
  - SheetHeader: `p-5 pb-3` (was `p-4 pb-2`), larger logo icon (`w-9 h-9`)
  - Mobile nav container: `px-3 py-2` (was `p-2`)
  - Mobile user info section: `px-5 py-4` (was `p-4`)
  - Section headers: `px-2 py-2 mt-1` (was `px-3 py-2 mt-2`)
  - Auth buttons section: `px-5 py-4 gap-3` (was `p-4 gap-2`)
  - Footer controls: `px-5 py-4 gap-3` (was `p-4`)
- Prevented horizontal overflow: added `overflow-hidden` to header container, `shrink-0` on right actions, `min-w-0` and `shrink-0 sm:shrink` on logo area
- Added `overflow-y-auto` and `custom-scrollbar` to SheetContent for better scrolling
- Reduced spacing between action buttons on mobile: `gap-1 sm:gap-2` (was `gap-2`)
- Reduced horizontal padding on mobile: `px-3 sm:px-4 lg:px-8` (was `px-4 lg:px-8`)
- Lint check passed for Header.tsx (pre-existing LoginPage.tsx error unrelated)

Stage Summary:
- All 6 mobile responsiveness issues fixed in Header.tsx
- Touch targets now meet 44px minimum on mobile across all interactive elements
- Logo text truncates gracefully on 375px screens with slogan hidden
- Mobile menu has better padding, spacing, and visual hierarchy
- No horizontal overflow on any screen size
- Desktop experience unchanged (all mobile classes use responsive prefixes)

---
Task ID: 4-b
Agent: main
Task: Fix LoginPage mobile responsiveness

Work Log:
- Read existing LoginPage.tsx (396 lines) and identified all 7 mobile responsiveness issues
- Fixed card overflow on 375px screens:
  - Outer container: `p-4` → `p-3 sm:p-4` (less padding on mobile)
  - Card wrapper: `w-full max-w-md` → `w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md mx-auto` (prevents overflow)
  - Card: added `overflow-hidden` to prevent any internal content overflow
- Fixed card internal padding for mobile:
  - CardHeader: added `px-4 sm:px-6` (reduced from default px-6 on mobile)
  - CardContent: added `px-4 sm:px-6` (reduced from default px-6 on mobile)
- Fixed input fields for mobile touch:
  - Identifier input: added `h-11` (44px height for touch target)
  - Password input: added `h-11` (44px height for touch target)
- Fixed OTP slots for mobile:
  - Each slot: `w-9 h-9` → `w-10 h-12 text-base` (40×48px, larger and easier to tap)
  - Split 6 slots into 2 groups of 3 for visual clarity (3+3 with gap separator)
  - Container gap: `gap-2` → `gap-1 sm:gap-2` (tighter on mobile to fit)
- Fixed Password/OTP mode toggle for mobile:
  - Toggle buttons: added `min-h-[44px]` for touch targets
  - Reduced gap on mobile: `gap-1.5 sm:gap-2` and `px-2 sm:px-3`
  - Added `py-2.5 sm:py-2` for slightly taller buttons on mobile
- Fixed show/hide password button for mobile:
  - Added `min-w-[44px] min-h-[44px] flex items-center justify-center p-1`
  - Changed from `right-3` to `right-2` to prevent overflow
- Fixed submit and Google buttons:
  - Submit button: added `h-11` (44px touch target)
  - Google button: added `h-11` (44px touch target)
- Fixed forgot password link for mobile:
  - Added `min-h-[36px] inline-flex items-center py-1`
  - Responsive text: `text-xs sm:text-sm`
- Fixed register link for mobile:
  - Added `min-h-[44px] inline-flex items-center px-1` for touch target
  - Increased margin: `mt-4` → `mt-5`
- Fixed JSX syntax error (missing closing brace in className template literal)
- Lint passes, dev server compiles successfully with 200 response

Stage Summary:
- All 7 mobile responsiveness issues fixed in LoginPage.tsx
- Card fits properly on 375px screens with no horizontal overflow
- All interactive elements meet 44px minimum touch target on mobile
- OTP slots are properly sized (40×48px) with 3+3 grouping
- Mode toggle buttons have proper mobile-friendly sizing
- Responsive padding (px-4 on mobile, px-6 on desktop)
- Desktop experience unchanged (all mobile classes use responsive prefixes)

---
Task ID: 4-d
Agent: main
Task: Fix KycPage mobile responsiveness

Work Log:
- Read KycPage.tsx (829 lines) and identified all 7 responsiveness issues
- Fixed container padding: changed `py-6 px-4` to `py-4 sm:py-6 px-3 sm:px-4 overflow-x-hidden`
- Fixed header section for mobile: smaller icon (`w-12 h-12 sm:w-14 sm:h-14`), smaller title (`text-xl sm:text-2xl`), reduced margins
- Fixed step indicator for mobile: added shortLabel for mobile (`Docs`/`Selfie`), hidden full label on mobile (`hidden sm:inline`), compact padding (`px-2.5 sm:px-4 py-1.5 sm:py-2`), shorter connector line (`w-4 sm:w-8`)
- Fixed card content padding: changed `p-6` to `p-3 sm:p-6`
- Fixed section headings: reduced to `text-sm sm:text-base` and `mb-2 sm:mb-3`
- Fixed all grid layouts to stack on mobile:
  - DOB/Gender: `grid-cols-1 sm:grid-cols-2`
  - Document Type/Number: `grid-cols-1 sm:grid-cols-2`
  - File uploads (Front/Back): `grid-cols-1 sm:grid-cols-2`
  - Division/District: `grid-cols-1 sm:grid-cols-2`
- Added h-11 minimum height to all input fields and select triggers (Name, DOB, Gender, Document Type, Document Number, House/Road, Upazila, Division, District, Postal Code)
- Fixed file upload areas for touch-friendliness:
  - Larger remove buttons (`w-8 h-8` with `touch-manipulation`)
  - `min-h-[44px]` on upload labels
  - Taller upload areas on desktop (`h-28 sm:h-32`)
- Fixed selfie pose selector for mobile:
  - Compact padding (`px-2.5 sm:px-3 py-2 sm:py-1.5`)
  - Touch-friendly minimum height (`min-h-[36px] sm:min-h-0`)
  - `touch-manipulation` for better tap response
  - Reduced gap (`gap-1.5 sm:gap-2`)
- Fixed GPS display for mobile: smaller text (`text-xs sm:text-sm`), compact padding (`p-2.5 sm:p-3`), `flex items-start` with `min-w-0` wrapper to prevent overflow
- Fixed captured photos grid: smaller thumbnails (`w-14 h-14 sm:w-16 sm:h-16`), reduced gap
- Fixed camera overlay for mobile: smaller face guide oval (`w-36 h-48 sm:w-48 sm:h-64`), compact pose label
- Fixed action buttons: added `min-h-[44px]` for touch targets, reduced gaps (`gap-2 sm:gap-3`), reduced icon margins (`mr-1 sm:mr-2`)
- Fixed instructions box: smaller padding (`p-3 sm:p-4`), smaller heading (`text-xs sm:text-sm`)
- Fixed camera area border radius: `rounded-lg sm:rounded-xl`
- Lint check passed for KycPage.tsx (pre-existing errors in LoginPage.tsx and TicketDetailsPage.tsx are unrelated)

Stage Summary:
- All 7 mobile responsiveness issues fixed in KycPage.tsx
- Container uses `px-3 sm:px-4` with `overflow-x-hidden` preventing horizontal scroll
- Step indicator shows short labels on mobile, full labels on sm+
- All grid layouts stack vertically on mobile (`grid-cols-1 sm:grid-cols-2`)
- All input fields and selects have `h-11` minimum height
- Touch targets meet 44px minimum (buttons, upload areas, pose selector)
- GPS display compact on mobile with text wrapping
- Camera overlay scales down gracefully on small screens
- Desktop experience fully preserved (all changes use responsive prefixes)

---
Task ID: 4-c
Agent: main
Task: Fix RegisterPage mobile responsiveness

Work Log:
- Read RegisterPage.tsx (889 lines) and identified all 7 mobile responsiveness issues
- Fixed outer wrapper and container for mobile-safe width:
  - Outer: `p-4` → `p-3 sm:p-4` (less padding on mobile)
  - Container: `w-full max-w-lg` → `w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg mx-auto` (prevents overflow on 375px)
- Fixed step indicator for mobile compactness:
  - Container: `gap-2 mb-6` → `gap-1 sm:gap-2 mb-4 sm:mb-6`
  - Pills: `gap-2 px-3` → `gap-1.5 sm:gap-2 px-2 sm:px-3` (compact on mobile)
  - Connectors: `w-8 mx-1` → `w-4 sm:w-8 mx-0.5 sm:mx-1` (shorter on mobile)
- Fixed Card internal padding for mobile:
  - Card: added `overflow-hidden`
  - CardHeader: added `px-4 sm:px-6`
  - CardContent: added `px-4 sm:px-6`
- Fixed Step 1 (Personal Info) for mobile:
  - Step container: added `[&_input]:h-11 [&_[data-slot=select-trigger]]:h-11 [&_[data-slot=select-trigger]]:w-full` (44px height for all inputs and select)
  - Gender & DOB grid: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` (stack on mobile)
  - Password strength criteria: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` (stack on mobile)
- Fixed Step 2 (Agreement) for mobile:
  - Summary section: `p-4` → `p-3 sm:p-4`, grid `grid-cols-2` → `grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2`
  - Email field: added `break-all` to prevent overflow on long emails
  - Agreement items: added `min-h-[44px]` for touch targets, `p-3 sm:p-4`, `shrink-0` on checkboxes
- Fixed Step 3 (OTP Verification) for mobile:
  - OTP sections: `p-4` → `p-3 sm:p-4`
  - Email/phone badges: added `max-w-[140px] truncate` to prevent overflow
  - OTP slots: added descendant selectors `[&_[data-slot=input-otp-slot]]:w-10 [&_[data-slot=input-otp-slot]]:h-12 [&_[data-slot=input-otp-slot]]:text-base` (40×48px minimum), with `sm:` variants for larger size
  - Verify/Resend button row: `flex-row` → `flex-col sm:flex-row` (stack on mobile), both buttons `h-11`
  - Send OTP buttons: added `h-11` for touch targets
  - Verification status: `gap-4` → `gap-3 sm:gap-4`
- Fixed action buttons and login link for mobile:
  - Back button: added `h-11`
  - Continue button: added `h-11`
  - Create Account button: added `h-11`
  - Login link button: added `min-h-[44px] min-w-[44px] inline-flex items-center justify-center`
- Lint check passed, dev server compiles successfully

Stage Summary:
- All 7 mobile responsiveness issues fixed in RegisterPage.tsx
- Card fits properly on 375px screens with no horizontal overflow
- All interactive elements meet 44px minimum touch target on mobile
- OTP slots are properly sized (40×48px minimum) with responsive scaling
- Gender/DOB and password criteria stack vertically on mobile
- Agreement checkboxes have proper touch targets with min-h-[44px]
- Badge text truncated on mobile to prevent overflow
- OTP verify/resend buttons stack vertically on mobile for easier tapping
- Desktop experience fully preserved (all changes use responsive prefixes)

---
Task ID: 4-e
Agent: mobile-responsiveness-agent
Task: Fix mobile responsiveness for DashboardPage, SearchPage, TicketDetailsPage, and AdminPage

Work Log:
- DashboardPage: Changed container to px-3 sm:px-4, wrapped TabsList in scrollable container with overflow-x-auto for mobile, added min-h-[44px] to all TabsTriggers for touch targets, added truncate/min-w-0 to profile email/name, made action buttons stack on mobile (flex-col sm:flex-row), made wallet button full-width on mobile, KYC benefits grid changed from grid-cols-3 to grid-cols-1 sm:grid-cols-3, settings SelectTrigger changed to w-full sm:w-28 h-11, settings CardContent changed to p-3 sm:p-6, added proper padding to wallet cards (p-3 sm:p-4) and text sizing (text-xs sm:text-sm, text-lg sm:text-xl)
- SearchPage: Changed container to px-3 sm:px-4, filter CardContent changed to p-3 sm:p-4, added h-11 w-full to all SelectTriggers and date Input for proper touch targets, reset button made full width with min-h-[44px], improved no-results state with Search icon and centered flex layout, ticket result cards changed to p-3 sm:p-4 with flex-wrap on key areas and min-h-[44px] on view details button
- TicketDetailsPage: Changed all 3 container instances to px-3 sm:px-4, added min-h-[44px] to back buttons and chat button, success header CardContent changed to p-4 sm:p-6, QR code CardContent changed to p-4 sm:p-6, QR code size made responsive (w-32 h-32 sm:w-40 sm:h-40), route from/to row made responsive with gap-2 sm:gap-4, min-w-0 and truncate on route names, chevron icon size responsive, date/time row made flex-wrap for mobile, seat info grid gap made responsive (gap-2 sm:gap-3), seat items padding responsive (p-2 sm:p-2.5), price CardContent changed to p-3 sm:p-6, escrow CardContent changed to p-3 sm:p-4, seller info avatar given shrink-0 and min-w-0 on name div, description CardContent changed to p-3 sm:p-4, purchase CardContent changed to p-3 sm:p-4, confirm dialog buttons changed to flex-col sm:flex-row with min-h-[44px], main purchase button changed to min-h-[48px], action buttons at bottom changed to min-h-[44px]
- AdminPage: Changed container to px-3 sm:px-4, wrapped TabsList in scrollable container with overflow-x-auto, added min-h-[44px] to all TabsTriggers, stat cards grid gap changed to gap-3 sm:gap-4, stat card content padding responsive (p-3 sm:p-4), icon and text sizes responsive, table container improved with -mx-3 px-3 sm:mx-0 sm:px-0 for mobile scroll, table cells given whitespace-nowrap, KYC pending items changed to flex-col sm:flex-row on mobile with gap-3, buttons given min-h-[44px], settings CardContent changed to p-3 sm:p-6, Input fields given h-11, save button made full-width on mobile with min-h-[44px]
- Lint passes with no errors, dev server running successfully

Stage Summary:
- All 4 pages fully responsive for 375px mobile screens
- Consistent px-3 sm:px-4 container padding across all pages
- All interactive elements meet 44px minimum touch target
- All input fields meet h-11 minimum height
- All card content uses responsive padding (p-3 sm:p-4 or p-3 sm:p-6)
- Tabs lists are horizontally scrollable on mobile
- Tables are horizontally scrollable on mobile
- No horizontal overflow on 375px screens
- Desktop experience fully preserved via responsive prefixes

---
Task ID: qa-mobile-fixes
Agent: main
Task: QA Testing, Fix Sell Ticket Page KYC Gate, and Mobile Responsive Design

Work Log:
- QA tested the sell ticket page - found it was not checking KYC verification on frontend
- Added KYC verification gate to SellTicketPage: Auth gate (login required) + KYC gate (verification required)
- KYC gate shows different states: none (start KYC), pending (under review), rejected (resubmit), approved (show form)
- Added useEffect to fetch user profile and KYC status on mount
- Added verified seller benefits list in KYC gate card
- Fixed Header mobile responsive: touch targets 44px, compact logo, better mobile menu spacing
- Fixed LoginPage mobile responsive: card width, input heights h-11, OTP slots w-10 h-12, touch-friendly buttons
- Fixed RegisterPage mobile responsive: step indicator compact, grid-cols-1 sm:grid-cols-2, h-11 inputs
- Fixed KycPage mobile responsive: stacked grids, compact step labels, touch-friendly upload/selfie areas
- Fixed DashboardPage mobile responsive: scrollable tabs, stacked cards, responsive wallet/settings
- Fixed SearchPage mobile responsive: stacked filters, responsive ticket cards, improved no-results state
- Fixed TicketDetailsPage mobile responsive: stacked layout, responsive QR code, touch-friendly buttons
- Fixed AdminPage mobile responsive: scrollable tabs, mobile table scroll, stacked KYC items
- All lint checks pass
- API testing confirmed: KYC gate works on backend (403 for unverified), all auth APIs work correctly
- Memory constraints in sandbox cause server instability when compiling multiple routes

Stage Summary:
- SellTicketPage now has proper KYC verification gate (auth + KYC check before showing form)
- All pages now have mobile-responsive designs with proper touch targets, stacked layouts, and no horizontal overflow
- Backend already had KYC check on ticket creation API (returns 403)
- Full i18n support maintained for all changes
