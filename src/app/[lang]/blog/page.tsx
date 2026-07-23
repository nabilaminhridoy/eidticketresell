'use client';
import dynamic from 'next/dynamic';
const BlogPage = dynamic(() => import('@/components/pages/BlogPage'), { ssr: false });
export default function BlogRoute() {
  return <BlogPage />;
}
