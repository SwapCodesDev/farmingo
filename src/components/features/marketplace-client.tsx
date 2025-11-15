
'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useUser } from '@/firebase';
import { collection, orderBy, query, where, startAt, endAt, Timestamp, doc } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import { ProductCard } from './product-card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
import Link from 'next/link';
import type { UserProfile } from '@/types';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';


// Define a placeholder type for the Product
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  uid: string;
  sellerName: string;
  sellerPhotoURL: string;
  sellerRole?: UserProfile['role'];
  rating?: number;
  reviewCount?: number;
};

export type MarketplacePost = {
  id: string;
  uid: string;
  author: string;
  authorPhotoURL: string;
  authorRole?: UserProfile['role'];
  itemName: string;
  description: string;
  price: number;
  quantity: string;
  condition: "New" | "Used" | "For Hire";
  imageUrl: string;
  createdAt: Timestamp;
  commentCount?: number;
  upvotes?: string[];
  downvotes?: string[];
};


export function MarketplaceClient() {
  const firestore = useFirestore();
  const { user } = useUser();
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
            <div className="flex justify-between items-center">
                <TabsList>
                    <TabsTrigger value="verified">Verified Market</TabsTrigger>
                    <TabsTrigger value="indirect">Indirect Market</TabsTrigger>
                </TabsList>
                 {user && isVerifiedSeller && activeTab === 'verified' && (
                    <CreateProductDialog>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            List Product
                        </Button>
                    </CreateProductDialog>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-card mt-4">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder={activeTab === 'verified' ? "Search products..." : "Search posts..."}
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
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Want to sell here?</AlertTitle>
                <AlertDescription>
                  Only users with a verified seller account can list products in this marketplace. Verification is handled by administrators.
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="verified" className="mt-6">
                {loading && <div className="text-center py-12 text-muted-foreground">Loading products...</div>}
                {!loading && products?.length === 0 && (
                    <div className="text-center py-20 px-6 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                        <ShoppingCart className="mx-auto h-16 w-16" />
                        <h3 className="font-headline text-2xl mt-6">The Verified Market is Empty</h3>
                        <p className="mt-2 max-w-md mx-auto">
                            {searchTerm 
                                ? `No products found for "${searchTerm}".`
                                : `There are currently no products listed from verified sellers.`}
                        </p>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="indirect" className="mt-6">
                {loading && <div className="text-center py-12 text-muted-foreground">Loading posts...</div>}
                 {!loading && marketplacePosts?.length === 0 && (
                    <div className="text-center py-20 px-6 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                        <ShoppingCart className="mx-auto h-16 w-16" />
                        <h3 className="font-headline text-2xl mt-6">The Indirect Market is Empty</h3>
                        <p className="mt-2 max-w-md mx-auto">
                            {searchTerm 
                                ? `No posts found for "${searchTerm}".`
                                : `There are currently no items listed here. Be the first to post something for sale!`}
                        </p>
                    </div>
                )}
                <div className="space-y-6">
                    {marketplacePosts?.map((post) => (
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
                    Create Post
                </Button>
                </CreateMarketplacePostDialog>
            ) : (
                <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
                    <Link href="/cart" className="group flex items-center justify-end">
                        <span className="bg-card text-card-foreground shadow-md rounded-md px-3 py-2 text-sm font-medium mr-3 opacity-0 scale-95 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 ease-in-out">View Cart</span>
                        <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                    </Link>
                    <Link href="/settings/orders" className="group flex items-center justify-end">
                         <span className="bg-card text-card-foreground shadow-md rounded-md px-3 py-2 text-sm font-medium mr-3 opacity-0 scale-95 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 ease-in-out">My Orders</span>
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
