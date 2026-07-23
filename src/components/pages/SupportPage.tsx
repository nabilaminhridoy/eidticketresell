'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore, useAuthStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import {
  Phone, Mail, MapPin, Clock, Send, Paperclip,
  CheckCircle2, User, MessageSquare, FileText, AlertCircle,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Allowed email domains
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com',
  'icloud.com', 'protonmail.com', 'live.com', 'msn.com',
  'aol.com', 'mail.com', 'yandex.com', 'zoho.com',
  'edu.bd', 'ac.bd', 'com.bd'
];

function validateEmailDomain(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
}

function validateBdPhone(phone: string): boolean {
  // Accept formats: +88XXXXXXXXXXX, 88XXXXXXXXXXX, or just XXXXXXXXXXX (11 digits)
  const cleaned = phone.replace(/[\s\-]/g, '');
  if (cleaned.startsWith('+88')) {
    const digits = cleaned.slice(3);
    return /^\d{11}$/.test(digits);
  }
  if (cleaned.startsWith('88')) {
    const digits = cleaned.slice(2);
    return /^\d{11}$/.test(digits);
  }
  // If just 11 digits, assume BD number
  return /^\d{11}$/.test(cleaned);
}

export default function SupportPage() {
  const { language } = useLanguageStore();
  const { user } = useAuthStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, attachment: t('fileTooLarge', language) }));
      return;
    }

    setAttachment(file);
    setAttachmentName(file.name);
    setErrors(prev => ({ ...prev, attachment: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = t('requiredField', language);
    if (!email.trim()) newErrors.email = t('requiredField', language);
    else if (!validateEmailDomain(email)) newErrors.email = t('invalidEmailDomain', language);
    if (phone.trim() && !validateBdPhone(phone)) newErrors.phone = t('invalidPhoneFormat', language);
    if (!subject.trim()) newErrors.subject = t('requiredField', language);
    if (!message.trim()) newErrors.message = t('requiredField', language);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('phone', phone.trim());
      formData.append('email', email.trim());
      formData.append('subject', subject.trim());
      formData.append('message', message.trim());
      if (user) formData.append('userId', user.id);
      if (attachment) formData.append('attachment', attachment);

      const res = await fetch('/api/support', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setErrors(prev => ({ ...prev, submit: data.error || 'Something went wrong' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, submit: 'Network error. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-6" />
          </motion.div>
          <h2 className={`text-2xl lg:text-3xl font-bold mb-3 ${fontClass}`}>
            {t('supportSuccessTitle', language)}
          </h2>
          <p className={`text-muted-foreground mb-8 max-w-md mx-auto ${fontClass}`}>
            {t('supportSuccessMsg', language)}
          </p>
          <Badge variant="secondary" className="px-4 py-2 text-sm bg-green-600/10 text-green-600 border-green-600/20">
            <Clock className="w-4 h-4 mr-2" />
            {isBn ? '২৪ ঘন্টার মধ্যে প্রতিক্রিয়া' : 'Response within 24 hours'}
          </Badge>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <Badge className="mb-4 px-4 py-1.5 text-sm bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
          <Headphones className="w-3.5 h-3.5 mr-1.5" />
          {t('support', language)}
        </Badge>
        <h1 className={`text-3xl lg:text-4xl font-bold mb-3 ${fontClass}`}>
          {t('getInTouch', language)}
        </h1>
        <p className={`text-muted-foreground max-w-xl mx-auto ${fontClass}`}>
          {t('supportFormDesc', language)}
        </p>
      </motion.div>

      {/* Quick Contact Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        <Card className="border-primary/10 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className={`font-medium text-sm ${fontClass}`}>{isBn ? 'ফোন' : 'Phone'}</p>
              <p className="text-xs text-muted-foreground">+880 1XXX-XXXXXX</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className={`font-medium text-sm ${fontClass}`}>{t('email', language)}</p>
              <p className="text-xs text-muted-foreground">support@eidticketresell.com</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/10 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className={`font-medium text-sm ${fontClass}`}>{isBn ? 'প্রতিক্রিয়া সময়' : 'Response Time'}</p>
              <p className="text-xs text-muted-foreground">{isBn ? '২৪ ঘন্টার মধ্যে' : 'Within 24 hours'}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2 border-primary/15 shadow-xl shadow-primary/5">
          <CardContent className="p-6 lg:p-8">
            <div className="space-y-6">
              {/* Row 1: Full Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                    <User className="w-3.5 h-3.5 mr-1 inline" />
                    {t('fullName', language)}
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: '' })); }}
                    placeholder={isBn ? 'আপনার পূর্ণ নাম' : 'Enter your full name'}
                    className={`w-full h-11 rounded-xl border-primary/20 ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''} ${fontClass}`}
                  />
                  {errors.fullName && (
                    <p className={`text-xs text-red-500 flex items-center gap-1 ${fontClass}`}>
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                    <Phone className="w-3.5 h-3.5 mr-1 inline" />
                    {t('phone', language)}
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })); }}
                    placeholder="+88 01XXX-XXXXXX"
                    className={`w-full h-11 rounded-xl border-primary/20 ${errors.phone ? 'border-red-500 focus:border-red-500' : ''} ${fontClass}`}
                  />
                  <p className={`text-xs text-muted-foreground ${fontClass}`}>
                    {t('phoneHintBd', language)}
                  </p>
                  {errors.phone && (
                    <p className={`text-xs text-red-500 flex items-center gap-1 ${fontClass}`}>
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Email + Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                    <Mail className="w-3.5 h-3.5 mr-1 inline" />
                    {t('email', language)}
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                    placeholder="you@gmail.com"
                    className={`w-full h-11 rounded-xl border-primary/20 ${errors.email ? 'border-red-500 focus:border-red-500' : ''} ${fontClass}`}
                  />
                  <p className={`text-xs text-muted-foreground ${fontClass}`}>
                    {t('emailHintDomains', language)}
                  </p>
                  {errors.email && (
                    <p className={`text-xs text-red-500 flex items-center gap-1 ${fontClass}`}>
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                    <MessageSquare className="w-3.5 h-3.5 mr-1 inline" />
                    {t('subject', language)}
                  </Label>
                  <Input
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); setErrors(prev => ({ ...prev, subject: '' })); }}
                    placeholder={isBn ? 'আপনার বিষয় লিখুন' : 'Enter subject'}
                    className={`w-full h-11 rounded-xl border-primary/20 ${errors.subject ? 'border-red-500 focus:border-red-500' : ''} ${fontClass}`}
                  />
                  {errors.subject && (
                    <p className={`text-xs text-red-500 flex items-center gap-1 ${fontClass}`}>
                      <AlertCircle className="w-3 h-3" /> {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Message */}
              <div className="space-y-2">
                <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                  <FileText className="w-3.5 h-3.5 mr-1 inline" />
                  {t('description', language)}
                </Label>
                <Textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors(prev => ({ ...prev, message: '' })); }}
                  placeholder={isBn ? 'আপনার সমস্যা বিস্তারিত লিখুন...' : 'Describe your issue in detail...'}
                  rows={5}
                  className={`w-full rounded-xl border-primary/20 min-h-[120px] ${errors.message ? 'border-red-500 focus:border-red-500' : ''} ${fontClass}`}
                />
                {errors.message && (
                  <p className={`text-xs text-red-500 flex items-center gap-1 ${fontClass}`}>
                    <AlertCircle className="w-3 h-3" /> {errors.message}
                  </p>
                )}
              </div>

              {/* Row 4: Attachment */}
              <div className="space-y-2">
                <Label className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${fontClass}`}>
                  <Paperclip className="w-3.5 h-3.5 mr-1 inline" />
                  {t('attachment', language)}
                </Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full rounded-xl border-2 border-dashed border-primary/20 p-4 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all ${errors.attachment ? 'border-red-500' : ''}`}
                >
                  {attachmentName ? (
                    <div className="flex items-center justify-center gap-2">
                      <Paperclip className="w-4 h-4 text-primary" />
                      <span className={`text-sm font-medium ${fontClass}`}>{attachmentName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachment(null);
                          setAttachmentName('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Paperclip className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className={`text-sm text-muted-foreground ${fontClass}`}>
                        {isBn ? 'ফাইল নির্বাচন করুন অথবা এখানে ক্লিক করুন' : 'Choose a file or click to upload'}
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className={`text-xs text-muted-foreground ${fontClass}`}>
                  {t('attachmentHint', language)}
                </p>
                {errors.attachment && (
                  <p className={`text-xs text-red-500 flex items-center gap-1 ${fontClass}`}>
                    <AlertCircle className="w-3 h-3" /> {errors.attachment}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className={fontClass}>{errors.submit}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-xl text-base h-12 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span className={fontClass}>{isBn ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span className={fontClass}>{t('submit', language)}</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Office Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-center"
      >
        <Card className="border-primary/10">
          <CardContent className="p-4 flex items-center justify-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <span className={`text-sm text-muted-foreground ${fontClass}`}>
              {isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}
            </span>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
