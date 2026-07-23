'use client';
import dynamic from 'next/dynamic';
const AdminHomepagePage = dynamic(() => import('@/components/admin/AdminHomepagePage'), { ssr: false });
export default function Page() { return <AdminHomepagePage section="footer" />; }
