'use client';

import { useLanguageStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  ShieldCheck,
  Globe,
  Eye,
  Users,
  Rocket,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Target,
  Lightbulb,
} from 'lucide-react';

export default function AboutUsPage() {
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const cls = isBn ? 'font-bangla' : '';

  // Stats
  const stats = [
    { value: '10,000+', label: isBn ? 'টিকেট বিক্রি' : 'Tickets Sold', icon: Star },
    { value: '5,000+', label: isBn ? 'সক্রিয় ব্যবহারকারী' : 'Active Users', icon: Users },
    { value: '500+', label: isBn ? 'যাচাইকৃত বিক্রেতা' : 'Verified Sellers', icon: ShieldCheck },
    { value: '64+', label: isBn ? 'শহর সংযুক্ত' : 'Cities Connected', icon: Globe },
  ];

  // Core values
  const coreValues = [
    {
      icon: ShieldCheck,
      title: isBn ? 'বিশ্বস্ততা' : 'Trust',
      desc: isBn
        ? 'প্রতিটি লেনদেনে বিশ্বস্ততা অগ্রাধিকার। এসক্রো সুরক্ষা, যাচাইকৃত বিক্রেতা ও স্বচ্ছ প্রক্রিয়া নিশ্চিত করি।'
        : 'Trust is our priority in every transaction. We ensure escrow protection, verified sellers, and transparent processes.',
    },
    {
      icon: Heart,
      title: isBn ? 'সুরক্ষা' : 'Safety',
      desc: isBn
        ? 'ক্রেতা ও বিক্রেতার সুরক্ষা আমাদের মূল দায়িত্ব। এসক্রো সিস্টেম, PNR যাচাই ও ফ্রaud ডিটেকশন সুরক্ষা নিশ্চিত করি।'
        : 'Protecting buyers and sellers is our core responsibility. Escrow system, PNR verification, and fraud detection ensure safety.',
    },
    {
      icon: Globe,
      title: isBn ? 'অভিগম্যতা' : 'Accessibility',
      desc: isBn
        ? 'সকল ব্যবহারকারীর জন্য সহজ অভিগম্যতা। বাংলা ও ইংরেজি সাপোর্ট, মোবাইল-অনুকূল ডিজাইন ও সহজ পেমেন্ট।'
        : 'Easy accessibility for all users. Bangla and English support, mobile-friendly design, and simple payment methods.',
    },
    {
      icon: Eye,
      title: isBn ? 'স্বচ্ছতা' : 'Transparency',
      desc: isBn
        ? 'সকল প্রক্রিয়া স্বচ্ছ ও নির্ভরযোগ্য। পেমেন্ট স্বচ্ছ, ফি স্পষ্ট, লেনদেনের বিবরণ প্রকাশ্য এবং নীতি সুস্পষ্ট।'
        : 'All processes are transparent and reliable. Payment is clear, fees are explicit, transaction details are public, and policies are clear.',
    },
  ];

  // Team members (placeholder)
  const team = [
    {
      name: isBn ? 'রাকিব হাসান' : 'Rakib Hasan',
      role: isBn ? 'প্রতিষ্ঠাতা ও CEO' : 'Founder & CEO',
      desc: isBn
        ? '5+ বছরের প্রযুক্তি অভিজ্ঞতা। বাংলাদেশের ডিজিটাল মার্কেটপ্লেস উন্নয়নে অগ্রণী।'
        : '5+ years of tech experience. Pioneer in Bangladesh\'s digital marketplace development.',
    },
    {
      name: isBn ? 'ফারিহা আক্তার' : 'Fariba Akter',
      role: isBn ? 'প্রযুক্তি প্রধান' : 'CTO',
      desc: isBn
        ? 'সফটওয়ের আর্কিটেক্ট ও নিরাপত্তা বিশেষজ্ঞ। প্ল্যাটফর্মের প্রযুক্তি কাঠামো নির্মাণ।'
        : 'Software architect and security expert. Built the platform\'s tech infrastructure.',
    },
    {
      name: isBn ? 'মাহমুদ করিম' : 'Mahmud Karim',
      role: isBn ? 'অপারেশন প্রধান' : 'COO',
      desc: isBn
        ? 'যানবাহন শিল্প ও সাপ্লি চেইন বিশেষজ্ঞ। প্ল্যাটফর্মের দৈনিক অপারেশন পরিচালনা।'
        : 'Transport industry and supply chain expert. Manages daily platform operations.',
    },
    {
      name: isBn ? 'নাসরিন সুলতানা' : 'Nasrin Sultana',
      role: isBn ? 'সাহায্য প্রধান' : 'Head of Support',
      desc: isBn
        ? 'ক্রেতা-বিক্রেতা সমর্থন ও সমস্যা সমাধান। 24/7 সাহায্য দলের নেতৃত্ব।'
        : 'Buyer-seller support and problem resolution. Leads the 24/7 support team.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <Badge className="mb-4 bg-green-600 text-white hover:bg-green-700">
          {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
        </Badge>
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${cls}`}>
          {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
        </h1>
        <p className={`text-muted-foreground text-lg max-w-2xl mx-auto ${cls}`}>
          {isBn
            ? 'ঈদ টিকেট রিসেল — বাংলাদেশের সবচেয়ে বিশ্বস্ত টিকেট মার্কেটপ্লেস। আমরা যাত্রীদের নিরাপদ ও সহজ টিকেট কেনাবেচার সুবিধা প্রদান করি।'
            : 'Eid Ticket Resell — Bangladesh\'s most trusted ticket marketplace. We provide safe and easy ticket buying and selling for travelers.'}
        </p>
      </div>

      {/* Our Story */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-8 bg-green-600 rounded-full" />
          <h2 className={`text-2xl font-bold ${cls}`}>
            {isBn ? 'আমাদের গল্প' : 'Our Story'}
          </h2>
        </div>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className={`text-muted-foreground leading-relaxed ${cls}`}>
                {isBn
                  ? 'বাংলাদেশে ঈদের সময় টিকেট পাওয়া এক বড় সমস্যা। লাখ লাখ যাত্রী বাস, ট্রেন, ফ্লাইট ও লঞ্চ টিকেটের জন্য ঘণ্টার পর ঘণ্টা লাইনে দাঁড়ায়। অনেকে টিকেট না পেয়ে ঈদে পরিবারের সাথে যেতে পারে না। অন্যদিকে, অনেকের অতিরিক্ত টিকেট বিক্রি করার কোনো নিরাপদ মাধ্যম নেই।'
                  : 'Getting tickets during Eid in Bangladesh is a major challenge. Millions of travelers stand in queues for hours for Bus, Train, Flight & Launch tickets. Many can\'t visit family during Eid without tickets. Meanwhile, many people have extra tickets but no safe way to sell them.'}
              </p>
              <p className={`text-muted-foreground leading-relaxed ${cls}`}>
                {isBn
                  ? 'এই সমস্যা সমাধানে 2023 সালে ঈদ টিকেট রিসেল প্রতিষ্ঠিত। আমরা একটি নিরাপদ, স্বচ্ছ ও সহজ প্ল্যাটফর্ম তৈরি করি — যেখানে ক্রেতা নিরাপদে টিকেট কিনতে পারে এবং বিক্রেতা অতিরিক্ত টিকেট বিক্রি করতে পারে। এসক্রো সুরক্ষা, PNR যাচাই ও KYC প্রক্রিয়া সকল লেনদেন নিরাপদ করে।'
                  : 'Founded in 2023 to solve this problem, Eid Ticket Resell creates a safe, transparent, and easy platform where buyers can purchase tickets safely and sellers can sell extra tickets. Escrow protection, PNR verification, and KYC processes make all transactions secure.'}
              </p>
              <p className={`text-muted-foreground leading-relaxed ${cls}`}>
                {isBn
                  ? 'আজ আমরা বাংলাদেশের 64+ শহরে সেবা প্রদান করি, 5,000+ সক্রিয় ব্যবহারকারী ও 500+ যাচাইকৃত বিক্রেতা সংযুক্ত। প্রতি ঈদে হাজার হাজার যাত্রী আমাদের প্ল্যাটফর্মের মাধ্যমে নিরাপদে পরিবারের সাথে যাত্রা করে।'
                  : 'Today we serve 64+ cities in Bangladesh, connecting 5,000+ active users and 500+ verified sellers. Every Eid, thousands of travelers safely journey with family through our platform.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Mission & Vision */}
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary-foreground" />
                </div>
                <h2 className={`text-xl font-bold ${cls}`}>
                  {isBn ? 'আমাদের মিশন' : 'Our Mission'}
                </h2>
              </div>
              <p className={`text-muted-foreground leading-relaxed ${cls}`}>
                {isBn
                  ? 'বাংলাদেশের যাত্রীদের নিরাপদ, স্বচ্ছ ও সহজ টিকেট কেনাবেচার সুবিধা প্রদান। প্রতিটি ঈদে প্রতিটি যাত্রী নিরাপদে পরিবারের সাথে যাত্রা করতে পারে — এটি আমাদের মিশন।'
                  : 'Provide safe, transparent, and easy ticket buying and selling for Bangladesh\'s travelers. Every traveler should journey safely with family every Eid — this is our mission.'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-bold ${cls}`}>
                  {isBn ? 'আমাদের ভিশন' : 'Our Vision'}
                </h2>
              </div>
              <p className={`text-muted-foreground leading-relaxed ${cls}`}>
                {isBn
                  ? 'বাংলাদেশের সবচেয়ে বিশ্বস্ত ও জনপ্রিয় টিকেট মার্কেটপ্লেস হওয়া। সকল যানবাহন, সকল রুট, সকল সময় — সর্বত্র নিরাপদ টিকেট সেবা প্রদান।'
                  : 'Become Bangladesh\'s most trusted and popular ticket marketplace. All transports, all routes, all times — providing safe ticket services everywhere.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${cls}`}>
            {isBn ? 'আমাদের অর্জন' : 'Our Achievements'}
          </h2>
          <p className={`text-muted-foreground ${cls}`}>
            {isBn
              ? 'সংখ্যায় আমাদের সেবার প্রমাণ'
              : 'Numbers that prove our service'}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => {
            const IconComp = s.icon;
            return (
              <Card key={i} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <IconComp className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold text-primary mb-1">{s.value}</p>
                  <p className={`text-sm text-muted-foreground ${cls}`}>{s.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Core Values */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${cls}`}>
            {isBn ? 'আমাদের মূল মূল্যবোধ' : 'Our Core Values'}
          </h2>
          <p className={`text-muted-foreground ${cls}`}>
            {isBn
              ? 'যে মূল্যবোধ আমাদের প্রতিটি সেবায় প্রতিফলিত'
              : 'Values reflected in every service we provide'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {coreValues.map((v, i) => {
            const IconComp = v.icon;
            return (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className={`font-semibold text-lg ${cls}`}>{v.title}</h3>
                  </div>
                  <p className={`text-muted-foreground text-sm leading-relaxed ${cls}`}>
                    {v.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${cls}`}>
            {isBn ? 'আমাদের দল' : 'Our Team'}
          </h2>
          <p className={`text-muted-foreground ${cls}`}>
            {isBn
              ? 'অভিজ্ঞ ও দক্ষ দল আমাদের সেবার মান নিশ্চিত করে'
              : 'Experienced and skilled team ensuring service quality'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <Card key={i} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className={`font-semibold mb-1 ${cls}`}>{member.name}</h3>
                <Badge variant="outline" className="mb-3 text-xs">
                  {member.role}
                </Badge>
                <p className={`text-muted-foreground text-sm leading-relaxed ${cls}`}>
                  {member.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Info */}
      <section>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className={`font-semibold text-lg ${cls}`}>
                {isBn ? 'যোগাযোগ তথ্য' : 'Contact Information'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className={`font-medium text-sm ${cls}`}>
                    {isBn ? 'ফোন' : 'Phone'}
                  </p>
                  <p className="text-sm text-muted-foreground">+880 1234-567890</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className={`font-medium text-sm ${cls}`}>
                    {isBn ? 'ইমেইল' : 'Email'}
                  </p>
                  <p className="text-sm text-muted-foreground">support@eidticketresell.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className={`font-medium text-sm ${cls}`}>
                    {isBn ? 'অফিস' : 'Office'}
                  </p>
                  <p className={`text-sm text-muted-foreground ${cls}`}>
                    {isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
