'use client';
import { useMemo, useState, useEffect } from 'react';
import { useFirestore, useUser, useCollection } from '@/firebase';
import {
  collection,
  query,
  where,
  limit,
  orderBy,
  Timestamp,
  doc,
  getDoc,
  collectionGroup,
  getCountFromServer,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Edit, Loader2, MapPin, MessageSquare, Heart, Lock, UserCheck, Users, AlertCircle } from 'lucide-react';
import { PostCard } from '@/components/features/community/post-card';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Link } from '@/i18n/routing';
import { formatUsername, formatTimestamp } from '@/lib/utils';
import type { UserProfile, Post, Comment } from '@/types';
import { useTranslations } from 'next-intl';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';

import { ProfileSkeleton } from '@/components/features/shared/skeletons';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { voteOnPost } = useAuthActions();
  const { showProfile } = useUserProfileDialog();
  const t = useTranslations('Profile');

  const [stats, setStats] = useState({ posts: 0, comments: 0, followers: 0, following: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

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

  // Fetch Stats (Posts, Comments, Followers, Following count)
  useEffect(() => {
    if (!firestore || !userProfile?.uid) return;
    setStatsLoading(true);

    const postsColl = collection(firestore, 'posts');
    const postsQ = query(postsColl, where('uid', '==', userProfile.uid));

    const commentsColl = collectionGroup(firestore, 'comments');
    const commentsQ = query(commentsColl, where('uid', '==', userProfile.uid), orderBy('createdAt', 'desc'));

    const followersColl = collection(firestore, 'users', userProfile.uid, 'followers');
    const followingColl = collection(firestore, 'users', userProfile.uid, 'following');

    Promise.all([
      getCountFromServer(postsQ),
      getCountFromServer(commentsQ),
      getCountFromServer(followersColl),
      getCountFromServer(followingColl)
    ]).then(([postsSnap, commentsSnap, followersSnap, followingSnap]) => {
      setStats({
        posts: postsSnap.data().count,
        comments: commentsSnap.data().count,
        followers: followersSnap.data().count,
        following: followingSnap.data().count
      });
      setStatsLoading(false);
    }).catch(err => {
      console.error("Error fetching stats:", err);
      setStatsLoading(false);
    });
  }, [firestore, userProfile?.uid]);

  // Subscriptions for lists
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

  const commentsQuery = useMemo(() => {
    if (!firestore || !userProfile) return null;
    return query(
      collectionGroup(firestore, 'comments'),
      where('uid', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userProfile]);

  const { data: comments, loading: commentsLoading } = useCollection<
    Comment & { createdAt: Timestamp }
  >(commentsQuery);

  // Fetch titles of posts where the comments are placed
  const [commentPosts, setCommentPosts] = useState<{[key: string]: {title: string, communityId: string, isMarketplace: boolean}}>({});
  useEffect(() => {
    if (!firestore || !comments || comments.length === 0) return;
    
    comments.forEach(async (c) => {
      const parts = c.refPath.split('/');
      const postId = parts[1];
      const isMarket = parts[0] === 'marketplacePosts';

      if (commentPosts[postId]) return;

      const postRef = doc(firestore, isMarket ? 'marketplacePosts' : 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const data = postSnap.data();
        setCommentPosts(prev => ({
          ...prev,
          [postId]: { 
            title: data.title || (isMarket ? 'Marketplace Listing' : 'Untitled Post'), 
            communityId: data.communityId || '',
            isMarketplace: isMarket
          }
        }));
      }
    });
  }, [firestore, comments]);

  // Followers List
  const followersListQuery = useMemo(() => {
    if (!firestore || !userProfile) return null;
    return query(collection(firestore, 'users', userProfile.uid, 'followers'));
  }, [firestore, userProfile]);

  const { data: followersList, loading: followersListLoading } = useCollection(followersListQuery);

  const followerIds = useMemo(() => followersList?.map(doc => doc.id) || [], [followersList]);
  
  const followersProfilesQuery = useMemo(() => {
    if (!firestore || followerIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('uid', 'in', followerIds));
  }, [firestore, followerIds]);

  const { data: followersProfiles, loading: followersProfilesLoading } = useCollection<UserProfile>(followersProfilesQuery);

  // Following List
  const followingListQuery = useMemo(() => {
    if (!firestore || !userProfile) return null;
    return query(collection(firestore, 'users', userProfile.uid, 'following'));
  }, [firestore, userProfile]);

  const { data: followingList, loading: followingListLoading } = useCollection(followingListQuery);

  const followingIds = useMemo(() => followingList?.map(doc => doc.id) || [], [followingList]);

  const followingProfilesQuery = useMemo(() => {
    if (!firestore || followingIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('uid', 'in', followingIds));
  }, [firestore, followingIds]);

  const { data: followingProfiles, loading: followingProfilesLoading } = useCollection<UserProfile>(followingProfilesQuery);

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
    return <ProfileSkeleton />;
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
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Banner & Profile Details */}
      <Card className="overflow-hidden border-none shadow-md bg-card">
        {/* Banner with Animated Gradient/Photo */}
        <div className="relative h-56 w-full overflow-hidden bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 hover:scale-[1.01] transition-transform duration-700 ease-out">
          {userProfile.bannerURL ? (
            <img 
              src={userProfile.bannerURL} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
          )}
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="absolute top-4 right-4 bg-background/60 backdrop-blur-md border-muted/50 hover:bg-background/80 transition-all font-semibold gap-1.5 shadow-sm"
          >
            <Link href="/settings/profile">
              <Edit className="h-4 w-4" />
              {t('edit-profile')}
            </Link>
          </Button>
        </div>

        {/* Profile Card Header overlay */}
        <CardHeader className="relative flex flex-col sm:flex-row items-center sm:items-end justify-between px-6 pb-6 pt-0 gap-4 border-b">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <Avatar className="-mt-16 h-32 w-32 border-4 border-card shadow-lg ring-1 ring-black/5 hover:scale-105 transition-transform duration-300">
              <AvatarImage
                src={userProfile.photoURL ?? undefined}
                alt={userProfile.displayName}
              />
              <AvatarFallback className="text-4xl bg-muted text-muted-foreground font-headline font-semibold">
                {getInitials(userProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="mb-2">
              <h1 className="text-3xl font-black tracking-tight font-headline text-foreground flex items-center justify-center sm:justify-start gap-2">
                {userProfile.displayName}
              </h1>
              <p className="text-sm font-semibold text-muted-foreground mt-0.5">
                {formatUsername(userProfile.username, userProfile.role)}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {userProfile.region || 'Everywhere'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Joined {formatTimestamp(userProfile.createdAt, { format: 'date', addSuffix: false })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-6 bg-muted/20 text-center">
          {[
            { label: t('posts'), count: stats.posts, icon: MessageSquare },
            { label: t('comments') || 'Comments', count: stats.comments, icon: Heart },
            { label: t('followers'), count: stats.followers, icon: Users },
            { label: t('following'), count: stats.following, icon: UserCheck }
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-card/65 backdrop-blur-sm border shadow-sm hover:-translate-y-0.5 hover:shadow transition-all"
            >
              <stat.icon className="h-5 w-5 text-primary/80 mb-1" />
              <span className="text-xl font-black tracking-tight font-headline text-foreground">
                {statsLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : stat.count}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs list */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="flex overflow-x-auto whitespace-nowrap scrollbar-none md:grid md:grid-cols-4 w-full bg-muted/30 p-1 rounded-xl">
          <TabsTrigger value="posts" className="rounded-lg py-2 font-semibold transition-all shrink-0">{t('posts')}</TabsTrigger>
          <TabsTrigger value="comments" className="rounded-lg py-2 font-semibold transition-all shrink-0">Comments</TabsTrigger>
          <TabsTrigger value="followers" className="rounded-lg py-2 font-semibold transition-all shrink-0">{t('followers')}</TabsTrigger>
          <TabsTrigger value="following" className="rounded-lg py-2 font-semibold transition-all shrink-0">{t('following')}</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-6 focus-visible:outline-none">
          {postsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
                <MessageSquare className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                <p className="font-semibold text-lg">{t('no-posts')}</p>
                <p className="mt-1 text-sm">{t('no-posts-desc')}</p>
              </div>
            )
          )}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-6 focus-visible:outline-none">
          {commentsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!commentsLoading && comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => {
                const parts = comment.refPath.split('/');
                const postId = parts[1];
                const postInfo = commentPosts[postId];
                const isMarket = postInfo?.isMarketplace;
                const postLink = isMarket 
                  ? `/marketplace/orders/${postId}` 
                  : `/c/${postInfo?.communityId || 'all'}`;

                return (
                  <Card key={comment.id} className="p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b">
                      <span>Commented on {formatTimestamp(comment.createdAt, { format: 'full', addSuffix: false })}</span>
                      {postInfo && (
                        <Link href={postLink} className="text-primary hover:underline font-semibold max-w-[200px] truncate">
                          on post: "{postInfo.title}"
                        </Link>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground pt-3 whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                  </Card>
                );
              })}
            </div>
          ) : (
            !commentsLoading && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
                <Heart className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                <p className="font-semibold text-lg">No comments yet</p>
                <p className="mt-1 text-sm">When you comment on posts, they'll show up here.</p>
              </div>
            )
          )}
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="mt-6 focus-visible:outline-none">
          {followersListLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!followersListLoading && followersProfiles && followersProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followersProfiles.map((follower) => (
                <Card 
                  key={follower.uid} 
                  className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                  onClick={() => showProfile(follower.username)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={follower.photoURL} alt={follower.displayName} />
                      <AvatarFallback>{getInitials(follower.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{follower.displayName}</h4>
                      <p className="text-xs text-muted-foreground">@{follower.username}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                    View
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            !followersListLoading && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
                <Users className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                <p className="font-semibold text-lg">No followers yet</p>
                <p className="mt-1 text-sm">When other users follow you, they'll show up here.</p>
              </div>
            )
          )}
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following" className="mt-6 focus-visible:outline-none">
          {followingListLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!followingListLoading && followingProfiles && followingProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followingProfiles.map((followingUser) => (
                <Card 
                  key={followingUser.uid} 
                  className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                  onClick={() => showProfile(followingUser.username)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={followingUser.photoURL} alt={followingUser.displayName} />
                      <AvatarFallback>{getInitials(followingUser.displayName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{followingUser.displayName}</h4>
                      <p className="text-xs text-muted-foreground">@{followingUser.username}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                    View
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            !followingListLoading && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
                <UserCheck className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
                <p className="font-semibold text-lg">Not following anyone yet</p>
                <p className="mt-1 text-sm">Explore communities to find interesting users to follow.</p>
              </div>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
