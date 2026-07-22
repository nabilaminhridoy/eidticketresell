'use client';

import { useEffect } from 'react';

export default function RootNotFound() {
  useEffect(() => {
    // Client-side redirect to default language page
    // Avoids the Performance measure error caused by server-side redirect()
    window.location.replace('/en/');
  }, []);

  return null;
}
