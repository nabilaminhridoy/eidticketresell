'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Wallet, Ticket, ShoppingBag, ShieldCheck, Settings, ArrowRight, Check, MessageCircle, QrCode, ScanLine, ClipboardCheck } from 'lucide-react';

export default function DashboardPage() {
  const { navigate } = useNav();
  const { user, token, updateUser, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [walletData, setWalletData] = useState({ balance: 0, pending: 0, escrow: 0, totalEarnings: 0 });

  useEffect(() => {
    if (!token) { navigate('login'); return; }
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/api/tickets/mine', { headers }).then((r) => r.json()).then((d) => setTickets(Array.isArray(d) ? d : d.tickets || [])).catch(() => {});
    fetch('/api/orders/mine', { headers }).then((r) => r.json()).then((d) => setOrders(Array.isArray(d) ? d : d.orders || [])).catch(() => {});
    fetch('/api/wallet', { headers }).then((r) => r.json()).then((d) => setWalletData(d.wallet || d)).catch(() => {});
  }, [token, navigate]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-4xl">
      <Tabs defaultValue="overview">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 mb-4">
          <TabsList className="flex gap-1 mb-0 min-w-max sm:min-w-0 sm:flex-wrap">
            <TabsTrigger value="overview" className="text-xs sm:text-sm min-h-[44px]"><User className="w-3 h-3 mr-1" />{language === 'en' ? 'Overview' : 'সারসংক্ষেপ'}</TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs sm:text-sm min-h-[44px]"><Ticket className="w-3 h-3 mr-1" />{t('myTickets', language)}</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm min-h-[44px]"><ShoppingBag className="w-3 h-3 mr-1" />{t('myOrders', language)}</TabsTrigger>
            <TabsTrigger value="wallet" className="text-xs sm:text-sm min-h-[44px]"><Wallet className="w-3 h-3 mr-1" />{t('wallet', language)}</TabsTrigger>
            <TabsTrigger value="kyc" className="text-xs sm:text-sm min-h-[44px]"><ShieldCheck className="w-3 h-3 mr-1" />{t('kyc', language)}</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm min-h-[44px]"><Settings className="w-3 h-3 mr-1" />{t('settings', language)}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-primary/10">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('profile', language)}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div><div className="min-w-0"><p className="font-semibold truncate">{user.name}</p><p className="text-sm text-muted-foreground truncate">{user.email}</p></div></div>
                <div className="flex items-center gap-2 flex-wrap"><Badge variant={user.isKycVerified ? 'default' : 'secondary'}>{user.isKycVerified ? t('verified', language) : t('unverified', language)}</Badge><Badge>{user.role}</Badge></div>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('wallet', language)}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-1">{t('bdt', language)}{walletData.balance}</p>
                <p className="text-sm text-muted-foreground">{t('availableBalance', language)}</p>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('myTickets', language)}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{tickets.length}</p></CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{t('myOrders', language)}</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{orders.length}</p></CardContent>
            </Card>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4"><Button variant="outline" className="min-h-[44px] w-full sm:w-auto" onClick={() => navigate('sell-ticket')}>{t('sellTickets', language)}</Button><Button variant="outline" className="min-h-[44px] w-full sm:w-auto" onClick={logout}>{t('logout', language)}</Button></div>
        </TabsContent>

        <TabsContent value="tickets">
          <div className="flex items-center justify-between mb-4 gap-2"><h2 className="font-bold truncate">{t('myTickets', language)}</h2><Button size="sm" className="min-h-[44px] shrink-0" onClick={() => navigate('sell-ticket')}>+ {t('sellTicket', language)}</Button></div>
          {tickets.length === 0 ? <p className="text-center py-8 text-muted-foreground">{t('noData', language)}</p> : (
            <div className="space-y-2">{(tickets as Array<{id:string;from:string;to:string;price:number;status:string;departureDate:string}>).map((tk) => (
              <Card key={tk.id} className="cursor-pointer hover:shadow-sm" onClick={() => navigate('ticket-details', { id: tk.id })}>
                <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0"><p className="font-medium truncate">{tk.from} → {tk.to}</p><p className="text-xs text-muted-foreground">{tk.departureDate}</p></div>
                  <div className="flex items-center gap-2 shrink-0"><span className="font-semibold text-primary whitespace-nowrap">{t('bdt', language)}{tk.price}</span><Badge variant="secondary" className="text-xs">{tk.status}</Badge><ArrowRight className="w-4 h-4 text-muted-foreground" /></div>
                </CardContent>
              </Card>
            ))}</div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <h2 className="font-bold mb-4">{t('myOrders', language)}</h2>
          {orders.length === 0 ? <p className="text-center py-8 text-muted-foreground">{t('noData', language)}</p> : (
            <div className="space-y-3">{(orders as Array<{id:string;orderId:string;status:string;totalAmount:number;amount:number;platformFee:number;deliveryMethod:string;deliveryStatus:string;isQrScanned:boolean;ticket?:{ticketType:string;transportType:string;routeFrom:string;routeTo:string;departureDate:string;price:number};seller?:{id:string;name:string};buyer?:{id:string;name:string};createdAt:string}>).map((o) => (
              <Card key={o.id} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium">#{o.orderId || o.id.slice(0,8)}</p>
                      <p className="text-xs text-muted-foreground">{o.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold whitespace-nowrap">৳{o.totalAmount}</span>
                      <Badge variant="secondary" className="text-xs">{o.status}</Badge>
                    </div>
                  </div>
                  {o.ticket && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <span>{o.ticket.routeFrom}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{o.ticket.routeTo}</span>
                      <Badge variant="outline" className="text-[10px] ml-1">{o.ticket.transportType}</Badge>
                      <Badge variant="outline" className="text-[10px] ml-1">{o.ticket?.ticketType === 'online_copy' ? 'Online' : 'Counter'}</Badge>
                    </div>
                  )}
                  {/* Platform fee display */}
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <Badge className={o.ticket?.ticketType === 'online_copy' ? 'bg-primary text-white' : 'bg-orange-500 text-white'}>
                      {o.ticket?.ticketType === 'online_copy' ? '2% Fee' : '3% Fee'}
                    </Badge>
                    <span className="text-muted-foreground">৳{o.platformFee} platform fee</span>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="outline" className="text-[10px]">{o.deliveryMethod}</Badge>
                  </div>
                  {/* Action buttons based on order type and role */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Chat button */}
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate('message', { orderId: o.id })}>
                      <MessageCircle className="w-3 h-3 mr-1" />Chat
                    </Button>
                    {/* QR verification button (for counter copy) */}
                    {o.ticket?.ticketType === 'counter_copy' && o.deliveryMethod !== 'online_pdf' && !o.isQrScanned && (
                      user?.id === o.seller?.id ? (
                        <Button size="sm" variant="default" className="h-7 text-xs bg-primary" onClick={() => navigate('qr-display', { orderId: o.id })}>
                          <QrCode className="w-3 h-3 mr-1" />Show QR
                        </Button>
                      ) : (
                        <Button size="sm" variant="default" className="h-7 text-xs bg-orange-500" onClick={() => navigate('qr-scan', { orderId: o.id })}>
                          <ScanLine className="w-3 h-3 mr-1" />Verify QR
                        </Button>
                      )
                    )}
                    {/* Journey verification button (for online copy buyer) */}
                    {o.ticket?.ticketType === 'online_copy' && user?.id === o.buyer?.id && o.deliveryStatus !== 'journey_verified' && o.status !== 'completed' && (
                      <Button size="sm" variant="default" className="h-7 text-xs bg-primary" onClick={() => navigate('journey-verify', { orderId: o.id })}>
                        <ClipboardCheck className="w-3 h-3 mr-1" />Verify Journey
                      </Button>
                    )}
                    {/* Already verified badge */}
                    {o.deliveryStatus === 'journey_verified' && (
                      <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Verified</Badge>
                    )}
                    {o.isQrScanned && (
                      <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />QR Scanned</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}</div>
          )}
        </TabsContent>

        <TabsContent value="wallet">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card><CardContent className="p-3 sm:p-4"><p className="text-xs sm:text-sm text-muted-foreground">{t('availableBalance', language)}</p><p className="text-lg sm:text-xl font-bold text-primary">{t('bdt', language)}{walletData.balance}</p></CardContent></Card>
            <Card><CardContent className="p-3 sm:p-4"><p className="text-xs sm:text-sm text-muted-foreground">{t('pendingBalance', language)}</p><p className="text-lg sm:text-xl font-bold">{t('bdt', language)}{walletData.pending}</p></CardContent></Card>
            <Card><CardContent className="p-3 sm:p-4"><p className="text-xs sm:text-sm text-muted-foreground">{t('escrowBalance', language)}</p><p className="text-lg sm:text-xl font-bold">{t('bdt', language)}{walletData.escrow}</p></CardContent></Card>
            <Card><CardContent className="p-3 sm:p-4"><p className="text-xs sm:text-sm text-muted-foreground">{t('totalEarnings', language)}</p><p className="text-lg sm:text-xl font-bold">{t('bdt', language)}{walletData.totalEarnings}</p></CardContent></Card>
          </div>
          <Button className="bg-primary min-h-[44px] w-full sm:w-auto">{t('withdraw', language)}</Button>
        </TabsContent>

        <TabsContent value="kyc">
          <Card className="border-primary/10">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />{t('kycVerification', language)}</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4"><Badge variant={user.isKycVerified ? 'default' : 'secondary'}>{user.isKycVerified ? t('kycApproved', language) : t('kycPending', language)}</Badge></div>
              {user.isKycVerified ? (
                <div className="space-y-3">
                  <p className="text-emerald-600 flex items-center gap-2"><ShieldCheck className="w-4 h-4" />{language === 'en' ? 'Your identity is verified. You can sell tickets and use wallet features.' : 'আপনার পরিচয় যাচাইকৃত। আপনি টিকেট বিক্রি ও ওয়ালেট ব্যবহার করতে পারবেন।'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: ShieldCheck, label: t('verifiedBadge', language) },
                      { icon: Ticket, label: t('canSellTickets', language) },
                      { icon: Wallet, label: t('canWithdraw', language) },
                    ].map(item => (
                      <div key={item.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                        <item.icon className="w-5 h-5 text-emerald-600" />
                        <span className={`text-xs text-emerald-700 dark:text-emerald-400 text-center ${language === 'bn' ? 'font-bangla' : ''}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className={`text-sm text-muted-foreground ${language === 'bn' ? 'font-bangla' : ''}`}>{t('becomeVerifiedSeller', language)}</p>
                  <p className={`text-xs text-muted-foreground ${language === 'bn' ? 'font-bangla' : ''}`}>
                    {language === 'en' ? 'Complete KYC verification to unlock seller features, wallet, and withdrawal capabilities.' : 'বিক্রেতা বৈশিষ্ট্য, ওয়ালেট এবং উত্তোলন সক্ষমতা আনলক করতে কেওয়াইসি যাচাই সম্পন্ন করুন।'}
                  </p>
                  <Button className="bg-primary" onClick={() => navigate('kyc', { username: user?.username || '' })}>
                    <ShieldCheck className="w-4 h-4 mr-2" />{t('kycVerification', language)}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-primary/10">
            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between"><div><p className="font-medium">{t('language', language)}</p><p className="text-sm text-muted-foreground">{language === 'en' ? 'English' : 'বাংলা'}</p></div>
                <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'bn')}><SelectTrigger className="w-full sm:w-28 h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="bn">বাংলা</SelectItem></SelectContent></Select>
              </div>
              <div className="flex items-center justify-between"><div><p className="font-medium">{t('notificationsSettings', language)}</p><p className="text-sm text-muted-foreground">{language === 'en' ? 'Push notifications' : 'পুশ বিজ্ঞপ্তি'}</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between"><div><p className="font-medium">{t('security', language)}</p><p className="text-sm text-muted-foreground">{language === 'en' ? 'Two-factor auth' : 'দ্বি-ফ্যাক্টর প্রমাণীকরণ'}</p></div><Switch /></div>
              <Button variant="destructive" onClick={logout}>{t('logout', language)}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
