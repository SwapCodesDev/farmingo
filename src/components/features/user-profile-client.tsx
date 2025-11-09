'use client';
import { useMemo, useState } from 'react';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PostCard } from './post-card';
import type { Post } from '@/lib/actions/community';
import { MessageCircle, UserPlus, Loader2, Calendar } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { Button } from '../ui/button';
import { getOrCreateConversation } from '@/lib/actions/messages';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { formatUsername, formatTimestamp } from '@/lib/utils';
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
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!userProfile) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">The user `u/{username}` does not exist.</p>
      </div>
    );
  }
  
  const joinDate = userProfile.createdAt instanceof Timestamp ? userProfile.createdAt.toDate() : new Date(userProfile.createdAt);
  const isOwnProfile = currentUser?.uid === userProfile.uid;

  return (
    <div className="space-y-8">
       <Card className="overflow-hidden">
        <div className="relative h-24 sm:h-36 w-full bg-muted">
             {/* Banner Image can be added here */}
        </div>
        <CardContent className="relative flex flex-col items-center justify-center pt-0 pb-6 -mt-12 sm:-mt-16 text-center">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
              <AvatarImage
                src={userProfile.photoURL ?? undefined}
                alt={userProfile.displayName}
              />
              <AvatarFallback className="text-4xl">
                {getInitials(userProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline">
                    {userProfile.displayName}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    {formatUsername(userProfile.username, userProfile.role)}
                </p>
                <div className="flex items-center justify-center pt-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Joined on {formatTimestamp(userProfile.createdAt, { format: 'full', addSuffix: false })}
                </div>
            </div>
             {!isOwnProfile && currentUser && (
                <div className='flex items-center gap-2 mt-4'>
                    <Button size="sm">
                        <UserPlus className='mr-2 h-4 w-4' />
                        Follow
                    </Button>
                    <Button size="sm" variant='outline' onClick={handleStartConversation} disabled={isCreatingConversation}>
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
      
      <div className="space-y-6">
        <h3 className="font-headline text-2xl font-bold tracking-tight px-6 md:px-0">Posts</h3>
        {postsLoading && <div className="text-center"><Loader2 className="h-6 w-6 animate-spin"/></div>}
        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={{...post, authorRole: userProfile.role}} voteAction={(vote) => voteOnPost(post.id, vote)} />)
        ) : (
          !postsLoading && (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="font-semibold text-lg">No posts yet.</p>
                <p className="mt-1">This user hasn't posted anything.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
