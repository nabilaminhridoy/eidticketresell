'use client';
import dynamic from 'next/dynamic';
const AdminMediaPage = dynamic(() => import('@/components/admin/AdminMediaPage'), { ssr: false });
export default function Page() { return <AdminMediaPage section="folders" />; }
