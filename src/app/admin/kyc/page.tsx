'use client';
import dynamic from 'next/dynamic';
const AdminKycPage = dynamic(() => import('@/components/admin/AdminKycPage'), { ssr: false });
export default function KycPage() { return <AdminKycPage />; }
