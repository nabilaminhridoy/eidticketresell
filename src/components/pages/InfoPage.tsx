'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Phone, MapPin, Send, MessageCircle, Bell, ChevronRight, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';

const sections: Record<string, { title: string; titleBn: string; icon: React.ElementType }> = {
  about: { title: 'About Us', titleBn: 'আমাদের সম্পর্কে', icon: ShieldCheck },
  contact: { title: 'Contact Us', titleBn: 'যোগাযোগ', icon: Mail },
  'how-it-works': { title: 'How It Works', titleBn: 'কিভাবে কাজ করে', icon: CreditCard },
  faq: { title: 'FAQ', titleBn: 'সাধারণ জিজ্ঞাসা', icon: MessageCircle },
  blog: { title: 'Blog', titleBn: 'ব্লগ', icon: Mail },
  support: { title: 'Support', titleBn: 'সাহায্য', icon: Phone },
  terms: { title: 'Terms of Service', titleBn: 'সেবার শর্তাবলী', icon: ShieldCheck },
  privacy: { title: 'Privacy Policy', titleBn: 'গোপনীয়তা নীতি', icon: ShieldCheck },
  refund: { title: 'Refund Policy', titleBn: 'ফেরত নীতি', icon: RefreshCw },
  'payment-policy': { title: 'Payment Policy', titleBn: 'পেমেন্ট নীতি', icon: CreditCard },
  chat: { title: 'Chat', titleBn: 'চ্যাট', icon: MessageCircle },
  notifications: { title: 'Notifications', titleBn: 'বিজ্ঞপ্তি', icon: Bell },
};

