'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const AdminLayout = dynamic(() => import('@/components/admin/AdminLayout'), { ssr: false });

// Routes that should NOT show the admin sidebar (login, verify-otp)
const NO_LAYOUT_ROUTES = ['/admin/login', '/admin/verify-otp'];

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (NO_LAYOUT_ROUTES.some(route => pathname.startsWith(route))) {
    // Auth pages render without sidebar
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
