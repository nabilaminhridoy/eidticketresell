'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  User, Lock, Shield, Bell, Clock, Camera, Save, Loader2,
  CheckCircle, AlertCircle, Key, Eye, EyeOff, History, Smartphone,
  ExternalLink, Link2, Unlink,
} from 'lucide-react';

interface AdminProfile {
  id: string;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface LoginHistoryEntry {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  timestamp: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('etr_admin_token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function getActionLabel(action: string): string {
  switch (action) {
    case 'admin_login': return 'Login';
    case 'password_change': return 'Password Change';
    case 'profile_update': return 'Profile Update';
    case '2fa_enabled': return '2FA Enabled';
    case '2fa_disabled': return '2FA Disabled';
    case 'logout': return 'Logout';
    case 'sms_sent': return 'SMS Sent';
    case 'sms_failed': return 'SMS Failed';
    default: return action;
  }
}

function getActionIcon(action: string) {
  switch (action) {
    case 'admin_login': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'password_change': return <Key className="w-4 h-4 text-yellow-500" />;
    case 'profile_update': return <User className="w-4 h-4 text-blue-500" />;
    case '2fa_enabled': return <Shield className="w-4 h-4 text-green-500" />;
    case '2fa_disabled': return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'logout': return <History className="w-4 h-4 text-muted-foreground" />;
    default: return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

export default function AdminProfilePage() {

  // ─── Frontend Account Link sub-component ───
  function FrontendAccountLink({ username: currentUsername }: { username: string }) {
    const [linkedStatus, setLinkedStatus] = useState<{
      linked: boolean;
      hasUsername: boolean;
      user?: { id: string; username: string; name: string; isActive: boolean; role: string };
      username?: string;
    } | null>(null);
    const [checking, setChecking] = useState(false);
    const [linking, setLinking] = useState(false);
    const [linkMsg, setLinkMsg] = useState<{ success: boolean; text: string } | null>(null);

    const checkLink = async () => {
      setChecking(true);
      try {
        const res = await fetch('/api/admin/link-user', { headers: getAuthHeaders() });
        const data = await res.json();
        setLinkedStatus(data);
      } catch { setLinkedStatus(null); }
      setChecking(false);
    };

    const handleLink = async () => {
      if (!currentUsername) return;
      setLinking(true);
      setLinkMsg(null);
      try {
        const res = await fetch('/api/admin/link-user', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: 'link' }),
        });
        const data = await res.json();
        if (res.ok) {
          setLinkMsg({ success: true, text: data.message });
          await checkLink();
        } else {
          setLinkMsg({ success: false, text: data.error });
        }
      } catch {
        setLinkMsg({ success: false, text: 'Network error' });
      }
      setLinking(false);
    };

    const handleUnlink = async () => {
      setLinking(true);
      setLinkMsg(null);
      try {
        const res = await fetch('/api/admin/link-user', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ action: 'unlink' }),
        });
        const data = await res.json();
        if (res.ok) {
          setLinkMsg({ success: true, text: data.message });
          await checkLink();
        } else {
          setLinkMsg({ success: false, text: data.error });
        }
      } catch {
        setLinkMsg({ success: false, text: 'Network error' });
      }
      setLinking(false);
    };

    useEffect(() => { checkLink(); }, []);

    return (
      <Card className="border-blue-200 dark:border-blue-900">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-500" />
            <p className="font-medium">Frontend Account (Sell & Buy Tickets)</p>
          </div>
          <p className="text-xs text-muted-foreground">
            As an admin, you can also sell and buy tickets on the frontend website like a regular user.
            Your admin identity is completely hidden — other users only see your username.
            Set a username above and link it to create your frontend account.
          </p>

          {checking ? (
            <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm text-muted-foreground">Checking...</span></div>
          ) : linkedStatus ? (
            <>
              {!linkedStatus.hasUsername ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">⚠ Set a username first</p>
                  <p className="text-xs text-muted-foreground">Enter a username in the profile form above to create your frontend account.</p>
                </div>
              ) : linkedStatus.linked ? (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">✓ Frontend account linked</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">@{linkedStatus.user?.username}</Badge>
                    <span className="text-muted-foreground">{linkedStatus.user?.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Your username <strong>@{linkedStatus.user?.username}</strong> is what other users see. Your admin role is hidden.</p>
                  <div className="flex gap-2 mt-2">
                    <a href={`/en/${linkedStatus.user?.username}`} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />View on frontend
                    </a>
                    <Button variant="outline" size="sm" onClick={handleUnlink} disabled={linking} className="gap-1 text-red-600">
                      <Unlink className="w-3.5 h-3.5" />Deactivate frontend account
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Link your frontend account</p>
                  <p className="text-xs text-muted-foreground">Username: <strong>@{linkedStatus.username || currentUsername}</strong> — click below to create your frontend user account.</p>
                  <Button size="sm" onClick={handleLink} disabled={linking || !currentUsername} className="gap-1">
                    {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    Create Frontend Account
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Could not check link status</p>
          )}

          {linkMsg && (
            <p className={`text-sm ${linkMsg.success ? 'text-green-600' : 'text-red-600'}`}>{linkMsg.text}</p>
          )}
        </CardContent>
      </Card>
    );
  }


  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    email_login: true, email_order: true, email_ticket: true,
    sms_login: true, sms_order: true, sms_ticket: true,
    push_all: true,
  });
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [historyPage, setHistoryPage] = useState(1);

  // Profile form state
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAvatar, setFormAvatar] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 2FA state
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false);

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadLoginHistory();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setFormName(data.profile.name);
        setFormUsername(data.profile.username || '');
        setFormPhone(data.profile.phone || '');
        setFormEmail(data.profile.email);
        setFormAvatar(data.profile.avatar || '');
      }
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadLoginHistory = async (page = 1) => {
    try {
      const res = await fetch(`/api/admin/profile/login-history?page=${page}&limit=20`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.loginHistory) {
        setLoginHistory(data.loginHistory);
        setHistoryPage(page);
      }
    } catch { /* silent */ }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Authorization': getAuthHeaders()['Authorization'] as string },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormAvatar(data.url);
        }
      }
    } catch { /* silent */ }
    setAvatarUploading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_profile',
          name: formName,
          username: formUsername,
          phone: formPhone,
          email: formEmail,
          avatar: formAvatar,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        // Update localStorage admin info
        const stored = localStorage.getItem('etr_admin_info');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.name = data.profile.name;
          parsed.email = data.profile.email;
          parsed.avatar = data.profile.avatar;
          localStorage.setItem('etr_admin_info', JSON.stringify(parsed));
        }
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch {
      setPasswordError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'toggle_2fa',
          enabled,
        }),
      });

      if (res.ok) {
        setProfile(prev => prev ? { ...prev, twoFactorEnabled: enabled } : prev);
      }
    } catch { /* silent */ }
    setSaving(false);
    setTwoFADialogOpen(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_notifications',
          notifications,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError('Failed to update notifications');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6" />Admin Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-1"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="password" className="gap-1"><Lock className="w-3.5 h-3.5" />Password</TabsTrigger>
          <TabsTrigger value="2fa" className="gap-1"><Shield className="w-3.5 h-3.5" />2FA</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1"><Bell className="w-3.5 h-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="login-history" className="gap-1"><Clock className="w-3.5 h-3.5" />Login History</TabsTrigger>
        </TabsList>

        {/* ─── PROFILE TAB ─── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Avatar section */}
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  {formAvatar ? (
                    <AvatarImage src={formAvatar} alt={formName} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {formName?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-muted-foreground">Upload a new avatar (JPG, PNG, max 2MB)</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      {avatarUploading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    {formAvatar && (
                      <Button variant="ghost" size="sm" onClick={() => setFormAvatar('')} className="text-red-600">
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <Separator />

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Your full name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username <span className="text-muted-foreground">(for frontend website)</span></Label>
                  <Input id="username" value={formUsername} onChange={e => setFormUsername(e.target.value)} placeholder="e.g. admin_etr" />
                  <p className="text-xs text-muted-foreground">This username appears on the frontend website</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="admin@etr.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+880 1XXX-XXXXXX" />
                  <p className="text-xs text-muted-foreground">Bangladesh format (+880...)</p>
                </div>
              </div>

              {/* Role info (read-only) */}
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <Badge variant="outline">{profile?.role || 'admin'}</Badge>
                <span className="text-sm text-muted-foreground">Role (cannot be changed from profile page)</span>
              </div>

              <Separator />

              {/* Frontend Account Link */}
              <FrontendAccountLink username={formUsername} />

              {/* Save button */}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── PASSWORD TAB ─── */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Password changed successfully!
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && newPassword.length < 8 && (
                  <p className="text-xs text-red-600">Password must be at least 8 characters</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

              <Button onClick={handlePasswordChange} disabled={saving || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword} className="gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Change Password
              </Button>

              <Separator />

              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">Password Requirements</p>
                <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
                  <li>Minimum 8 characters</li>
                  <li>Mix of uppercase and lowercase letters recommended</li>
                  <li>Include numbers and special characters for stronger security</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── 2FA TAB ─── */}
        <TabsContent value="2fa">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
              <CardDescription>Add an extra layer of security to your admin account</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Current 2FA status */}
              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Shield className={`w-5 h-5 ${profile?.twoFactorEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium">{profile?.twoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.twoFactorEnabled
                        ? 'Your account has an additional security layer'
                        : 'Enable 2FA for enhanced account security'}
                    </p>
                  </div>
                </div>
                <Badge variant={profile?.twoFactorEnabled ? 'default' : 'secondary'}>
                  {profile?.twoFactorEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Enable/disable 2FA */}
              <div className="space-y-3">
                {profile?.twoFactorEnabled ? (
                  <Card className="border-red-200 dark:border-red-900">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium text-red-600">⚠ Disabling 2FA reduces your account security</p>
                      <p className="text-xs text-muted-foreground">Without 2FA, your account will only be protected by your password. This makes it more vulnerable to unauthorized access.</p>
                      <Button variant="destructive" size="sm" onClick={() => setTwoFADialogOpen(true)} className="gap-1">
                        <Shield className="w-4 h-4" />Disable 2FA
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-green-200 dark:border-green-900">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium text-green-600">✓ Enable Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">2FA requires you to enter a verification code from your authenticator app each time you log in, significantly increasing your account security.</p>
                      <Button size="sm" onClick={() => handleToggle2FA(true)} disabled={saving} className="gap-1">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        Enable 2FA
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* How 2FA works */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium">How 2FA works on ETR Admin</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>When enabled, you'll need an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>After entering your password, you'll be asked for a 6-digit verification code</li>
                  <li>The code refreshes every 30 seconds in your authenticator app</li>
                  <li>Even if your password is compromised, attackers cannot access your account without the code</li>
                </ul>
              </div>

              {/* Disable 2FA confirmation dialog */}
              <Dialog open={twoFADialogOpen} onOpenChange={setTwoFADialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to disable 2FA? This will reduce the security of your account and make it more vulnerable to unauthorized access.
                  </p>
                  <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => setTwoFADialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => handleToggle2FA(false)} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disable 2FA'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── NOTIFICATIONS TAB ─── */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Email notifications */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />Email Notifications
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Login Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified when someone logs into your account</p>
                    </div>
                    <Switch checked={notifications.email_login} onCheckedChange={v => setNotifications({...notifications, email_login: v})} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Order Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates about new orders and order status changes</p>
                    </div>
                    <Switch checked={notifications.email_order} onCheckedChange={v => setNotifications({...notifications, email_order: v})} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Ticket Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates about ticket listings and reviews</p>
                    </div>
                    <Switch checked={notifications.email_ticket} onCheckedChange={v => setNotifications({...notifications, email_ticket: v})} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* SMS notifications */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />SMS Notifications
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Login SMS</p>
                      <p className="text-xs text-muted-foreground">Receive SMS when someone logs into your account</p>
                    </div>
                    <Switch checked={notifications.sms_login} onCheckedChange={v => setNotifications({...notifications, sms_login: v})} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Order SMS</p>
                      <p className="text-xs text-muted-foreground">Receive SMS for critical order updates</p>
                    </div>
                    <Switch checked={notifications.sms_order} onCheckedChange={v => setNotifications({...notifications, sms_order: v})} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Ticket SMS</p>
                      <p className="text-xs text-muted-foreground">Receive SMS for important ticket events</p>
                    </div>
                    <Switch checked={notifications.sms_ticket} onCheckedChange={v => setNotifications({...notifications, sms_ticket: v})} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Push notifications */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4" />Push Notifications
                </h3>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">All Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive push notifications in the admin panel</p>
                  </div>
                  <Switch checked={notifications.push_all} onCheckedChange={v => setNotifications({...notifications, push_all: v})} />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button onClick={handleSaveNotifications} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── LOGIN HISTORY TAB ─── */}
        <TabsContent value="login-history">
          <Card>
            <CardHeader>
              <CardTitle>Login History & Activity</CardTitle>
              <CardDescription>Review your recent account activity and login sessions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Last login info */}
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                  </p>
                </div>
              </div>

              {loginHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No login history found</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden md:table-cell">Details</TableHead>
                        <TableHead className="hidden md:table-cell">IP Address</TableHead>
                        <TableHead>Date & Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loginHistory.map(entry => (
                        <TableRow key={entry.id}>
                          <TableCell>{getActionIcon(entry.action)}</TableCell>
                          <TableCell className="font-medium">{getActionLabel(entry.action)}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">{entry.details || '—'}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{entry.ipAddress || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(entry.timestamp).toLocaleString('en-BD', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-muted-foreground">Page {historyPage}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage <= 1}
                    onClick={() => loadLoginHistory(historyPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadLoginHistory(historyPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
