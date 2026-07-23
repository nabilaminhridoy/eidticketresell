'use client';
import dynamic from 'next/dynamic';
const ContactUsPage = dynamic(() => import('@/components/pages/ContactUsPage'), { ssr: false });
export default function ContactUsRoute() {
  return <ContactUsPage />;
}
