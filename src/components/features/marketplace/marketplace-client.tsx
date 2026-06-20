
'use client';

import { useFirestore, useUser, useDoc } from '@/firebase';
import { collection, orderBy, query, startAt, endAt, doc, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useMemo, useState, useEffect, useRef } from 'react';
import { ProductCard } from './product-card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ShoppingCart, Plus, Edit, Package, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateProductDialog } from './create-product-dialog';
import { CreateMarketplacePostDialog } from './create-marketplace-post-dialog';
import { MarketplacePostCard } from './marketplace-post-card';
import { voteOnMarketplacePost } from '@/lib/actions/marketplace-post';
import { Link } from '@/i18n/routing';
import type { UserProfile, Product, MarketplacePost } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { PostListSkeleton } from '@/components/features/shared/skeletons';
import { EmptyState } from '@/components/features/shared/empty-state';
import { MarketplaceFilters } from './marketplace-filters';

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4 border rounded-xl p-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketplaceClient() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('Marketplace');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [activeTab, setActiveTab] = useState('verified');

  // Products pagination state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsCursor, setProductsCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [productsHasMore, setProductsHasMore] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isInitialProductsLoading, setIsInitialProductsLoading] = useState(true);

  // MarketplacePosts pagination state
  const [marketplacePosts, setMarketplacePosts] = useState<MarketplacePost[]>([]);
  const [postsCursor, setPostsCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isInitialPostsLoading, setIsInitialPostsLoading] = useState(true);

  // Refs for infinite scroll sentinels
  const productsSentinelRef = useRef<HTMLDivElement>(null);
  const postsSentinelRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (category && category !== 'all' && product.category !== category) {
        return false;
      }
      if (priceRange.min && product.price < Number(priceRange.min)) {
        return false;
      }
      if (priceRange.max && product.price > Number(priceRange.max)) {
        return false;
      }
      return true;
    });
  }, [products, category, priceRange]);

  const filteredMarketplacePosts = useMemo(() => {
    return marketplacePosts.filter((post) => {
      if (priceRange.min && post.price < Number(priceRange.min)) {
        return false;
      }
      if (priceRange.max && post.price > Number(priceRange.max)) {
        return false;
      }
      return true;
    });
  }, [marketplacePosts, priceRange]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('all');
    setPriceRange({ min: '', max: '' });
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const fetchProducts = async (isFirstPage: boolean) => {
    if (!firestore) return;
    if (productsLoading) return;
    if (!isFirstPage && !productsHasMore) return;

    setProductsLoading(true);
    if (isFirstPage) {
      setIsInitialProductsLoading(true);
      setProducts([]);
      setProductsCursor(null);
      setProductsHasMore(true);
    }

    try {
      const q = collection(firestore, 'products');
      const [sortField, sortDirection] = sortBy.split('_');
      let baseQuery;

      if (debouncedSearchTerm) {
        if (isFirstPage) {
          baseQuery = query(
            q,
            orderBy('name'),
            startAt(debouncedSearchTerm),
            endAt(debouncedSearchTerm + '\uf8ff'),
            limit(6)
          );
        } else if (productsCursor) {
          baseQuery = query(
            q,
            orderBy('name'),
            startAt(debouncedSearchTerm),
            endAt(debouncedSearchTerm + '\uf8ff'),
            startAfter(productsCursor),
            limit(6)
          );
        }
      } else {
        if (isFirstPage) {
          baseQuery = query(
            q,
            orderBy(sortField, sortDirection as 'asc' | 'desc'),
            limit(6)
          );
        } else if (productsCursor) {
          baseQuery = query(
            q,
            orderBy(sortField, sortDirection as 'asc' | 'desc'),
            startAfter(productsCursor),
            limit(6)
          );
        }
      }

      if (baseQuery) {
        const snapshot = await getDocs(baseQuery);
        const newItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          refPath: doc.ref.path,
          ...doc.data(),
        })) as unknown as Product[];

        if (isFirstPage) {
          setProducts(newItems);
        } else {
          setProducts((prev) => [...prev, ...newItems]);
        }

        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
        setProductsCursor(lastVisible);
        setProductsHasMore(snapshot.docs.length === 6);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
      setIsInitialProductsLoading(false);
    }
  };

  const fetchMarketplacePosts = async (isFirstPage: boolean) => {
    if (!firestore) return;
    if (postsLoading) return;
    if (!isFirstPage && !postsHasMore) return;

    setPostsLoading(true);
    if (isFirstPage) {
      setIsInitialPostsLoading(true);
      setMarketplacePosts([]);
      setPostsCursor(null);
      setPostsHasMore(true);
    }

    try {
      const q = collection(firestore, 'marketplacePosts');
      const [sortField, sortDirection] = sortBy.split('_');
      let baseQuery;

      if (debouncedSearchTerm) {
        if (isFirstPage) {
          baseQuery = query(
            q,
            orderBy('itemName'),
            startAt(debouncedSearchTerm),
            endAt(debouncedSearchTerm + '\uf8ff'),
            limit(6)
          );
        } else if (postsCursor) {
          baseQuery = query(
            q,
            orderBy('itemName'),
            startAt(debouncedSearchTerm),
            endAt(debouncedSearchTerm + '\uf8ff'),
            startAfter(postsCursor),
            limit(6)
          );
        }
      } else {
        if (isFirstPage) {
          baseQuery = query(
            q,
            orderBy(sortField, sortDirection as 'asc' | 'desc'),
            limit(6)
          );
        } else if (postsCursor) {
          baseQuery = query(
            q,
            orderBy(sortField, sortDirection as 'asc' | 'desc'),
            startAfter(postsCursor),
            limit(6)
          );
        }
      }

      if (baseQuery) {
        const snapshot = await getDocs(baseQuery);
        const newItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          refPath: doc.ref.path,
          ...doc.data(),
        })) as unknown as MarketplacePost[];

        if (isFirstPage) {
          setMarketplacePosts(newItems);
        } else {
          setMarketplacePosts((prev) => [...prev, ...newItems]);
        }

        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
        setPostsCursor(lastVisible);
        setPostsHasMore(snapshot.docs.length === 6);
      }
    } catch (error) {
      console.error('Error fetching marketplace posts:', error);
    } finally {
      setPostsLoading(false);
      setIsInitialPostsLoading(false);
    }
  };

  // Fetch initial page on dependencies change
  useEffect(() => {
    if (activeTab === 'verified') {
      fetchProducts(true);
    }
  }, [firestore, sortBy, debouncedSearchTerm, activeTab]);

  useEffect(() => {
    if (activeTab === 'indirect') {
      fetchMarketplacePosts(true);
    }
  }, [firestore, sortBy, debouncedSearchTerm, activeTab]);

  // Keep references to current load functions for IntersectionObserver to avoid stale closures
  const loadMoreProductsRef = useRef<() => void>();
  loadMoreProductsRef.current = () => {
    if (!productsLoading && productsHasMore) {
      fetchProducts(false);
    }
  };

  const loadMorePostsRef = useRef<() => void>();
  loadMorePostsRef.current = () => {
    if (!postsLoading && postsHasMore) {
      fetchMarketplacePosts(false);
    }
  };

  // Setup IntersectionObservers
  useEffect(() => {
    if (activeTab !== 'verified') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProductsRef.current?.();
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = productsSentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'indirect') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePostsRef.current?.();
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = postsSentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [activeTab]);

  const handleVoteOnPost = (postId: string, vote: 'up' | 'down') => {
    if (!firestore || !user) return;
    voteOnMarketplacePost(firestore, user.uid, postId, vote);

    // Optimistic UI updates
    setMarketplacePosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const upvoted = post.upvotes?.includes(user.uid);
        const downvoted = post.downvotes?.includes(user.uid);

        let newUpvotes = post.upvotes ? [...post.upvotes] : [];
        let newDownvotes = post.downvotes ? [...post.downvotes] : [];

        if (vote === 'up') {
          if (upvoted) {
            newUpvotes = newUpvotes.filter((uid) => uid !== user.uid);
          } else {
            newUpvotes.push(user.uid);
            newDownvotes = newDownvotes.filter((uid) => uid !== user.uid);
          }
        } else if (vote === 'down') {
          if (downvoted) {
            newDownvotes = newDownvotes.filter((uid) => uid !== user.uid);
          } else {
            newDownvotes.push(user.uid);
            newUpvotes = newUpvotes.filter((uid) => uid !== user.uid);
          }
        }

        return {
          ...post,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
        };
      })
    );
  };

  const isVerifiedSeller = userProfile?.isVerified === true;

  return (
    <div className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                    <TabsTrigger value="verified">{t('verified-market')}</TabsTrigger>
                    <TabsTrigger value="indirect">{t('indirect-market')}</TabsTrigger>
                </TabsList>
                 {user && isVerifiedSeller && activeTab === 'verified' && (
                    <CreateProductDialog onSuccess={() => fetchProducts(true)}>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('list-product')}
                        </Button>
                    </CreateProductDialog>
                )}
            </div>

            <div className="mt-4">
              <MarketplaceFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                category={category}
                onCategoryChange={setCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onClearFilters={handleClearFilters}
                activeTab={activeTab}
              />
            </div>

            {user && !isVerifiedSeller && activeTab === 'verified' && (
              <Alert className="mt-4 border-amber-500/25 bg-amber-500/5">
                <Info className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500">Want to sell here?</AlertTitle>
                <AlertDescription>
                  <p>Only users with a verified seller account can list products in this marketplace. Verification is handled by administrators.</p>
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="verified" className="mt-6">
                {isInitialProductsLoading && <ProductSkeletonGrid />}
                {!isInitialProductsLoading && filteredProducts.length === 0 && (
                    <EmptyState
                        type={searchTerm || category !== 'all' || priceRange.min || priceRange.max ? 'search' : 'products'}
                        title={searchTerm || category !== 'all' || priceRange.min || priceRange.max ? undefined : t('no-products')}
                        description={searchTerm || category !== 'all' || priceRange.min || priceRange.max
                            ? `No products found matching your active filters.`
                            : `There are currently no products listed from verified sellers.`}
                    />
                )}
                {!isInitialProductsLoading && filteredProducts.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product: Product) => (
                        <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    {/* Bottom sentinel and loading skeleton for more items */}
                    <div ref={productsSentinelRef} className="py-6">
                      {productsLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-4 border rounded-xl p-4">
                              <Skeleton className="aspect-square w-full rounded-lg" />
                              <Skeleton className="h-6 w-2/3" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
            </TabsContent>
            <TabsContent value="indirect" className="mt-6">
                {isInitialPostsLoading && <PostListSkeleton />}
                 {!isInitialPostsLoading && filteredMarketplacePosts.length === 0 && (
                    <EmptyState
                        type={searchTerm || priceRange.min || priceRange.max ? 'search' : 'posts'}
                        title={searchTerm || priceRange.min || priceRange.max ? undefined : t('no-products')}
                        description={searchTerm || priceRange.min || priceRange.max
                            ? `No posts found matching your active filters.`
                            : `There are currently no items listed here. Be the first to post something for sale!`}
                    />
                )}
                {!isInitialPostsLoading && filteredMarketplacePosts.length > 0 && (
                  <>
                    <div className="space-y-6">
                        {filteredMarketplacePosts.map((post: MarketplacePost) => (
                            <MarketplacePostCard key={post.id} post={post} voteAction={(vote) => handleVoteOnPost(post.id, vote)} />
                        ))}
                    </div>
                    {/* Bottom sentinel and loading skeleton for more items */}
                    <div ref={postsSentinelRef} className="py-6">
                      {postsLoading && (
                        <div className="mt-6">
                          <PostListSkeleton />
                        </div>
                      )}
                    </div>
                  </>
                )}
            </TabsContent>
      </Tabs>
        {user && (
            <>
            {activeTab === 'indirect' ? (
                <CreateMarketplacePostDialog onSuccess={() => fetchMarketplacePosts(true)}>
                <Button
                    className="fixed bottom-6 right-6 rounded-full shadow-lg"
                    aria-label="Create Post"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    {t('create-post')}
                </Button>
                </CreateMarketplacePostDialog>
            ) : (
                <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
                    <Link href="/cart" className="group flex items-center justify-end">
                        <span className="bg-card text-card-foreground shadow-md rounded-md px-3 py-2 text-sm font-medium mr-3 opacity-0 scale-95 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 ease-in-out">{t('view-cart')}</span>
                        <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                    </Link>
                    <Link href="/marketplace/orders" className="group flex items-center justify-end">
                         <span className="bg-card text-card-foreground shadow-md rounded-md px-3 py-2 text-sm font-medium mr-3 opacity-0 scale-95 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 ease-in-out">{t('my-orders')}</span>
                        <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <Package className="h-5 w-5" />
                        </div>
                    </Link>
                </div>
            )}
            </>
        )}
    </div>
  );
}
