'use client';

import { useSyncExternalStore, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* useSyncExternalStore helpers for localStorage token                */
/* This avoids calling setState inside an effect, which the strict     */
/* React lint rule forbids.                                            */
/* ------------------------------------------------------------------ */

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getSnapshot() {
  return localStorage.getItem('etr_admin_token') ?? '';
}

function getServerSnapshot() {
  return ''; // Token never exists during SSR
}

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!token) {
      // Redirect unauthorized users to the frontend 404 page
      // so only /admin/login is discoverable
      router.replace('/en/not-found');
    }
  }, [token, router]);

  /* Show spinner while redirecting unauthenticated users */
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
