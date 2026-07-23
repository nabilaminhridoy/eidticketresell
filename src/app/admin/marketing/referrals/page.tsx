'use client';
import dynamic from 'next/dynamic';
const AdminMarketingPage = dynamic(() => import('@/components/admin/AdminMarketingPage'), { ssr: false });
export default function Page() { return <AdminMarketingPage section="referrals" />; }
