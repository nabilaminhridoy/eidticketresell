'use client';
import dynamic from 'next/dynamic';
const AdminAnalyticsPage = dynamic(() => import('@/components/admin/AdminAnalyticsPage'), { ssr: false });
export default function Page() { return <AdminAnalyticsPage />; }
