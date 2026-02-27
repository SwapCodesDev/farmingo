
'use client';
import React from 'react';
import { ConversationClient } from '@/components/features/conversation-client';
import { Suspense } from 'react';

export default function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; conversationId: string }>;
}) {
  const { conversationId } = React.use(params);

  return (
    <div className="h-[calc(100vh-8.5rem)]">
      <Suspense fallback={<p>Loading conversation...</p>}>
        <ConversationClient conversationId={conversationId} />
      </Suspense>
    </div>
  );
}
