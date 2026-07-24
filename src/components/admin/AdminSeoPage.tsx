'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Search, Globe, FileText, Code, Twitter, Map, AlertTriangle,
  ArrowLeft, Edit, Settings, ExternalLink, Trash2, Plus,
  Loader2
} from 'lucide-react';

interface SeoSection {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

export default function AdminSeoPage({ section }: { section?: string }) {
  const currentSection = section || null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

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

  // Homepage SEO fields
  const [hpMetaTitle, setHpMetaTitle] = useState('ETR - Buy & Sell Bus, Train, Flight, Launch Tickets in Bangladesh');
  const [hpMetaDesc, setHpMetaDesc] = useState('Bangladesh\'s trusted ticket marketplace. Buy and sell bus, train, flight, and launch tickets with secure payments and instant verification.');
  const [hpKeywords, setHpKeywords] = useState('bus tickets, train tickets, flight tickets, launch tickets, Bangladesh');
  const [hpCanonical, setHpCanonical] = useState('https://etr.com.bd');

  // Blog SEO fields
  const [blogListingTitle, setBlogListingTitle] = useState('ETR Blog - Travel Tips & Guides');
  const [blogListingDesc, setBlogListingDesc] = useState('Read travel guides, tips, and news about transportation in Bangladesh.');
  const [blogAutoSeo, setBlogAutoSeo] = useState(true);
  const [blogIncludeSitemap, setBlogIncludeSitemap] = useState(true);

  // Open Graph fields
  const [ogSiteName, setOgSiteName] = useState('ETR');
  const [ogTitle, setOgTitle] = useState('ETR - Bangladesh Ticket Marketplace');
  const [ogDesc, setOgDesc] = useState('Buy and sell tickets securely');
  const [ogImage, setOgImage] = useState('/images/og-image.jpg');
  const [ogUrl, setOgUrl] = useState('https://etr.com.bd');

  // Twitter Card fields
  const [twitterCardType, setTwitterCardType] = useState('summary');
  const [twitterSite, setTwitterSite] = useState('@etr_bd');
  const [twitterTitle, setTwitterTitle] = useState('ETR - Bangladesh Ticket Marketplace');
  const [twitterImage, setTwitterImage] = useState('/images/twitter-card.jpg');

  // Schema fields
  const [schemaOrg, setSchemaOrg] = useState(true);
  const [schemaWeb, setSchemaWeb] = useState(true);
  const [schemaProduct, setSchemaProduct] = useState(true);
  const [customSchema, setCustomSchema] = useState('');

  // Robots.txt
  const [robotsTxt, setRobotsTxt] = useState('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account/\nDisallow: /api/\n\nSitemap: https://etr.com.bd/sitemap.xml');

  // Sitemap fields
  const [sitemapAuto, setSitemapAuto] = useState(true);
  const [sitemapHomepage, setSitemapHomepage] = useState(true);
  const [sitemapBlog, setSitemapBlog] = useState(true);
  const [sitemapPages, setSitemapPages] = useState(true);
  const [sitemapTickets, setSitemapTickets] = useState(true);
  const [sitemapCategories, setSitemapCategories] = useState(true);

  // Redirects
  const [redirects, setRedirects] = useState<{ from: string; to: string }[]>([
    { from: '/old-about', to: '/about-us' },
    { from: '/bus-tickets-old', to: '/buy-tickets?type=bus' },
  ]);

  // Fetch SEO settings and initialize all fields in the async callback
  useEffect(() => {
    fetch('/api/admin/seo', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          const map: Record<string, string> = {};
          d.settings.forEach((s: { key: string; value: string }) => {
            map[s.key] = s.value;
          });
          // Initialize all fields from fetched data (async callback is OK for setState)
          setHpMetaTitle(map['seo_homepage_meta_title'] || 'ETR - Buy & Sell Bus, Train, Flight, Launch Tickets in Bangladesh');
          setHpMetaDesc(map['seo_homepage_meta_description'] || 'Bangladesh\'s trusted ticket marketplace. Buy and sell bus, train, flight, and launch tickets with secure payments and instant verification.');
          setHpKeywords(map['seo_homepage_keywords'] || 'bus tickets, train tickets, flight tickets, launch tickets, Bangladesh');
          setHpCanonical(map['seo_homepage_canonical'] || 'https://etr.com.bd');
          setBlogListingTitle(map['seo_blog_listing_title'] || 'ETR Blog - Travel Tips & Guides');
          setBlogListingDesc(map['seo_blog_listing_description'] || 'Read travel guides, tips, and news about transportation in Bangladesh.');
          setBlogAutoSeo(map['seo_blog_auto_seo'] !== 'false');
          setBlogIncludeSitemap(map['seo_blog_include_sitemap'] !== 'false');
          setOgSiteName(map['seo_og_site_name'] || 'ETR');
          setOgTitle(map['seo_og_title'] || 'ETR - Bangladesh Ticket Marketplace');
          setOgDesc(map['seo_og_description'] || 'Buy and sell tickets securely');
          setOgImage(map['seo_og_image'] || '/images/og-image.jpg');
          setOgUrl(map['seo_og_url'] || 'https://etr.com.bd');
          setTwitterCardType(map['seo_twitter_card_type'] || 'summary');
          setTwitterSite(map['seo_twitter_site'] || '@etr_bd');
          setTwitterTitle(map['seo_twitter_title'] || 'ETR - Bangladesh Ticket Marketplace');
          setTwitterImage(map['seo_twitter_image'] || '/images/twitter-card.jpg');
          setSchemaOrg(map['seo_schema_org'] !== 'false');
          setSchemaWeb(map['seo_schema_web'] !== 'false');
          setSchemaProduct(map['seo_schema_product'] !== 'false');
          setCustomSchema(map['seo_custom_schema'] || '');
          setRobotsTxt(map['seo_robots_txt'] || 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account/\nDisallow: /api/\n\nSitemap: https://etr.com.bd/sitemap.xml');
          setSitemapAuto(map['seo_sitemap_auto'] !== 'false');
          setSitemapHomepage(map['seo_sitemap_homepage'] !== 'false');
          setSitemapBlog(map['seo_sitemap_blog'] !== 'false');
          setSitemapPages(map['seo_sitemap_pages'] !== 'false');
          setSitemapTickets(map['seo_sitemap_tickets'] !== 'false');
          setSitemapCategories(map['seo_sitemap_categories'] !== 'false');
          // Parse redirects from settings
          const redirectsStr = map['seo_redirects'] || '/old-about,/about-us|/bus-tickets-old,/buy-tickets?type=bus';
          const parsedRedirects = redirectsStr.split('|').filter(Boolean).map(r => {
            const parts = r.split(',');
            return { from: parts[0] || '', to: parts[1] || '' };
          });
          if (parsedRedirects.length > 0) setRedirects(parsedRedirects);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveSeo = async (settings: { key: string; value: string }[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaved(prev => ({ ...prev, [settings[0]?.key?.split('_')[1] || 'general']: true }));
        setTimeout(() => setSaved(prev => ({ ...prev, [settings[0]?.key?.split('_')[1] || 'general']: false })), 2000);
      }
    } catch {
      // Save failed silently
    }
    setSaving(false);
  };

  const markSaved = (sectionKey: string) => {
    setSaved(prev => ({ ...prev, [sectionKey]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [sectionKey]: false })), 2000);
  };

  // Sub-section detail view
  if (currentSection) {
    const sec = seoSections.find(s => s.key === currentSection);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/seo"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />Back</Button></Link>
          <h1 className="text-xl font-bold">{sec?.label || currentSection}</h1>
        </div>

        {loading && <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

        {!loading && currentSection === 'homepage' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Homepage SEO Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Meta Title</label><Input value={hpMetaTitle} onChange={e => setHpMetaTitle(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Meta Description</label><Textarea value={hpMetaDesc} onChange={e => setHpMetaDesc(e.target.value)} rows={3} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Meta Keywords</label><Input value={hpKeywords} onChange={e => setHpKeywords(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Canonical URL</label><Input value={hpCanonical} onChange={e => setHpCanonical(e.target.value)} /></div>
              <Button onClick={() => handleSaveSeo([
                { key: 'seo_homepage_meta_title', value: hpMetaTitle },
                { key: 'seo_homepage_meta_description', value: hpMetaDesc },
                { key: 'seo_homepage_keywords', value: hpKeywords },
                { key: 'seo_homepage_canonical', value: hpCanonical },
              ]).then(() => markSaved('homepage'))} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved['homepage'] ? 'Saved!' : 'Save'}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && currentSection === 'blog' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Blog SEO Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Blog Listing Title</label><Input value={blogListingTitle} onChange={e => setBlogListingTitle(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">Blog Listing Description</label><Textarea value={blogListingDesc} onChange={e => setBlogListingDesc(e.target.value)} rows={3} /></div>
              <div className="flex items-center gap-2"><Switch checked={blogAutoSeo} onCheckedChange={setBlogAutoSeo} /><label className="text-sm">Auto-generate SEO for new posts</label></div>
              <div className="flex items-center gap-2"><Switch checked={blogIncludeSitemap} onCheckedChange={setBlogIncludeSitemap} /><label className="text-sm">Include blog in sitemap</label></div>
              <Button onClick={() => handleSaveSeo([
                { key: 'seo_blog_listing_title', value: blogListingTitle },
                { key: 'seo_blog_listing_description', value: blogListingDesc },
                { key: 'seo_blog_auto_seo', value: blogAutoSeo ? 'true' : 'false' },
                { key: 'seo_blog_include_sitemap', value: blogIncludeSitemap ? 'true' : 'false' },
              ]).then(() => markSaved('blog'))} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved['blog'] ? 'Saved!' : 'Save'}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && currentSection === 'pages' && (
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

        {!loading && currentSection === 'open-graph' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Open Graph Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">og:site_name</label><Input value={ogSiteName} onChange={e => setOgSiteName(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">og:title</label><Input value={ogTitle} onChange={e => setOgTitle(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">og:description</label><Textarea value={ogDesc} onChange={e => setOgDesc(e.target.value)} rows={2} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">og:image</label><Input value={ogImage} onChange={e => setOgImage(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">og:url</label><Input value={ogUrl} onChange={e => setOgUrl(e.target.value)} /></div>
              <Button onClick={() => handleSaveSeo([
                { key: 'seo_og_site_name', value: ogSiteName },
                { key: 'seo_og_title', value: ogTitle },
                { key: 'seo_og_description', value: ogDesc },
                { key: 'seo_og_image', value: ogImage },
                { key: 'seo_og_url', value: ogUrl },
              ]).then(() => markSaved('open-graph'))} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved['open-graph'] ? 'Saved!' : 'Save'}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && currentSection === 'twitter-card' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Twitter Card Settings</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">twitter:card</label>
                <select className="w-full p-2 border rounded-lg text-sm" value={twitterCardType} onChange={e => setTwitterCardType(e.target.value)}><option value="summary">summary</option><option value="summary_large_image">summary_large_image</option></select>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">twitter:site</label><Input value={twitterSite} onChange={e => setTwitterSite(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">twitter:title</label><Input value={twitterTitle} onChange={e => setTwitterTitle(e.target.value)} /></div>
              <div className="space-y-2"><label className="text-sm font-medium">twitter:image</label><Input value={twitterImage} onChange={e => setTwitterImage(e.target.value)} /></div>
              <Button onClick={() => handleSaveSeo([
                { key: 'seo_twitter_card_type', value: twitterCardType },
                { key: 'seo_twitter_site', value: twitterSite },
                { key: 'seo_twitter_title', value: twitterTitle },
                { key: 'seo_twitter_image', value: twitterImage },
              ]).then(() => markSaved('twitter-card'))} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved['twitter-card'] ? 'Saved!' : 'Save'}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && currentSection === 'schema' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Schema Markup (JSON-LD)</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Switch checked={schemaOrg} onCheckedChange={setSchemaOrg} /><label className="text-sm">Enable Organization Schema</label></div>
              <div className="flex items-center gap-2"><Switch checked={schemaWeb} onCheckedChange={setSchemaWeb} /><label className="text-sm">Enable WebSite Schema</label></div>
              <div className="flex items-center gap-2"><Switch checked={schemaProduct} onCheckedChange={setSchemaProduct} /><label className="text-sm">Enable Product Schema (tickets)</label></div>
              <div className="space-y-2"><label className="text-sm font-medium">Custom Schema</label><Textarea value={customSchema} onChange={e => setCustomSchema(e.target.value)} placeholder="Add custom JSON-LD schema..." rows={5} /></div>
              <Button onClick={() => handleSaveSeo([
                { key: 'seo_schema_org', value: schemaOrg ? 'true' : 'false' },
                { key: 'seo_schema_web', value: schemaWeb ? 'true' : 'false' },
                { key: 'seo_schema_product', value: schemaProduct ? 'true' : 'false' },
                { key: 'seo_custom_schema', value: customSchema },
              ]).then(() => markSaved('schema'))} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved['schema'] ? 'Saved!' : 'Save'}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && currentSection === 'robots-txt' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Robots.txt Configuration</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <Textarea value={robotsTxt} onChange={e => setRobotsTxt(e.target.value)} rows={10} className="font-mono" />
              <Button onClick={() => handleSaveSeo([
                { key: 'seo_robots_txt', value: robotsTxt },
              ]).then(() => markSaved('robots-txt'))} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved['robots-txt'] ? 'Saved!' : 'Save & Regenerate'}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && currentSection === 'sitemap' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Sitemap Configuration</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2"><Switch checked={sitemapAuto} onCheckedChange={setSitemapAuto} /><label className="text-sm">Auto-generate sitemap</label></div>
              <div className="space-y-2"><label className="text-sm font-medium">Included Sections</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><Switch checked={sitemapHomepage} onCheckedChange={setSitemapHomepage} /><label className="text-sm">Homepage</label></div>
                  <div className="flex items-center gap-2"><Switch checked={sitemapBlog} onCheckedChange={setSitemapBlog} /><label className="text-sm">Blog</label></div>
                  <div className="flex items-center gap-2"><Switch checked={sitemapPages} onCheckedChange={setSitemapPages} /><label className="text-sm">Static Pages</label></div>
                  <div className="flex items-center gap-2"><Switch checked={sitemapTickets} onCheckedChange={setSitemapTickets} /><label className="text-sm">Ticket Listings</label></div>
                  <div className="flex items-center gap-2"><Switch checked={sitemapCategories} onCheckedChange={setSitemapCategories} /><label className="text-sm">Category Pages</label></div>
                </div>
              </div>
              <Button onClick={() => handleSaveSeo([
                { key: 'seo_sitemap_auto', value: sitemapAuto ? 'true' : 'false' },
                { key: 'seo_sitemap_homepage', value: sitemapHomepage ? 'true' : 'false' },
                { key: 'seo_sitemap_blog', value: sitemapBlog ? 'true' : 'false' },
                { key: 'seo_sitemap_pages', value: sitemapPages ? 'true' : 'false' },
                { key: 'seo_sitemap_tickets', value: sitemapTickets ? 'true' : 'false' },
                { key: 'seo_sitemap_categories', value: sitemapCategories ? 'true' : 'false' },
              ]).then(() => markSaved('sitemap'))} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved['sitemap'] ? 'Saved!' : 'Generate Sitemap'}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && currentSection === 'redirects' && (
          <Card>
            <CardHeader><CardTitle className="text-lg">301 Redirects</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                {redirects.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Input value={r.from} onChange={e => { const newRedirects = [...redirects]; newRedirects[i] = { ...newRedirects[i], from: e.target.value }; setRedirects(newRedirects); }} className="max-w-[200px]" />
                    <span className="text-muted-foreground">→</span>
                    <Input value={r.to} onChange={e => { const newRedirects = [...redirects]; newRedirects[i] = { ...newRedirects[i], to: e.target.value }; setRedirects(newRedirects); }} className="flex-1" />
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => { setRedirects(redirects.filter((_, j) => j !== i)); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
              </div>
              <Button size="sm" className="gap-1" onClick={() => setRedirects([...redirects, { from: '', to: '' }])}><Plus className="w-4 h-4" />Add Redirect</Button>
              <Button onClick={() => {
                const redirectsStr = redirects.map(r => `${r.from},${r.to}`).join('|');
                handleSaveSeo([{ key: 'seo_redirects', value: redirectsStr }]).then(() => markSaved('redirects'));
              }} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved['redirects'] ? 'Saved!' : 'Save Redirects'}</Button>
            </CardContent>
          </Card>
        )}

        {!loading && currentSection === '404-monitor' && (
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
        {!loading && !seoSections.find(s => s.key === currentSection) && (
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
