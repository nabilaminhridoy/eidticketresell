'use client';
import dynamic from 'next/dynamic';
const TermsOfServicePage = dynamic(() => import('@/components/pages/TermsOfServicePage'), { ssr: false });
export default function TermsOfServiceRoute() {
  return <TermsOfServicePage />;
}
