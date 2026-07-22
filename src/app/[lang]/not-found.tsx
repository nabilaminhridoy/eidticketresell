'use client';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  return (
    <div className={`min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-background ${fontClass}`}>
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="relative">
          <div className="text-[8rem] sm:text-[10rem] font-black text-muted-foreground/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isBn ? 'পৃষ্ঠা খুঁজে পাওয়া যায়নি' : 'Page Not Found'}
          </h1>
          <p className="text-muted-foreground">
            {isBn
              ? 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে'
              : 'The page you are looking for does not exist or has been moved'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('home')}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white transition-colors duration-200 min-h-[44px]"
          >
            <Home className="w-4 h-4 mr-2" />
            {isBn ? 'হোম পৃষ্ঠায় যান' : 'Go Home'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="min-h-[44px] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isBn ? 'পিছনে যান' : 'Go Back'}
          </Button>
        </div>
      </div>
    </div>
  );
}
