import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LANGS = ['en', 'bn'];
const DEFAULT_LANG = 'en';

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

  if (VALID_LANGS.includes(firstSegment)) {
    return NextResponse.next();
  }

  // No lang prefix — redirect by prepending default lang
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LANG}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|favicon\\.ico|logo\\.svg|.*\\..*).*)'],
};
