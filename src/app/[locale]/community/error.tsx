'use client';

import { SectionError } from '@/components/features/shared/section-error';

export default function CommunityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SectionError error={error} reset={reset} messageKey="community-failed" />;
}
