
import { MarketplacePostDetailClient } from '@/components/features/marketplace-post-detail-client';
import { Suspense } from 'react';

export default function MarketplacePostPage({ params }: { params: { postId: string } }) {
  return (
    <Suspense fallback={<p>Loading post...</p>}>
      <MarketplacePostDetailClient postId={params.postId} />
    </Suspense>
  );
}
