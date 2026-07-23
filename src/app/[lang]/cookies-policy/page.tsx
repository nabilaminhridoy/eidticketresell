'use client';
import dynamic from 'next/dynamic';
const CookiesPolicyPage = dynamic(() => import('@/components/pages/CookiesPolicyPage'), { ssr: false });
export default function CookiesPolicyRoute() {
  return <CookiesPolicyPage />;
}
