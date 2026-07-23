'use client';
import dynamic from 'next/dynamic';
const AdminVerifyTicketPage = dynamic(() => import('@/components/admin/AdminVerifyTicketPage'), { ssr: false });
export default function Page() { return <AdminVerifyTicketPage section="fraud-reports" />; }
