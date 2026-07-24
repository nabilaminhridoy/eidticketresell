'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export default function AdminSettingsLocalizationPage({ section }: { section?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Localization Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Localization configuration panel coming soon. Manage languages, currencies, and regional settings.
          {section && ` Current section: ${section}`}
        </p>
      </CardContent>
    </Card>
  );
}
