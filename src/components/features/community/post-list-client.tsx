'use client';

import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { PostCard } from './post-card';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { PostListSkeleton } from '@/components/features/shared/skeletons';
import { EmptyState } from '@/components/features/shared/empty-state';
import type { UserProfile, Post } from '@/types';

type EnrichedPost = Post & { authorRole?: UserProfile['role'] };

interface PostListClientProps {
  communityId: string;
}

export function PostListClient({ communityId }: PostListClientProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { voteOnPost } = useAuthActions();

  // Pagination states
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsCursor, setPostsCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Users cache to avoid redundant fetching
  const [usersMap, setUsersMap] = useState<Map<string, UserProfile>>(new Map());

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch profiles of authors we haven't cached yet
  const fetchAuthorProfiles = async (uids: string[]): Promise<Record<string, UserProfile>> => {
    if (!firestore || uids.length === 0) return {};

    const missingUids = uids.filter(uid => !usersMap.has(uid));
    if (missingUids.length === 0) return {};

    const newProfilesMap: Record<string, UserProfile> = {};
    try {
      // Fetch up to 30 items at once. Since we load posts in chunks of 6, missingUids <= 6
      const q = query(collection(firestore, 'users'), where('uid', 'in', missingUids));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => {
        const profile = doc.data() as UserProfile;
        newProfilesMap[profile.uid] = profile;
      });
    } catch (error) {
      console.error('Error fetching author profiles:', error);
    }
    return newProfilesMap;
  };

  const fetchPosts = async (isFirstPage: boolean) => {
    if (!firestore) return;
    if (postsLoading) return;
    if (!isFirstPage && !postsHasMore) return;

    setPostsLoading(true);
    if (isFirstPage) {
      setIsInitialLoading(true);
      setPosts([]);
      setPostsCursor(null);
      setPostsHasMore(true);
    }

    try {
      const q = collection(firestore, 'posts');
      let baseQuery;

      if (isFirstPage) {
        baseQuery = query(
          q,
          where('communityId', '==', communityId),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
      } else if (postsCursor) {
        baseQuery = query(
          q,
          where('communityId', '==', communityId),
          orderBy('createdAt', 'desc'),
          startAfter(postsCursor),
          limit(6)
        );
      }

      if (baseQuery) {
        const snapshot = await getDocs(baseQuery);
        const newItems = snapshot.docs.map(doc => ({
          id: doc.id,
          refPath: doc.ref.path,
          ...doc.data()
        })) as unknown as Post[];

        // Fetch user profiles for the authors of these new posts
        const authorUids = Array.from(new Set(newItems.map(item => item.uid)));
        if (authorUids.length > 0) {
          const newProfiles = await fetchAuthorProfiles(authorUids);
          setUsersMap(prev => {
            const next = new Map(prev);
            Object.entries(newProfiles).forEach(([uid, profile]) => {
              next.set(uid, profile);
            });
            return next;
          });
        }

        if (isFirstPage) {
          setPosts(newItems);
        } else {
          setPosts(prev => [...prev, ...newItems]);
        }

        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
        setPostsCursor(lastVisible);
        setPostsHasMore(snapshot.docs.length === 6);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPosts(true);
  }, [firestore, communityId]);

  // Infinite Scroll Trigger
  const loadMoreRef = useRef<() => void>();
  loadMoreRef.current = () => {
    if (!postsLoading && postsHasMore) {
      fetchPosts(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current?.();
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, []);

  const handleVoteOnPost = async (postId: string, vote: 'up' | 'down') => {
    if (!user) return;
    await voteOnPost(postId, vote);

    // Optimistic state updates
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;

        const upvoted = post.upvotes?.includes(user.uid);
        const downvoted = post.downvotes?.includes(user.uid);

        let newUpvotes = post.upvotes ? [...post.upvotes] : [];
        let newDownvotes = post.downvotes ? [...post.downvotes] : [];

        if (vote === 'up') {
          if (upvoted) {
            newUpvotes = newUpvotes.filter(uid => uid !== user.uid);
          } else {
            newUpvotes.push(user.uid);
            newDownvotes = newDownvotes.filter(uid => uid !== user.uid);
          }
        } else if (vote === 'down') {
          if (downvoted) {
            newDownvotes = newDownvotes.filter(uid => uid !== user.uid);
          } else {
            newDownvotes.push(user.uid);
            newUpvotes = newUpvotes.filter(uid => uid !== user.uid);
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

  if (isInitialLoading) {
    return <PostListSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        type="posts"
        title="No posts in this community yet."
        description="Be the first to share something!"
      />
    );
  }

  // Enrich posts with cached author roles
  const enrichedPosts: EnrichedPost[] = posts.map(post => ({
    ...post,
    authorRole: usersMap.get(post.uid)?.role || 'user',
  }));

  return (
    <div className="space-y-6">
      {enrichedPosts.map((post) => (
        <PostCard key={post.id} post={post} voteAction={(vote) => handleVoteOnPost(post.id, vote)} />
      ))}
      <div ref={sentinelRef} className="py-6">
        {postsLoading && <PostListSkeleton />}
      </div>
    </div>
  );
}
