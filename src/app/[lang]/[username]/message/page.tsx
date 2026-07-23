'use client';
import dynamic from 'next/dynamic';
import { use } from 'react';
import { useAuthStore } from '@/lib/store';

const BuyerSellerChat = dynamic(() => import('@/components/chat/BuyerSellerChat'), { ssr: false });

export default function MessageRoute({ params }: { params: Promise<{ username: string; lang: string }> }) {
  const { username } = use(params);
  const { user } = useAuthStore();

  if (!user) return null;

  return <BuyerSellerChat userId={user.id} />;
}
