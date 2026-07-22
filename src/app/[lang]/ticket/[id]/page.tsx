'use client';
import TicketDetailsPage from '@/components/pages/TicketDetailsPage';
import { use } from 'react';

export default function TicketDetailRoute({ params }: { params: Promise<{ id: string; lang: string }> }) {
  const { id } = use(params);
  return <TicketDetailsPage ticketId={id} />;
}
