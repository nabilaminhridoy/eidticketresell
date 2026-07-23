'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguageStore } from '@/lib/store';
import type { Language } from '@/lib/i18n';
import AppShell from '@/components/layout/AppShell';

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

  return <AppShell>{children}</AppShell>;
}
