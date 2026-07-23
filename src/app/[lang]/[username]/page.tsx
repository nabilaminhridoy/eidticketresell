'use client';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { use } from 'react';
import dynamic from 'next/dynamic';

const DashboardPage = dynamic(() => import('@/components/pages/DashboardPage'), { ssr: false });
const NotFoundPage = dynamic(() => import('@/app/[lang]/404/not-found-client').then(m => ({ default: m.default })), { ssr: false });

export default function UserProfileRoute({ params }: { params: Promise<{ username: string; lang: string }> }) {
  const { username } = use(params);
  const { token } = useAuthStore();
  const { language } = useLanguageStore();

  // If user is not authenticated, show 404 instead of redirecting to login
  // This prevents wrong URLs from redirecting to login page
  if (!token) {
    return <NotFoundPage />;
  }

  return <DashboardPage tab="profile" username={username} />;
}
