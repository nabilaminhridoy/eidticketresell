# Task 7: Migrate Page Components to URL-Based Routing

## Summary
Migrated 8 page components from zustand store navigation (`useAppStore`) to URL-based routing using `useNav()` hook and Next.js router primitives.

## Files Modified

### 1. SearchPage.tsx
- Removed `import { useAppStore } from '@/lib/store'`
- Added `import { useNav } from '@/lib/use-nav'` and `import { useSearchParams } from 'next/navigation'`
- Replaced `const { navigate, pageParams } = useAppStore()` with `const { navigate } = useNav()` + `const searchParams = useSearchParams()`
- Changed `pageParams.from` → `searchParams.get('from')`
- Changed `pageParams.to` → `searchParams.get('to')`
- Changed `pageParams.transportType` → `searchParams.get('transport')`

### 2. TicketDetailsPage.tsx
- Removed `useAppStore` import, kept `useAuthStore`
- Added `import { useNav } from '@/lib/use-nav'`
- Changed signature to `TicketDetailsPage({ ticketId }: { ticketId?: string })`
- Replaced `const { navigate, pageParams } = useAppStore()` with `const { navigate } = useNav()`
- Replaced `pageParams.id` → `ticketId` in 3 locations (guard, fetch URL, useCallback deps)

### 3. LoginPage.tsx
- Removed `useAppStore` from combined import
- Added `import { useNav } from '@/lib/use-nav'`
- Replaced `useAppStore().navigate` with `useNav().navigate`

### 4. RegisterPage.tsx
- Same as LoginPage - replaced useAppStore with useNav

### 5. SellTicketPage.tsx
- Same as LoginPage - replaced useAppStore with useNav

### 6. KycPage.tsx
- Same as LoginPage - replaced useAppStore with useNav

### 7. DashboardPage.tsx
- Added `useNav` import
- Added props: `{ tab = 'overview', username }: { tab?: string; username?: string }`
- Changed `<Tabs defaultValue="overview">` → `<Tabs defaultValue={tab}>`
- Replaced `useAppStore().navigate` with `useNav().navigate`

### 8. InfoPage.tsx
- Removed `import { useAppStore } from '@/lib/store'`
- Added `{ section, slug }` props to component signature
- Replaced `useAppStore().currentPage` with `section` prop
- Changed `sections[currentPage]` → `sections[section]`
- Changed `switch(currentPage)` → `switch(section)`
- Did NOT add useNav import (navigate is not used in this component)

### 9. AdminPage.tsx
- No changes needed (does not use useAppStore for navigation)

## Verification
- ESLint: 0 errors, 0 warnings
- No `useAppStore` references remain in any page component
- All `navigate()` call signatures preserved: `navigate('page-name', { param: 'value' })`
