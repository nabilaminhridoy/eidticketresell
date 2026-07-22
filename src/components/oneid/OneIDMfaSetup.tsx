'use client';

import { useState, useCallback } from 'react';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import {
  Shield, QrCode, Copy, CheckCircle2, Loader2, ArrowRight,
  ArrowLeft, AlertCircle, Check, Smartphone, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ─── Props ───────────────────────────────────────────────────────────────────

interface OneIDMfaSetupProps {
  /** Called when MFA setup is successfully completed */
  onSuccess?: () => void;
  /** Called when user skips/cancels setup */
  onSkip?: () => void;
  /** If true, hide the skip button (for settings page) */
  required?: boolean;
}

// ─── Step type ───────────────────────────────────────────────────────────────

type SetupStep = 'intro' | 'qrcode' | 'verify' | 'success';

// ─── Animation variants ─────────────────────────────────────────────────────

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const fadeVariants = {
  enter: { opacity: 0, scale: 0.95 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function OneIDMfaSetup({ onSuccess, onSkip, required = false }: OneIDMfaSetupProps) {
  const { token } = useAuthStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  // State
  const [step, setStep] = useState<SetupStep>('intro');
  const [bindId, setBindId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // ─── Start setup: call /api/oneid/setup ─────────────────────────────────

  const handleStartSetup = useCallback(async () => {
    if (!token) {
      toast.error(isBn ? 'প্রমাণীকরণ প্রয়োজন' : 'Authentication required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/oneid/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || t('oneidMfaSetupFailed', language));

      setBindId(data.bind_id);
      setQrCode(data.qr_code);
      setAlgorithm(data.algorithm || 'TOTP');
      setStep('qrcode');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('oneidMfaSetupFailed', language);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token, language, isBn]);

  // ─── Verify TOTP ────────────────────────────────────────────────────────

  const handleVerifyTotp = useCallback(async () => {
    if (!token || !bindId || totpCode.length !== 6) return;

    setVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/oneid/verify-totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bind_id: bindId,
          code: totpCode,
          purpose: 'setup',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || t('oneidMfaVerifyFailedDesc', language));
      }

      setStep('success');
      toast.success(t('oneidMfaSuccess', language));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('oneidMfaVerifyFailedDesc', language);
      setError(message);
      toast.error(t('oneidMfaVerifyFailed', language));
    } finally {
      setVerifying(false);
    }
  }, [token, bindId, totpCode, language]);

  // ─── Copy bind ID ───────────────────────────────────────────────────────

  const handleCopyBindId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bindId);
      setCopied(true);
      toast.success(isBn ? 'কপি করা হয়েছে!' : 'Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(isBn ? 'কপি করতে ব্যর্থ' : 'Failed to copy');
    }
  }, [bindId, isBn]);

  // ─── Go back ────────────────────────────────────────────────────────────

  const handleGoBack = useCallback(() => {
    setError('');
    setTotpCode('');
    if (step === 'verify') {
      setStep('qrcode');
    } else if (step === 'qrcode') {
      setStep('intro');
      setBindId('');
      setQrCode('');
    }
  }, [step]);

  // ─── Render: Intro Step ─────────────────────────────────────────────────

  const renderIntro = () => (
    <motion.div
      key="intro"
      variants={fadeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center text-center space-y-5 py-4"
    >
      {/* Shield icon with gradient */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className={`text-xl font-bold ${fontClass}`}>
          {t('oneidSecureAccount', language)}
        </h2>
        <p className={`text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto ${fontClass}`}>
          {t('oneidSecureAccountDesc', language)}
        </p>
      </div>

      {/* Features */}
      <div className="w-full space-y-2.5">
        {[
          { icon: Shield, text: isBn ? 'এন্ড-টু-এন্ড এনক্রিপ্টেড অথেনটিকেশন' : 'End-to-end encrypted authentication' },
          { icon: Smartphone, text: isBn ? 'ওয়ানআইডি ওয়ালেট অ্যাপের সাথে কাজ করে' : 'Works with OneID Wallet app' },
          { icon: KeyRound, text: isBn ? 'লগইনে অতিরিক্ত নিরাপত্তা স্তর' : 'Extra security layer for login' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <feature.icon className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span className={`text-sm ${fontClass}`}>{feature.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-2.5 pt-2">
        <Button
          onClick={handleStartSetup}
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Shield className="w-4 h-4 mr-2" />
          )}
          <span className={fontClass}>{t('oneidEnableMfa', language)}</span>
          {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>

        {!required && onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className={`w-full text-muted-foreground ${fontClass}`}
          >
            {t('oneidSetupLater', language)}
          </Button>
        )}
      </div>
    </motion.div>
  );

  // ─── Render: QR Code Step ───────────────────────────────────────────────

  const renderQrCode = () => (
    <motion.div
      key="qrcode"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-5 py-2"
    >
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="text-muted-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className={fontClass}>{t('back', language)}</span>
        </Button>
      </div>

      {/* QR Code display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative p-4 rounded-2xl bg-white border-2 border-emerald-100 shadow-lg shadow-emerald-500/5">
          {qrCode ? (
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt={t('oneidQrCodeAlt', language)}
              className="w-48 h-48 sm:w-56 sm:h-56"
            />
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-muted/30 rounded-lg">
              <QrCode className="w-16 h-16 text-muted-foreground/50" />
            </div>
          )}
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl-sm" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr-sm" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl-sm" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br-sm" />
        </div>

        <p className={`text-sm text-muted-foreground text-center ${fontClass}`}>
          {t('oneidScanQrCode', language)}
        </p>
      </div>

      {/* Binding ID fallback */}
      <div className="p-4 rounded-xl border bg-muted/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium text-muted-foreground uppercase tracking-wide ${fontClass}`}>
            {t('oneidBindIdLabel', language)}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {algorithm || 'TOTP'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2.5 rounded-lg bg-background border font-mono text-sm break-all select-all">
            {bindId}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyBindId}
            className="shrink-0 h-10 w-10"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className={`text-xs text-muted-foreground ${fontClass}`}>
          {t('oneidOr', language)} {t('oneidManually', language).toLowerCase()}
        </p>
      </div>

      {/* Step-by-step instructions */}
      <div className="space-y-2">
        <h3 className={`text-sm font-semibold ${fontClass}`}>
          {t('oneidInstructions', language)}
        </h3>
        <div className="space-y-2">
          {[
            { num: 1, icon: Smartphone, text: t('oneidStep1', language) },
            { num: 2, icon: QrCode, text: t('oneidStep2', language) },
            { num: 3, icon: CheckCircle2, text: t('oneidStep3', language) },
            { num: 4, icon: KeyRound, text: t('oneidStep4', language) },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-emerald-600">{item.num}</span>
              </div>
              <div className="flex items-start gap-2 min-w-0">
                <item.icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className={`text-sm leading-snug ${fontClass}`}>{item.text}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <Button
        onClick={() => { setError(''); setTotpCode(''); setStep('verify'); }}
        className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-emerald-500/25 transition-all"
      >
        <span className={fontClass}>{t('oneidEnterTotp', language)}</span>
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );

  // ─── Render: TOTP Verification Step ─────────────────────────────────────

  const renderVerify = () => (
    <motion.div
      key="verify"
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-5 py-2"
    >
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="text-muted-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className={fontClass}>{t('back', language)}</span>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h3 className={`text-lg font-bold ${fontClass}`}>
          {t('oneidEnter6DigitCode', language)}
        </h3>
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

        <p className={`text-xs text-muted-foreground text-center ${fontClass}`}>
          {t('oneidWalletApp', language)}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className={fontClass}>{error}</span>
        </motion.div>
      )}

      {/* Verify button */}
      <Button
        onClick={handleVerifyTotp}
        disabled={totpCode.length !== 6 || verifying}
        className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-emerald-500/25 transition-all"
      >
        {verifying ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mr-2" />
        )}
        <span className={fontClass}>{t('oneidVerifyTotp', language)}</span>
      </Button>
    </motion.div>
  );

  // ─── Render: Success Step ───────────────────────────────────────────────

  const renderSuccess = () => (
    <motion.div
      key="success"
      variants={fadeVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center text-center space-y-5 py-6"
    >
      {/* Animated success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        {/* Radiating circles */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full border-2 border-emerald-400"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0.3 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          className="absolute inset-0 rounded-full border-2 border-emerald-300"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className={`text-xl font-bold text-emerald-700 dark:text-emerald-400 ${fontClass}`}>
          {t('oneidMfaSuccess', language)}
        </h2>
        <p className={`text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto ${fontClass}`}>
          {t('oneidMfaSuccessDesc', language)}
        </p>
      </motion.div>

      {/* Security badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
      >
        <Shield className="w-4 h-4 text-emerald-600" />
        <span className={`text-xs font-medium text-emerald-700 dark:text-emerald-400 ${fontClass}`}>
          {t('oneidMfaEnabled', language)}
        </span>
      </motion.div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full pt-2"
      >
        <Button
          onClick={onSuccess}
          className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          <span className={fontClass}>
            {isBn ? 'চালিয়ে যান' : 'Continue'}
          </span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );

  // ─── Render: Error state ────────────────────────────────────────────────

  const renderError = () => {
    if (!error || step === 'verify') return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"
      >
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className={fontClass}>{error}</span>
      </motion.div>
    );
  };

  // ─── Main render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500/5 via-background to-primary/10 p-3 sm:p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md mx-auto relative">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {(['intro', 'qrcode', 'verify'] as SetupStep[]).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-emerald-500'
                  : (['intro', 'qrcode', 'verify'].indexOf(s) < ['intro', 'qrcode', 'verify'].indexOf(step))
                    ? 'w-6 bg-emerald-300'
                    : 'w-6 bg-muted'
              }`}
            />
          ))}
        </div>

        <Card className="shadow-xl border-emerald-500/10 overflow-hidden">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className={`text-base font-semibold truncate ${fontClass}`}>
                  {t('oneidMfaSetup', language)}
                </CardTitle>
                <CardDescription className={`text-xs ${fontClass}`}>
                  {step === 'intro' && t('oneidOptional', language)}
                  {step === 'qrcode' && t('oneidSetupProgress', language)}
                  {step === 'verify' && t('oneidEnterTotp', language)}
                  {step === 'success' && t('oneidMfaEnabled', language)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            {/* Error for non-verify steps */}
            {renderError()}

            <AnimatePresence mode="wait">
              {step === 'intro' && renderIntro()}
              {step === 'qrcode' && renderQrCode()}
              {step === 'verify' && renderVerify()}
              {step === 'success' && renderSuccess()}
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
