'use client';

import { useRouter } from 'next/navigation';
import { useAppStore, useLanguageStore } from './store';
import { getPagePath } from './navigation';

export function useNav() {
  const router = useRouter();
  const { language } = useLanguageStore();

  const navigate = (page: string, params?: Record<string, string>) => {
    const path = getPagePath(language, page, params);
    // Sync Zustand store so components reading currentPage/pageParams still work
    useAppStore.getState().navigate(page as any, params);
    router.push(path);
  };

  const replace = (page: string, params?: Record<string, string>) => {
    const path = getPagePath(language, page, params);
    useAppStore.getState().navigate(page as any, params);
    router.replace(path);
  };

  return { navigate, replace };
}
