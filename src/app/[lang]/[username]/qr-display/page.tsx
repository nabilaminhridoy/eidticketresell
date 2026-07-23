'use client';
import dynamic from 'next/dynamic';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';

const OrderQrDisplay = dynamic(() => import('@/components/orders/OrderQrDisplay'), { ssr: false });

export default function QrDisplayRoute({ params }: { params: Promise<{ username: string; lang: string }> }) {
  const { username } = use(params);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-lg">
      <OrderQrDisplay
        orderId={orderId}
        deliveryMethod="in_person"
        ticketType="counter_copy"
        isQrScanned={false}
        deliveryStatus="pending"
      />
    </div>
  );
}
