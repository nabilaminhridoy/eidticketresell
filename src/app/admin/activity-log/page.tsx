'use client';
import dynamic from 'next/dynamic';
const AdminActivityLogPage = dynamic(() => import('@/components/admin/AdminActivityLogPage'), { ssr: false });
export default function Page() { return <AdminActivityLogPage />; }
