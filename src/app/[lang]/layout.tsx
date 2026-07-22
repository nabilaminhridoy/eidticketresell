'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguageStore } from '@/lib/store';
import type { Language } from '@/lib/i18n';

// Lazy load AppShell to reduce initial compilation memory
const AppShell = dynamic(() => import('@/components/layout/AppShell'), {
  ssr: false,
});

const VALID_LANGS = ['en', 'bn'];

export default function LangLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ lang: string }>();
  const router = useRouter();
  const { setLanguage } = useLanguageStore();

  const lang = params.lang;
  const isValid = VALID_LANGS.includes(lang);

  useEffect(() => {
    if (!isValid) {
      router.replace('/en/');
    }
  }, [isValid, router]);

  useEffect(() => {
    if (isValid) {
      setLanguage(lang as Language);
    }
  }, [lang, isValid, setLanguage]);

  if (!isValid) return null;

  // All pages now use AppShell (Header + Footer)
  return <AppShell>{children}</AppShell>;
}
