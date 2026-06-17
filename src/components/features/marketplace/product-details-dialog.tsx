'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, orderBy, query, Timestamp } from 'firebase/firestore';
import { Star, MapPin, ShoppingCart, Loader2, MessageSquare, Calendar } from 'lucide-react';
import { formatUsername, cn } from '@/lib/utils';
import { submitProductReview } from '@/lib/actions/marketplace';
import type { Product, ProductReview } from '@/types';
import Image from 'next/image';
import { useCart } from '@/context/cart-provider';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedButton = motion(Button);

interface ProductDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function ProductDetailsDialog({
  isOpen,
  onOpenChange,
  product,
}: ProductDetailsDialogProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { showProfile } = useUserProfileDialog();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setIsEditing(false);
      setRating(0);
      setComment('');
      setIsAdded(false);
    }
  };

  // Fetch reviews for this product
  const reviewsQuery = useMemo(() => {
    if (!firestore || !product.id) return null;
    return query(
      collection(firestore, 'products', product.id, 'reviews'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, product.id]);

  const { data: reviews, loading: reviewsLoading } = useCollection<ProductReview>(reviewsQuery);

  const hasReviewed = useMemo(() => {
    if (!user || !reviews) return false;
    return reviews.some((r) => r.uid === user.uid);
  }, [user, reviews]);

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleAddToCart = () => {
    const qty = product.moq || 1;
    addToCart(product, qty);
    toast({
      title: 'Added to Cart',
      description: `${product.name} (Qty: ${qty} ${product.unit || 'kg'}) has been added to your cart.`,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to submit a review.',
      });
      return;
    }

    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Rating Required',
        description: 'Please select a rating from 1 to 5 stars.',
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        variant: 'destructive',
        title: 'Comment Required',
        description: 'Please write a brief comment for your review.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitProductReview(firestore, user, product.id, rating, comment);
      toast({
        title: isEditing ? 'Review Updated' : 'Review Submitted',
        description: isEditing 
          ? 'Your review has been successfully updated.' 
          : 'Thank you for your feedback! Your review has been added.',
      });
      if (!isEditing) {
        setRating(0);
        setComment('');
      }
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An error occurred while submitting your review.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date safely
  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[850px] max-h-[90vh] overflow-y-auto p-0 rounded-xl border shadow-2xl bg-background/95 backdrop-blur-md">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name} Details</DialogTitle>
          <DialogDescription>
            Detailed view of {product.name} including descriptions, specifications, price, and customer reviews.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Image and Specs */}
          <div className="md:col-span-5 p-6 border-b md:border-b-0 md:border-r flex flex-col justify-between bg-muted/20">
            <div>
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-inner border bg-muted group">
                <Image
                  src={product.imageUrl || 'https://picsum.photos/seed/product/400/300'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>

              {/* Price & Details */}
              <div className="mt-6 space-y-4">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground font-medium">Price</span>
                  <div>
                    <span className="text-3xl font-extrabold text-primary">₹{product.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground"> / {product.unit || 'kg'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border rounded-xl p-3 flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">Min. Order (MOQ)</span>
                    <span className="font-bold text-sm text-foreground mt-1">
                      {product.moq || 1} {product.unit || 'kg'}
                    </span>
                  </div>
                  <div className="bg-card border rounded-xl p-3 flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">Availability</span>
                    {product.stock === 0 ? (
                      <span className="font-bold text-sm text-destructive mt-1">Out of Stock</span>
                    ) : product.stock <= (product.moq || 1) ? (
                      <span className="font-bold text-sm text-amber-500 mt-1">Low Stock ({product.stock})</span>
                    ) : (
                      <span className="font-bold text-sm text-emerald-500 mt-1">
                        {product.stock} {product.unit || 'kg'}
                      </span>
                    )}
                  </div>
                </div>

                {product.origin && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border rounded-xl p-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium truncate">{product.origin}</span>
                  </div>
                )}
              </div>
            </div>

            <AnimatedButton
              className={cn(
                "w-full mt-6 py-6 text-base shadow-lg transition-all duration-300 font-bold",
                isAdded ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20" : "hover:shadow-primary/20"
              )}
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdded}
              animate={isAdded ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <motion.svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                    Added!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </motion.span>
                )}
              </AnimatePresence>
            </AnimatedButton>
          </div>

          {/* Right Column: Title, Desc, and Reviews */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Product Header */}
              <div className="space-y-2">
                {product.category && (
                  <Badge variant="outline" className="capitalize text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5">
                    {product.category}
                  </Badge>
                )}
                <h2 className="text-2xl font-extrabold tracking-tight font-headline text-foreground">{product.name}</h2>

                {/* Seller Info */}
                <div className="flex items-center gap-2.5 pt-1">
                  <Avatar className="h-7 w-7 cursor-pointer border ring-offset-background transition-transform hover:scale-105" onClick={() => showProfile(product.sellerName)}>
                    <AvatarImage src={product.sellerPhotoURL} alt={product.sellerName} />
                    <AvatarFallback>{getInitials(product.sellerName)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Seller: </span>
                    <button
                      onClick={() => showProfile(product.sellerName)}
                      className="font-semibold text-foreground hover:underline hover:text-primary transition-colors text-left"
                    >
                      {formatUsername(product.sellerName, product.sellerRole)}
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About this product</h3>
                <p className="text-sm leading-relaxed text-muted-foreground/90 bg-muted/10 p-3.5 rounded-lg border border-dashed">
                  {product.description}
                </p>
              </div>

              {/* Reviews Section */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Customer Reviews
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-bold text-foreground">
                      {product.rating ? product.rating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewCount || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {reviewsLoading ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Loading reviews...</span>
                    </div>
                  ) : !reviews || reviews.length === 0 ? (
                    <div className="text-center py-8 bg-muted/10 border border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>
                      <p className="text-xs text-muted-foreground/75 mt-1">Be the first to share your experience!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="p-3 border rounded-xl bg-card hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border">
                              <AvatarImage src={review.userPhotoURL} alt={review.username} />
                              <AvatarFallback>{getInitials(review.username)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                              {review.username}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 my-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground/90 leading-normal">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Write Review Section */}
              <div className="border-t pt-4 space-y-3">
                {user ? (
                  hasReviewed && !isEditing ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-3.5 text-xs font-medium flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        You have already submitted a review.
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 py-0 px-2.5 bg-background border-muted-foreground/20 hover:bg-muted text-foreground font-semibold"
                        onClick={() => {
                          const userReview = reviews?.find((r) => r.uid === user.uid);
                          if (userReview) {
                            setRating(userReview.rating);
                            setComment(userReview.comment);
                            setIsEditing(true);
                          }
                        }}
                      >
                        Edit Review
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          {isEditing ? 'Modify your rating:' : 'Share your rating:'}
                        </span>
                        <div
                          className="flex items-center gap-1"
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          {Array.from({ length: 5 }).map((_, i) => {
                            const starIndex = i + 1;
                            const isActive = starIndex <= (hoverRating || rating);
                            return (
                              <button
                                type="button"
                                key={i}
                                className="transition-transform hover:scale-110 focus:outline-none"
                                onClick={() => setRating(starIndex)}
                                onMouseEnter={() => setHoverRating(starIndex)}
                              >
                                <Star
                                  className={`h-5 w-5 transition-colors duration-150 ${
                                    isActive ? 'fill-accent text-accent' : 'text-muted-foreground/30'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Textarea
                        placeholder="Write your review here... How was the quality? Did it match the description?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="text-xs min-h-[60px] focus-visible:ring-primary/30 rounded-lg"
                        maxLength={300}
                      />

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-muted-foreground">
                          Max 300 characters
                        </span>
                        <div className="flex gap-2">
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsEditing(false);
                                setRating(0);
                                setComment('');
                              }}
                              className="text-xs font-semibold"
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !rating || !comment.trim()}
                            className="font-semibold text-xs px-4"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                {isEditing ? 'Updating...' : 'Submitting...'}
                              </>
                            ) : (
                              isEditing ? 'Update Review' : 'Submit Review'
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  )
                ) : (
                  <div className="bg-muted/30 border border-dashed rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Please log in to leave a review and share your feedback.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
