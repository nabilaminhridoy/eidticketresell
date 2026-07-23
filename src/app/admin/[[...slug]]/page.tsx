'use client';

import { use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Minimal dynamic import - only ONE import for the router component
// This dramatically reduces Turbopack's initial compilation memory footprint
const AdminPageRouter = dynamic(() => import('@/components/admin/AdminPageRouter'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  ),
});

export default function AdminCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug ?? [];
  const slugPath = slug.join('/');
  const router = useRouter();
  const pathname = usePathname();

  return <AdminPageRouter slugPath={slugPath} pathname={pathname} router={router} />;
}
