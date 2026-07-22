'use client';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShieldCheck, CreditCard, Smartphone, Wallet, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { language } = useLanguageStore();
  const { navigate } = useNav();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-2xl">
      <button onClick={() => navigate('search')} className={`flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 ${fontClass}`}>
        <ArrowLeft className="w-4 h-4" />
        {t('back', language)}
      </button>
      <h1 className={`text-2xl font-bold mb-6 ${fontClass}`}>{isBn ? 'চেকআউট' : 'Checkout'}</h1>
      <Card className="border-primary/10"><CardHeader><CardTitle className={`text-sm ${fontClass}`}>{isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <RadioGroup defaultValue="bkash" className="space-y-2">
            {[
              { value: 'bkash', label: 'bKash', icon: Smartphone, color: 'text-pink-600' },
              { value: 'nagad', label: 'Nagad', icon: Smartphone, color: 'text-orange-600' },
              { value: 'rocket', label: 'Rocket', icon: Smartphone, color: 'text-purple-600' },
              { value: 'sslcommerz', label: 'SSLCommerz', icon: CreditCard, color: 'text-blue-600' },
            ].map((method) => (
              <Label key={method.value} htmlFor={method.value} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30">
                <RadioGroupItem value={method.value} id={method.value} />
                <method.icon className={`w-5 h-5 ${method.color}`} />
                <span className={`font-medium ${fontClass}`}>{method.label}</span>
              </Label>
            ))}
          </RadioGroup>
          <Separator className="my-3" />
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4 text-primary" /><span className={`text-sm font-medium ${fontClass}`}>{isBn ? 'এসক্রো সুরক্ষা' : 'Escrow Protection'}</span></div>
          <p className={`text-xs text-muted-foreground mb-4 ${fontClass}`}>{isBn ? 'আপনার পেমেন্ট এসক্রোতে নিরাপদে রাখা হবে যতক্ষণ না যাত্রা সম্পন্ন হয়।' : 'Your payment will be securely held in escrow until the journey is completed.'}</p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm"><span className={fontClass}>{isBn ? 'টিকেট মূল্য' : 'Ticket Price'}</span><span>৳0</span></div>
            <div className="flex justify-between text-sm"><span className={fontClass}>{isBn ? 'প্ল্যাটফর্ম ফি' : 'Platform Fee'}</span><span>৳0</span></div>
            <Separator />
            <div className="flex justify-between font-bold"><span className={fontClass}>{isBn ? 'সর্বমোট' : 'Total'}</span><span className="text-primary">৳0</span></div>
          </div>
          <Button className="w-full min-h-[44px] bg-gradient-to-r from-primary to-primary/90">{isBn ? 'পেমেন্ট করুন' : 'Pay Now'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
