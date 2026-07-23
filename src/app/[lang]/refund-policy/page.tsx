'use client';
import dynamic from 'next/dynamic';
const RefundPolicyPage = dynamic(() => import('@/components/pages/RefundPolicyPage'), { ssr: false });
export default function RefundPolicyRoute() {
  return <RefundPolicyPage />;
}
