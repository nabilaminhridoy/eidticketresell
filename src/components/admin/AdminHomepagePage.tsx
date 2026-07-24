'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Home, ArrowLeft, LayoutDashboard, Search, Grid3X3, Star,
  List, BarChart3, Quote, MessageCircle, Clock, Edit, Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HomepageSectionData {
  id: string;
  sectionKey: string;
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
  content: string;
  contentBn: string;
  isVisible: boolean;
  order: number;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

const SECTION_META: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  hero: { label: 'Hero Banner', icon: LayoutDashboard, description: 'Main hero section with headline and search' },
  search: { label: 'Search Section', icon: Search, description: 'Transport search bar and filters' },
  categories: { label: 'Categories', icon: Grid3X3, description: 'Transport category cards' },
  featured_tickets: { label: 'Featured Tickets', icon: Star, description: 'Featured/popular ticket listings' },
  how_it_works: { label: 'How It Works', icon: List, description: 'Step-by-step guide section' },
  stats: { label: 'Statistics', icon: BarChart3, description: 'Platform statistics and trust indicators' },
  testimonials: { label: 'Testimonials', icon: Quote, description: 'Customer reviews and testimonials' },
  faqs: { label: 'FAQs Section', icon: MessageCircle, description: 'Frequently asked questions section' },
  cta: { label: 'CTA / Footer Settings', icon: Clock, description: 'Call-to-action and footer links' },
};

const DEFAULT_SECTION_CONTENT: Record<string, string> = {
  hero: JSON.stringify({ headline: 'Find & Book Tickets Instantly', subheadline: 'Bus, Train, Flight & Launch tickets across Bangladesh', ctaText: 'Search Tickets', backgroundImage: '/images/hero-bg.jpg' }),
  search: JSON.stringify({ sectionTitle: 'Search Your Journey', defaultTransportType: 'bus', showPopularRoutes: true }),
  categories: JSON.stringify({ sectionTitle: 'Choose Your Transport', layout: 'grid', visibleCategories: ['Bus', 'Train', 'Flight', 'Launch'] }),
  featured_tickets: JSON.stringify({ sectionTitle: 'Featured Tickets', maxTickets: 8, sortBy: 'popular' }),
  how_it_works: JSON.stringify({ sectionTitle: 'How It Works', steps: ['Search Tickets', 'Select & Pay', 'Receive & Travel'] }),
  stats: JSON.stringify({ sectionTitle: 'Trusted by Thousands', stats: ['10K+ Tickets Sold', '5K+ Happy Customers', '100+ Routes', '99% Satisfaction'] }),
  testimonials: JSON.stringify({ sectionTitle: 'What Our Customers Say', maxTestimonials: 3 }),
  faqs: JSON.stringify({ sectionTitle: 'Frequently Asked Questions', maxFaqs: 5, categoryFilter: 'all' }),
  cta: JSON.stringify({ footerDescription: "Bangladesh's trusted ticket marketplace", copyrightText: '© 2024 ETR. All rights reserved.', showSocialLinks: true, showPaymentIcons: true }),
};

const DEFAULT_SECTION_CONTENT_BN: Record<string, string> = {
  hero: JSON.stringify({ headline: 'টিকিট খুঁজুন এবং বুক করুন', subheadline: 'বাংলাদেশের বাস, ট্রেন, ফ্লাইট এবং লঞ্চ টিকিট', ctaText: 'টিকিট খুঁজুন', backgroundImage: '/images/hero-bg.jpg' }),
  search: JSON.stringify({ sectionTitle: 'আপনার যাত্রা খুঁজুন', defaultTransportType: 'bus', showPopularRoutes: true }),
  categories: JSON.stringify({ sectionTitle: 'আপনার যানবাহন নির্বাচন করুন', layout: 'grid', visibleCategories: ['বাস', 'ট্রেন', 'ফ্লাইট', 'লঞ্চ'] }),
  featured_tickets: JSON.stringify({ sectionTitle: 'বিশেষ টিকিট', maxTickets: 8, sortBy: 'popular' }),
  how_it_works: JSON.stringify({ sectionTitle: 'কিভাবে কাজ করে', steps: ['টিকিট খুঁজুন', 'নির্বাচন করুন এবং পেমেন্ট করুন', 'পান এবং ভ্রমণ করুন'] }),
  stats: JSON.stringify({ sectionTitle: 'হাজারো মানুষের ভরসা', stats: ['10K+ টিকিট বিক্রি', '5K+ সন্তুষ্ট ক্রেতা', '100+ রুট', '99% সন্তুষ্টি'] }),
  testimonials: JSON.stringify({ sectionTitle: 'আমাদের ক্রেতারা কি বলেন', maxTestimonials: 3 }),
  faqs: JSON.stringify({ sectionTitle: 'সাধারণ জিজ্ঞাসা', maxFaqs: 5, categoryFilter: 'all' }),
  cta: JSON.stringify({ footerDescription: 'বাংলাদেশের বিশ্বস্ত টিকিট মার্কেটপ্লেস', copyrightText: '© 2024 ETR. সর্বস্বত্ব সংরক্ষিত।', showSocialLinks: true, showPaymentIcons: true }),
};

