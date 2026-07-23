'use client';
import dynamic from 'next/dynamic';
const AdminTicketsPage = dynamic(() => import('@/components/admin/AdminTicketsPage'), { ssr: false });
export default function TicketsPage() { return <AdminTicketsPage />; }
