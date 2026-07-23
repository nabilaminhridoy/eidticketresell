'use client';
import dynamic from 'next/dynamic';
const SafetyGuidelinesPage = dynamic(() => import('@/components/pages/SafetyGuidelinesPage'), { ssr: false });
export default function SafetyGuidelinesRoute() {
  return <SafetyGuidelinesPage />;
}
