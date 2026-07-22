'use client';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function OrderSuccessfulPage() {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';
  return (
    <div className="container mx-auto px-3 sm:px-4 py-12 max-w-md">
      <Card className="border-primary/10 text-center"><CardContent className="p-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${fontClass}`}>{isBn ? 'অর্ডার সফল!' : 'Order Successful!'}</h1>
        <p className={`text-muted-foreground mb-6 ${fontClass}`}>{isBn ? 'আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। টিকেট আপনার ড্যাশবোর্ডে পাওয়া যাবে।' : 'Your payment has been processed successfully. Your ticket will be available in your dashboard.'}</p>
        <div className="flex flex-col gap-3">
          <Button className="bg-primary min-h-[44px]" onClick={() => navigate('home')}>{isBn ? 'হোম যান' : 'Go Home'}<ArrowRight className="w-4 h-4 ml-1" /></Button>
          <Button variant="outline" className="min-h-[44px]" onClick={() => navigate('my-tickets')}>{isBn ? 'আমার টিকেট' : 'My Tickets'}</Button>
        </div>
      </CardContent></Card>
    </div>
  );
}
