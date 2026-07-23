'use client';
import dynamic from 'next/dynamic';
const AdminFaqsPage = dynamic(() => import('@/components/admin/AdminFaqsPage'), { ssr: false });
export default function Page() { return <AdminFaqsPage />; }
