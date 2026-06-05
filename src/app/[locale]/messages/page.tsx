'use client';

import { MessagesClient } from '@/components/features/messages/messages-client';
import { useUser } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Suspense } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MessagesPage() {
  const { user, loading } = useUser();
  const isMobile = useIsMobile();
  const t = useTranslations('Messages');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>You must be logged in to view messages.</p>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <div className="h-full">
        <Suspense fallback={<p>Loading conversations...</p>}>
          <MessagesClient currentUser={user} />
        </Suspense>
      </div>
    );
  }

  // Desktop placeholder when no conversation is selected
  return (
    <Card className="h-full flex flex-col items-center justify-center text-center p-6 bg-muted/20 border-muted">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-bold font-headline">{t('title')}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        Select a conversation from the sidebar list to view messages and start chatting.
      </p>
    </Card>
  );
}

import { Loader2 } from 'lucide-react';
