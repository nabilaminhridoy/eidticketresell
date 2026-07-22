'use client';
import { Suspense } from 'react';
import SearchPage from '@/components/pages/SearchPage';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function BuyTicketsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SearchPage />
    </Suspense>
  );
}
