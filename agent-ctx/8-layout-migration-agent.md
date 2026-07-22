# Task 8 - Layout Migration Agent

## Task
Migrate layout components (AppShell, Header, Footer) from zustand store navigation to URL-based routing

## Summary of Changes

### AppShell.tsx
- Removed `useAppStore` import, added `usePathname` from `next/navigation`
- Replaced `const { currentPage } = useAppStore()` with `const pathname = usePathname()`
- Changed scroll-to-top useEffect dependency from `[currentPage]` to `[pathname]`

### Header.tsx
- Removed `useAppStore` import, added `useNav` from `@/lib/use-nav`, `usePathname`/`useRouter` from `next/navigation`, `getPagePath` from `@/lib/navigation`
- Removed `Page` type alias (was derived from useAppStore)
- Replaced `const { currentPage, navigate } = useAppStore()` with `const { navigate } = useNav()`, `const pathname = usePathname()`, `const router = useRouter()`
- Replaced `isActive(page)` from `currentPage === page` to pathname-based comparison using `getPagePath(language, page)`, with special handling for transport pages using `pathname.startsWith()`
- Replaced `toggleLanguage` with `switchLanguage` that also navigates to the new language URL
- Updated Buy Tickets dropdown trigger active state from array inclusion check to pathname startsWith
- Removed `Page` type cast in `handleNavigate`

### Footer.tsx
- Removed `useAppStore` import, added `useNav` from `@/lib/use-nav`
- Replaced `const { navigate } = useAppStore()` with `const { navigate } = useNav()`

## Lint Result
0 errors, 0 warnings
