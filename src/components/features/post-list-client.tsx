
'use client';

import { PostCard } from './post-card';
import { useAuthActions } from '@/hooks/use-auth-actions';
import type { Post } from '@/lib/actions/community';
import type { UserProfile } from '@/types';

type EnrichedPost = Post & { authorRole?: UserProfile['role'] };
interface PostListClientProps {
  posts: EnrichedPost[];
}

export function PostListClient({ posts }: PostListClientProps) {
  const { voteOnPost } = useAuthActions();

  if (posts.length === 0) {
     return (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="font-semibold text-lg">No posts in this community yet.</p>
            <p className="mt-1">Be the first to share something!</p>
        </div>
     )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} voteAction={(vote) => voteOnPost(post.id, vote)} />
      ))}
    </div>
  );
}
