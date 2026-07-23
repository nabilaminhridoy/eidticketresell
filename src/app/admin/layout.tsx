'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

/* Dynamic imports with ssr:false to keep peak memory low in the 4GB sandbox */
const AdminLayout = dynamic(() => import('@/components/admin/AdminLayout'), { ssr: false });
const AdminAuthGuard = dynamic(() => import('@/components/admin/AdminAuthGuard'), { ssr: false });

/* Routes accessible without authentication (no sidebar, no auth guard) */
const PUBLIC_ROUTES = ['/admin/login', '/admin/verify-otp'];

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  /* Public auth pages: render without sidebar and without auth guard */
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return <>{children}</>;
  }

  /* All other admin pages: require authentication and show sidebar layout */
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  );
}
