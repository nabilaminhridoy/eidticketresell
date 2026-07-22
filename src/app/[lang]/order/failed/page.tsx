'use client';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowRight } from 'lucide-react';

export default function OrderFailedPage() {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';
  return (
    <div className="container mx-auto px-3 sm:px-4 py-12 max-w-md">
      <Card className="border-primary/10 text-center"><CardContent className="p-8">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${fontClass}`}>{isBn ? 'অর্ডার ব্যর্থ!' : 'Order Failed!'}</h1>
        <p className={`text-muted-foreground mb-6 ${fontClass}`}>{isBn ? 'পেমেন্ট প্রক্রিয়ায় সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'There was an issue processing your payment. Please try again.'}</p>
        <div className="flex flex-col gap-3">
          <Button className="bg-primary min-h-[44px]" onClick={() => navigate('search')}>{isBn ? 'টিকেট খুঁজুন' : 'Search Tickets'}<ArrowRight className="w-4 h-4 ml-1" /></Button>
          <Button variant="outline" className="min-h-[44px]" onClick={() => navigate('home')}>{isBn ? 'হোম যান' : 'Go Home'}</Button>
        </div>
      </CardContent></Card>
    </div>
  );
}
