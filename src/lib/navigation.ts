import type { Language } from './i18n';

export function localizedPath(lang: Language, path: string): string {
  return `/${lang}${path}`;
}

/**
 * Build a query string from a params object, excluding certain keys
 * that are already part of the URL path (like id, slug, username, transportType).
 */
function buildQueryString(params: Record<string, string>, excludeKeys: string[] = []): string {
  const queryParams = Object.entries(params)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return queryParams ? `?${queryParams}` : '';
}

export function getPagePath(lang: Language, page: string, params?: Record<string, string>): string {
  const p = params || {};

  switch (page) {
    // ─── Public Pages ────────────────────────────
    case 'home':
      return `/${lang}`;
    case 'search':
      return `/${lang}/buy-tickets${buildQueryString(p, [])}`;
    case 'bus':
      return `/${lang}/buy-tickets?transport=bus${buildQueryString(p, ['transport']).replace('?', '&')}`;
    case 'train':
      return `/${lang}/buy-tickets?transport=train${buildQueryString(p, ['transport']).replace('?', '&')}`;
    case 'flight':
      return `/${lang}/buy-tickets?transport=flight${buildQueryString(p, ['transport']).replace('?', '&')}`;
    case 'launch':
      return `/${lang}/buy-tickets?transport=launch${buildQueryString(p, ['transport']).replace('?', '&')}`;
    case 'sell-ticket':
      return `/${lang}/sell-tickets`;
    case 'ticket-details':
      return p.id ? `/${lang}/ticket/${p.id}` : `/${lang}/buy-tickets`;
    case 'how-it-works':
      return `/${lang}/how-it-works`;
    case 'safety-guidelines':
      return `/${lang}/safety-guidelines`;
    case 'faq':
      return `/${lang}/faqs`;
    case 'blog':
      return p.slug ? `/${lang}/blog/${p.slug}` : `/${lang}/blog`;
    case 'about':
      return `/${lang}/about-us`;
    case 'contact':
      return `/${lang}/contact-us`;
    case 'support':
      return `/${lang}/support`;
    case 'terms':
      return `/${lang}/terms-of-service`;
    case 'privacy':
      return `/${lang}/privacy-policy`;
    case 'refund':
      return `/${lang}/refund-policy`;
    case 'payment-policy':
      return `/${lang}/payment-policy`;
    case 'cookies-policy':
      return `/${lang}/cookies-policy`;
    case 'verify-ticket':
      return `/${lang}/verify-ticket`;
    case 'checkout':
      return p.ticketId ? `/${lang}/checkout?ticketId=${p.ticketId}` : `/${lang}/checkout`;
    case 'order-successful':
      return `/${lang}/order/successful`;
    case 'order-cancelled':
      return `/${lang}/order/cancelled`;
    case 'order-failed':
      return `/${lang}/order/failed`;
    case 'order-pending':
      return `/${lang}/order/pending`;

    // ─── User Authentication ─────────────────────
    case 'login':
      return `/${lang}/account/login`;
    case 'register':
      return `/${lang}/account/register`;
    case 'forgot-password':
      return `/${lang}/account/forget-password`;
    case 'reset-password':
      return `/${lang}/account/reset-password`;
    case 'verify-otp':
      return `/${lang}/account/verify-otp`;

    // ─── Buyer/Seller Panel ──────────────────────
    case 'profile':
      return p.username ? `/${lang}/${p.username}` : `/${lang}`;
    case 'dashboard':
      return p.username ? `/${lang}/${p.username}/dashboard` : `/${lang}`;
    case 'my-tickets':
      return p.username ? `/${lang}/${p.username}/my-tickets` : `/${lang}`;
    case 'my-orders':
      return p.username ? `/${lang}/${p.username}/my-orders${buildQueryString(p, ['username'])}` : `/${lang}`;
    case 'wallet':
      return p.username ? `/${lang}/${p.username}/wallet` : `/${lang}`;
    case 'wallet-balance':
      return p.username ? `/${lang}/${p.username}/wallet/balance` : `/${lang}`;
    case 'wallet-payout':
      return p.username ? `/${lang}/${p.username}/wallet/payout-method${buildQueryString(p, ['username'])}` : `/${lang}`;
    case 'withdraw-history':
      return p.username ? `/${lang}/${p.username}/withdraw-history` : `/${lang}`;
    case 'transactions':
      return p.username ? `/${lang}/${p.username}/transactions` : `/${lang}`;
    case 'reviews':
      return p.username ? `/${lang}/${p.username}/my-reviews` : `/${lang}`;
    case 'address':
      return p.username ? `/${lang}/${p.username}/address` : `/${lang}`;
    case 'message':
      return p.username ? `/${lang}/${p.username}/message${buildQueryString(p, ['username'])}` : `/${lang}/support`;
    case 'kyc':
      return p.username ? `/${lang}/${p.username}/kyc-verification` : `/${lang}`;
    case 'ekyc-verification':
      return p.username ? `/${lang}/${p.username}/ekyc-verification` : `/${lang}`;
    case 'settings':
      return p.username ? `/${lang}/${p.username}/dashboard` : `/${lang}`;
    case 'security':
      return p.username ? `/${lang}/${p.username}/security` : `/${lang}`;
    case 'notifications':
      return p.username ? `/${lang}/${p.username}/dashboard` : `/${lang}`;
    case 'chat':
      return p.username ? `/${lang}/${p.username}/message${buildQueryString(p, ['username'])}` : `/${lang}/support`;
    case 'qr-display':
      return p.username ? `/${lang}/${p.username}/qr-display${buildQueryString(p, ['username'])}` : `/${lang}`;
    case 'qr-scan':
      return p.username ? `/${lang}/${p.username}/qr-scan${buildQueryString(p, ['username'])}` : `/${lang}`;
    case 'journey-verify':
      return p.username ? `/${lang}/${p.username}/journey-verify${buildQueryString(p, ['username'])}` : `/${lang}`;
    case 'logout':
      return p.username ? `/${lang}/${p.username}/logout` : `/${lang}`;

    // ─── Admin ───────────────────────────────────
    case 'admin':
      return `/${lang}/admin`;

    default:
      return `/${lang}`;
  }
}
