'use client';
import dynamic from 'next/dynamic';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';

const JourneyVerificationUpload = dynamic(() => import('@/components/orders/JourneyVerificationUpload'), { ssr: false });

export default function JourneyVerifyRoute({ params }: { params: Promise<{ username: string; lang: string }> }) {
  const { username } = use(params);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const ticketType = searchParams.get('ticketType') || 'online_copy';
  const departureDate = searchParams.get('departureDate') || '';

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-lg">
      <JourneyVerificationUpload
        orderId={orderId}
        ticketType={ticketType}
        departureDate={departureDate}
      />
    </div>
  );
}
