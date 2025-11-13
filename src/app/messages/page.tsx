'use client';
import { MessagesClient } from '@/components/features/messages-client';
import { useUser } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Suspense } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function MessagesPage() {
  const { user, loading } = useUser();
  const isMobile = useIsMobile();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
        <Card>
            <CardContent className="p-6">
                <p>You must be logged in to view messages.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="h-[calc(100vh-8.5rem)] md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-4">
        <div className={cn("md:col-span-1", isMobile && 'h-full')}>
            <Suspense fallback={<p>Loading conversations...</p>}>
                <MessagesClient currentUser={user} />
            </Suspense>
        </div>
        <div className="hidden md:col-span-2 lg:col-span-3 md:flex items-center justify-center h-full">
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 rounded-lg bg-card border">
                <MessageSquare className="h-16 w-16 mb-4" />
                <h2 className="text-xl font-semibold">Select a conversation</h2>
                <p>Choose from your existing conversations on the left, or start a new one.</p>
            </div>
        </div>
    </div>
  );
}