export default function InfoPage() {
  const { currentPage } = useAppStore();
  const { language } = useLanguageStore();
  const section = sections[currentPage];
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<Array<{text:string;sent:boolean}>>([]);

  if (!section) return <div className="text-center py-20">{t('noData', language)}</div>;
  const Icon = section.icon;
  const title = language === 'bn' ? section.titleBn : section.title;
  const isBn = language === 'bn';
  const cls = isBn ? 'font-bangla' : '';

  const renderContent = () => {
    switch (currentPage) {
      case 'about': return (
        <div className="space-y-4">
          <p className={cls}>{isBn ? 'ঈদ টিকেট রিসেল বাংলাদেশের সবচেয়ে বিশ্বস্ত টিকেট মার্কেটপ্লেস। আমরা বাস, ট্রেন, ফ্লাইট ও লঞ্চ টিকেট নিরাপদে কেনাবেচার প্ল্যাটফর্ম প্রদান করি।' : 'Eid Ticket Resell is Bangladesh\'s most trusted ticket marketplace. We provide a secure platform for buying and selling Bus, Train, Flight & Launch tickets.'}</p>
          <div className="grid grid-cols-2 gap-3">
            {[{v:'10,000+',l:isBn?'টিকেট বিক্রি':'Tickets Sold'},{v:'5,000+',l:isBn?'ব্যবহারকারী':'Users'},{v:'500+',l:isBn?'যাচাইকৃত বিক্রেতা':'Verified Sellers'},{v:'64+',l:isBn?'শহর':'Cities'}].map((s,i)=>(
              <Card key={i}><CardContent className="p-3 text-center"><p className="text-xl font-bold text-primary">{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></CardContent></Card>
            ))}
          </div>
        </div>
      );
      case 'contact': return (
        <div className="space-y-4">
          <div className="space-y-2 text-sm"><div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />support@eidticketresell.com</div><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />+880 1234-567890</div><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{isBn?'ঢাকা, বাংলাদেশ':'Dhaka, Bangladesh'}</div></div>
          <div className="space-y-3"><div className="space-y-1.5"><Label>{t('name',language)}</Label><Input /></div><div className="space-y-1.5"><Label>{t('email',language)}</Label><Input type="email" /></div><div className="space-y-1.5"><Label>{t('description',language)}</Label><Textarea rows={3} /></div><Button className="bg-gradient-to-r from-primary to-primary/90">{isBn?'পাঠান':'Send'} <Send className="w-4 h-4 ml-1" /></Button></div>
        </div>
      );
      case 'how-it-works': return (
        <div className="space-y-4">{[
          {n:'1',t:t('step1Title',language),d:t('step1Desc',language)},
          {n:'2',t:t('step2Title',language),d:t('step2Desc',language)},
          {n:'3',t:t('step3Title',language),d:t('step3Desc',language)},
          {n:'4',t:t('step4Title',language),d:t('step4Desc',language)},
        ].map((s,i)=>(
          <Card key={i}><CardContent className="p-4 flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold shrink-0">{s.n}</div><div><p className={`font-semibold ${cls}`}>{s.t}</p><p className={`text-sm text-muted-foreground ${cls}`}>{s.d}</p></div></CardContent></Card>
        ))}</div>
      );
      case 'faq': return (
        <Accordion type="single" collapsible>{[
          {q:isBn?'কিভাবে টিকেট কিনব?':'How to buy tickets?',a:isBn?'সার্চ করুন, টিকেট নির্বাচন করুন, পেমেন্ট করুন এবং টিকেট পান।':'Search, select a ticket, pay securely, and receive your ticket.'},
          {q:isBn?'পেমেন্ট কতটা নিরাপদ?':'How secure is payment?',a:isBn?'আপনার পেমেন্ট এসক্রোতে রাখা হয় যতক্ষণ যাত্রা সম্পন্ন না হয়।':'Your payment is held in escrow until the journey is complete.'},
          {q:isBn?'টিকেট বিক্রি করতে কি লাগে?':'What do I need to sell tickets?',a:isBn?'KYC যাচাই সম্পন্ন করুন এবং টিকেট তালিকাভুক্ত করুন।':'Complete KYC verification and list your tickets.'},
          {q:isBn?'ফেরত নীতি কি?':'What is the refund policy?',a:isBn?'যাত্রা বাতিল হলে সম্পূর্ণ ফেরত পাবেন।':'Full refund if the journey is cancelled.'},
        ].map((f,i)=>(
          <AccordionItem key={i} value={`q${i}`}><AccordionTrigger className={cls}>{f.q}</AccordionTrigger><AccordionContent className={cls}>{f.a}</AccordionContent></AccordionItem>
        ))}</Accordion>
      );
      case 'blog': return (
        <div className="space-y-4">{[
          {t:isBn?'ঈদ ভ্রমণ টিপস':'Eid Travel Tips',d:isBn?'ঈদে নিরাপদ ভ্রমণের সেরা টিপস':'Best tips for safe travel during Eid'},
          {t:isBn?'সাশ্রয়ী টিকেট':'Budget Tickets',d:isBn?'কম খরচে টিকেট খোঁজার উপায়':'How to find affordable tickets'},
          {t:isBn?'বিক্রেতা গাইড':'Seller Guide',d:isBn?'টিকেট বিক্রির সম্পূর্ণ গাইড':'Complete guide to selling tickets'},
        ].map((b,i)=>(
          <Card key={i} className="cursor-pointer hover:shadow-sm"><CardContent className="p-4"><h3 className={`font-semibold mb-1 ${cls}`}>{b.t}</h3><p className={`text-sm text-muted-foreground ${cls}`}>{b.d}</p></CardContent></Card>
        ))}</div>
      );
      case 'support': return (
        <div className="space-y-4">
          <p className={cls}>{isBn?'আমাদের সাহায্য দল ২৪/৭ উপলব্ধ।':'Our support team is available 24/7.'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card><CardContent className="p-4 flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /><div><p className="font-medium">{isBn?'ফোন':'Phone'}</p><p className="text-sm text-muted-foreground">+880 1234-567890</p></div></CardContent></Card>
            <Card><CardContent className="p-4 flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><div><p className="font-medium">{t('email',language)}</p><p className="text-sm text-muted-foreground">support@eidticketresell.com</p></div></CardContent></Card>
          </div>
        </div>
      );
      case 'chat': return (
        <div className="space-y-3">
          <div className="min-h-[200px] max-h-64 overflow-y-auto space-y-2 p-3 bg-muted/30 rounded-lg">
            {messages.length === 0 && <p className="text-center text-sm text-muted-foreground">{isBn?'কোনো বার্তা নেই':'No messages yet'}</p>}
            {messages.map((m,i)=><div key={i} className={`flex ${m.sent?'justify-end':'justify-start'}`}><div className={`max-w-[80%] px-3 py-1.5 rounded-lg text-sm ${m.sent?'bg-primary text-primary-foreground':'bg-muted'}`}>{m.text}</div></div>)}
          </div>
          <div className="flex gap-2"><Input value={msg} onChange={(e)=>setMsg(e.target.value)} placeholder={t('typeMessage',language)} onKeyDown={(e)=>{if(e.key==='Enter'&&msg){setMessages((p)=>[...p,{text:msg,sent:true}]);setMsg('');}}} /><Button onClick={()=>{if(msg){setMessages((p)=>[...p,{text:msg,sent:true}]);setMsg('');}}}><Send className="w-4 h-4" /></Button></div>
        </div>
      );
      case 'notifications': return (
        <div className="space-y-2">{[
          {t:isBn?'আপনার টিকেট বিক্রি হয়েছে':'Your ticket has been sold',d:'2m',r:true},
          {t:isBn?'পেমেন্ট প্রাপ্ত':'Payment received',d:'1h',r:true},
          {t:isBn?'KYC অনুমোদিত':'KYC Approved',d:'1d',r:false},
          {t:isBn?'নতুন টিকেট উপলব্ধ':'New tickets available',d:'2d',r:false},
        ].map((n,i)=>(
          <Card key={i} className={n.r?'border-primary/20':''}><CardContent className="p-3 flex items-center gap-3">{n.r&&<div className="w-2 h-2 rounded-full bg-primary" />}<div className="flex-1"><p className={`text-sm font-medium ${cls}`}>{n.t}</p><p className="text-xs text-muted-foreground">{n.d}</p></div></CardContent></Card>
        ))}</div>
      );
      default: return (
        <div className="prose prose-sm max-w-none">
          <p className={cls}>{isBn?`${title} পৃষ্ঠার বিষয়বস্তু এখানে প্রদর্শিত হবে।`:`Content for the ${title} page will be displayed here.`}</p>
          <p className={cls}>{isBn?'এই নীতি সকল ব্যবহারকারীর জন্য প্রযোজ্য এবং প্ল্যাটফর্ম ব্যবহারের শর্ত ও নিয়মাবলী নির্ধারণ করে। সকল লেনদেন এসক্রো সুরক্ষায় সম্পন্ন হয় এবং ক্রেতা-বিক্রেতা উভয়ের অধিকার সংরক্ষিত থাকে।':'This policy applies to all users and establishes the terms and conditions for platform use. All transactions are completed under escrow protection, with rights reserved for both buyers and sellers.'}</p>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Card className="border-primary/10">
        <CardHeader><CardTitle className={`flex items-center gap-2 ${cls}`}><Icon className="w-5 h-5 text-primary" />{title}</CardTitle></CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
