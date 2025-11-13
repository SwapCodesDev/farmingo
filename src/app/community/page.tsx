
import { CommunityListClient } from '@/components/features/community-list-client';
import { Suspense } from 'react';

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Community Hub
        </h1>
        <p className="text-muted-foreground">
          Connect with fellow farmers, share knowledge, and grow together. Explore a community or search for content below.
        </p>
      </div>

      <Suspense fallback={<p>Loading communities...</p>}>
        <CommunityListClient />
      </Suspense>
    </div>
  );
}
