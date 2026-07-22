import type { Language } from './i18n';

export function localizedPath(lang: Language, path: string): string {
  return `/${lang}${path}`;
}

export function getPagePath(lang: Language, page: string, params?: Record<string, string>): string {
  switch (page) {
    case 'home':                    return `/${lang}`;
    case 'search':                  return params?.transportType ? `/${lang}/buy-tickets?transport=${params.transportType}` : `/${lang}/buy-tickets`;
    case 'bus':                     return `/${lang}/buy-tickets?transport=bus`;
    case 'train':                   return `/${lang}/buy-tickets?transport=train`;
    case 'flight':                  return `/${lang}/buy-tickets?transport=flight`;
    case 'launch':                  return `/${lang}/buy-tickets?transport=launch`;
    case 'sell-ticket':             return `/${lang}/sell-tickets`;
    case 'ticket-details':          return params?.id ? `/${lang}/ticket/${params.id}` : `/${lang}/buy-tickets`;
    case 'how-it-works':            return `/${lang}/how-it-works`;
    case 'safety-guidelines':       return `/${lang}/safety-guidelines`;
    case 'faq':                     return `/${lang}/faqs`;
    case 'blog':                    return params?.slug ? `/${lang}/blog/${params.slug}` : `/${lang}/blog`;
    case 'about':                   return `/${lang}/about-us`;
    case 'contact':                 return `/${lang}/contact-us`;
    case 'support':                 return `/${lang}/support`;
    case 'terms':                   return `/${lang}/terms-of-service`;
    case 'privacy':                 return `/${lang}/privacy-policy`;
    case 'refund':                  return `/${lang}/refund-policy`;
    case 'payment-policy':          return `/${lang}/payment-policy`;
    case 'cookies-policy':          return `/${lang}/cookies-policy`;
    case 'verify-ticket':           return `/${lang}/verify-ticket`;
    case 'checkout':                return `/${lang}/checkout`;
    case 'order-successful':        return `/${lang}/order/successful`;
    case 'order-cancelled':         return `/${lang}/order/cancelled`;
    case 'order-failed':            return `/${lang}/order/failed`;
    case 'order-pending':           return `/${lang}/order/pending`;
    case 'login':                   return `/${lang}/account/login`;
    case 'register':                return `/${lang}/account/register`;
    case 'forgot-password':         return `/${lang}/account/forget-password`;
    case 'reset-password':          return `/${lang}/account/reset-password`;
    case 'verify-otp':              return `/${lang}/account/verify-otp`;
    case 'profile':                 return params?.username ? `/${lang}/${params.username}` : `/${lang}`;
    case 'dashboard':               return params?.username ? `/${lang}/${params.username}/dashboard` : `/${lang}`;
    case 'my-tickets':              return params?.username ? `/${lang}/${params.username}/my-tickets` : `/${lang}`;
    case 'my-orders':               return params?.username ? `/${lang}/${params.username}/my-orders` : `/${lang}`;
    case 'wallet':                  return params?.username ? `/${lang}/${params.username}/wallet` : `/${lang}`;
    case 'wallet-balance':          return params?.username ? `/${lang}/${params.username}/wallet/balance` : `/${lang}`;
    case 'wallet-payout':           return params?.username ? `/${lang}/${params.username}/wallet/payout-method` : `/${lang}`;
    case 'withdraw-history':        return params?.username ? `/${lang}/${params.username}/withdraw-history` : `/${lang}`;
    case 'transactions':            return params?.username ? `/${lang}/${params.username}/transactions` : `/${lang}`;
    case 'reviews':                 return params?.username ? `/${lang}/${params.username}/my-reviews` : `/${lang}`;
    case 'address':                 return params?.username ? `/${lang}/${params.username}/address` : `/${lang}`;
    case 'message':                 return params?.username ? `/${lang}/${params.username}/message` : `/${lang}/support`;
    case 'kyc':                     return params?.username ? `/${lang}/${params.username}/kyc-verification` : `/${lang}`;
    case 'settings':                return params?.username ? `/${lang}/${params.username}/dashboard` : `/${lang}`;
    case 'security':                return params?.username ? `/${lang}/${params.username}/security` : `/${lang}`;
    case 'notifications':           return params?.username ? `/${lang}/${params.username}/dashboard` : `/${lang}`;
    case 'chat':                    return params?.username ? `/${lang}/${params.username}/message` : `/${lang}/support`;
    case 'admin':                   return `/${lang}/admin`;
    default:                        return `/${lang}`;
  }
}
