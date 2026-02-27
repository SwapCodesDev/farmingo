
'use client';

import { CommunityListClient } from '@/components/features/community-list-client';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

export default function CommunityPage() {
  const t = useTranslations('Community');

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

      <Suspense fallback={<p>{t('loading-communities')}</p>}>
        <CommunityListClient />
      </Suspense>
    </div>
  );
}
