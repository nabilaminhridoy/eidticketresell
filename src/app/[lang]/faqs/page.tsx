'use client';
import dynamic from 'next/dynamic';
const FaqsPage = dynamic(() => import('@/components/pages/FaqsPage'), { ssr: false });
export default function FaqsRoute() {
  return <FaqsPage />;
}
