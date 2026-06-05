
'use client';

import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { collection, orderBy, query, where, startAt, endAt, Timestamp, doc } from 'firebase/firestore';
import { useMemo, useState } from 'react';
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
import { Search, ShoppingCart, Tractor, Plus, Edit, Package, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateProductDialog } from './create-product-dialog';
import { CreateMarketplacePostDialog } from './create-marketplace-post-dialog';
import { MarketplacePostCard } from './marketplace-post-card';
import { voteOnMarketplacePost } from '@/lib/actions/marketplace-post';
import { Link } from '@/i18n/routing';
import type { UserProfile, Product, MarketplacePost } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { useTranslations } from 'next-intl';


export function MarketplaceClient() {
  const firestore = useFirestore();
  const { user } = useUser();
  const t = useTranslations('Marketplace');
  const commonT = useTranslations('Common');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [activeTab, setActiveTab] = useState('verified');

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const productsQuery = useMemo(() => {
    if (!firestore || activeTab !== 'verified') return null;
    let q = collection(firestore, 'products');
    const [sortField, sortDirection] = sortBy.split('_');
    if (searchTerm) {
        return query(q, orderBy('name'), startAt(searchTerm), endAt(searchTerm + '\uf8ff'));
    }
    return query(q, orderBy(sortField, sortDirection as 'asc' | 'desc'));
  }, [firestore, sortBy, searchTerm, activeTab]);

  const marketplacePostsQuery = useMemo(() => {
    if (!firestore || activeTab !== 'indirect') return null;
    let q = collection(firestore, 'marketplacePosts');
    const [sortField, sortDirection] = sortBy.split('_');
     if (searchTerm) {
        return query(q, orderBy('itemName'), startAt(searchTerm), endAt(searchTerm + '\uf8ff'));
    }
    return query(q, orderBy(sortField, sortDirection as 'asc' | 'desc'));
  }, [firestore, sortBy, searchTerm, activeTab]);

  const { data: products, loading: productsLoading } = useCollection<Product>(productsQuery);
  const { data: marketplacePosts, loading: postsLoading } = useCollection<MarketplacePost>(marketplacePostsQuery);

  const loading = productsLoading || postsLoading;

  const handleVoteOnPost = (postId: string, vote: 'up' | 'down') => {
    if (!firestore || !user) return;
    voteOnMarketplacePost(firestore, user.uid, postId, vote);
  }

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
                    <CreateProductDialog>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('list-product')}
                        </Button>
                    </CreateProductDialog>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-card mt-4">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder={t('search-placeholder')}
                    className="pl-9" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt_desc">Newest</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value={activeTab === 'verified' ? 'name_asc' : 'itemName_asc'}>Name: A-Z</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>

            {user && !isVerifiedSeller && activeTab === 'verified' && (
              <Alert className="mt-4 border-amber-500/25 bg-amber-500/5">
                <Info className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500">Want to sell here?</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>Only users with a verified seller account can list products in this marketplace. Verification is handled by administrators.</p>
                  <div className="bg-background/80 border p-2.5 rounded-md text-xs font-mono space-y-1 max-w-md mt-2">
                    <p className="font-semibold text-foreground border-b pb-1 mb-1">Authenticated Session Debug Info:</p>
                    <p>• Your UID: <span className="text-primary select-all font-semibold">{user.uid}</span></p>
                    <p>• Profile Exists: <span className="font-semibold">{userProfile ? 'Yes' : 'No'}</span></p>
                    <p>• Role: <span className="font-semibold">{userProfile?.role || 'none'}</span></p>
                    <p>• isVerified: <span className="font-semibold text-destructive">{userProfile?.isVerified === true ? 'true' : 'false'}</span></p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="verified" className="mt-6">
                {loading && <div className="text-center py-12 text-muted-foreground">{commonT('loading')}</div>}
                {!loading && products?.length === 0 && (
                    <div className="text-center py-20 px-6 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                        <ShoppingCart className="mx-auto h-16 w-16 opacity-50" />
                        <h3 className="font-headline text-2xl mt-6">{t('no-products')}</h3>
                        <p className="mt-2 max-w-md mx-auto">
                            {searchTerm 
                                ? `No products found for "${searchTerm}".`
                                : `There are currently no products listed from verified sellers.`}
                        </p>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products?.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="indirect" className="mt-6">
                {loading && <div className="text-center py-12 text-muted-foreground">{commonT('loading')}</div>}
                 {!loading && marketplacePosts?.length === 0 && (
                    <div className="text-center py-20 px-6 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                        <ShoppingCart className="mx-auto h-16 w-16 opacity-50" />
                        <h3 className="font-headline text-2xl mt-6">{t('no-products')}</h3>
                        <p className="mt-2 max-w-md mx-auto">
                            {searchTerm 
                                ? `No posts found for "${searchTerm}".`
                                : `There are currently no items listed here. Be the first to post something for sale!`}
                        </p>
                    </div>
                )}
                <div className="space-y-6">
                    {marketplacePosts?.map((post: MarketplacePost) => (
                        <MarketplacePostCard key={post.id} post={post} voteAction={(vote) => handleVoteOnPost(post.id, vote)} />
                    ))}
                </div>
            </TabsContent>
      </Tabs>
        {user && (
            <>
            {activeTab === 'indirect' ? (
                <CreateMarketplacePostDialog>
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
