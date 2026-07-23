'use client';
import dynamic from 'next/dynamic';
const AdminSettingsPaymentsPage = dynamic(() => import('@/components/admin/AdminSettingsPaymentsPage'), { ssr: false });
export default function Page() { return <AdminSettingsPaymentsPage section="platform-fee" />; }
