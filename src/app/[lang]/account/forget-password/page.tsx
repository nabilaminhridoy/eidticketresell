'use client';
import { useState } from 'react';
import { useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Mail, Phone, AtSign, Loader2, AlertCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ForgetPasswordPage() {
  const { navigate } = useNav();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect identifier type for icon
  const getIdentifierIcon = () => {
    if (identifier.includes('@')) return Mail;
    if (/^\+?\d/.test(identifier)) return Phone;
    return AtSign;
  };

  const IdentifierIcon = getIdentifierIcon();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError(isBn ? 'ফোন/ইমেইল/ইউজারনেম দিন' : 'Please enter phone, email, or username');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const body: Record<string, string> = { type: 'forgot_password', identifier };
      if (identifier.includes('@')) body.email = identifier;
      else if (/^\+?\d/.test(identifier)) body.phone = identifier;

      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      toast.success(isBn ? 'ভেরিফিকেশন কোড পাঠানো হয়েছে!' : 'Verification code sent!');

      if (data.otp) {
        toast.info(`OTP: ${data.otp}`, { duration: 10000 });
      }

      // Navigate to verify-otp page with forgot-password mode
      const lang = language;
      const params = new URLSearchParams({
        mode: 'forgot-password',
        token: data.pendingToken || '',
      });
      window.location.href = `/${lang}/account/verify-otp?${params.toString()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

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
            <KeyRound className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className={`text-2xl font-bold ${fontClass}`}>{t('forgotPassword', language)}</h1>
          <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>
            {isBn ? 'পাসওয়ার্ড রিসেট করতে আপনার ফোন, ইমেইল বা ইউজারনেম দিন' : 'Enter your phone, email, or username to reset your password'}
          </p>
        </div>

        <Card className="shadow-sm border">
          <CardContent className="p-6">
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label className={`text-sm font-medium ${fontClass}`}>
                  {t('phoneEmailUsername', language)} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <IdentifierIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 h-11"
                    placeholder={isBn ? 'ফোন / ইমেইল / ইউজারনেম' : 'Phone / Email / Username'}
                  />
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
                disabled={loading || !identifier}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isBn ? 'ওটিপি পাঠান' : 'Send OTP'}
              </Button>

              <button
                type="button"
                onClick={() => navigate('login')}
                className={`w-full text-center text-sm text-primary hover:underline py-2 ${fontClass}`}
              >
                {isBn ? 'লগইন পৃষ্ঠায় ফিরুন' : 'Back to Login'}
              </button>
            </form>
          </CardContent>
        </Card>

        <div className={`flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground ${fontClass}`}>
          <Shield className="w-3 h-3" />
          {isBn ? 'আপনার তথ্য এন্ড-টু-এন্ড এনক্রিপ্টেড ও সুরক্ষিত' : 'Your data is encrypted and secure'}
        </div>
      </motion.div>
    </div>
  );
}
