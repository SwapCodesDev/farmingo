'use client';

import { PostListClient } from './post-list-client';

export function PostList({ communityId }: { communityId: string }) {
  return (
    <div className="space-y-6">
      <PostListClient communityId={communityId} />
    </div>
  );
}
