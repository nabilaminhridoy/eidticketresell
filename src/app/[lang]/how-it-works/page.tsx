'use client';
import dynamic from 'next/dynamic';
const HowItWorksPage = dynamic(() => import('@/components/pages/HowItWorksPage'), { ssr: false });
export default function HowItWorksRoute() {
  return <HowItWorksPage />;
}
