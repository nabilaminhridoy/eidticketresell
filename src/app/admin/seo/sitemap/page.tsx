'use client';
import dynamic from 'next/dynamic';
const AdminSeoPage = dynamic(() => import('@/components/admin/AdminSeoPage'), { ssr: false });
export default function Page() { return <AdminSeoPage section="sitemap" />; }
