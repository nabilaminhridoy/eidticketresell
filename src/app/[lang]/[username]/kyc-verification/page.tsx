'use client';
import KycPage from '@/components/pages/KycPage';
import { use } from 'react';

export default function KycVerificationRoute({ params }: { params: Promise<{ username: string; lang: string }> }) {
  const { username } = use(params);
  return <KycPage username={username} />;
}
