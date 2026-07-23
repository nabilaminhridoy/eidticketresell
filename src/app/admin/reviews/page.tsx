'use client';
import dynamic from 'next/dynamic';
const AdminReviewsPage = dynamic(() => import('@/components/admin/AdminReviewsPage'), { ssr: false });
export default function ReviewsPage() { return <AdminReviewsPage />; }
