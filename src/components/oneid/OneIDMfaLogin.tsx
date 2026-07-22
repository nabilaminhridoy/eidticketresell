'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, KeyRound, Loader2, ArrowRight, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ─── Props ───────────────────────────────────────────────────────────────────

interface OneIDMfaLoginProps {
  mfaToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    username: string;
    gender?: string;
    dateOfBirth?: string;
    role: string;
    isKycVerified: boolean;
    avatar?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    oneidMfaEnabled?: boolean;
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

type MfaMode = 'push' | 'totp';
type PushStatus = 'idle' | 'sending' | 'pending' | 'verified' | 'failed' | 'expired' | 'error';

// ─── Animation variants ─────────────────────────────────────────────────────

const modeVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const fadeVariants = {
  enter: { opacity: 0, scale: 0.95 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ─── Max polling attempts ───────────────────────────────────────────────────

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

// ─── Component ───────────────────────────────────────────────────────────────

export default function OneIDMfaLogin({ mfaToken, user }: OneIDMfaLoginProps) {
  const { login } = useAuthStore();
  const { navigate } = useNav();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  // Mode state
  const [mode, setMode] = useState<MfaMode>('push');

  // Push state
  const [pushStatus, setPushStatus] = useState<PushStatus>('idle');
  const [requestId, setRequestId] = useState('');
  const [validNumber, setValidNumber] = useState<number | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // TOTP state
  const [totpCode, setTotpCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // General
  const [error, setError] = useState('');

  // ─── Cleanup on unmount ──────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  // ─── Complete login ──────────────────────────────────────────────────────

  const completeLogin = useCallback(() => {
    login(user, mfaToken);
    toast.success(isBn ? 'সফলভাবে লগইন হয়েছে!' : 'Login successful!');
    navigate('home');
  }, [user, mfaToken, login, navigate, isBn]);

  // ─── Send push notification ──────────────────────────────────────────────

  const sendPushNotification = useCallback(async () => {
    if (!mfaToken) return;

    setPushStatus('sending');
    setError('');
    setPollCount(0);

    // Clear any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    try {
      const res = await fetch('/api/oneid/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mfaToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || t('oneidPushFailed', language));
      }

      if (!isMountedRef.current) return;

      setRequestId(data.request_id);
      setValidNumber(data.valid_number ?? null);
      setPushStatus('pending');
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : t('oneidPushFailed', language);
      setError(message);
      setPushStatus('error');
      toast.error(message);
    }
  }, [mfaToken, language]);

  // ─── Auto-send push on mount ─────────────────────────────────────────────

  useEffect(() => {
    if (mode === 'push' && pushStatus === 'idle') {
      sendPushNotification();
    }
  }, [mode, pushStatus, sendPushNotification]);

  // ─── Poll push status ───────────────────────────────────────────────────

  useEffect(() => {
    if (pushStatus !== 'pending' || !requestId || !mfaToken) return;

    pollIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) return;

      try {
        const res = await fetch(`/api/oneid/push/status?request_id=${encodeURIComponent(requestId)}`, {
          headers: {
            'Authorization': `Bearer ${mfaToken}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Status check failed');
        }

        if (!isMountedRef.current) return;

        if (data.status === 'verified') {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setPushStatus('verified');
          // Short delay to show success state before completing login
          setTimeout(() => {
            if (isMountedRef.current) {
              completeLogin();
            }
          }, 1200);
        } else if (data.status === 'failed') {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setPushStatus('failed');
          setError(t('oneidPushFailed', language));
        } else if (data.status === 'expired') {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setPushStatus('expired');
        } else {
          // Still pending — increment poll count
          setPollCount((prev) => {
            const next = prev + 1;
            if (next >= MAX_POLL_ATTEMPTS) {
              // Max attempts reached — treat as expired
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              setPushStatus('expired');
            }
            return next;
          });
        }
      } catch {
        // Don't fail the whole flow on a single poll error — just keep trying
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [pushStatus, requestId, mfaToken, language, completeLogin]);

  // ─── Handle TOTP verify ─────────────────────────────────────────────────

  const handleVerifyTotp = useCallback(async () => {
    if (totpCode.length !== 6 || !mfaToken) return;

    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/oneid/verify-totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mfaToken}`,
        },
        body: JSON.stringify({
          code: totpCode,
          purpose: 'login',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || t('oneidMfaVerifyFailedDesc', language));
      }

      toast.success(t('oneidPushVerified', language));
      completeLogin();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('oneidMfaVerifyFailedDesc', language);
      setError(message);
      toast.error(t('oneidMfaVerifyFailed', language));
    } finally {
      setVerifying(false);
    }
  }, [totpCode, mfaToken, language, completeLogin]);

  // ─── Switch modes ────────────────────────────────────────────────────────

  const switchToTotp = useCallback(() => {
    // Stop any push polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setMode('totp');
    setError('');
    setTotpCode('');
  }, []);

  const switchToPush = useCallback(() => {
    setMode('push');
    setError('');
    setTotpCode('');
    // Reset push state so the useEffect fires sendPushNotification
    setPushStatus('idle');
  }, []);

  // ─── Countdown progress (visual only) ───────────────────────────────────

  const progressPercent = pushStatus === 'pending'
    ? Math.round(((MAX_POLL_ATTEMPTS - pollCount) / MAX_POLL_ATTEMPTS) * 100)
    : pushStatus === 'idle' || pushStatus === 'sending'
      ? 100
      : 0;

  // ─── Render: Push Mode ──────────────────────────────────────────────────

  const renderPushMode = () => (
    <motion.div
      key="push-mode"
      variants={modeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center text-center space-y-5 py-4"
    >
      {/* Icon area */}
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25"
          animate={pushStatus === 'pending' ? { scale: [1, 1.05, 1] } : {}}
          transition={pushStatus === 'pending' ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          {pushStatus === 'verified' ? (
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          ) : pushStatus === 'sending' ? (
            <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
          ) : (
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          )}
        </motion.div>

        {/* Progress ring */}
        {pushStatus === 'pending' && (
          <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted/30"
            />
            <circle
              cx="40"
              cy="40"
              r="38"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - progressPercent / 100)}`}
              strokeLinecap="round"
              className="text-primary transition-all duration-1000 ease-linear"
            />
          </svg>
        )}

        {/* Status badge */}
        {pushStatus !== 'sending' && pushStatus !== 'idle' && (
          <div className="absolute -bottom-1 -right-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
              pushStatus === 'verified'
                ? 'bg-emerald-500'
                : pushStatus === 'failed' || pushStatus === 'error'
                  ? 'bg-destructive'
                  : pushStatus === 'expired'
                    ? 'bg-amber-500'
                    : 'bg-primary/80'
            }`}>
              {pushStatus === 'verified' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : pushStatus === 'failed' || pushStatus === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5 text-white" />
              ) : pushStatus === 'expired' ? (
                <RefreshCw className="w-3.5 h-3.5 text-white" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-white" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className={`text-xl font-bold ${fontClass}`}>
          {t('oneidPushTitle', language)}
        </h2>
        <p className={`text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto ${fontClass}`}>
          {t('oneidPushDesc', language)}
        </p>
      </div>

      {/* Valid number badge */}
      {validNumber !== null && (pushStatus === 'pending' || pushStatus === 'sending') && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <p className={`text-sm font-medium ${fontClass}`}>
            {t('oneidPushSelectNumber', language).replace('{number}', '')}
          </p>
          <Badge
            className="text-2xl font-bold px-6 py-3 bg-primary text-primary-foreground shadow-lg"
          >
            {validNumber}
          </Badge>
        </motion.div>
      )}

      {/* Status messages */}
      {pushStatus === 'pending' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className={fontClass}>{t('oneidPushWaiting', language)}</span>
        </motion.div>
      )}

      {pushStatus === 'verified' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className={fontClass}>{t('oneidPushVerified', language)}</span>
        </motion.div>
      )}

      {pushStatus === 'failed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className={fontClass}>{t('oneidPushFailed', language)}</span>
          </div>
          <Button
            onClick={sendPushNotification}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className={fontClass}>{t('oneidPushResend', language)}</span>
          </Button>
        </motion.div>
      )}

      {(pushStatus === 'expired' || pushStatus === 'error') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span className={fontClass}>
              {pushStatus === 'expired' ? t('oneidPushExpired', language) : error}
            </span>
          </div>
          <Button
            onClick={sendPushNotification}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className={fontClass}>{t('oneidPushResend', language)}</span>
          </Button>
        </motion.div>
      )}

      {/* Error message */}
      {error && pushStatus !== 'error' && pushStatus !== 'failed' && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className={fontClass}>{error}</span>
        </motion.div>
      )}

      {/* Fallback: use TOTP instead */}
      {pushStatus !== 'verified' && (
        <button
          onClick={switchToTotp}
          className={`text-sm text-primary hover:underline min-h-[44px] inline-flex items-center gap-1.5 ${fontClass}`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          {t('oneidUseTotpInstead', language)}
        </button>
      )}
    </motion.div>
  );

  // ─── Render: TOTP Mode ──────────────────────────────────────────────────

  const renderTotpMode = () => (
    <motion.div
      key="totp-mode"
      variants={modeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center text-center space-y-5 py-4"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
        <KeyRound className="w-10 h-10 text-primary-foreground" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className={`text-xl font-bold ${fontClass}`}>
          {t('oneidEnter6DigitCode', language)}
        </h2>
        <p className={`text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto ${fontClass}`}>
          {t('oneidWalletApp', language)}
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex flex-col items-center space-y-4">
        <InputOTP
          maxLength={6}
          value={totpCode}
          onChange={setTotpCode}
          containerClassName="flex items-center gap-1 sm:gap-2"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-semibold" />
            <InputOTPSlot index={1} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-semibold" />
            <InputOTPSlot index={2} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-semibold" />
          </InputOTPGroup>
          <InputOTPGroup>
            <InputOTPSlot index={3} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-semibold" />
            <InputOTPSlot index={4} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-semibold" />
            <InputOTPSlot index={5} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-semibold" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className={fontClass}>{error}</span>
        </motion.div>
      )}

      {/* Verify button */}
      <Button
        onClick={handleVerifyTotp}
        disabled={totpCode.length !== 6 || verifying}
        className="w-full h-11 bg-primary shadow-lg hover:shadow-primary/30 transition-shadow"
      >
        {verifying ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mr-2" />
        )}
        <span className={fontClass}>{t('oneidVerifyTotp', language)}</span>
        {!verifying && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>

      {/* Switch back to push */}
      <button
        onClick={switchToPush}
        className={`text-sm text-primary hover:underline min-h-[44px] inline-flex items-center gap-1.5 ${fontClass}`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        {t('oneidUsePushInstead', language)}
      </button>
    </motion.div>
  );

  // ─── Main render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-3 sm:p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md mx-auto relative">
        {/* Logo / Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className={`text-2xl font-bold ${fontClass}`}>
            {t('oneidMfaRequired', language)}
          </h1>
          <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>
            {t('oneidMfaRequiredDesc', language)}
          </p>
        </motion.div>

        <Card className="shadow-xl border-primary/10 overflow-hidden">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                {mode === 'push' ? (
                  <Smartphone className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <KeyRound className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <CardTitle className={`text-base font-semibold truncate ${fontClass}`}>
                  {mode === 'push' ? t('oneidPushTitle', language) : t('oneidEnter6DigitCode', language)}
                </CardTitle>
                <CardDescription className={`text-xs ${fontClass}`}>
                  {t('oneidMfaRequired', language)}
                </CardDescription>
              </div>
            </div>

            {/* Mode indicator */}
            <div className="flex rounded-lg border bg-muted/50 p-1 mt-3">
              <button
                onClick={() => { if (mode !== 'push') switchToPush(); }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all min-h-[44px] ${
                  mode === 'push'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                } ${fontClass}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                {isBn ? 'পুশ' : 'Push'}
              </button>
              <button
                onClick={() => { if (mode !== 'totp') switchToTotp(); }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all min-h-[44px] ${
                  mode === 'totp'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                } ${fontClass}`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                {isBn ? 'কোড' : 'Code'}
              </button>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            <AnimatePresence mode="wait">
              {mode === 'push' && renderPushMode()}
              {mode === 'totp' && renderTotpMode()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Security note */}
        <div className={`flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground ${fontClass}`}>
          <Shield className="w-3 h-3" />
          {isBn ? 'আপনার তথ্য এন্ড-টু-এন্ড এনক্রিপ্টেড ও সুরক্ষিত' : 'Your data is encrypted and secure'}
        </div>
      </div>
    </div>
  );
}
