'use client';
import { MessagesClient } from '@/components/features/messages-client';
import { useUser } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Suspense } from 'react';

export default function MessagesPage() {
  const { user, loading } = useUser();

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
    );
  }

  return (
    <div className="h-[calc(100vh-8.5rem)]">
      <Suspense fallback={<p>Loading conversations...</p>}>
        <MessagesClient currentUser={user} />
      </Suspense>
    </div>
  );
}
