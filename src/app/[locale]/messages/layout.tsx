'use client';

import { usePathname } from '@/i18n/routing';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { MessagesClient } from '@/components/features/messages/messages-client';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';

import { MessagesSkeleton } from '@/components/features/shared/skeletons';

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  if (loading) {
    return <MessagesSkeleton />;
  }

  if (!user) {
    return (
      <Card>
        <div className="p-6">
          <p>You must be logged in to view messages.</p>
        </div>
      </Card>
    );
  }

  // Check if we are on a specific conversation page
  const segments = pathname.split('/');
  const isViewingConversation = segments.length > 2 && segments[segments.length - 1] !== 'messages';

  if (isMobile) {
    // On mobile, show either the list (on /messages) or the active chat (on /messages/[conversationId])
    return (
      <div className="h-[calc(100vh-8.5rem)]">
        {!isViewingConversation ? (
          children
        ) : (
          children
        )}
      </div>
    );
  }

  // On desktop/tablet, render a split-pane layout
  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8.5rem)]">
      <div className="col-span-12 md:col-span-4 h-full">
        <MessagesClient currentUser={user} />
      </div>
      <div className="col-span-12 md:col-span-8 h-full">
        {children}
      </div>
    </div>
  );
}
