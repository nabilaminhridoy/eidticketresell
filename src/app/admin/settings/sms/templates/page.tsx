'use client';
import dynamic from 'next/dynamic';
const AdminSettingsSmsPage = dynamic(() => import('@/components/admin/AdminSettingsSmsPage'), { ssr: false });
export default function Page() { return <AdminSettingsSmsPage section="templates" />; }
