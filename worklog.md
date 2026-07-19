---
Task ID: 1
Agent: Main Agent
Task: QC testing all pages, remove Google login option

Work Log:
- Explored full project structure: 9 page components, 19 API routes, 48 UI components
- QC'd each page: LoginPage, RegisterPage, SearchPage, SellTicketPage, DashboardPage, TicketDetailsPage, KycPage, InfoPage, AdminPage
- Found and fixed bugs:
  1. LoginPage: Removed Google login button and "Or login with" divider
  2. LoginPage: Fixed resend timer bug (useState → useEffect for interval cleanup)
  3. SearchPage: Fixed loading state never showing (refactored to use useCallback + fetchIdRef pattern)
  4. SellTicketPage: Fixed operator precedence bug in error message (added parentheses)
  5. i18n.ts: Removed googleLogin and orLoginWith translation keys from both EN and BN
- Ran lint check: all passing with 0 errors
- Verified with Agent Browser: All pages pass QA on both desktop and mobile viewports

Stage Summary:
- Google login fully removed from LoginPage (button, divider, SVG, i18n keys)
- All pages render correctly on desktop (1920×1080) and mobile (375×812)
- Login OTP/Password toggle works correctly
- Mobile hamburger menu, language switcher, and theme toggle all functional
- Search page now shows proper loading spinner during data fetch
- No blocking issues found
