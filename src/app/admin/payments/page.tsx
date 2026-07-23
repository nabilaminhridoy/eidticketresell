'use client';
import dynamic from 'next/dynamic';
const AdminPaymentsPage = dynamic(() => import('@/components/admin/AdminPaymentsPage'), { ssr: false });
export default function PaymentsPage() { return <AdminPaymentsPage />; }
