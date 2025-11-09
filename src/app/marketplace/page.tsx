import { MarketplaceClient } from '@/components/features/marketplace-client';
import { Suspense } from 'react';

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Marketplace
        </h1>
        <p className="text-muted-foreground">
          Buy and sell fresh produce and farming supplies directly.
        </p>
      </div>
      <Suspense fallback={<p>Loading marketplace...</p>}>
        <MarketplaceClient />
      </Suspense>
    </div>
  );
}
