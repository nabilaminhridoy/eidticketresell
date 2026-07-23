'use client';
import dynamic from 'next/dynamic';
const AdminSystemPage = dynamic(() => import('@/components/admin/AdminSystemPage'), { ssr: false });
export default function Page() { return <AdminSystemPage section="backups" />; }
