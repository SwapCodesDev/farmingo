'use client';
import React from 'react';
import { ConversationClient } from '@/components/features/conversation-client';
import { Suspense } from 'react';

// This is the main component that renders the layout for a specific conversation.
export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
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
