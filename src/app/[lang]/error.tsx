'use client';

import { useLanguageStore } from '@/lib/store';

export default function LangError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        </div>
        <h2 className={`text-2xl font-bold ${fontClass}`}>
          {isBn ? 'কিছু একটা সমস্যা হয়েছে' : 'Something went wrong'}
        </h2>
        <p className={`text-muted-foreground ${fontClass}`}>
          {error.message || (isBn ? 'একটি অপ্রত্যাশিত ত্রুটি হয়েছে' : 'An unexpected error occurred')}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          {isBn ? 'আবার চেষ্টা করুন' : 'Try again'}
        </button>
      </div>
    </div>
  );
}
