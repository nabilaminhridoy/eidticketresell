'use client';
import dynamic from 'next/dynamic';
import { use } from 'react';

const BlogDetailPage = dynamic(() => import('@/components/pages/BlogDetailPage'), { ssr: false });

export default function BlogPostRoute({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug } = use(params);
  return <BlogDetailPage slug={slug} />;
}
