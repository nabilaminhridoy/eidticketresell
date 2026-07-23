'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail } from 'lucide-react';

export default function AdminVerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('eid-admin');
    if (stored) {
      try {
        const admin = JSON.parse(stored);
        requestAnimationFrame(() => { setAdminEmail(admin.email || ''); });
      } catch { router.push('/admin/login'); }
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const otpCode = otp.join('');
    const token = localStorage.getItem('eid-admin-token');

    try {
      const res = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ otp: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">OTP Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the 6-digit code sent to <span className="font-medium">{adminEmail}</span>
          </p>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-lg"
                  />
                ))}
              </div>

              <Button type="submit" className="w-full h-11 bg-primary" disabled={loading || otp.some(d => !d)}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Didn&apos;t receive the code? <button type="button" className="text-primary hover:underline">Resend OTP</button>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <a href="/admin/login" className="text-primary hover:underline">Back to Login</a>
        </p>
      </div>
    </div>
  );
}
