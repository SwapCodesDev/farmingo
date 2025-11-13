
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchResultsClient } from '@/components/features/search-results-client';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const time = searchParams.get('t') || 'all';

  return (
    <SearchResultsClient
      query={query}
      sort={sort}
      time={time}
    />
  );
}


export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
