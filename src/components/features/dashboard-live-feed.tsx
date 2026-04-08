
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ShoppingCart, ArrowUpRight, Clock, Users, Store } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatTimestamp } from '@/lib/utils';
import type { Post } from '@/lib/actions/community';
import type { Product } from './marketplace-client';

export function DashboardLiveFeed() {
  const firestore = useFirestore();

  const recentPostsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'), limit(3));
  }, [firestore]);

  const recentProductsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('createdAt', 'desc'), limit(3));
  }, [firestore]);

  const { data: posts, loading: postsLoading } = useCollection<Post>(recentPostsQuery);
  const { data: products, loading: productsLoading } = useCollection<Product>(recentProductsQuery);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Community Pulse */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="font-headline text-xl">Community Pulse</CardTitle>
          </div>
          <Link href="/community" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          {postsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <Link key={post.id} href={`/community/${post.id}`} className="block">
                <div className="group p-4 rounded-2xl bg-card border hover:border-accent/30 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={post.authorPhotoURL} />
                      <AvatarFallback>{post.author[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-accent uppercase tracking-tighter">c/{post.communityId}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(post.createdAt)}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm leading-tight group-hover:text-accent transition-colors line-clamp-1">{post.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{post.text}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic py-4">No recent discussions found.</p>
          )}
        </CardContent>
      </Card>

      {/* Market Fresh */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-headline text-xl">New in Market</CardTitle>
          </div>
          <Link href="/marketplace" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            Shop Now <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          {productsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <Link key={product.id} href="/marketplace" className="block">
                <div className="group p-4 rounded-2xl bg-card border hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border">
                        <img src={product.imageUrl} alt={product.name} className="object-cover h-full w-full" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-primary">₹{product.price}</span>
                        <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 border-primary/20 text-primary">Verified</Badge>
                      </div>
                    </div>
                    <div className="p-2 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ShoppingCart className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic py-4">No recent products listed.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
