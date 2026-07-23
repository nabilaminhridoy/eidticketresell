'use client';
import dynamic from 'next/dynamic';
const AdminJourneyVerifyPage = dynamic(() => import('@/components/admin/AdminJourneyVerifyPage'), { ssr: false });
export default function JourneyVerifyPage() {
  return <AdminJourneyVerifyPage />;
}
