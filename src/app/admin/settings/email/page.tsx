'use client';
import dynamic from 'next/dynamic';
const AdminSettingsEmailPage = dynamic(() => import('@/components/admin/AdminSettingsEmailPage'), { ssr: false });
export default function Page() { return <AdminSettingsEmailPage section="smtp" />; }
