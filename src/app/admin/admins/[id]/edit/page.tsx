'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
const AdminAdminsPage = dynamic(() => import('@/components/admin/AdminAdminsPage'), { ssr: false });
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminAdminsPage action="edit" itemId={id} />;
}
