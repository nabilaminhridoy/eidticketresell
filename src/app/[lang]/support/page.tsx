'use client';
import dynamic from 'next/dynamic';

const SupportPage = dynamic(() => import('@/components/pages/SupportPage'), { ssr: false });

export default function SupportPageRoute() {
  return <SupportPage />;
}
