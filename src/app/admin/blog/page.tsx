'use client';
import dynamic from 'next/dynamic';
const AdminBlogPage = dynamic(() => import('@/components/admin/AdminBlogPage'), { ssr: false });
export default function Page() { return <AdminBlogPage />; }
