'use client';
import { useMemo } from 'react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import {
  collection,
  query,
  where,
  limit,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Edit, Loader2 } from 'lucide-react';
import { PostCard } from '@/components/features/post-card';
import { useAuthActions } from '@/hooks/use-auth-actions';
import Link from 'next/link';
import { formatUsername, formatTimestamp } from '@/lib/utils';
import type { UserProfile } from '@/types';
import type { Post } from '@/lib/actions/community';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { voteOnPost } = useAuthActions();

  const userProfileQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users'),
      where('uid', '==', user.uid),
      limit(1)
    );
  }, [firestore, user]);

  const { data: userProfiles, loading: profileLoading } =
    useCollection<UserProfile>(userProfileQuery);
  const userProfile = userProfiles?.[0];

  const postsQuery = useMemo(() => {
    if (!firestore || !userProfile) return null;
    return query(
      collection(firestore, 'posts'),
      where('uid', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userProfile]);

  const { data: posts, loading: postsLoading } = useCollection<
    Post & { createdAt: Timestamp }
  >(postsQuery);

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const loading = userLoading || profileLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Could not load user profile. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full bg-muted">
             <Button asChild variant="outline" size="icon" className="absolute top-4 right-4 bg-background/50 backdrop-blur-sm hover:bg-background/75">
              <Link href="/settings/profile">
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
        </div>
        <CardHeader className="relative flex flex-col items-center justify-center pt-0 pb-6 -mt-16">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage
                src={userProfile.photoURL ?? undefined}
                alt={userProfile.displayName}
              />
              <AvatarFallback className="text-4xl">
                {getInitials(userProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center mt-4">
                <h1 className="text-3xl font-bold font-headline">
                    {userProfile.displayName}
                </h1>
                <p className="text-base text-muted-foreground">
                    {formatUsername(userProfile.username, userProfile.role)}
                </p>
                <div className="flex items-center justify-center pt-2 text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Joined on {formatTimestamp(userProfile.createdAt, { format: 'full', addSuffix: false })}
                </div>
            </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="followers" disabled>Followers</TabsTrigger>
          <TabsTrigger value="following" disabled>Following</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
            {postsLoading && (
                 <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
            {!postsLoading && posts && posts.length > 0 ? (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <PostCard
                        key={post.id}
                        post={{...post, authorRole: userProfile.role}}
                        voteAction={(vote) => voteOnPost(post.id, vote)}
                        />
                    ))}
                </div>
            ) : (
                !postsLoading && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="font-semibold text-lg">No posts yet.</p>
                        <p className="mt-1">When you post, they'll show up here.</p>
                    </div>
                )
            )}
        </TabsContent>
        <TabsContent value="followers">
            <p className="text-muted-foreground text-center py-12">This feature is coming soon.</p>
        </TabsContent>
        <TabsContent value="following">
            <p className="text-muted-foreground text-center py-12">This feature is coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
