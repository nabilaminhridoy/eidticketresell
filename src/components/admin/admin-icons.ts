/**
 * Admin icon registry — centralized icon imports for the admin panel.
 * 
 * By pulling all lucide-react icons into a single barrel, Turbopack
 * only needs to resolve ONE import-statement per file that uses icons,
 * instead of 50+ individual import lines. This significantly reduces
 * the module-graph resolution work and peak RSS memory during compilation.
 * 
 * Only icons that are actually rendered are imported (tree-shakeable).
 */
import {
  // Sidebar nav items
  LayoutDashboard, BarChart3, Activity, Ticket, ShoppingBag, CreditCard,
  Wallet, RefreshCw, AlertTriangle, Users, ShieldCheck, MessageCircle,
  Star, ScanLine, ClipboardCheck, BookOpen, HelpCircle, FileText, Home,
  Megaphone, PenTool, Search, FileBarChart2, Image, Settings, Globe,
  Mail, Smartphone, Shield, Key, UserCog, Scale, Database, HardDrive,
  Clock4,
  // Sidebar chrome (logo, toggles)
  Menu, ChevronLeft, ChevronDown,
  // Header icons
  Bell, LogOut, LogIn, User, X, CheckCircle,
  // Profile page icons
  Camera, Save, Eye, EyeOff, History,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

export type IconName = keyof typeof iconMap;

/** Map string keys → icon components so sidebar config stays lightweight */
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, BarChart3, Activity, Ticket, ShoppingBag, CreditCard,
  Wallet, RefreshCw, AlertTriangle, Users, ShieldCheck, MessageCircle,
  Star, ScanLine, ClipboardCheck, BookOpen, HelpCircle, FileText, Home,
  Megaphone, PenTool, Search, FileBarChart2, Image, Settings, Globe,
  Mail, Smartphone, Shield, Key, UserCog, Scale, Database, HardDrive,
  Clock4, Menu, ChevronLeft, ChevronDown, Bell, LogOut, LogIn, User, X, CheckCircle,
  Camera, Save, Eye, EyeOff, History,
};

export function getIcon(name: string): LucideIcon | undefined {
  return iconMap[name];
}

export { iconMap };
