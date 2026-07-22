'use client';

import { useRouter } from 'next/navigation';
import { useLanguageStore } from './store';
import { getPagePath } from './navigation';

export function useNav() {
  const router = useRouter();
  const { language } = useLanguageStore();

  const navigate = (page: string, params?: Record<string, string>) => {
    const path = getPagePath(language, page, params);
    router.push(path);
  };

  const replace = (page: string, params?: Record<string, string>) => {
    const path = getPagePath(language, page, params);
    router.replace(path);
  };

  return { navigate, replace };
}
