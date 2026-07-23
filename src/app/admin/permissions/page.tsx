'use client';
import dynamic from 'next/dynamic';
const AdminRolesPage = dynamic(() => import('@/components/admin/AdminRolesPage'), { ssr: false });
export default function Page() { return <AdminRolesPage section="permissions" />; }
