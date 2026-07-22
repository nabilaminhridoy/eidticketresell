'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with ssr disabled for faster initial page load
// The loading skeleton shows immediately while the component loads
const HomePage = dynamic(() => import('@/components/pages/HomePage'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  ),
});

export default function LangHomePage() {
  return <HomePage />;
}
