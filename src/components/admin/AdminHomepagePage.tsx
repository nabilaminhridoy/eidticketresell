'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Home, ArrowLeft, Eye, Star, Search, Image, Edit, Plus, Trash2,
  LayoutDashboard, Type, List, Grid3X3, Quote, BarChart3, Clock, MessageCircle
} from 'lucide-react';

interface HomepageSection {
  key: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  description: string;
}

export default function AdminHomepagePage({ section }: { section?: string }) {
  const [sections, setSections] = useState<HomepageSection[]>([
    { key: 'hero', label: 'Hero Banner', icon: LayoutDashboard, enabled: true, description: 'Main hero section with search and headline' },
    { key: 'search', label: 'Search Section', icon: Search, enabled: true, description: 'Transport search bar and filters' },
    { key: 'categories', label: 'Categories', icon: Grid3X3, enabled: true, description: 'Transport category cards (Bus, Train, Flight, Launch)' },
    { key: 'featured-tickets', label: 'Featured Tickets', icon: Star, enabled: true, description: 'Featured/popular ticket listings' },
    { key: 'how-it-works', label: 'How It Works', icon: List, enabled: true, description: 'Step-by-step guide section' },
    { key: 'statistics', label: 'Statistics', icon: BarChart3, enabled: true, description: 'Platform statistics and trust indicators' },
    { key: 'testimonials', label: 'Testimonials', icon: Quote, enabled: true, description: 'Customer reviews and testimonials' },
    { key: 'faqs', label: 'FAQs Section', icon: MessageCircle, enabled: true, description: 'Frequently asked questions section' },
    { key: 'footer', label: 'Footer Settings', icon: Clock, enabled: true, description: 'Footer links, social media, and info' },
  ]);

  const currentSection = section || null;

  // Section detail editor
  if (currentSection) {
    const sec = sections.find(s => s.key === currentSection);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/homepage"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">Edit: {sec?.label || currentSection}</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {sec?.icon && <sec.icon className="w-5 h-5" />}
                {sec?.label} Settings
              </CardTitle>
              <div className="flex items-center gap-2">
                <label className="text-sm">Enabled</label>
                <Switch checked={sec?.enabled} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {currentSection === 'hero' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Headline</label><Input defaultValue="Find & Book Tickets Instantly" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Subheadline</label><Input defaultValue="Bus, Train, Flight & Launch tickets across Bangladesh" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">CTA Button Text</label><Input defaultValue="Search Tickets" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Background Image</label><Input defaultValue="/images/hero-bg.jpg" /></div>
              </>
            )}
            {currentSection === 'search' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Section Title</label><Input defaultValue="Search Your Journey" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Default Transport Type</label>
                  <Select defaultValue="bus"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bus">Bus</SelectItem><SelectItem value="train">Train</SelectItem><SelectItem value="flight">Flight</SelectItem><SelectItem value="launch">Launch</SelectItem></SelectContent></Select>
                </div>
                <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Show popular routes</label></div>
              </>
            )}
            {currentSection === 'categories' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Section Title</label><Input defaultValue="Choose Your Transport" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Layout</label>
                  <Select defaultValue="grid"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="grid">Grid (4 columns)</SelectItem><SelectItem value="cards">Large Cards</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Categories Visible</p>
                  {['Bus', 'Train', 'Flight', 'Launch'].map(cat => (
                    <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm">{cat}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </>
            )}
            {currentSection === 'featured-tickets' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Section Title</label><Input defaultValue="Featured Tickets" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Max Tickets to Show</label><Input type="number" defaultValue={8} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Sort By</label>
                  <Select defaultValue="popular"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="popular">Most Popular</SelectItem><SelectItem value="newest">Newest</SelectItem><SelectItem value="price-low">Price: Low to High</SelectItem></SelectContent></Select>
                </div>
              </>
            )}
            {currentSection === 'how-it-works' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Section Title</label><Input defaultValue="How It Works" /></div>
                <div className="space-y-3">
                  {['1. Search Tickets', '2. Select & Pay', '3. Receive & Travel'].map((step, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <Input defaultValue={step} />
                      <Textarea defaultValue={`Description for step ${i+1}...`} rows={2} />
                    </div>
                  ))}
                </div>
              </>
            )}
            {currentSection === 'statistics' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Section Title</label><Input defaultValue="Trusted by Thousands" /></div>
                <div className="space-y-3">
                  {['10K+ Tickets Sold', '5K+ Happy Customers', '100+ Routes', '99% Satisfaction'].map(stat => (
                    <div key={stat} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <Input defaultValue={stat} className="max-w-[200px]" />
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </>
            )}
            {currentSection === 'testimonials' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Section Title</label><Input defaultValue="What Our Customers Say" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Max Testimonials</label><Input type="number" defaultValue={3} /></div>
              </>
            )}
            {currentSection === 'faqs' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Section Title</label><Input defaultValue="Frequently Asked Questions" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Max FAQs to Show</label><Input type="number" defaultValue={5} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Category Filter</label>
                  <Select defaultValue="all"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="buying">Buying</SelectItem><SelectItem value="payments">Payments</SelectItem></SelectContent></Select>
                </div>
              </>
            )}
            {currentSection === 'footer' && (
              <>
                <div className="space-y-2"><label className="text-sm font-medium">Footer Description</label><Textarea defaultValue="Bangladesh's trusted ticket marketplace" rows={2} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Copyright Text</label><Input defaultValue="© 2024 ETR. All rights reserved." /></div>
                <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Show social media links</label></div>
                <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Show payment method icons</label></div>
              </>
            )}
          </CardContent>
        </Card>
        <Button>Save Changes</Button>
      </div>
    );
  }

  // Overview with section toggles
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Home className="w-6 h-6" />Homepage Sections</h1>
          <p className="text-sm text-muted-foreground">Manage homepage layout and section settings</p>
        </div>
        <Button size="sm">Preview Homepage</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(sec => (
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
                <Switch
                  checked={sec.enabled}
                  onCheckedChange={(checked) => setSections(prev => prev.map(s => s.key === sec.key ? {...s, enabled: checked} : s))}
                />
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
