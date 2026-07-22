'use client';
import DashboardPage from '@/components/pages/DashboardPage';
import { use } from 'react';

export default function AddressRoute({ params }: { params: Promise<{ username: string; lang: string }> }) {
  const { username } = use(params);
  return <DashboardPage tab="address" username={username} />;
}
