'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
const AdminPagesPage = dynamic(() => import('@/components/admin/AdminPagesPage'), { ssr: false });
export default function Page({ params }: { params: Promise<{ pageSlug: string }> }) {
  const { pageSlug } = use(params);
  return <AdminPagesPage pageSlug={pageSlug} />;
}
