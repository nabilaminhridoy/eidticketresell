'use client';
import dynamic from 'next/dynamic';
const AdminSettingsGeneralPage = dynamic(() => import('@/components/admin/AdminSettingsGeneralPage'), { ssr: false });
export default function Page() { return <AdminSettingsGeneralPage section="localization" />; }
