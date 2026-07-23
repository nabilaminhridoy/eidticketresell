'use client';
import dynamic from 'next/dynamic';
const AdminRefundsPage = dynamic(() => import('@/components/admin/AdminRefundsPage'), { ssr: false });
export default function RefundsPage() { return <AdminRefundsPage />; }
