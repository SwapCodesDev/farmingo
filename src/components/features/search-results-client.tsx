'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import type { Post } from '@/lib/actions/community';
import { PostCard } from './post-card';
import { useAuthActions } from '@/hooks/use-auth-actions';

interface SearchResultsClientProps {
  query: string;
  sort: string;
  time: string;
}

export function SearchResultsClient({
  query: initialQuery,
  sort: initialSort,
  time: initialTime,
}: SearchResultsClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortOption, setSortOption] = useState(initialSort);
  const [timeOption, setTimeOption] = useState(initialTime);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Post[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { voteOnPost } = useAuthActions();

  const updateURL = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', searchQuery);
    params.set('sort', sortOption);
    params.set('t', timeOption);
    router.push(`${pathname}?${params.toString()}`);
  };

  const performSearch = async () => {
    if (!firestore || !initialQuery) {
      setResults([]);
      return;
    }
    setIsLoading(true);

    try {
      const postsRef = collection(firestore, 'posts');

      // Firestore does not support native text search on multiple fields.
      // This is a simplified client-side search. For production, use a dedicated search service.
      const postsSnapshot = await getDocs(postsRef);
      let fetchedPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      
      // 1. Filter by search query (client-side)
      if (initialQuery) {
        fetchedPosts = fetchedPosts.filter(post => 
            post.title.toLowerCase().includes(initialQuery.toLowerCase()) ||
            post.text.toLowerCase().includes(initialQuery.toLowerCase())
        );
      }

      // 2. Filter by time
      const now = new Date();
      let startTime: Date | null = null;
      switch (initialTime) {
          case 'hour': startTime = new Date(now.getTime() - 60 * 60 * 1000); break;
          case 'day': startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
          case 'week': startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
          case 'month': startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
          case 'year': startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      }
      if (startTime) {
        fetchedPosts = fetchedPosts.filter(post => {
            const postDate = post.createdAt instanceof Timestamp ? post.createdAt.toDate() : new Date(post.createdAt);
            return postDate >= startTime!;
        });
      }

      // 3. Sort results
      fetchedPosts.sort((a, b) => {
        const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
        const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);

        switch(initialSort) {
            case 'popular':
            case 'top':
                return scoreB - scoreA;
            case 'comment_count':
                return (b.commentCount || 0) - (a.commentCount || 0);
            case 'new':
            case 'relevance': // Fallback for relevance
            default:
                return dateB.getTime() - dateA.getTime();
        }
      });
      setResults(fetchedPosts);
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateURL();
  };
  
  useEffect(() => {
    updateURL();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption, timeOption]);

  useEffect(() => {
    performSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialSort, initialTime, firestore]);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">
        Search Results {initialQuery && `for "${initialQuery}"`}
      </h1>

      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities, posts, comments..."
            className="pl-9"
          />
        </div>
        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Search
        </Button>
      </form>
      
      <div className="flex flex-col md:flex-row items-center gap-2">
        <div className="flex items-center gap-2 w-full">
            <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="comment_count">Comment Count</SelectItem>
                </SelectContent>
            </Select>
            <Select value={timeOption} onValueChange={setTimeOption}>
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="hour">Past Hour</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {results.length > 0 ? (
                results.map(post => (
                    <PostCard key={post.id} post={post} voteAction={(vote) => voteOnPost(post.id, vote)} />
                ))
            ) : (
                <div className="text-center py-20 px-6 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                    <Search className="mx-auto h-16 w-16" />
                    <h3 className="font-headline text-2xl mt-6">No Results Found</h3>
                    <p className="mt-2 max-w-md mx-auto">
                        We couldn't find anything matching your search. Try a different query or adjust your filters.
                    </p>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
