'use client';

import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Header from './Header';
import Footer from './Footer';
import { useAppStore, useLanguageStore } from '@/lib/store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentPage } = useAppStore();
  const { language } = useLanguageStore();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Update document lang attribute
  useEffect(() => {
    document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
  }, [language]);

  return (
    <div className={`min-h-screen flex flex-col ${language === 'bn' ? 'font-bangla' : ''}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
    </div>
  );
}
