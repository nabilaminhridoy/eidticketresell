'use client';
import dynamic from 'next/dynamic';
const PaymentPolicyPage = dynamic(() => import('@/components/pages/PaymentPolicyPage'), { ssr: false });
export default function PaymentPolicyRoute() {
  return <PaymentPolicyPage />;
}
