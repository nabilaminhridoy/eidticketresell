'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Upload, Trash2, Loader2, CheckCircle2, X, Image as ImageLucide,
  Palette, CreditCard, FolderOpen, Eye, RefreshCw, AlertCircle
} from 'lucide-react';

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}` };
}

interface ImageSetting {
  key: string;
  value: string;
  group: string;
}

interface MediaFile {
  key: string;
  value: string;
  group: string;
}

// Brand image definitions
const BRAND_IMAGES = [
  { key: 'site_logo', label: 'Site Logo (Light Mode)', description: 'Main logo displayed in header on light backgrounds', category: 'brand', subDir: 'logos' },
  { key: 'dark_mode_logo', label: 'Dark Mode Logo', description: 'Logo for dark theme header', category: 'brand', subDir: 'logos' },
  { key: 'site_favicon', label: 'Site Favicon', description: 'Browser tab icon (recommended: 32x32 or 16x16 PNG/ICO)', category: 'brand', subDir: 'favicon' },
];

// Payment image definitions
const PAYMENT_IMAGES = [
  { key: 'payment_gateway_logo', label: 'Payment Gateway Logo', description: 'General payment section logo', category: 'payment', subDir: 'payment' },
  { key: 'bkash_logo', label: 'bKash Logo', description: 'bKash mobile payment logo', category: 'payment', subDir: 'payment' },
  { key: 'nagad_logo', label: 'Nagad Logo', description: 'Nagad mobile payment logo', category: 'payment', subDir: 'payment' },
  { key: 'rocket_logo', label: 'Rocket Logo', description: 'Rocket mobile payment logo', category: 'payment', subDir: 'payment' },
];

export default function AdminMediaPage({ section }: { section?: string }) {
  const [imageSettings, setImageSettings] = useState<Record<string, string>>({});
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const currentSection = section || null;

  // Fetch media data on mount (using .then chains to avoid lint rule about setState in effects)
  useEffect(() => {
    fetch('/api/admin/media', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {};
        if (data.images) {
          data.images.forEach((s: ImageSetting) => {
            map[s.key] = s.value;
          });
        }
        setImageSettings(map);
        setMediaFiles(data.media || []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  // Refresh handler (called by button click, not inside an effect)
  const handleRefresh = () => {
    setLoading(true);
    fetch('/api/admin/media', { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {};
        if (data.images) {
          data.images.forEach((s: ImageSetting) => {
            map[s.key] = s.value;
          });
        }
        setImageSettings(map);
        setMediaFiles(data.media || []);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  };

  const showMessage = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpload = async (file: File, settingKey: string, category: string, subDir: string) => {
    setUploadingKey(settingKey);
    setUploadProgress(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('settingKey', settingKey);
    formData.append('category', category);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageSettings(prev => ({ ...prev, [settingKey]: data.path }));
        showMessage(`${settingKey} uploaded successfully!`);
        // Refresh data to get latest
        handleRefresh();
      } else {
        const err = await res.json();
        setUploadProgress(`Upload failed: ${err.error || 'Unknown error'}`);
        setTimeout(() => setUploadProgress(''), 3000);
      }
    } catch {
      setUploadProgress('Upload failed: Network error');
      setTimeout(() => setUploadProgress(''), 3000);
    }

    setUploadingKey(null);
    setUploadProgress('');
  };

  const handleDelete = async (settingKey: string) => {
    setDeletingKey(settingKey);
    try {
      const res = await fetch(`/api/admin/media?key=${settingKey}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setImageSettings(prev => ({ ...prev, [settingKey]: '' }));
        showMessage(`${settingKey} removed successfully!`);
        handleRefresh();
      }
    } catch {
      // silently handle
    }
    setDeletingKey(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, item: { key: string; category: string; subDir: string }) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadProgress('File too large. Maximum size is 5MB.');
        setTimeout(() => setUploadProgress(''), 3000);
        return;
      }
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
      if (!allowedTypes.includes(file.type)) {
        setUploadProgress('Invalid file type. Allowed: PNG, JPG, GIF, SVG, WEBP, ICO');
        setTimeout(() => setUploadProgress(''), 3000);
        return;
      }
      handleUpload(file, item.key, item.category, item.subDir);
    }
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent, item: { key: string; category: string; subDir: string }) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file, item.key, item.category, item.subDir);
    }
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(key);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);
  };

  // Image upload card component
  const ImageUploadCard = ({ item }: { item: { key: string; label: string; description: string; category: string; subDir: string } }) => {
    const currentValue = imageSettings[item.key] || '';
    const isUploading = uploadingKey === item.key;
    const isDeleting = deletingKey === item.key;
    const isDragOver = dragOverKey === item.key;

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">{item.label}</h4>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            {currentValue && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                disabled={isDeleting}
                onClick={() => handleDelete(item.key)}
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </Button>
            )}
          </div>

          {/* Image preview / upload drop zone */}
          <div
            className={`relative rounded-lg border-2 transition-all cursor-pointer ${
              isDragOver ? 'border-primary bg-primary/10 scale-[1.02]' :
              currentValue ? 'border-border' : 'border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/10'
            }`}
            onDrop={(e) => handleDrop(e, item)}
            onDragOver={(e) => handleDragOver(e, item.key)}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (!isUploading && fileInputRefs.current[item.key]) {
                fileInputRefs.current[item.key]?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Upload ${item.label}`}
          >
            <input
              ref={(el) => { fileInputRefs.current[item.key] = el; }}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp,image/x-icon,image/vnd.microsoft.icon"
              className="hidden"
              onChange={(e) => handleFileSelect(e, item)}
              aria-hidden="true"
            />

            {isUploading ? (
              <div className="aspect-[4/3] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}</p>
                </div>
              </div>
            ) : currentValue ? (
              <div className="aspect-[4/3] flex items-center justify-center overflow-hidden bg-muted/20 relative group">
                <img
                  src={currentValue}
                  alt={item.label}
                  className="max-w-full max-h-full object-contain p-2 transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Eye className="w-5 h-5 text-white" />
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] flex items-center justify-center cursor-pointer">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <p className="text-sm font-medium">Drop image or click to upload</p>
                  <p className="text-xs">PNG, JPG, SVG, GIF, WEBP, ICO (max 5MB)</p>
                </div>
              </div>
            )}
          </div>

          {currentValue && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                Uploaded
              </Badge>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{currentValue}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Upload view
  if (currentSection === 'upload') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Upload className="w-6 h-6" />Upload Media</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="p-8 border-2 border-dashed rounded-lg text-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Drag and drop files here</p>
              <p className="text-sm text-muted-foreground">or click to browse your files</p>
              <p className="text-xs text-muted-foreground mt-2">Supported: JPG, PNG, GIF, SVG, WEBP, ICO (Max 5MB)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Folders view
  if (currentSection === 'folders') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><FolderOpen className="w-6 h-6" />Media Folders</h1>
        </div>
        <Card className="p-8 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Media folders are organized automatically based on upload category.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="outline">logos</Badge>
            <Badge variant="outline">favicon</Badge>
            <Badge variant="outline">payment</Badge>
            <Badge variant="outline">general</Badge>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Success message toast
  const SuccessToast = successMessage ? (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-lg">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm font-medium">{successMessage}</span>
        <button onClick={() => setSuccessMessage('')} className="ml-2 hover:bg-emerald-100 rounded p-0.5">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  ) : null;

  // Upload progress toast
  const ProgressToast = uploadProgress ? (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 shadow-lg">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{uploadProgress}</span>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      {SuccessToast}
      {ProgressToast}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ImageLucide className="w-6 h-6" />Media Library</h1>
          <p className="text-sm text-muted-foreground">Manage logos, favicon, payment images, and uploaded media</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      <Tabs defaultValue="brand">
        <TabsList>
          <TabsTrigger value="brand" className="gap-1">
            <Palette className="w-3.5 h-3.5" />Brand Assets
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-1">
            <CreditCard className="w-3.5 h-3.5" />Payment Images
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-1">
            <FolderOpen className="w-3.5 h-3.5" />Media Library
          </TabsTrigger>
        </TabsList>

        {/* Brand Assets Tab */}
        <TabsContent value="brand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Logo & Favicon
              </CardTitle>
              <CardDescription>
                Upload and manage your site&apos;s brand identity assets. These images appear in the header, browser tab, and throughout the site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BRAND_IMAGES.map((item) => (
                  <ImageUploadCard key={item.key} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview section */}
          {(imageSettings['site_logo'] || imageSettings['dark_mode_logo'] || imageSettings['site_favicon']) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brand Preview</CardTitle>
                <CardDescription>How your brand assets appear on the site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-6 p-4 rounded-lg bg-muted/30">
                  {/* Light mode preview */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                    <span className="text-xs text-gray-500 mr-1">Light:</span>
                    {imageSettings['site_logo'] ? (
                      <img src={imageSettings['site_logo']} alt="Site Logo" className="h-8 max-w-[120px] object-contain" />
                    ) : (
                      <span className="text-xs text-gray-400">No logo</span>
                    )}
                  </div>
                  {/* Dark mode preview */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-700">
                    <span className="text-xs text-gray-400 mr-1">Dark:</span>
                    {imageSettings['dark_mode_logo'] ? (
                      <img src={imageSettings['dark_mode_logo']} alt="Dark Mode Logo" className="h-8 max-w-[120px] object-contain" />
                    ) : (
                      <span className="text-xs text-gray-500">No logo</span>
                    )}
                  </div>
                  {/* Favicon preview */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                    <span className="text-xs text-muted-foreground mr-1">Favicon:</span>
                    {imageSettings['site_favicon'] ? (
                      <img src={imageSettings['site_favicon']} alt="Favicon" className="h-6 w-6 object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No favicon</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment Gateway Images Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Gateway Images
              </CardTitle>
              <CardDescription>
                Upload logos for payment methods displayed on the checkout and wallet pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PAYMENT_IMAGES.map((item) => (
                  <ImageUploadCard key={item.key} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment preview section */}
          {(imageSettings['bkash_logo'] || imageSettings['nagad_logo'] || imageSettings['rocket_logo'] || imageSettings['payment_gateway_logo']) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods Preview</CardTitle>
                <CardDescription>How payment options appear to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-center gap-4 p-6 rounded-lg bg-muted/30">
                  {imageSettings['payment_gateway_logo'] && (
                    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border">
                      <img src={imageSettings['payment_gateway_logo']} alt="Payment Gateway" className="h-12 max-w-[100px] object-contain" />
                      <span className="text-xs text-muted-foreground">Gateway</span>
                    </div>
                  )}
                  {imageSettings['bkash_logo'] && (
                    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border">
                      <img src={imageSettings['bkash_logo']} alt="bKash" className="h-12 max-w-[100px] object-contain" />
                      <span className="text-xs text-muted-foreground">bKash</span>
                    </div>
                  )}
                  {imageSettings['nagad_logo'] && (
                    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border">
                      <img src={imageSettings['nagad_logo']} alt="Nagad" className="h-12 max-w-[100px] object-contain" />
                      <span className="text-xs text-muted-foreground">Nagad</span>
                    </div>
                  )}
                  {imageSettings['rocket_logo'] && (
                    <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border">
                      <img src={imageSettings['rocket_logo']} alt="Rocket" className="h-12 max-w-[100px] object-contain" />
                      <span className="text-xs text-muted-foreground">Rocket</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <ImageLucide className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Separator />

          {/* All images grid */}
          {(() => {
            // Combine all image settings that have values with general media files
            const allItems: Array<{ key: string; value: string; label: string; group: string }> = [];

            // Brand images
            BRAND_IMAGES.forEach(item => {
              if (imageSettings[item.key]) {
                allItems.push({ key: item.key, value: imageSettings[item.key], label: item.label, group: 'brand' });
              }
            });

            // Payment images
            PAYMENT_IMAGES.forEach(item => {
              if (imageSettings[item.key]) {
                allItems.push({ key: item.key, value: imageSettings[item.key], label: item.label, group: 'payment' });
              }
            });

            // General media
            mediaFiles.forEach(file => {
              if (file.value) {
                allItems.push({ key: file.key, value: file.value, label: file.key, group: file.group });
              }
            });

            // Filter by search
            const filtered = searchQuery
              ? allItems.filter(item =>
                  item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.value.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : allItems;

            if (filtered.length === 0) {
              return (
                <Card className="p-8 text-center">
                  <ImageLucide className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No media files uploaded yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Go to Brand Assets or Payment Images tabs to upload your first images.
                  </p>
                </Card>
              );
            }

            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filtered.map((item) => (
                  <Card key={item.key} className="hover:shadow-md transition-shadow overflow-hidden group">
                    <CardContent className="p-3">
                      <div className="aspect-square rounded-lg bg-muted/20 flex items-center justify-center overflow-hidden mb-2 relative">
                        <img
                          src={item.value}
                          alt={item.label}
                          className="max-w-full max-h-full object-contain p-1 transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.value}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs mt-1 ${
                          item.group === 'brand' ? 'border-primary/30 text-primary' :
                          item.group === 'payment' ? 'border-emerald-500/30 text-emerald-600' :
                          'border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        {item.group === 'brand' ? 'Brand' : item.group === 'payment' ? 'Payment' : 'Media'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
