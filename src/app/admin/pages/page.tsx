'use client';
import dynamic from 'next/dynamic';
const AdminPagesPage = dynamic(() => import('@/components/admin/AdminPagesPage'), { ssr: false });
export default function Page() { return <AdminPagesPage />; }
