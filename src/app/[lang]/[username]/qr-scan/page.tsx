'use client';
import dynamic from 'next/dynamic';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';

const OrderQrScanner = dynamic(() => import('@/components/orders/OrderQrScanner'), { ssr: false });

export default function QrScanRoute({ params }: { params: Promise<{ username: string; lang: string }> }) {
  const { username } = use(params);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-lg">
      <OrderQrScanner
        orderId={orderId}
        isQrScanned={false}
        deliveryStatus="pending"
      />
    </div>
  );
}
