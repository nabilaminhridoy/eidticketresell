'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AdminDisputesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Disputes Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Dispute management panel coming soon. View and resolve ticket disputes here.</p>
      </CardContent>
    </Card>
  );
}
