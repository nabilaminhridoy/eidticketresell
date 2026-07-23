'use client';
import dynamic from 'next/dynamic';
const AdminPayoutPage = dynamic(() => import('@/components/admin/AdminPayoutPage'), { ssr: false });
export default function PayoutWithdrawsPage() { return <AdminPayoutPage />; }
