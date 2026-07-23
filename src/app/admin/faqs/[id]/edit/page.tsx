'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
const AdminFaqsPage = dynamic(() => import('@/components/admin/AdminFaqsPage'), { ssr: false });
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminFaqsPage action="edit" itemId={id} />;
}
