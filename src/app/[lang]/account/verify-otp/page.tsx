'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, Lock, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const pendingToken = searchParams.get('token') || '';

  const { navigate } = useNav();
  const { login } = useAuthStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Resend timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && !loading) {
      handleVerify();
    }
  }, [otp]);

  const isLoginMode = mode === 'login';

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        // Login OTP verification - call login API with pendingToken + OTP
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pendingToken, otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');

        // Complete login
        login(data.user, data.token);
        toast.success(isBn ? 'সফলভাবে লগইন হয়েছে!' : 'Login successful!');
        navigate('home');
      } else {
        // Forgot password OTP verification
        const res = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pendingToken, otp, type: 'forgot_password' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');

        toast.success(isBn ? 'ভেরিফিকেশন সফল!' : 'Verification successful!');

        // Navigate to reset password with reset token
        const lang = language;
        const params = new URLSearchParams({ token: data.resetToken });
        window.location.href = `/${lang}/account/reset-password?${params.toString()}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setOtp(''); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      if (isLoginMode) {
        // For login mode, re-submit credentials to get a new OTP
        // The user would need to go back to login page
        toast.info(isBn ? 'লগইন পৃষ্ঠায় ফিরে আবার চেষ্টা করুন' : 'Go back to login and try again');
      } else {
        // For forgot-password, resend OTP
        const res = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'forgot_password', pendingToken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to resend');

        toast.success(isBn ? 'নতুন কোড পাঠানো হয়েছে!' : 'New code sent!');
        if (data.otp) {
          toast.info(`OTP: ${data.otp}`, { duration: 10000 });
        }
        setResendTimer(60);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend');
    }
  };

  const IconComponent = isLoginMode ? Ticket : Lock;
  const title = isLoginMode
    ? (isBn ? 'লগইন ভেরিফিকেশন' : 'Login Verification')
    : (isBn ? 'পাসওয়ার্ড রিসেট ভেরিফিকেশন' : 'Password Reset Verification');
  const description = isLoginMode
    ? (isBn ? 'আপনার নিবন্ধিত ফোন বা ইমেইলে পাঠানো ৬-সংখ্যার কোড দিন' : 'Enter the 6-digit code sent to your registered phone or email')
    : (isBn ? 'আপনার ফোন বা ইমেইলে পাঠানো ৬-সংখ্যার কোড দিন' : 'Enter the 6-digit code sent to your phone or email');
  const backPage = isLoginMode ? 'login' : 'forgot-password';
  const backLabel = isLoginMode
    ? (isBn ? 'লগইন পৃষ্ঠায় ফিরুন' : 'Back to Login')
    : (isBn ? 'ফোরগেট পাসওয়ার্ড পৃষ্ঠায় ফিরুন' : 'Back to Forgot Password');

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <IconComponent className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className={`text-2xl font-bold ${fontClass}`}>{title}</h1>
          <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>{description}</p>
        </div>

        <Card className="shadow-sm border">
          <CardContent className="p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (otp.length === 6) handleVerify();
              }}
              className="space-y-5"
            >
              {/* OTP Input */}
              <div className="space-y-3">
                <Label className={`text-center block text-sm font-medium ${fontClass}`}>
                  {t('otpVerification', language)}
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    containerClassName="flex items-center gap-1 sm:gap-2"
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-bold" />
                      <InputOTPSlot index={1} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-bold" />
                      <InputOTPSlot index={2} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-bold" />
                    </InputOTPGroup>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-bold" />
                      <InputOTPSlot index={4} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-bold" />
                      <InputOTPSlot index={5} className="h-14 w-11 sm:h-14 sm:w-12 text-lg font-bold" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className={fontClass}>{error}</span>
                </div>
              )}

              {/* Verify button */}
              <Button
                type="submit"
                className="w-full h-11 bg-primary"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                {isBn ? 'যাচাই করুন' : 'Verify'}
              </Button>

              {/* Resend & Back */}
              <div className="space-y-2">
                <div className={`text-center text-sm text-muted-foreground ${fontClass}`}>
                  {isBn ? 'কোড পাননি? ' : "Didn't get the code? "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    className={`text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed ${fontClass}`}
                  >
                    {resendTimer > 0
                      ? `${isBn ? 'পুনঃপ্রেরণ' : 'Resend'} (${resendTimer}s)`
                      : t('resendOtp', language)}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(backPage as any)}
                  className={`w-full text-center text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1.5 py-2 ${fontClass}`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {backLabel}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
