'use client';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';

export default function OrderPendingPage() {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';
  return (
    <div className="container mx-auto px-3 sm:px-4 py-12 max-w-md">
      <Card className="border-primary/10 text-center"><CardContent className="p-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${fontClass}`}>{isBn ? 'অর্ডার পেন্ডিং' : 'Order Pending'}</h1>
        <p className={`text-muted-foreground mb-6 ${fontClass}`}>{isBn ? 'আপনার পেমেন্ট প্রক্রিয়াধীন। অনুগ্রহ করে অপেক্ষা করুন।' : 'Your payment is being processed. Please wait.'}</p>
        <div className="flex flex-col gap-3">
          <Button className="bg-gradient-to-r from-primary to-primary/90 min-h-[44px]" onClick={() => navigate('my-orders')}>{isBn ? 'আমার অর্ডার' : 'My Orders'}<ArrowRight className="w-4 h-4 ml-1" /></Button>
          <Button variant="outline" className="min-h-[44px]" onClick={() => navigate('home')}>{isBn ? 'হোম যান' : 'Go Home'}</Button>
        </div>
      </CardContent></Card>
    </div>
  );
}
