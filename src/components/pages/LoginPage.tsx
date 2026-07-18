'use client';
import { useState } from 'react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Ticket, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { navigate, currentPage } = useAppStore();
  const { login } = useAuthStore();
  const { language } = useLanguageStore();
  const isRegister = currentPage === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { email, password, name } : { email, password };
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      login(data.user, data.token);
      navigate('home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-3">
            <Ticket className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className={`text-2xl ${language === 'bn' ? 'font-bangla' : ''}`}>
            {isRegister ? t('register', language) : t('login', language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <Label className={language === 'bn' ? 'font-bangla' : ''}>{t('name', language)}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className={language === 'bn' ? 'font-bangla' : ''}>{t('email', language)}</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label className={language === 'bn' ? 'font-bangla' : ''}>{t('password', language)}</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/90" disabled={loading}>
              {loading ? '...' : isRegister ? t('register', language) : t('login', language)}
            </Button>
          </form>
          <p className={`text-center text-sm text-muted-foreground mt-4 ${language === 'bn' ? 'font-bangla' : ''}`}>
            {isRegister ? t('alreadyHaveAccount', language) : t('dontHaveAccount', language)}{' '}
            <button onClick={() => navigate(isRegister ? 'login' : 'register')} className="text-primary font-medium hover:underline">
              {isRegister ? t('login', language) : t('register', language)}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
