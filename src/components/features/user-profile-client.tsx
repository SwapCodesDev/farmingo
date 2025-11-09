'use client';
import { useMemo, useState } from 'react';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PostCard } from './post-card';
import type { Post } from '@/lib/actions/community';
import { MessageCircle, UserPlus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Button } from '../ui/button';
import { getOrCreateConversation } from '@/lib/actions/messages';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { formatUsername } from '@/lib/utils';
import type { UserProfile } from '@/types';


interface UserProfileClientProps {
  username: string;
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { hideProfile } = useUserProfileDialog();
  const { voteOnPost } = useAuthActions();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const userQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users'),
      where('username', '==', username),
      limit(1)
    );
  }, [firestore, username]);

  const { data: users, loading: userLoading } = useCollection<UserProfile>(userQuery);
  const userProfile = users?.[0];

  const postsQuery = useMemo(() => {
    if (!firestore || !userProfile) return null;
    return query(
      collection(firestore, 'posts'),
      where('uid', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userProfile]);

  const { data: posts, loading: postsLoading } = useCollection<Post & { createdAt: Timestamp | Date | string }>(postsQuery);

  const handleStartConversation = async () => {
    if (!currentUser || !userProfile || !firestore) return;

    setIsCreatingConversation(true);
    try {
        const conversationId = await getOrCreateConversation(firestore, currentUser.uid, userProfile.uid);
        hideProfile();
        router.push(`/messages/${conversationId}`);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Failed to start conversation",
            description: error.message,
        });
    } finally {
        setIsCreatingConversation(false);
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (userLoading) {
    return <div className="text-center">Loading profile...</div>;
  }

  if (!userProfile) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">The user `u/{username}` does not exist.</p>
      </div>
    );
  }
  
  const joinDate = userProfile.createdAt instanceof Timestamp ? userProfile.createdAt.toDate() : new Date(userProfile.createdAt);
  const isOwnProfile = currentUser?.uid === userProfile.uid;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
            <CardHeader>
                <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
                        <AvatarFallback className="text-3xl">
                            {getInitials(userProfile.displayName || userProfile.email || '')}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold font-headline">{userProfile.displayName}</h2>
                    <p className="text-lg text-muted-foreground">{formatUsername(userProfile.username, userProfile.role)}</p>
                </div>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className='text-sm text-muted-foreground space-y-2'>
                <div className='flex items-center justify-center gap-2 bg-muted p-3 rounded-lg'>
                    <span>Joined {format(joinDate, 'MMMM yyyy')}</span>
                </div>
            </div>
            {!isOwnProfile && currentUser && (
                <div className='flex flex-col gap-2'>
                    <Button>
                        <UserPlus className='mr-2 h-4 w-4' />
                        Follow
                    </Button>
                    <Button variant='outline' onClick={handleStartConversation} disabled={isCreatingConversation}>
                        {isCreatingConversation ? (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                            <MessageCircle className='mr-2 h-4 w-4' />
                        )}
                        Message
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2 space-y-6">
        <h3 className="font-headline text-2xl font-bold tracking-tight">Posts</h3>
        {postsLoading && <p>Loading posts...</p>}
        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} voteAction={(vote) => voteOnPost(post.id, vote)} />)
        ) : (
          !postsLoading && <p className="text-muted-foreground">This user hasn't posted anything yet.</p>
        )}
      </div>
    </div>
  );
}
