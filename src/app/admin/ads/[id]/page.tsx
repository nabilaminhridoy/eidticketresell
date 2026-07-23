'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
const AdminAdsPage = dynamic(() => import('@/components/admin/AdminAdsPage'), { ssr: false });
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminAdsPage action="view" itemId={id} />;
}
