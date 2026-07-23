'use client';
import dynamic from 'next/dynamic';
const AdminUsersPage = dynamic(() => import('@/components/admin/AdminUsersPage'), { ssr: false });
export default function UsersPage() { return <AdminUsersPage />; }
