'use client';

import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Post } from '@/lib/actions/community';
import { PostListClient } from './post-list-client';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemo } from 'react';
import type { UserProfile } from '@/types';

export function PostList({ communityId }: { communityId: string }) {
  const firestore = useFirestore();

  const postsQuery = useMemo(() => {
    if (!firestore) return null;
    // Remove orderBy to avoid needing a composite index. Sorting will be done client-side.
    return query(
      collection(firestore, 'posts'),
      where('communityId', '==', communityId)
    );
  }, [firestore, communityId]);

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: posts, loading: postsLoading } = useCollection<Post & { createdAt: Timestamp }>(postsQuery);
  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const loading = postsLoading || usersLoading;

  const enrichedPosts = useMemo(() => {
    if (!posts || !users) return [];

    const usersMap = new Map(users.map(user => [user.uid, user]));

    const sortedPosts = [...posts].sort((a, b) => {
        const dateA = a.createdAt?.toDate() || 0;
        const dateB = b.createdAt?.toDate() || 0;
        // @ts-ignore
        return dateB - dateA;
    });

    return sortedPosts.map(post => ({
      ...post,
      authorRole: usersMap.get(post.uid)?.role || 'user',
    }));
  }, [posts, users]);


  if (loading) {
    return <p>Loading posts...</p>;
  }

  return (
    <div className="space-y-6">
      <PostListClient posts={enrichedPosts} />
    </div>
  );
}
