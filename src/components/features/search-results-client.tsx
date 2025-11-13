'use client';

import { useState, useEffect } from 'react';
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
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import type { Post } from '@/lib/actions/community';
import { PostCard } from './post-card';
import { useAuthActions } from '@/hooks/use-auth-actions';
import type { UserProfile } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { formatTimestamp, formatUsername } from '@/lib/utils';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';

interface SearchResultsClientProps {
  query: string;
  sort: string;
  time: string;
}

type Community = {
    id: string;
    name: string;
    description: string;
    postCount: number;
    imageUrl?: string;
    creatorId: string;
    creatorUsername: string;
    creatorRole?: UserProfile['role'];
    createdAt: Timestamp;
}

function CommunityResultCard({ community }: { community: Community }) {
    const { showProfile } = useUserProfileDialog();
    return (
        <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <Link href={`/c/${community.id}`} className="relative block aspect-video w-full bg-muted">
                {community.imageUrl && (
                    <Image
                        src={community.imageUrl}
                        alt={community.name}
                        fill
                        className="object-cover"
                    />
                )}
            </Link>
            <CardHeader className="relative">
                <Link href={`/c/${community.id}`}>
                    <CardTitle className="font-headline text-xl hover:underline">c/{community.name}</CardTitle>
                </Link>
                <CardDescription className="line-clamp-2 h-10">{community.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto flex justify-between text-xs text-muted-foreground">
                <button onClick={() => showProfile(community.creatorUsername)} className="hover:underline">
                    Created by {formatUsername(community.creatorUsername, community.creatorRole)}
                </button>
                <span>{formatTimestamp(community.createdAt)}</span>
            </CardFooter>
        </Card>
    );
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
  const [postResults, setPostResults] = useState<Post[]>([]);
  const [communityResults, setCommunityResults] = useState<Community[]>([]);

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
      setPostResults([]);
      setCommunityResults([]);
      return;
    }
    setIsLoading(true);

    try {
      // 1. Search Posts
      const postsRef = collection(firestore, 'posts');
      const postsSnapshot = await getDocs(postsRef);
      let fetchedPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      
      fetchedPosts = fetchedPosts.filter(post => 
          post.title.toLowerCase().includes(initialQuery.toLowerCase()) ||
          post.text.toLowerCase().includes(initialQuery.toLowerCase())
      );

      // 2. Search Communities
      const communitiesRef = collection(firestore, 'communities');
      const communitiesSnapshot = await getDocs(communitiesRef);
      let fetchedCommunities = communitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Community));

      fetchedCommunities = fetchedCommunities.filter(community =>
        community.name.toLowerCase().includes(initialQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(initialQuery.toLowerCase())
      );


      // 3. Filter by time (only for posts for now)
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

      // 4. Sort results
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
      
      fetchedCommunities.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));

      setPostResults(fetchedPosts);
      setCommunityResults(fetchedCommunities);
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

  const hasResults = communityResults.length > 0 || postResults.length > 0;

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

      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {!hasResults ? (
                <div className="text-center py-20 px-6 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                    <Search className="mx-auto h-16 w-16" />
                    <h3 className="font-headline text-2xl mt-6">No Results Found</h3>
                    <p className="mt-2 max-w-md mx-auto">
                        We couldn't find anything matching your search. Try a different query or adjust your filters.
                    </p>
                </div>
            ) : (
                <>
                {communityResults.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="font-headline text-2xl font-bold">Communities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {communityResults.map(community => (
                                <CommunityResultCard key={community.id} community={community} />
                            ))}
                        </div>
                    </div>
                )}
                 {postResults.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="font-headline text-2xl font-bold">Posts</h2>
                        {postResults.map(post => (
                            <PostCard key={post.id} post={post} voteAction={(vote) => voteOnPost(post.id, vote)} />
                        ))}
                    </div>
                 )}
                </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
