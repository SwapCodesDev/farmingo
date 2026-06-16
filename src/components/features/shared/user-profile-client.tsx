'use client';
import { useMemo, useState, useEffect } from 'react';
import { collection, query, where, limit, orderBy, getCountFromServer, doc, getDoc, collectionGroup, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '../community/post-card';
import type { Post, Comment, UserProfile } from '@/types';
import { MessageCircle, UserPlus, UserMinus, Loader2, Calendar, MapPin, MessageSquare, Heart, Lock, UserCheck, Users } from 'lucide-react';
import { Button } from '../../ui/button';
import { getOrCreateConversation } from '@/lib/actions/messages';
import { followUser, unfollowUser } from '@/lib/actions/profile';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { formatUsername, formatTimestamp, cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface UserProfileClientProps {
  username: string;
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { hideProfile, showProfile } = useUserProfileDialog();
  const { voteOnPost } = useAuthActions();
  const t = useTranslations('Profile');

  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isFollowingTransition, setIsFollowingTransition] = useState(false);
  const [stats, setStats] = useState({ posts: 0, comments: 0, followers: 0, following: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch Target User Profile
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

  const isOwnProfile = currentUser?.uid === userProfile?.uid;

  // Check if current user is following target user
  const followingRef = useMemo(() => {
    if (!firestore || !currentUser || !userProfile) return null;
    return doc(firestore, 'users', currentUser.uid, 'following', userProfile.uid);
  }, [firestore, currentUser, userProfile]);

  const { data: followingDoc, loading: followingLoading } = useDoc(followingRef);
  const isFollowing = !!followingDoc;

  // Fetch target user stats
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

  // Privacy Checking Helpers
  const canViewSection = (visibility: 'public' | 'followers' | 'private' | undefined) => {
    if (isOwnProfile) return true;
    if (!visibility || visibility === 'public') return true;
    if (visibility === 'followers') return isFollowing;
    return false; // private
  };

  const showPosts = canViewSection(userProfile?.privacySettings?.postsVisibility);
  const showComments = canViewSection(userProfile?.privacySettings?.commentsVisibility);
  const showFollowers = canViewSection(userProfile?.privacySettings?.followersVisibility);
  const showFollowing = canViewSection(userProfile?.privacySettings?.followingVisibility);

  // Subscriptions for lists
  const postsQuery = useMemo(() => {
    if (!firestore || !userProfile || !showPosts) return null;
    return query(
      collection(firestore, 'posts'),
      where('uid', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userProfile, showPosts]);

  const { data: posts, loading: postsLoading } = useCollection<Post & { createdAt: Timestamp }>(postsQuery);

  const commentsQuery = useMemo(() => {
    if (!firestore || !userProfile || !showComments) return null;
    return query(
      collectionGroup(firestore, 'comments'),
      where('uid', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, userProfile, showComments]);

  const { data: comments, loading: commentsLoading } = useCollection<Comment & { createdAt: Timestamp }>(commentsQuery);

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

  // Followers profiles
  const followersListQuery = useMemo(() => {
    if (!firestore || !userProfile || !showFollowers) return null;
    return query(collection(firestore, 'users', userProfile.uid, 'followers'));
  }, [firestore, userProfile, showFollowers]);

  const { data: followersList, loading: followersListLoading } = useCollection(followersListQuery);

  const followerIds = useMemo(() => followersList?.map(doc => doc.id) || [], [followersList]);

  const followersProfilesQuery = useMemo(() => {
    if (!firestore || followerIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('uid', 'in', followerIds));
  }, [firestore, followerIds]);

  const { data: followersProfiles, loading: followersProfilesLoading } = useCollection<UserProfile>(followersProfilesQuery);

  // Following profiles
  const followingListQuery = useMemo(() => {
    if (!firestore || !userProfile || !showFollowing) return null;
    return query(collection(firestore, 'users', userProfile.uid, 'following'));
  }, [firestore, userProfile, showFollowing]);

  const { data: followingList, loading: followingListLoading } = useCollection(followingListQuery);

  const followingIds = useMemo(() => followingList?.map(doc => doc.id) || [], [followingList]);

  const followingProfilesQuery = useMemo(() => {
    if (!firestore || followingIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('uid', 'in', followingIds));
  }, [firestore, followingIds]);

  const { data: followingProfiles, loading: followingProfilesLoading } = useCollection<UserProfile>(followingProfilesQuery);

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
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !userProfile || !firestore || isFollowingTransition) return;
    setIsFollowingTransition(true);
    try {
      if (isFollowing) {
        await unfollowUser(firestore, currentUser.uid, userProfile.uid);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${userProfile.displayName}.`
        });
      } else {
        await followUser(firestore, currentUser.uid, userProfile.uid);
        toast({
          title: "Following",
          description: `You are now following ${userProfile.displayName}.`
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Action failed",
        description: error.message
      });
    } finally {
      setIsFollowingTransition(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">{t('user-not-found')}</h1>
        <p className="text-muted-foreground">{t('user-not-found-desc', { username })}</p>
      </div>
    );
  }

  const renderPrivacyLock = (visibility: 'public' | 'followers' | 'private' | undefined) => {
    const isPrivate = visibility === 'private';
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card flex flex-col items-center justify-center p-6 shadow-sm">
        <Lock className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="font-bold text-lg text-foreground">{isPrivate ? "This section is private" : "Followers only"}</p>
        <p className="text-sm mt-1 max-w-sm">
          {isPrivate 
            ? "Only u/" + userProfile.username + " can view this content." 
            : "You must follow u/" + userProfile.username + " to view their activity."}
        </p>
        {!isPrivate && !isFollowing && currentUser && (
          <Button size="sm" className="mt-4 gap-1.5" onClick={handleFollowToggle} disabled={isFollowingTransition}>
            {isFollowingTransition ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {t('follow')}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Banner & User Details Card */}
      <Card className="overflow-hidden border-none shadow-md bg-card">
        {/* Banner container */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 hover:scale-[1.01] transition-transform duration-500 ease-out">
          {userProfile.bannerURL ? (
            <img src={userProfile.bannerURL} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
          )}
        </div>

        {/* Profile Card Header overlay */}
        <CardContent className="relative flex flex-col sm:flex-row items-center sm:items-end justify-between px-6 pb-6 pt-0 gap-4 text-center sm:text-left border-b">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <Avatar className="-mt-14 sm:-mt-16 h-28 w-28 sm:h-32 sm:w-32 border-4 border-card shadow-lg ring-1 ring-black/5 hover:scale-105 transition-transform duration-300">
              <AvatarImage
                src={userProfile.photoURL ?? undefined}
                alt={userProfile.displayName}
              />
              <AvatarFallback className="text-4xl bg-muted text-muted-foreground font-headline font-semibold">
                {getInitials(userProfile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-headline text-foreground flex items-center justify-center sm:justify-start gap-2">
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

          {/* Follow / Unfollow / Message action panel */}
          {!isOwnProfile && currentUser && (
            <div className="flex items-center gap-2 mb-2">
              <Button 
                size="sm" 
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollowToggle}
                disabled={isFollowingTransition || followingLoading}
                className={cn(
                  "w-24 group transition-all duration-200",
                  isFollowing 
                    ? "border-primary text-primary hover:border-destructive hover:text-destructive hover:bg-destructive/10" 
                    : "bg-primary text-primary-foreground hover:bg-primary/95"
                )}
              >
                {isFollowingTransition ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <span className="group-hover:hidden flex items-center justify-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      Following
                    </span>
                    <span className="group-hover:flex hidden items-center justify-center gap-1">
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </span>
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    {t('follow')}
                  </span>
                )}
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleStartConversation} disabled={isCreatingConversation}>
                {isCreatingConversation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-primary" />
                )}
                {t('message')}
              </Button>
            </div>
          )}
        </CardContent>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 p-6 bg-muted/20 text-center">
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

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1 rounded-xl">
          <TabsTrigger value="posts" className="rounded-lg py-2 font-semibold transition-all">{t('posts')}</TabsTrigger>
          <TabsTrigger value="comments" className="rounded-lg py-2 font-semibold transition-all">Comments</TabsTrigger>
          <TabsTrigger value="followers" className="rounded-lg py-2 font-semibold transition-all">{t('followers')}</TabsTrigger>
          <TabsTrigger value="following" className="rounded-lg py-2 font-semibold transition-all">{t('following')}</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-4 focus-visible:outline-none">
          {!showPosts ? (
            renderPrivacyLock(userProfile.privacySettings?.postsVisibility)
          ) : postsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
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
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
              <MessageSquare className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="font-semibold text-lg">{t('user-no-posts')}</p>
            </div>
          )}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-4 focus-visible:outline-none">
          {!showComments ? (
            renderPrivacyLock(userProfile.privacySettings?.commentsVisibility)
          ) : commentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : comments && comments.length > 0 ? (
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
                        <Link href={postLink} className="text-primary hover:underline font-semibold max-w-[200px] truncate" onClick={hideProfile}>
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
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
              <Heart className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="font-semibold text-lg">No comments yet</p>
            </div>
          )}
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="mt-4 focus-visible:outline-none">
          {!showFollowers ? (
            renderPrivacyLock(userProfile.privacySettings?.followersVisibility)
          ) : followersListLoading || followersProfilesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : followersProfiles && followersProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
              <Users className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="font-semibold text-lg">No followers yet</p>
            </div>
          )}
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following" className="mt-4 focus-visible:outline-none">
          {!showFollowing ? (
            renderPrivacyLock(userProfile.privacySettings?.followingVisibility)
          ) : followingListLoading || followingProfilesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : followingProfiles && followingProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl bg-card">
              <UserCheck className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="font-semibold text-lg">Not following anyone yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
