'use client';
import dynamic from 'next/dynamic';
const AdminAdminsPage = dynamic(() => import('@/components/admin/AdminAdminsPage'), { ssr: false });
export default function Page() { return <AdminAdminsPage />; }
