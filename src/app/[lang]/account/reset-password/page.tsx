'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Lock, Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token') || '';

  const { navigate } = useNav();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 8) {
      setError(isBn ? 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' : 'Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(isBn ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match');
      return;
    }

    if (!resetToken) {
      setError(isBn ? 'অবৈধ রিসেট লিংক। আবার চেষ্টা করুন।' : 'Invalid reset link. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess(true);
      toast.success(isBn ? 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে!' : 'Password reset successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-3 sm:p-4">
        <motion.div
          className="w-full max-w-md mx-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${fontClass}`}>
            {isBn ? 'পাসওয়ার্ড রিসেট সম্পন্ন!' : 'Password Reset Complete!'}
          </h1>
          <p className={`text-sm text-muted-foreground mb-6 ${fontClass}`}>
            {isBn ? 'আপনার নতুন পাসওয়ার্ড দিয়ে লগইন করুন' : 'You can now login with your new password'}
          </p>
          <Button
            onClick={() => navigate('login')}
            className="bg-primary"
          >
            {isBn ? 'লগইন করুন' : 'Go to Login'}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-3 sm:p-4">
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className={`text-2xl font-bold ${fontClass}`}>{isBn ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}</h1>
          <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>
            {isBn ? 'নতুন পাসওয়ার্ড তৈরি করুন' : 'Create a new password'}
          </p>
        </div>

        <Card className="shadow-sm border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${fontClass}`}>
                  {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    placeholder={isBn ? 'নতুন পাসওয়ার্ড' : 'New password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${fontClass}`}>
                  {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    placeholder={isBn ? 'পুনরায় পাসওয়ার্ড দিন' : 'Re-enter password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className={fontClass}>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-primary"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
