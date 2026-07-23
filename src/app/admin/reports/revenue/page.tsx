'use client';
import dynamic from 'next/dynamic';
const AdminReportsPage = dynamic(() => import('@/components/admin/AdminReportsPage'), { ssr: false });
export default function Page() { return <AdminReportsPage section="revenue" />; }
