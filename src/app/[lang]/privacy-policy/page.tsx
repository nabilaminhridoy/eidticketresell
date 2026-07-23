'use client';
import dynamic from 'next/dynamic';
const PrivacyPolicyPage = dynamic(() => import('@/components/pages/PrivacyPolicyPage'), { ssr: false });
export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage />;
}
