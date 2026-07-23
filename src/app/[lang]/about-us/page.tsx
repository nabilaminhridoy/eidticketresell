'use client';
import dynamic from 'next/dynamic';
const AboutUsPage = dynamic(() => import('@/components/pages/AboutUsPage'), { ssr: false });
export default function AboutUsRoute() {
  return <AboutUsPage />;
}
