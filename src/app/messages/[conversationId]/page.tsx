'use client';
import { ConversationClient } from '@/components/features/conversation-client';
import { MessagesClient } from '@/components/features/messages-client';
import { useUser } from '@/firebase';
import { Suspense, use } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

// This is the main component that renders the layout for a specific conversation.
export default function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const { conversationId } = use(params);
  const { user, loading } = useUser();
  const isMobile = useIsMobile();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  // On mobile, only show the conversation view.
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8.5rem)]">
        <Suspense fallback={<p>Loading conversation...</p>}>
          <ConversationClient conversationId={conversationId} />
        </Suspense>
      </div>
    );
  }

  // On desktop, show the list of conversations and the selected one.
  return (
    <div className="h-[calc(100vh-8.5rem)] md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4">
      <div className="md:col-span-1">
        <Suspense fallback={<p>Loading conversations...</p>}>
          <MessagesClient currentUser={user} />
        </Suspense>
      </div>
      <div className="md:col-span-2 lg:col-span-3 h-full">
        <Suspense fallback={<p>Loading conversation...</p>}>
          <ConversationClient conversationId={conversationId} />
        </Suspense>
      </div>
    </div>
  );
}
