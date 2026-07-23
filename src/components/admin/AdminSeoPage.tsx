'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Search, Globe, FileText, Code, Twitter, Map, AlertTriangle,
  ArrowLeft, Edit, Eye, BarChart3, Settings, List, ExternalLink, Trash2, Plus
} from 'lucide-react';

interface SeoSection {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

export default function AdminSeoPage({ section }: { section?: string }) {
  const currentSection = section || null;

  const seoSections: SeoSection[] = [
    { key: 'homepage', label: 'Homepage SEO', icon: Globe, description: 'Meta title, description, and keywords for homepage' },
    { key: 'blog', label: 'Blog SEO', icon: FileText, description: 'SEO settings for blog listing and posts' },
    { key: 'pages', label: 'Pages SEO', icon: FileText, description: 'SEO settings for static pages' },
    { key: 'open-graph', label: 'Open Graph', icon: Code, description: 'Facebook and social sharing meta tags' },
    { key: 'twitter-card', label: 'Twitter Card', icon: Twitter, description: 'Twitter card meta tags configuration' },
    { key: 'schema', label: 'Schema Markup', icon: Code, description: 'Structured data / JSON-LD configuration' },
    { key: 'robots-txt', label: 'Robots.txt', icon: Settings, description: 'Search engine crawling rules' },
    { key: 'sitemap', label: 'Sitemap', icon: Map, description: 'XML sitemap configuration' },
    { key: 'redirects', label: '301 Redirects', icon: ExternalLink, description: 'URL redirect management' },
    { key: '404-monitor', label: '404 Monitor', icon: AlertTriangle, description: 'Track and fix broken links' },
  ];

  // Sub-section detail view
  if (currentSection) {
    const sec = seoSections.find(s => s.key === currentSection);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/seo"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">{sec?.label || currentSection}</h1>
        </div>

        {currentSection === 'homepage' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Homepage SEO Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Meta Title</label><Input defaultValue="ETR - Buy & Sell Bus, Train, Flight, Launch Tickets in Bangladesh" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Meta Description</label><Textarea defaultValue="Bangladesh's trusted ticket marketplace. Buy and sell bus, train, flight, and launch tickets with secure payments and instant verification." rows={3} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Meta Keywords</label><Input defaultValue="bus tickets, train tickets, flight tickets, launch tickets, Bangladesh" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Canonical URL</label><Input defaultValue="https://etr.com.bd" /></div>
              <Button>Save</Button>
            </CardContent>
          </Card>
        )}

        {currentSection === 'blog' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Blog SEO Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Blog Listing Title</label><Input defaultValue="ETR Blog - Travel Tips & Guides" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Blog Listing Description</label><Textarea defaultValue="Read travel guides, tips, and news about transportation in Bangladesh." rows={3} /></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Auto-generate SEO for new posts</label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Include blog in sitemap</label></div>
              <Button>Save</Button>
            </CardContent>
          </Card>
        )}

        {currentSection === 'pages' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Pages SEO Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">Configure SEO meta tags for each static page individually.</p>
              <div className="space-y-3">
                {['About Us', 'Contact Us', 'How It Works', 'Privacy Policy', 'Terms of Service'].map(page => (
                  <div key={page} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                    <span className="text-sm font-medium">{page}</span>
                    <Button variant="outline" size="sm"><Edit className="w-3.5 h-3.5" />Edit SEO</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentSection === 'open-graph' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Open Graph Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">og:site_name</label><Input defaultValue="ETR" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">og:title</label><Input defaultValue="ETR - Bangladesh Ticket Marketplace" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">og:description</label><Textarea defaultValue="Buy and sell tickets securely" rows={2} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">og:image</label><Input defaultValue="/images/og-image.jpg" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">og:url</label><Input defaultValue="https://etr.com.bd" /></div>
              <Button>Save</Button>
            </CardContent>
          </Card>
        )}

        {currentSection === 'twitter-card' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Twitter Card Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">twitter:card</label>
                <select className="w-full p-2 border rounded-lg text-sm"><option>summary</option><option>summary_large_image</option></select>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">twitter:site</label><Input defaultValue="@etr_bd" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">twitter:title</label><Input defaultValue="ETR - Bangladesh Ticket Marketplace" /></div>
              <div className="space-y-2"><label className="text-sm font-medium">twitter:image</label><Input defaultValue="/images/twitter-card.jpg" /></div>
              <Button>Save</Button>
            </CardContent>
          </Card>
        )}

        {currentSection === 'schema' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Schema Markup (JSON-LD)</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Enable Organization Schema</label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Enable WebSite Schema</label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Enable Product Schema (tickets)</label></div>
              <div className="space-y-2"><label className="text-sm font-medium">Custom Schema</label><Textarea placeholder="Add custom JSON-LD schema..." rows={5} /></div>
              <Button>Save</Button>
            </CardContent>
          </Card>
        )}

        {currentSection === 'robots-txt' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Robots.txt Configuration</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <Textarea defaultValue={`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /api/

Sitemap: https://etr.com.bd/sitemap.xml`} rows={10} className="font-mono" />
              <Button>Save & Regenerate</Button>
            </CardContent>
          </Card>
        )}

        {currentSection === 'sitemap' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Sitemap Configuration</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">Auto-generate sitemap</label></div>
              <div className="space-y-2"><label className="text-sm font-medium">Included Sections</label>
                <div className="space-y-2">
                  {['Homepage', 'Blog', 'Static Pages', 'Ticket Listings', 'Category Pages'].map(s => (
                    <div key={s} className="flex items-center gap-2"><Switch defaultChecked /><label className="text-sm">{s}</label></div>
                  ))}
                </div>
              </div>
              <Button>Generate Sitemap</Button>
            </CardContent>
          </Card>
        )}

        {currentSection === 'redirects' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">301 Redirects</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                {[
                  { from: '/old-about', to: '/about-us' },
                  { from: '/bus-tickets-old', to: '/buy-tickets?type=bus' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Input defaultValue={r.from} className="max-w-[200px]" />
                    <span className="text-muted-foreground">→</span>
                    <Input defaultValue={r.to} className="flex-1" />
                    <Button variant="ghost" size="icon" className="text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
              </div>
              <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />Add Redirect</Button>
            </CardContent>
          </Card>
        )}

        {currentSection === '404-monitor' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">404 Error Monitor</CardTitle>
                <Badge variant="destructive">12 errors</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {[
                { url: '/old-contact', hits: 45, lastSeen: '2 hours ago' },
                { url: '/deprecated-api/v1', hits: 12, lastSeen: '1 day ago' },
                { url: '/missing-page', hits: 8, lastSeen: '3 days ago' },
              ].map((err, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">{err.url}</p>
                    <p className="text-xs text-muted-foreground">Last seen: {err.lastSeen}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{err.hits} hits</Badge>
                    <Button variant="outline" size="sm">Fix</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Default fallback for unknown sections */}
        {!seoSections.find(s => s.key === currentSection) && (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">SEO settings for this section. Configure meta tags and optimization options.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Hub overview
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="w-6 h-6" />SEO Management</h1>
        <p className="text-sm text-muted-foreground">Configure SEO settings, meta tags, and search optimization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seoSections.map(sec => (
          <Link key={sec.key} href={`/admin/seo/${sec.key}`}>
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <sec.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{sec.label}</h3>
                    <p className="text-xs text-muted-foreground">{sec.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
