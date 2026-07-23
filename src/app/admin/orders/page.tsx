'use client';
import dynamic from 'next/dynamic';
const AdminOrdersPage = dynamic(() => import('@/components/admin/AdminOrdersPage'), { ssr: false });
export default function OrdersPage() { return <AdminOrdersPage />; }
