// This is now a Server Component
import { ConversationClient } from '@/components/features/conversation-client';
import { Suspense } from 'react';

// The page component is now async and receives params directly.
export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {

  // We are removing the user check from this component.
  // The user check will now happen inside the ConversationClient component,
  // which is more appropriate for a client-side concern.

  return (
    <div className="h-[calc(100vh-8.5rem)]">
      <Suspense fallback={<p>Loading conversation...</p>}>
        {/* We pass the conversationId directly to the client component.
            The currentUser will be fetched via the useUser hook within ConversationClient. */}
        <ConversationClient conversationId={params.conversationId} />
      </Suspense>
    </div>
  );
}