export default function AdminHomepagePage({ section }: { section?: string }) {
  const [sections, setSections] = useState<HomepageSectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const currentSection = section || null;

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/homepage', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load homepage sections', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getOrCreateSectionData = (sectionKey: string): HomepageSectionData => {
    const existing = sections.find(s => s.sectionKey === sectionKey);
    if (existing) return existing;

    const meta = SECTION_META[sectionKey];
    return {
      id: '',
      sectionKey,
      title: meta?.label || sectionKey,
      titleBn: '',
      subtitle: '',
      subtitleBn: '',
      content: DEFAULT_SECTION_CONTENT[sectionKey] || '{}',
      contentBn: DEFAULT_SECTION_CONTENT_BN[sectionKey] || '{}',
      isVisible: true,
      order: 0,
    };
  };

  const updateSectionData = (sectionKey: string, updates: Partial<HomepageSectionData>) => {
    setSections(prev => {
      const existing = prev.find(s => s.sectionKey === sectionKey);
      if (existing) {
        return prev.map(s => s.sectionKey === sectionKey ? { ...s, ...updates } : s);
      }
      const newSection = { ...getOrCreateSectionData(sectionKey), ...updates };
      return [...prev, newSection];
    });
  };

  const saveSection = async (sectionKey: string) => {
    setSaving(true);
    const sectionData = getOrCreateSectionData(sectionKey);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state with saved data
        if (data.section) {
          setSections(prev => {
            const existing = prev.find(s => s.sectionKey === sectionKey);
            if (existing) {
              return prev.map(s => s.sectionKey === sectionKey ? { ...s, ...data.section } : s);
            }
            return [...prev, data.section];
          });
        }
        toast({ title: 'Success', description: `${SECTION_META[sectionKey]?.label || sectionKey} saved successfully` });
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error || 'Failed to save section', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error while saving', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Section detail editor
  if (currentSection) {
    const secData = getOrCreateSectionData(currentSection);
    const meta = SECTION_META[currentSection];

    // Parse content JSON for editing
    let contentObj: Record<string, unknown> = {};
    try {
      contentObj = JSON.parse(secData.content || '{}');
    } catch { contentObj = {}; }

    let contentBnObj: Record<string, unknown> = {};
    try {
      contentBnObj = JSON.parse(secData.contentBn || '{}');
    } catch { contentBnObj = {}; }

    const updateContentField = (field: string, value: unknown) => {
      const updated = { ...contentObj, [field]: value };
      updateSectionData(currentSection, { content: JSON.stringify(updated) });
    };

    const updateContentBnField = (field: string, value: unknown) => {
      const updated = { ...contentBnObj, [field]: value };
      updateSectionData(currentSection, { contentBn: JSON.stringify(updated) });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/homepage"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Edit: {meta?.label || currentSection}</h1>
          <Badge variant={secData.isVisible ? 'default' : 'secondary'}>
            {secData.isVisible ? 'Visible' : 'Hidden'}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {meta?.icon && <meta.icon className="w-5 h-5" />}
                {meta?.label} Settings
              </CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm">Enabled</label>
                <Switch
                  checked={secData.isVisible}
                  onCheckedChange={(checked) => updateSectionData(currentSection, { isVisible: checked })}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Title fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title (English)</label>
                <Input value={secData.title} onChange={(e) => updateSectionData(currentSection, { title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title (Bengali)</label>
                <Input value={secData.titleBn} onChange={(e) => updateSectionData(currentSection, { titleBn: e.target.value })} placeholder="বাংলা শিরোনাম" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subtitle (English)</label>
                <Input value={secData.subtitle} onChange={(e) => updateSectionData(currentSection, { subtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subtitle (Bengali)</label>
                <Input value={secData.subtitleBn} onChange={(e) => updateSectionData(currentSection, { subtitleBn: e.target.value })} placeholder="বাংলা উপশিরোনাম" />
              </div>
            </div>

            <Separator />

            {/* Section-specific content fields */}
            {currentSection === 'hero' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Headline</label>
                    <Input value={String(contentObj.headline || '')} onChange={(e) => updateContentField('headline', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Headline (Bengali)</label>
                    <Input value={String(contentBnObj.headline || '')} onChange={(e) => updateContentBnField('headline', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subheadline</label>
                    <Input value={String(contentObj.subheadline || '')} onChange={(e) => updateContentField('subheadline', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subheadline (Bengali)</label>
                    <Input value={String(contentBnObj.subheadline || '')} onChange={(e) => updateContentBnField('subheadline', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CTA Button Text</label>
                    <Input value={String(contentObj.ctaText || '')} onChange={(e) => updateContentField('ctaText', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CTA Button Text (Bengali)</label>
                    <Input value={String(contentBnObj.ctaText || '')} onChange={(e) => updateContentBnField('ctaText', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Background Image URL</label>
                  <Input value={String(contentObj.backgroundImage || '')} onChange={(e) => updateContentField('backgroundImage', e.target.value)} />
                </div>
              </>
            )}

            {currentSection === 'search' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input value={String(contentObj.sectionTitle || '')} onChange={(e) => updateContentField('sectionTitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title (Bengali)</label>
                    <Input value={String(contentBnObj.sectionTitle || '')} onChange={(e) => updateContentBnField('sectionTitle', e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={Boolean(contentObj.showPopularRoutes)} onCheckedChange={(checked) => updateContentField('showPopularRoutes', checked)} />
                  <label className="text-sm">Show popular routes</label>
                </div>
              </>
            )}

            {currentSection === 'categories' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input value={String(contentObj.sectionTitle || '')} onChange={(e) => updateContentField('sectionTitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title (Bengali)</label>
                    <Input value={String(contentBnObj.sectionTitle || '')} onChange={(e) => updateContentBnField('sectionTitle', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Layout</label>
                  <Input value={String(contentObj.layout || '')} onChange={(e) => updateContentField('layout', e.target.value)} placeholder="grid or cards" />
                </div>
              </>
            )}

            {currentSection === 'featured_tickets' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input value={String(contentObj.sectionTitle || '')} onChange={(e) => updateContentField('sectionTitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title (Bengali)</label>
                    <Input value={String(contentBnObj.sectionTitle || '')} onChange={(e) => updateContentBnField('sectionTitle', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Tickets to Show</label>
                    <Input type="number" value={String(contentObj.maxTickets || '')} onChange={(e) => updateContentField('maxTickets', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <Input value={String(contentObj.sortBy || '')} onChange={(e) => updateContentField('sortBy', e.target.value)} placeholder="popular, newest, price-low" />
                  </div>
                </div>
              </>
            )}

            {currentSection === 'how_it_works' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input value={String(contentObj.sectionTitle || '')} onChange={(e) => updateContentField('sectionTitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title (Bengali)</label>
                    <Input value={String(contentBnObj.sectionTitle || '')} onChange={(e) => updateContentBnField('sectionTitle', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Steps (JSON array)</label>
                  <Textarea value={secData.content} onChange={(e) => updateSectionData(currentSection, { content: e.target.value })} rows={6} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Steps (Bengali JSON)</label>
                  <Textarea value={secData.contentBn} onChange={(e) => updateSectionData(currentSection, { contentBn: e.target.value })} rows={6} />
                </div>
              </>
            )}

            {currentSection === 'stats' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input value={String(contentObj.sectionTitle || '')} onChange={(e) => updateContentField('sectionTitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title (Bengali)</label>
                    <Input value={String(contentBnObj.sectionTitle || '')} onChange={(e) => updateContentBnField('sectionTitle', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stats Data (JSON)</label>
                  <Textarea value={secData.content} onChange={(e) => updateSectionData(currentSection, { content: e.target.value })} rows={6} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stats Data (Bengali JSON)</label>
                  <Textarea value={secData.contentBn} onChange={(e) => updateSectionData(currentSection, { contentBn: e.target.value })} rows={6} />
                </div>
              </>
            )}

            {currentSection === 'testimonials' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input value={String(contentObj.sectionTitle || '')} onChange={(e) => updateContentField('sectionTitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title (Bengali)</label>
                    <Input value={String(contentBnObj.sectionTitle || '')} onChange={(e) => updateContentBnField('sectionTitle', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Testimonials</label>
                  <Input type="number" value={String(contentObj.maxTestimonials || '')} onChange={(e) => updateContentField('maxTestimonials', parseInt(e.target.value) || 0)} />
                </div>
              </>
            )}

            {currentSection === 'faqs' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input value={String(contentObj.sectionTitle || '')} onChange={(e) => updateContentField('sectionTitle', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title (Bengali)</label>
                    <Input value={String(contentBnObj.sectionTitle || '')} onChange={(e) => updateContentBnField('sectionTitle', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max FAQs to Show</label>
                    <Input type="number" value={String(contentObj.maxFaqs || '')} onChange={(e) => updateContentField('maxFaqs', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category Filter</label>
                    <Input value={String(contentObj.categoryFilter || '')} onChange={(e) => updateContentField('categoryFilter', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {currentSection === 'cta' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Footer Description</label>
                    <Textarea value={String(contentObj.footerDescription || '')} onChange={(e) => updateContentField('footerDescription', e.target.value)} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Footer Description (Bengali)</label>
                    <Textarea value={String(contentBnObj.footerDescription || '')} onChange={(e) => updateContentBnField('footerDescription', e.target.value)} rows={2} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Copyright Text</label>
                    <Input value={String(contentObj.copyrightText || '')} onChange={(e) => updateContentField('copyrightText', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Copyright Text (Bengali)</label>
                    <Input value={String(contentBnObj.copyrightText || '')} onChange={(e) => updateContentBnField('copyrightText', e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={Boolean(contentObj.showSocialLinks)} onCheckedChange={(checked) => updateContentField('showSocialLinks', checked)} />
                    <label className="text-sm">Show social media links</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={Boolean(contentObj.showPaymentIcons)} onCheckedChange={(checked) => updateContentField('showPaymentIcons', checked)} />
                    <label className="text-sm">Show payment method icons</label>
                  </div>
                </div>
              </>
            )}

            {/* Generic content editor for any section */}
            {!['hero', 'search', 'categories', 'featured_tickets', 'how_it_works', 'stats', 'testimonials', 'faqs', 'cta'].includes(currentSection) && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content (JSON)</label>
                  <Textarea value={secData.content} onChange={(e) => updateSectionData(currentSection, { content: e.target.value })} rows={8} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content (Bengali JSON)</label>
                  <Textarea value={secData.contentBn} onChange={(e) => updateSectionData(currentSection, { contentBn: e.target.value })} rows={8} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={() => saveSection(currentSection)} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => fetchSections()}>Refresh</Button>
        </div>
      </div>
    );
  }

  // Overview with section toggles
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Merge DB sections with meta to show all available sections
  const allSectionKeys = Object.keys(SECTION_META);
  const displaySections = allSectionKeys.map(key => {
    const dbSection = sections.find(s => s.sectionKey === key);
    const meta = SECTION_META[key];
    return {
      key,
      label: meta.label,
      icon: meta.icon,
      description: meta.description,
      isVisible: dbSection?.isVisible ?? true,
      hasData: !!dbSection,
      title: dbSection?.title || meta.label,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Home className="w-6 h-6" />Homepage Sections</h1>
          <p className="text-sm text-muted-foreground">Manage homepage layout and section settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displaySections.map(sec => (
          <Card key={sec.key} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <sec.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{sec.label}</h3>
                    <p className="text-xs text-muted-foreground">{sec.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sec.hasData ? 'default' : 'secondary'}>
                    {sec.hasData ? 'Configured' : 'Default'}
                  </Badge>
                  <Switch
                    checked={sec.isVisible}
                    onCheckedChange={(checked) => {
                      // Update visibility via API
                      updateSectionData(sec.key, { isVisible: checked });
                    }}
                  />
                </div>
              </div>
              <Link href={`/admin/homepage/${sec.key}`}>
                <Button variant="outline" size="sm" className="w-full gap-1 mt-2">
                  <Edit className="w-3.5 h-3.5" />Edit {sec.label}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
