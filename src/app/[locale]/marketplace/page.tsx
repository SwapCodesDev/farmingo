
import { MarketplaceClient } from '@/components/features/marketplace/marketplace-client';
import { MarketplaceSkeleton } from '@/components/features/shared/skeletons';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export default async function MarketplacePage() {
  const t = await getTranslations('Marketplace');

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
      <Suspense fallback={<MarketplaceSkeleton />}>
        <MarketplaceClient />
      </Suspense>
    </div>
  );
}
