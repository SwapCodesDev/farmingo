import { PostDetailClient } from '@/components/features/post-detail-client';
import { Suspense } from 'react';

export default function PostPage({ params }: { params: { postId: string } }) {
  return (
    <Suspense fallback={<p>Loading post...</p>}>
      <PostDetailClient postId={params.postId} />
    </Suspense>
  );
}
