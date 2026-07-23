'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  Facebook,
  Twitter,
  Globe,
  AlertCircle,
} from 'lucide-react';

export default function ContactUsPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const cls = isBn ? 'font-bangla' : '';

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Contact methods
  const contactMethods = [
    {
      icon: Phone,
      title: isBn ? 'ফোন' : 'Phone',
      value: '+880 1234-567890',
      desc: isBn ? 'যেকোনো সময় কল করুন' : 'Call anytime',
      color: 'bg-green-600/10',
      iconColor: 'text-green-600',
    },
    {
      icon: Mail,
      title: isBn ? 'ইমেইল' : 'Email',
      value: 'support@eidticketresell.com',
      desc: isBn ? '24 ঘণ্টায় উত্তর পাবেন' : 'Response within 24 hours',
      color: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
    },
    {
      icon: MapPin,
      title: isBn ? 'অফিস' : 'Office',
      value: isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh',
      desc: isBn ? 'সোনারগাঁও রোড, ঢাকা 1205' : 'Sonargaon Road, Dhaka 1205',
      color: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
  ];

  // Subject options
  const subjectOptions = [
    { value: 'general', label: isBn ? 'সাধারণ জিজ্ঞাসা' : 'General Inquiry' },
    { value: 'ticket', label: isBn ? 'টিকেট সমস্যা' : 'Ticket Issue' },
    { value: 'payment', label: isBn ? 'পেমেন্ট সমস্যা' : 'Payment Issue' },
    { value: 'seller', label: isBn ? 'বিক্রেতা সাহায্য' : 'Seller Support' },
    { value: 'bug', label: isBn ? 'বাগ রিপোর্ট' : 'Bug Report' },
    { value: 'other', label: isBn ? 'অন্যান্য' : 'Other' },
  ];

  // Office hours
  const officeHours = [
    { day: isBn ? 'সোম-শুক্র' : 'Mon-Fri', time: '9:00 AM - 6:00 PM' },
    { day: isBn ? 'শনিবার' : 'Saturday', time: '10:00 AM - 4:00 PM' },
    { day: isBn ? 'রবিবার' : 'Sunday', time: isBn ? 'বন্ধ' : 'Closed' },
    { day: isBn ? 'ঈদের সময়' : 'During Eid', time: isBn ? '24/7 সাহায্য' : '24/7 Support' },
  ];

  // Social links
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', color: 'text-blue-600' },
    { icon: Twitter, label: 'Twitter', color: 'text-sky-500' },
    { icon: Globe, label: 'Website', color: 'text-primary' },
  ];

  // Validation
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = isBn ? 'নাম আবশ্যক' : 'Name is required';
    }
    if (!formData.phone.trim()) {
      errs.phone = isBn ? 'ফোন নম্বর আবশ্যক' : 'Phone number is required';
    } else if (!/^(\+880|880|0)?1[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = isBn ? 'সঠিক বাংলাদেশ ফোন নম্বর দিন' : 'Enter a valid Bangladesh phone number';
    }
    if (!formData.email.trim()) {
      errs.email = isBn ? 'ইমেইল আবশ্যক' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = isBn ? 'সঠিক ইমেইল দিন' : 'Enter a valid email';
    }
    if (!formData.subject) {
      errs.subject = isBn ? 'বিষয় নির্বাচন করুন' : 'Select a subject';
    }
    if (!formData.message.trim()) {
      errs.message = isBn ? 'বার্তা আবশ্যক' : 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errs.message = isBn ? 'বার্তা কমপক্ষে 10 অক্ষর' : 'Message must be at least 10 characters';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    // Simulate submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ fullName: '', phone: '', email: '', subject: '', message: '' });
    } catch {
      // Error handling
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <Badge className="mb-4 bg-green-600 text-white hover:bg-green-700">
          {isBn ? 'যোগাযোগ করুন' : 'Contact Us'}
        </Badge>
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${cls}`}>
          {isBn ? 'যোগাযোগ করুন' : 'Contact Us'}
        </h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${cls}`}>
          {isBn
            ? 'যেকোনো সমস্যা, জিজ্ঞাসা বা প্রশ্নে আমাদের সাথে যোগাযোগ করুন। আমাদের সাহায্য দল সর্বদা প্রস্তুত।'
            : 'Contact us for any issue, question, or inquiry. Our support team is always ready to help.'}
        </p>
      </div>

      {/* Contact Methods */}
      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {contactMethods.map((cm, i) => {
            const IconComp = cm.icon;
            return (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${cm.color} rounded-full flex items-center justify-center mb-4`}>
                    <IconComp className={`w-6 h-6 ${cm.iconColor}`} />
                  </div>
                  <h3 className={`font-semibold mb-1 ${cls}`}>{cm.title}</h3>
                  <p className={`font-medium text-primary mb-1 ${cls}`}>{cm.value}</p>
                  <p className={`text-sm text-muted-foreground ${cls}`}>{cm.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Office Hours */}
      <section className="mb-10">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className={`font-semibold text-lg ${cls}`}>
                {isBn ? 'অফিসের সময়' : 'Office Hours'}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {officeHours.map((oh, i) => (
                <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className={`font-medium text-sm ${cls}`}>{oh.day}</p>
                  <p className="text-sm text-muted-foreground">{oh.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Form */}
      <section className="mb-10">
        <Card className="border-border">
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className={`font-semibold text-lg mb-2 ${cls}`}>
                  {isBn ? 'বার্তা পাঠানো হয়েছে!' : 'Message Sent!'}
                </h3>
                <p className={`text-muted-foreground mb-4 ${cls}`}>
                  {isBn
                    ? 'আমাদের সাহায্য দল 24 ঘণ্টার মধ্যে উত্তর দিবে।'
                    : 'Our support team will respond within 24 hours.'}
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setSubmitted(false)}
                >
                  {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-2 mb-6">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className={`font-semibold text-lg ${cls}`}>
                    {isBn ? 'বার্তা পাঠান' : 'Send a Message'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className={cls}>
                      {isBn ? 'সম্পূর্ণ নাম' : 'Full Name'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your name'}
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={cls}
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className={cls}>
                      {isBn ? 'ফোন নম্বর (+88)' : 'Phone Number (+88)'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="+880 1XXX-XXXXXX"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className={cls}>
                      {isBn ? 'ইমেইল' : 'Email'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder={isBn ? 'ইমেইল লিখুন' : 'Enter your email'}
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label className={cls}>
                      {isBn ? 'বিষয়' : 'Subject'} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => handleChange('subject', value)}
                    >
                      <SelectTrigger className={`w-full ${cls}`}>
                        <SelectValue placeholder={isBn ? 'বিষয় নির্বাচন' : 'Select subject'} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className={cls}>
                      {isBn ? 'বার্তা' : 'Message'} <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      rows={5}
                      placeholder={isBn ? 'আপনার বার্তা লিখুন...' : 'Write your message...'}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={cls}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 bg-primary hover:bg-primary/90 w-full md:w-auto"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="animate-pulse">
                      {isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                    </span>
                  ) : (
                    <>
                      {isBn ? 'বার্তা পাঠান' : 'Send Message'}
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Social Media & FAQ Link */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Social Media */}
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className={`font-semibold text-lg mb-4 ${cls}`}>
                {isBn ? 'সোশ্যাল মিডিয়া' : 'Social Media'}
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((sl, i) => {
                  const IconComp = sl.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <IconComp className={`w-5 h-5 ${sl.color}`} />
                      <span className={`text-sm font-medium ${cls}`}>{sl.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Link */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <HelpCircle className="w-8 h-8 text-primary" />
                <div>
                  <h3 className={`font-semibold text-lg ${cls}`}>
                    {isBn ? 'সাধারণ জিজ্ঞাসা' : 'Frequently Asked Questions'}
                  </h3>
                  <p className={`text-sm text-muted-foreground ${cls}`}>
                    {isBn
                      ? 'সাধারণ প্রশ্নের উত্তর পান'
                      : 'Find answers to common questions'}
                  </p>
                </div>
              </div>
              <p className={`text-sm text-muted-foreground mb-4 ${cls}`}>
                {isBn
                  ? 'বার্তা পাঠানোর আগে FAQ পড়ুন — অনেক প্রশ্নের উত্তর ইতিমধ্যে আছে।'
                  : 'Before sending a message, check our FAQ — many questions are already answered.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
