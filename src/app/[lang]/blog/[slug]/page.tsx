'use client';
import InfoPage from '@/components/pages/InfoPage';
import { use } from 'react';

export default function BlogPostRoute({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug } = use(params);
  return <InfoPage section="blog" slug={slug} />;
}
