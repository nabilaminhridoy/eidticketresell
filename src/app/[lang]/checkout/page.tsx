'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const CheckoutPage = dynamic(() => import('@/components/pages/CheckoutPage'), { ssr: false });

export default function CheckoutRoute() {
  return (
    <Suspense>
      <CheckoutPage />
    </Suspense>
  );
}
