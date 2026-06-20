'use client';

import { SectionError } from '@/components/features/shared/section-error';

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SectionError error={error} reset={reset} messageKey="messages-failed" />;
}
