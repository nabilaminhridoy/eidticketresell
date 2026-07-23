import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LANGS = ['en', 'bn'];
const DEFAULT_LANG = 'en';

// Known static route segments after /[lang]/
const KNOWN_STATIC_SEGMENTS = [
  'about-us',
  'blog',
  'buy-tickets',
  'checkout',
  'contact-us',
  'cookies-policy',
  'faqs',
  'how-it-works',
  'not-found',
  'payment-policy',
  'privacy-policy',
  'refund-policy',
  'safety-guidelines',
  'sell-tickets',
  'support',
  'terms-of-service',
  'verify-ticket',
  'account',
  'ticket',
  'order',
];

// Known username sub-route segments
const KNOWN_USER_SUB_SEGMENTS = [
  'dashboard',
  'my-tickets',
  'my-orders',
  'my-reviews',
  'transactions',
  'wallet',
  'withdraw-history',
  'kyc-verification',
  'security',
  'address',
  'message',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, _next
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Root "/" → redirect to /en/
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}`;
    return NextResponse.redirect(url);
  }

  // Check if first segment is a valid lang
  const segments = pathname.split('/');
  const firstSegment = segments[1];

  if (!VALID_LANGS.includes(firstSegment)) {
    // No lang prefix — redirect by prepending default lang
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Valid lang prefix — check if the path matches a known route
  // segments[0] = '', segments[1] = lang, segments[2] = route segment (or empty for home)
  const secondSegment = segments[2] || '';

  // Home page: /[lang]/ with no second segment
  if (!secondSegment) {
    return NextResponse.next();
  }

  // Check if it's a known static route
  if (KNOWN_STATIC_SEGMENTS.includes(secondSegment)) {
    return NextResponse.next();
  }

  // Check if it could be a username route: /[lang]/[username] or /[lang]/[username]/subroute
  // Username should look like a valid username: alphanumeric, underscores, reasonable length
  const isValidUsernamePattern = /^[a-zA-Z0-9_]{3,30}$/.test(secondSegment);

  if (isValidUsernamePattern) {
    // If there's a third segment, check it's a known username sub-route
    const thirdSegment = segments[3] || '';
    if (thirdSegment) {
      // For /username/wallet/balance, /username/wallet/payout-method patterns
      if (thirdSegment === 'wallet' && segments[4]) {
        const walletSub = segments[4];
        if (walletSub === 'balance' || walletSub === 'payout-method') {
          return NextResponse.next();
        }
        // Unknown wallet sub-route → 404
        const url = request.nextUrl.clone();
        url.pathname = `/${firstSegment}/not-found`;
        return NextResponse.redirect(url);
      }
      if (KNOWN_USER_SUB_SEGMENTS.includes(thirdSegment)) {
        return NextResponse.next();
      }
      // Unknown sub-route after username → 404
      const url = request.nextUrl.clone();
      url.pathname = `/${firstSegment}/not-found`;
      return NextResponse.redirect(url);
    }
    // Just /[lang]/[username] — could be a valid username profile page
    return NextResponse.next();
  }

  // Path doesn't match any known route pattern → redirect to 404
  const url = request.nextUrl.clone();
  url.pathname = `/${firstSegment}/not-found`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|favicon\\.ico|logo\\.svg|.*\\..*).*)'],
};
