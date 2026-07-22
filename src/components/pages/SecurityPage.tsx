'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Shield, ShieldCheck, ShieldOff, Fingerprint, Loader2,
  ArrowLeft, AlertCircle, CheckCircle2, Clock, Cpu, KeyRound, Smartphone, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import OneIDMfaSetup from '@/components/oneid/OneIDMfaSetup';

type View = 'overview' | 'setup' | 'disable';

export default function SecurityPage() {
  const { navigate } = useNav();
  const { user, token } = useAuthStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [view, setView] = useState<View>('overview');
  const [mfaEnabled, setMfaEnabled] = useState(user?.oneidMfaEnabled || false);
  const [disableTotp, setDisableTotp] = useState('');
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState('');
  const [mfaInfo, setMfaInfo] = useState<{
    oneidMfaEnabled: boolean;
    oneidHasBinding: boolean;
    oneidLastVerifiedAt: string | null;
  } | null>(null);

  // Fetch MFA info from /api/auth/me
  useEffect(() => {
    if (!token) return;
    const fetchMfaInfo = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMfaEnabled(data.user?.oneidMfaEnabled || false);
          setMfaInfo({
            oneidMfaEnabled: data.user?.oneidMfaEnabled || false,
            oneidHasBinding: data.user?.oneidHasBinding || false,
            oneidLastVerifiedAt: data.user?.oneidLastVerifiedAt || null,
          });
        }
      } catch {
        // silently fail
      }
    };
    fetchMfaInfo();
  }, [token]);

  const handleDisableMfa = async () => {
    if (disableTotp.length !== 6) {
      setDisableError(isBn ? '৬-সংখ্যার কোড দিন' : 'Please enter the 6-digit code');
      return;
    }

    setDisabling(true);
    setDisableError('');

    try {
      const res = await fetch('/api/oneid/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ totp_code: disableTotp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('oneidMfaDisableFailed', language));
      }

      setMfaEnabled(false);
      setView('overview');
      toast.success(t('oneidMfaDisabledSuccess', language));
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : t('oneidMfaDisableFailed', language));
    } finally {
      setDisabling(false);
    }
  };

  const handleSetupSuccess = () => {
    setMfaEnabled(true);
    setView('overview');
    toast.success(t('oneidMfaSuccess', language));
  };

  // Setup view
  if (view === 'setup') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setView('overview')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className={`text-xl font-bold ${fontClass}`}>{t('oneidMfaSetup', language)}</h1>
          </div>
          <OneIDMfaSetup onSuccess={handleSetupSuccess} required onSkip={() => setView('overview')} />
        </div>
      </div>
    );
  }

  // Disable view
  if (view === 'disable') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => { setView('overview'); setDisableTotp(''); setDisableError(''); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className={`text-xl font-bold ${fontClass}`}>{t('oneidDisableMfa', language)}</h1>
          </div>

          <Card className="border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <ShieldOff className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className={`text-lg ${fontClass}`}>{t('oneidDisableMfaConfirm', language)}</CardTitle>
                  <CardDescription className={`text-sm ${fontClass}`}>{t('oneidDisableMfaDesc', language)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${fontClass}`}>
                  {t('oneidEnter6DigitCode', language)}
                </label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={disableTotp} onChange={setDisableTotp} containerClassName="flex items-center gap-1 sm:gap-2">
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-12 w-10 text-base" />
                      <InputOTPSlot index={1} className="h-12 w-10 text-base" />
                      <InputOTPSlot index={2} className="h-12 w-10 text-base" />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="h-12 w-10 text-base" />
                      <InputOTPSlot index={4} className="h-12 w-10 text-base" />
                      <InputOTPSlot index={5} className="h-12 w-10 text-base" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {disableError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className={fontClass}>{disableError}</span>
                </div>
              )}

              <Button
                variant="destructive"
                className="w-full h-11"
                onClick={handleDisableMfa}
                disabled={disableTotp.length !== 6 || disabling}
              >
                {disabling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShieldOff className="w-4 h-4 mr-2" />
                )}
                {t('oneidDisableMfa', language)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Overview view
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('dashboard', { username: user?.username || '' })}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className={`text-xl font-bold ${fontClass}`}>{t('security', language)}</h1>
            <p className={`text-sm text-muted-foreground ${fontClass}`}>
              {isBn ? 'আপনার অ্যাকাউন্টের নিরাপত্তা পরিচালনা করুন' : 'Manage your account security'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* OneID MFA Card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    mfaEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted'
                  }`}>
                    {mfaEnabled ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Shield className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className={`text-base ${fontClass}`}>{t('oneidMfa', language)}</CardTitle>
                    <CardDescription className={`text-sm ${fontClass}`}>{t('oneidMfaDesc', language)}</CardDescription>
                  </div>
                </div>
                <Badge variant={mfaEnabled ? 'default' : 'secondary'} className={mfaEnabled ? 'bg-emerald-600' : ''}>
                  {mfaEnabled ? t('oneidMfaEnabled', language) : t('oneidMfaDisabled', language)}
                </Badge>
              </div>
            </CardHeader>

            {mfaEnabled && mfaInfo && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Fingerprint className="w-4 h-4 text-muted-foreground" />
                    <span className={`text-muted-foreground ${fontClass}`}>{t('oneidBindingActive', language)}:</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  {mfaInfo.oneidLastVerifiedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className={`text-muted-foreground ${fontClass}`}>{t('oneidLastVerified')}:</span>
                      <span className={fontClass}>
                        {new Date(mfaInfo.oneidLastVerifiedAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <span className={`text-muted-foreground ${fontClass}`}>{t('oneidAlgorithm')}:</span>
                    <span className="font-mono text-xs">SHA1</span>
                  </div>
                </div>
              </CardContent>
            )}

            <CardContent className="pt-0">
              <div className="flex gap-2">
                {!mfaEnabled ? (
                  <Button
                    onClick={() => setView('setup')}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t('oneidEnableMfa', language)}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setView('disable')}
                    className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    {t('oneidDisableMfa', language)}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* How OneID MFA Works */}
          <Card>
            <CardHeader>
              <CardTitle className={`text-base ${fontClass}`}>
                {isBn ? 'ওয়ানআইডি এমএফএ কিভাবে কাজ করে' : 'How OneID MFA Works'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${fontClass}`}>{t('oneidStep1', language)}</p>
                    <p className={`text-xs text-muted-foreground ${fontClass}`}>
                      {isBn ? 'আপনার ফোনে ফ্রি অ্যাপটি ডাউনলোড করুন' : 'Download the free app on your phone'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <KeyRound className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${fontClass}`}>
                      {isBn ? 'লগইনে পুশ নোটিফিকেশন বা ৬-সংখ্যার কোড' : 'Push notification or 6-digit code on login'}
                    </p>
                    <p className={`text-xs text-muted-foreground ${fontClass}`}>
                      {isBn ? 'দ্রুত ও নিরাপদ যাচাই' : 'Quick and secure verification'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${fontClass}`}>
                      {isBn ? 'আপনার অ্যাকাউন্ট অতিরিক্ত সুরক্ষিত' : 'Your account gets extra protection'}
                    </p>
                    <p className={`text-xs text-muted-foreground ${fontClass}`}>
                      {isBn ? 'পাসওয়ার্ড ফাঁস হলেও নিরাপদ' : 'Safe even if your password is compromised'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Security Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${fontClass}`}>
                      {isBn ? 'পাসওয়ার্ড নিরাপত্তা' : 'Password Security'}
                    </CardTitle>
                    <CardDescription className={`text-sm ${fontClass}`}>
                      {isBn ? 'আপনার পাসওয়ার্ড পরিবর্তন করুন' : 'Change your password'}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="outline" className="w-full" onClick={() => navigate('forgot-password')}>
                <KeyRound className="w-4 h-4 mr-2" />
                {isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
