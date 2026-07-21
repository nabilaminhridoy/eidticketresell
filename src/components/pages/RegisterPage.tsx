'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, useAuthStore, useLanguageStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Ticket, Eye, EyeOff, Check, X, Loader2, ArrowLeft, ArrowRight,
  User, Mail, Phone, Shield, Calendar, Lock, AtSign, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const { navigate } = useAppStore();
  const { login } = useAuthStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Personal Info fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [usernameDebounce, setUsernameDebounce] = useState<NodeJS.Timeout | null>(null);

  // Agreements
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeNotifications, setAgreeNotifications] = useState(false);

  // OTP verification
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState<'email' | 'phone' | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState<'email' | 'phone' | null>(null);

  // General
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState({ email: 0, phone: 0 });

  // Resend timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(prev => ({
        email: Math.max(0, prev.email - 1),
        phone: Math.max(0, prev.phone - 1),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Password strength calculation
  const getPasswordStrength = useCallback(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: isBn ? 'দুর্বল' : 'Weak', color: 'bg-red-500' },
      { score: 2, label: isBn ? 'মাঝারি' : 'Fair', color: 'bg-orange-500' },
      { score: 3, label: isBn ? 'ভালো' : 'Good', color: 'bg-yellow-500' },
      { score: 4, label: isBn ? 'শক্তিশালী' : 'Strong', color: 'bg-emerald-500' },
      { score: 5, label: isBn ? 'শক্তিশালী' : 'Very Strong', color: 'bg-emerald-600' },
    ];
    return levels[score] || levels[0];
  }, [password, isBn]);

  const passwordStrength = getPasswordStrength();
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // Username availability check with debounce
  useEffect(() => {
    if (usernameDebounce) clearTimeout(usernameDebounce);

    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    setUsernameStatus('checking');
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);
    setUsernameDebounce(timeout);
  }, [username]);

  // Phone number formatting
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('880')) {
      return '+' + digits;
    }
    if (digits.startsWith('01') && digits.length <= 11) {
      return '+88' + digits;
    }
    if (value.startsWith('+8801') || value.startsWith('+880')) {
      return '+' + digits;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  // Send OTP
  const handleSendOtp = async (type: 'email' | 'phone') => {
    setSendingOtp(type);
    try {
      const body: Record<string, string> = { type: type === 'email' ? 'email_verification' : 'phone_verification' };
      if (type === 'email') body.email = email;
      else body.phone = phone;

      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      if (type === 'email') {
        setEmailOtpSent(true);
        setResendTimer(prev => ({ ...prev, email: 60 }));
      } else {
        setPhoneOtpSent(true);
        setResendTimer(prev => ({ ...prev, phone: 60 }));
      }

      toast.success(type === 'email' ? t('otpSentToEmail', language) : t('otpSentToPhone', language));

      // In development, show the OTP
      if (data.otp) {
        toast.info(`OTP: ${data.otp}`, { duration: 10000 });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setSendingOtp(null);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (type: 'email' | 'phone') => {
    setVerifyingOtp(type);
    try {
      const body: Record<string, string> = {
        otp: type === 'email' ? emailOtp : phoneOtp,
        type: type === 'email' ? 'email_verification' : 'phone_verification',
      };
      if (type === 'email') body.email = email;
      else body.phone = phone;

      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');

      if (type === 'email') setEmailOtpVerified(true);
      else setPhoneOtpVerified(true);

      toast.success(isBn ? 'ওটিপি যাচাই সফল!' : 'OTP verified successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setVerifyingOtp(null);
    }
  };

  // Step 1 validation
  const isStep1Valid = () => {
    return (
      fullName.trim().length >= 2 &&
      username.length >= 3 &&
      usernameStatus === 'available' &&
      email.includes('@') &&
      /^\+8801[3-9]\d{8}$/.test(phone) &&
      gender &&
      dateOfBirth &&
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) &&
      password === confirmPassword
    );
  };

  // Step 2 validation
  const isStep2Valid = () => {
    return agreeAge && agreeTerms;
  };

  // Step 3 validation
  const isStep3Valid = () => {
    return emailOtpVerified && phoneOtpVerified;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!isStep3Valid()) {
      setError(isBn ? 'অনুগ্রহ করে ইমেইল ও ফোন যাচাই করুন' : 'Please verify both email and phone');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          username,
          email: email.toLowerCase(),
          phone,
          gender,
          dateOfBirth,
          password,
          agreeAge,
          agreeTerms,
          agreeNotifications,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      login(data.user, data.token);
      toast.success(t('registrationSuccess', language));
      navigate('home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: t('personalInfo', language), icon: User },
    { number: 2, label: t('agreement', language), icon: Shield },
    { number: 3, label: t('securityVerification', language), icon: Lock },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero-light p-3 sm:p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg mx-auto relative">
        {/* Logo */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-3 shadow-lg">
            <Ticket className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className={`text-2xl font-bold ${fontClass}`}>{t('appName', language)}</h1>
          <p className={`text-sm text-muted-foreground mt-1 ${fontClass}`}>{t('appSlogan', language)}</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentStep >= step.number
                  ? 'bg-gradient-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground'
              } ${fontClass}`}>
                <step.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.number}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-1 rounded transition-all ${
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-primary/10 overflow-hidden">
          <div className="h-1 bg-gradient-spectrum" />
          <CardHeader className="pb-4 px-4 sm:px-6">
            <CardTitle className={`text-xl text-center ${fontClass}`}>
              {currentStep === 1 && t('personalInfo', language)}
              {currentStep === 2 && t('agreement', language)}
              {currentStep === 3 && t('securityVerification', language)}
            </CardTitle>
            <CardDescription className={`text-center ${fontClass}`}>
              {t('step', language)} {currentStep} {t('of', language)} 3
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 [&_input]:h-11 [&_[data-slot=select-trigger]]:h-11 [&_[data-slot=select-trigger]]:w-full"
                >
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label className={`text-sm font-medium ${fontClass}`}>
                      {t('fullName', language)} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isBn ? 'আপনার পূর্ণ নাম' : 'Your full name'}
                        className="pl-10 border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <Label className={`text-sm font-medium ${fontClass}`}>
                      {t('username', language)} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder={isBn ? 'ইউজারনেম' : 'username'}
                        className="pl-10 border-primary/20 focus:border-primary"
                      />
                      {usernameStatus === 'checking' && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                      {usernameStatus === 'available' && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      )}
                      {usernameStatus === 'taken' && (
                        <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                      )}
                    </div>
                    {usernameStatus === 'available' && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" />{t('usernameAvailable', language)}</p>
                    )}
                    {usernameStatus === 'taken' && (
                      <p className="text-xs text-red-600 flex items-center gap-1"><X className="w-3 h-3" />{t('usernameTaken', language)}</p>
                    )}
                    <p className={`text-xs text-muted-foreground ${fontClass}`}>
                      {isBn ? 'ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও আন্ডারস্কোর। ৩-২০ অক্ষর।' : 'Lowercase letters, numbers, underscores. 3-20 characters. Can be changed later if available.'}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label className={`text-sm font-medium ${fontClass}`}>
                      {t('email', language)} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@gmail.com"
                        className="pl-10 border-primary/20 focus:border-primary"
                      />
                    </div>
                    <p className={`text-xs text-muted-foreground ${fontClass}`}>
                      {isBn ? '@gmail.com, @outlook.com, @yahoo.com ইত্যাদি' : 'Supported: @gmail.com, @outlook.com, @yahoo.com, etc.'}
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label className={`text-sm font-medium ${fontClass}`}>
                      {t('phone', language)} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+8801712345678"
                        className="pl-10 border-primary/20 focus:border-primary"
                      />
                    </div>
                    <p className={`text-xs text-muted-foreground ${fontClass}`}>
                      {isBn ? '+88 দিয়ে শুরু, তারপর ১১ সংখ্যার বাংলাদেশ নম্বর' : '+88 country code followed by 11-digit BD number'}
                    </p>
                  </div>

                  {/* Gender & DOB row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className={`text-sm font-medium ${fontClass}`}>
                        {t('gender', language)} <span className="text-destructive">*</span>
                      </Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder={isBn ? 'নির্বাচন' : 'Select'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('male', language)}</SelectItem>
                          <SelectItem value="female">{t('female', language)}</SelectItem>
                          <SelectItem value="other">{t('other', language)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className={`text-sm font-medium ${fontClass}`}>
                        {t('dateOfBirth', language)} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="pl-10 border-primary/20 focus:border-primary"
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label className={`text-sm font-medium ${fontClass}`}>
                      {t('password', language)} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 border-primary/20 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength indicator */}
                    {password && (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Progress value={passwordStrength.score * 20} className="h-1.5 flex-1 [&_[data-slot=progress-indicator]]:bg-gradient-primary" />
                          <span className={`text-xs font-medium ${fontClass}`} style={{
                            color: passwordStrength.score <= 1 ? '#ef4444' :
                              passwordStrength.score === 2 ? '#f97316' :
                              passwordStrength.score === 3 ? '#eab308' :
                              '#10b981'
                          }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {[
                            { check: passwordChecks.length, label: t('passwordMinLength', language) },
                            { check: passwordChecks.uppercase, label: t('passwordUppercase', language) },
                            { check: passwordChecks.lowercase, label: t('passwordLowercase', language) },
                            { check: passwordChecks.number, label: t('passwordNumber', language) },
                            { check: passwordChecks.special, label: t('passwordSpecial', language) },
                          ].map((item) => (
                            <div key={item.label} className="flex items-center gap-1">
                              {item.check ? (
                                <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                              ) : (
                                <X className="w-3 h-3 text-muted-foreground shrink-0" />
                              )}
                              <span className={`text-xs ${item.check ? 'text-emerald-600' : 'text-muted-foreground'} ${fontClass}`}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label className={`text-sm font-medium ${fontClass}`}>
                      {t('confirmPassword', language)} <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 border-primary/20 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{t('passwordMismatch', language)}
                      </p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />{isBn ? 'পাসওয়ার্ড মিলেছে' : 'Passwords match'}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Agreement */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Summary of entered info */}
                  <div className="bg-muted/50 rounded-xl p-3 sm:p-4 space-y-2">
                    <h4 className={`font-semibold text-sm ${fontClass}`}>{isBn ? 'আপনার তথ্য সারসংক্ষেপ' : 'Your Information Summary'}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                      <div><span className="text-muted-foreground">{t('name', language)}:</span> <span className="font-medium">{fullName}</span></div>
                      <div><span className="text-muted-foreground">{t('username', language)}:</span> <span className="font-medium">@{username}</span></div>
                      <div className="break-all"><span className="text-muted-foreground">{t('email', language)}:</span> <span className="font-medium">{email}</span></div>
                      <div><span className="text-muted-foreground">{t('phone', language)}:</span> <span className="font-medium">{phone}</span></div>
                      <div><span className="text-muted-foreground">{t('gender', language)}:</span> <span className="font-medium">{gender}</span></div>
                      <div><span className="text-muted-foreground">{t('dateOfBirth', language)}:</span> <span className="font-medium">{dateOfBirth}</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Age Agreement */}
                    <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border hover:bg-muted/30 transition-colors min-h-[44px]">
                      <Checkbox
                        id="agree-age"
                        checked={agreeAge}
                        onCheckedChange={(checked) => setAgreeAge(checked === true)}
                        className="mt-0.5 shrink-0"
                      />
                      <Label htmlFor="agree-age" className={`text-sm cursor-pointer leading-relaxed ${fontClass}`}>
                        {t('ageAgreement', language)}
                      </Label>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border hover:bg-muted/30 transition-colors min-h-[44px]">
                      <Checkbox
                        id="agree-terms"
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                        className="mt-0.5 shrink-0"
                      />
                      <Label htmlFor="agree-terms" className={`text-sm cursor-pointer leading-relaxed ${fontClass}`}>
                        {t('termsAgreement', language)}
                      </Label>
                    </div>

                    {/* Notifications Agreement */}
                    <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border hover:bg-muted/30 transition-colors min-h-[44px]">
                      <Checkbox
                        id="agree-notifications"
                        checked={agreeNotifications}
                        onCheckedChange={(checked) => setAgreeNotifications(checked === true)}
                        className="mt-0.5 shrink-0"
                      />
                      <Label htmlFor="agree-notifications" className={`text-sm cursor-pointer leading-relaxed ${fontClass}`}>
                        {t('notificationsAgreement', language)}
                      </Label>
                    </div>
                  </div>

                  {!agreeAge && !agreeTerms && (
                    <p className={`text-xs text-muted-foreground text-center ${fontClass}`}>
                      {isBn ? 'চালিয়ে যেতে প্রথম দুটি চেকবক্সে সম্মতি দিন' : 'Please check the first two boxes to continue'}
                    </p>
                  )}
                </motion.div>
              )}

              {/* STEP 3: OTP Verification */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Email OTP */}
                  <div className="space-y-3 p-3 sm:p-4 rounded-xl border-orange/20 bg-orange/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="icon-bg-orange"><Mail className="w-4 h-4" /></span>
                        <Label className={`text-sm font-medium ${fontClass}`}>{t('emailOtp', language)}</Label>
                      </div>
                      {emailOtpVerified ? (
                        <Badge variant="default" className="bg-orange"><Check className="w-3 h-3 mr-1" />{t('verified', language)}</Badge>
                      ) : (
                        <Badge variant="secondary" className="max-w-[140px] truncate">{email}</Badge>
                      )}
                    </div>

                    {!emailOtpVerified && (
                      <>
                        {!emailOtpSent ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendOtp('email')}
                            disabled={sendingOtp === 'email'}
                            className="w-full h-11"
                          >
                            {sendingOtp === 'email' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                            {t('sendOtp', language)}
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-center [&_[data-slot=input-otp-slot]]:w-10 [&_[data-slot=input-otp-slot]]:h-12 [&_[data-slot=input-otp-slot]]:text-base sm:[&_[data-slot=input-otp-slot]]:w-12 sm:[&_[data-slot=input-otp-slot]]:h-14">
                              <InputOTP maxLength={6} value={emailOtp} onChange={setEmailOtp}>
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerifyOtp('email')}
                                disabled={emailOtp.length !== 6 || verifyingOtp === 'email'}
                                className="flex-1 h-11"
                              >
                                {verifyingOtp === 'email' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                {t('verifyOtp', language)}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendOtp('email')}
                                disabled={resendTimer.email > 0 || sendingOtp === 'email'}
                                className="h-11"
                              >
                                {resendTimer.email > 0
                                  ? `${resendTimer.email}s`
                                  : t('resendOtp', language)}
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Phone OTP */}
                  <div className="space-y-3 p-3 sm:p-4 rounded-xl border-orange/20 bg-orange/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="icon-bg-orange"><Phone className="w-4 h-4" /></span>
                        <Label className={`text-sm font-medium ${fontClass}`}>{t('mobileOtp', language)}</Label>
                      </div>
                      {phoneOtpVerified ? (
                        <Badge variant="default" className="bg-orange"><Check className="w-3 h-3 mr-1" />{t('verified', language)}</Badge>
                      ) : (
                        <Badge variant="secondary" className="max-w-[140px] truncate">{phone}</Badge>
                      )}
                    </div>

                    {!phoneOtpVerified && (
                      <>
                        {!phoneOtpSent ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendOtp('phone')}
                            disabled={sendingOtp === 'phone'}
                            className="w-full h-11"
                          >
                            {sendingOtp === 'phone' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                            {t('sendOtp', language)}
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-center [&_[data-slot=input-otp-slot]]:w-10 [&_[data-slot=input-otp-slot]]:h-12 [&_[data-slot=input-otp-slot]]:text-base sm:[&_[data-slot=input-otp-slot]]:w-12 sm:[&_[data-slot=input-otp-slot]]:h-14">
                              <InputOTP maxLength={6} value={phoneOtp} onChange={setPhoneOtp}>
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerifyOtp('phone')}
                                disabled={phoneOtp.length !== 6 || verifyingOtp === 'phone'}
                                className="flex-1 h-11"
                              >
                                {verifyingOtp === 'phone' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                {t('verifyOtp', language)}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendOtp('phone')}
                                disabled={resendTimer.phone > 0 || sendingOtp === 'phone'}
                                className="h-11"
                              >
                                {resendTimer.phone > 0
                                  ? `${resendTimer.phone}s`
                                  : t('resendOtp', language)}
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Verification status */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs">
                    <span className={`flex items-center gap-1 ${emailOtpVerified ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      <Mail className="w-3 h-3" />
                      {isBn ? 'ইমেইল' : 'Email'}: {emailOtpVerified ? '✓' : '...'}
                    </span>
                    <span className={`flex items-center gap-1 ${phoneOtpVerified ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      <Phone className="w-3 h-3" />
                      {isBn ? 'ফোন' : 'Phone'}: {phoneOtpVerified ? '✓' : '...'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className={fontClass}>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-6">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as Step)}
                  className={`h-11 border-primary/20 hover:bg-primary/10 hover:text-primary ${fontClass}`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('back', language)}
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  onClick={() => {
                    setError('');
                    if (currentStep === 1 && !isStep1Valid()) {
                      setError(isBn ? 'অনুগ্রহ করে সকল তথ্য সঠিকভাবে পূরণ করুন' : 'Please fill in all fields correctly');
                      return;
                    }
                    if (currentStep === 2 && !isStep2Valid()) {
                      setError(isBn ? 'প্রথম দুটি চেকবক্সে সম্মতি দিন' : 'Please agree to the required terms');
                      return;
                    }
                    setCurrentStep((prev) => (prev + 1) as Step);
                  }}
                  className="flex-1 h-11 btn-gradient-primary rounded-xl"
                  disabled={currentStep === 1 && !isStep1Valid()}
                >
                  {t('continueBtn', language)}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={!isStep3Valid() || loading}
                  className="flex-1 h-11 btn-gradient-primary rounded-xl"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Ticket className="w-4 h-4 mr-2" />
                  )}
                  {t('createAccount', language)}
                </Button>
              )}
            </div>

            {/* Login link */}
            <p className={`text-center text-sm text-muted-foreground mt-4 ${fontClass}`}>
              {t('alreadyHaveAccount', language)}{' '}
              <button
                onClick={() => navigate('login')}
                className="text-primary font-medium hover:underline min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              >
                {t('login', language)}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
