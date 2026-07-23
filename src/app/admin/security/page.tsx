'use client';
import dynamic from 'next/dynamic';
const AdminSecurityPage = dynamic(() => import('@/components/admin/AdminSecurityPage'), { ssr: false });
export default function Page() { return <AdminSecurityPage />; }
