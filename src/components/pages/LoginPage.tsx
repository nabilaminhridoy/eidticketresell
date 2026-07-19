'use client';

import { useState } from 'react';
import { useAppStore, useAuthStore, useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import {
  Ticket, Eye, EyeOff, Loader2, Phone, Mail, AtSign,
  Lock, Shield, ArrowRight, AlertCircle, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type LoginMode = 'password' | 'otp';

export default function LoginPage() {
  const { navigate } = useAppStore();
  const { login } = useAuthStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  // Form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP login
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // General
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resend timer
  useState(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  });

  // Detect identifier type for icon
  const getIdentifierIcon = () => {
    if (identifier.includes('@')) return Mail;
    if (/^\+?\d/.test(identifier)) return Phone;
    return AtSign;
  };

  const IdentifierIcon = getIdentifierIcon();

  // Send login OTP
  const handleSendLoginOtp = async () => {
    if (!identifier) {
      setError(isBn ? 'ফোন/ইমেইল/ইউজারনেম দিন' : 'Please enter phone, email, or username');
      return;
    }
    setSendingOtp(true);
    setError('');
    try {
      const body: Record<string, string> = { type: 'login' };
      if (identifier.includes('@')) body.email = identifier;
      else if (/^\+?\d/.test(identifier)) body.phone = identifier;
      else body.email = identifier; // default fallback for username

      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpSent(true);
      setResendTimer(60);
      toast.success(isBn ? 'ওটিপি পাঠানো হয়েছে!' : 'OTP sent successfully!');

      if (data.otp) {
        toast.info(`OTP: ${data.otp}`, { duration: 10000 });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier) {
      setError(isBn ? 'ফোন/ইমেইল/ইউজারনেম দিন' : 'Please enter phone, email, or username');
      return;
    }

    if (loginMode === 'password' && !password) {
      setError(isBn ? 'পাসওয়ার্ড দিন' : 'Please enter your password');
      return;
    }

    if (loginMode === 'otp' && !otp) {
      setError(isBn ? 'ওটিপি কোড দিন' : 'Please enter the OTP code');
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = { identifier };
      if (loginMode === 'password') {
        body.password = password;
      } else {
        body.otp = otp;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.user, data.token);
      toast.success(isBn ? 'সফলভাবে লগইন হয়েছে!' : 'Login successful!');
      navigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-3 sm:p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md mx-auto relative">
        {/* Logo */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3 shadow-lg">
            <Ticket className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className={`text-2xl font-bold ${fontClass}`}>{t('login', language)}</h1>
          <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>
            {isBn ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Welcome back! Sign in to continue'}
          </p>
        </motion.div>

        <Card className="shadow-xl border-primary/10 overflow-hidden">
          <CardHeader className="pb-2 px-4 sm:px-6">
            {/* Login mode toggle */}
            <div className="flex rounded-lg border bg-muted/50 p-1">
              <button
                onClick={() => { setLoginMode('password'); setError(''); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all min-h-[44px] ${
                  loginMode === 'password'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                } ${fontClass}`}
              >
                <Lock className="w-3.5 h-3.5" />
                {isBn ? 'পাসওয়ার্ড' : 'Password'}
              </button>
              <button
                onClick={() => { setLoginMode('otp'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all min-h-[44px] ${
                  loginMode === 'otp'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                } ${fontClass}`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                {isBn ? 'ওটিপি' : 'OTP'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identifier input */}
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${fontClass}`}>
                  {t('phoneEmailUsername', language)} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <IdentifierIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isBn ? 'ফোন / ইমেইল / ইউজারনেম' : 'Phone / Email / Username'}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* Password mode */}
                {loginMode === 'password' && (
                  <motion.div
                    key="password-mode"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1.5"
                  >
                    <Label className={`text-sm font-medium ${fontClass}`}>
                      {t('password', language)} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate('forgot-password')}
                        className={`text-xs sm:text-sm text-primary hover:underline py-1 min-h-[36px] inline-flex items-center ${fontClass}`}
                      >
                        {t('forgotPassword', language)}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* OTP mode */}
                {loginMode === 'otp' && (
                  <motion.div
                    key="otp-mode"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {!otpSent ? (
                      <div className="p-4 rounded-xl border bg-muted/30 text-center space-y-3">
                        <Shield className="w-8 h-8 text-primary mx-auto" />
                        <p className={`text-sm text-muted-foreground ${fontClass}`}>
                          {isBn ? 'আপনার ফোন বা ইমেইলে ওটিপি পাঠানো হবে' : 'We\'ll send an OTP to your registered phone or email'}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendLoginOtp}
                          disabled={!identifier || sendingOtp}
                          className="w-full"
                        >
                          {sendingOtp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                          {t('sendOtp', language)}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className={`text-sm font-medium ${fontClass}`}>{t('otpVerification', language)}</Label>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="flex items-center gap-1 sm:gap-2">
                            <InputOTPGroup>
                              <InputOTPSlot index={0} className="h-12 w-10 sm:h-12 sm:w-10 text-base" />
                              <InputOTPSlot index={1} className="h-12 w-10 sm:h-12 sm:w-10 text-base" />
                              <InputOTPSlot index={2} className="h-12 w-10 sm:h-12 sm:w-10 text-base" />
                            </InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot index={3} className="h-12 w-10 sm:h-12 sm:w-10 text-base" />
                              <InputOTPSlot index={4} className="h-12 w-10 sm:h-12 sm:w-10 text-base" />
                              <InputOTPSlot index={5} className="h-12 w-10 sm:h-12 sm:w-10 text-base" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleSendLoginOtp}
                            disabled={resendTimer > 0 || sendingOtp}
                          >
                            {resendTimer > 0
                              ? `${isBn ? 'পুনঃপ্রেরণ' : 'Resend'} (${resendTimer}s)`
                              : t('resendOtp', language)}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

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

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:shadow-primary/30 transition-shadow"
                disabled={loading || (loginMode === 'otp' && otpSent && otp.length !== 6)}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {t('login', language)}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className={`bg-card px-3 text-muted-foreground ${fontClass}`}>
                  {t('orLoginWith', language)}
                </span>
              </div>
            </div>

            {/* Social login placeholder */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => toast.info(isBn ? 'শীঘ্রই আসছে!' : 'Coming soon!')}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t('googleLogin', language)}
            </Button>

            {/* Register link */}
            <p className={`text-center text-sm text-muted-foreground mt-5 ${fontClass}`}>
              {t('dontHaveAccount', language)}{' '}
              <button
                onClick={() => navigate('register')}
                className="text-primary font-medium hover:underline min-h-[44px] inline-flex items-center px-1"
              >
                {t('createNow', language)}
              </button>
            </p>
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
