'use client';
import dynamic from 'next/dynamic';
const AdminAdsPage = dynamic(() => import('@/components/admin/AdminAdsPage'), { ssr: false });
export default function Page() { return <AdminAdsPage />; }
