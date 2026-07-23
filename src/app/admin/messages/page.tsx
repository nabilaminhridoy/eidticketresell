'use client';
import dynamic from 'next/dynamic';
const AdminMessagesPage = dynamic(() => import('@/components/admin/AdminMessagesPage'), { ssr: false });
export default function MessagesPage() { return <AdminMessagesPage />; }
