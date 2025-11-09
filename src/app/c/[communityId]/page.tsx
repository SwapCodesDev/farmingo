

import { PostList } from '@/components/features/post-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CreatePostDialog } from '@/components/features/create-post-dialog';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';


// This is a server component, so we can't use hooks.
// We'll simulate fetching for now.
async function getCommunity(communityId: string): Promise<{ id: string; name: string; description: string; } | null> {
  if (communityId) {
    return {
      id: communityId,
      name: communityId.charAt(0).toUpperCase() + communityId.slice(1),
      description: `A community for all things related to ${communityId}.`,
    }
  }
  return null;
}


export default async function CommunitySubPage({ params }: { params: { communityId: string } }) {
  const community = await getCommunity(params.communityId);

  if (!community) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Community not found</h1>
        <Button asChild variant="link">
          <Link href="/community">Explore other communities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          c/{community.id}
        </h1>
        <p className="text-muted-foreground">
          {community.description}
        </p>
      </div>
      
      <Suspense fallback={<p>Loading posts...</p>}>
        <PostList communityId={params.communityId} />
      </Suspense>

      <CreatePostDialog communityId={params.communityId}>
          <Button
            className="fixed bottom-6 right-6 rounded-full shadow-lg"
            aria-label="Create New Post"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
      </CreatePostDialog>

    </div>
  );
}
