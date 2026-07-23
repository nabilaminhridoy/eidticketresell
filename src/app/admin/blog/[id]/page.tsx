'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
const AdminBlogPage = dynamic(() => import('@/components/admin/AdminBlogPage'), { ssr: false });
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminBlogPage action="view" itemId={id} />;
}
