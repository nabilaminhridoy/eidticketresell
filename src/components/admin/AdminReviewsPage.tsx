'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Star, Eye, Trash2, ChevronLeft, ChevronRight, User, MessageSquare,
  AlertTriangle, Shield
} from 'lucide-react';

interface ReviewRecord {
  id: string;
  orderId: string;
  authorId: string;
  authorName: string;
  targetId: string;
  targetName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

const MOCK_REVIEWS: ReviewRecord[] = [
  { id: 'rev1', orderId: 'ORD-00000001', authorId: '5', authorName: 'Nasir Ahmed', targetId: '1', targetName: 'Rahim Uddin', rating: 5, comment: 'Excellent seller! Ticket was valid and delivered promptly. Highly recommended.', createdAt: '2025-01-16T16:00:00Z' },
  { id: 'rev2', orderId: 'ORD-00000001', authorId: '1', authorName: 'Rahim Uddin', targetId: '5', targetName: 'Nasir Ahmed', rating: 4, comment: 'Good buyer, confirmed delivery quickly. Payment was on time.', createdAt: '2025-01-16T17:00:00Z' },
  { id: 'rev3', orderId: 'ORD-00000003', authorId: '5', authorName: 'Nasir Ahmed', targetId: '3', targetName: 'Fatima Begum', rating: 3, comment: 'Average experience. Ticket was valid but delivery took longer than expected.', createdAt: '2025-01-12T12:00:00Z' },
  { id: 'rev4', orderId: 'ORD-00000002', authorId: '4', authorName: 'Arif Khan', targetId: '1', targetName: 'Rahim Uddin', rating: 2, comment: 'Seller provided wrong seat number. Had to negotiate at the station. Not happy.', createdAt: '2025-01-17T08:00:00Z' },
  { id: 'rev5', orderId: 'ORD-00000011', authorId: '2', authorName: 'Karim Hasan', targetId: '2', targetName: 'Karim Hasan', rating: 1, comment: 'SPAM REVIEW - This appears to be a fraudulent self-review!', createdAt: '2025-01-20T10:00:00Z' },
  { id: 'rev6', orderId: 'ORD-00000012', authorId: '6', authorName: 'Test User', targetId: '1', targetName: 'Rahim Uddin', rating: 4, comment: null, createdAt: '2025-01-19T06:00:00Z' },
];

export default function AdminReviewsPage() {
  const [reviews] = useState<ReviewRecord[]>(MOCK_REVIEWS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const pageSize = 10;
  const filteredReviews = reviews.filter(r =>
    !search || r.authorName.toLowerCase().includes(search.toLowerCase()) || r.targetName.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedReviews = filteredReviews.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredReviews.length / pageSize);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating}</span>
      </div>
    );
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) return <Badge className="bg-emerald-500 text-white">Good</Badge>;
    if (rating === 3) return <Badge className="bg-yellow-500 text-white">Average</Badge>;
    if (rating === 2) return <Badge className="bg-orange text-white">Poor</Badge>;
    return <Badge variant="destructive">Bad</Badge>;
  };

  const handleView = (review: ReviewRecord) => {
    setSelectedReview(review);
    setViewModalOpen(true);
  };

  const handleDelete = (review: ReviewRecord) => {
    setSelectedReview(review);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // In real app, would call API
    setDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6" /> Review Management
          </h1>
          <p className="text-sm text-muted-foreground">{filteredReviews.length} total reviews</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Input placeholder="Search by author or target..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reviews found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="hidden md:table-cell">Target</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="hidden sm:table-cell">Comment</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.orderId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {review.authorName}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          {review.targetName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          {getRatingBadge(review.rating)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className="text-xs truncate max-w-[200px]">
                          {review.comment || <span className="text-muted-foreground italic">No comment</span>}
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleView(review)} title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(review)} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredReviews.length > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Review ID</Label><p className="font-medium">{selectedReview.id}</p></div>
                <div><Label className="text-xs text-muted-foreground">Order</Label><p className="font-medium">{selectedReview.orderId}</p></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Author</Label>
                  <p className="font-medium flex items-center gap-1"><User className="w-3 h-3" /> {selectedReview.authorName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Target</Label>
                  <p className="font-medium flex items-center gap-1"><User className="w-3 h-3" /> {selectedReview.targetName}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Rating</Label>
                <div className="mt-1">{renderStars(selectedReview.rating)}</div>
              </div>
              {selectedReview.comment && (
                <div>
                  <Label className="text-xs text-muted-foreground">Comment</Label>
                  <div className="mt-1 p-3 rounded-lg bg-muted/30">
                    <MessageSquare className="w-4 h-4 text-muted-foreground inline mr-1" />
                    <p className="text-sm">{selectedReview.comment}</p>
                  </div>
                </div>
              )}
              <div><Label className="text-xs text-muted-foreground">Date</Label><p className="text-sm">{new Date(selectedReview.createdAt).toLocaleString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Review Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm font-medium text-red-700">
                  Are you sure you want to delete this review?
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                </div>
                <p className="text-sm">{selectedReview.comment || 'No comment'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  By {selectedReview.authorName} about {selectedReview.targetName}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
