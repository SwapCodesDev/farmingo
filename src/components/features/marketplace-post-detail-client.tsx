'use client';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, orderBy, query, Timestamp, doc } from 'firebase/firestore';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, MoreVertical, Edit, Trash2, Tag, Tractor, Wrench, MessageSquare, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import type { MarketplacePost } from './marketplace-client';
import { Badge } from '../ui/badge';
import { addMarketplaceComment, voteOnMarketplaceComment, voteOnMarketplacePost, deleteMarketplacePost } from '@/lib/actions/marketplace-post';
import type { Comment } from '@/lib/actions/community';
import { CommentThread } from './comment-thread';
import { VoteControl } from './vote-control';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditMarketplacePostDialog } from './edit-marketplace-post-dialog';
import { formatUsername, formatTimestamp } from '@/lib/utils';
import type { UserProfile } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface MarketplacePostDetailClientProps {
  postId: string;
}

export function MarketplacePostDetailClient({ postId }: MarketplacePostDetailClientProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { showProfile } = useUserProfileDialog();
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [commentText]);
  
  const postRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'marketplacePosts', postId);
  }, [firestore, postId]);
  
  const { data: post, loading: postLoading } = useDoc<MarketplacePost & { upvotes?: string[], downvotes?: string[] }>(postRef);

  const commentsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, `marketplacePosts/${postId}/comments`), orderBy('createdAt', 'asc'));
  }, [firestore, postId]);
  
  const { data: comments } = useCollection<Comment & { createdAt: Timestamp | Date | string, parentId: string | null, id: string, commentCount?: number }>(commentsQuery);

  const topLevelComments = useMemo(() => comments?.filter(comment => !comment.parentId) || [], [comments]);

  const handleAddComment = async (text: string, parentId: string | null = null) => {
    if (!text.trim() || !post || !firestore || !user) return;
    setIsCommenting(true);
    try {
      await addMarketplaceComment(firestore, user, post.id, text, parentId);
      if (!parentId) {
        setCommentText('');
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not post comment.' });
    } finally {
      setIsCommenting(false);
    }
  };
  
  const handleVoteOnComment = async (commentId: string, vote: 'up' | 'down') => {
    if (!firestore || !user) return;
    voteOnMarketplaceComment(firestore, user.uid, postId, commentId, vote);
  };

  const handleVoteOnPost = async (vote: 'up' | 'down') => {
    if (!firestore || !user) return;
    voteOnMarketplacePost(firestore, user.uid, postId, vote);
  }

  const handleDelete = async () => {
    if (!post || !firestore) return;
    try {
      await deleteMarketplacePost(firestore, post.id);
      toast({ title: "Post Deleted", description: "The marketplace post has been removed."});
      router.push(`/marketplace`);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting post', description: error.message });
    }
    setIsDeleteDialogOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getConditionIcon = () => {
    if (!post) return null;
    switch(post.condition) {
        case 'New': return <Tag className="h-4 w-4" />;
        case 'Used': return <Tractor className="h-4 w-4" />;
        case 'For Hire': return <Wrench className="h-4 w-4" />;
        default: return null;
    }
  }
  
  if (postLoading) {
    return <p>Loading post...</p>
  }
  
  if (!post) {
      return (
        <div className="text-center">
            <h2 className="text-2xl font-bold">Post not found</h2>
            <p className="text-muted-foreground">This post may have been deleted or the link is incorrect.</p>
            <Button asChild variant="outline" className="mt-4">
                <Link href="/marketplace">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Marketplace
                </Link>
            </Button>
        </div>
      )
  }

  const isOwner = user?.uid === post.uid;

  return (
    <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-4 -ml-4">
            <Link href="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
            </Link>
        </Button>
        <Card>
            <CardContent className="p-4 sm:p-6">
                 <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-full md:w-1/2">
                        <div className="relative aspect-square w-full">
                            <Image src={post.imageUrl} alt={post.itemName} layout="fill" objectFit="cover" className="rounded-md border" />
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
                            <div className="flex items-center gap-2 bg-muted/50 hover:bg-muted rounded-full p-1 pr-2">
                                <Avatar className="h-5 w-5 cursor-pointer" onClick={() => showProfile(post.author)}>
                                <AvatarImage src={post.authorPhotoURL} alt={post.author} />
                                <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                                </Avatar>
                                <button onClick={() => showProfile(post.author)} className="font-semibold text-foreground hover:underline">
                                {formatUsername(post.author, post.authorRole)}
                                </button>
                            </div>
                            <span>•</span>
                            <p>{formatTimestamp(post.createdAt)}</p>
                            {isOwner && (
                            <div className="ml-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </div>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold font-headline mb-2">{post.itemName}</h1>
                        <p className="font-bold text-3xl text-primary mb-4">₹{post.price.toFixed(2)}</p>
                        
                        <div className='flex items-center gap-4 my-4 text-sm'>
                            <Badge variant="outline" className="flex items-center gap-2">
                                {getConditionIcon()}
                                {post.condition}
                            </Badge>
                            <Badge variant="secondary">Qty: {post.quantity}</Badge>
                        </div>
                        
                        <div className="space-y-4 text-sm prose">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.description}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground my-4 -ml-1">
                    <VoteControl
                        post={post}
                        voteAction={handleVoteOnPost}
                    />
                    <Button variant="ghost" size="sm" className="bg-muted/50 hover:bg-muted rounded-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>{post.commentCount || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="bg-muted/50 hover:bg-muted rounded-full">
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
                    </Button>
                </div>
            
            {user && (
              <div className="w-full my-6 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm mb-2 text-muted-foreground">Comment as <span className="font-semibold text-primary">{user.displayName}</span></p>
                  <Textarea
                      ref={textareaRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Ask a question or make an offer..."
                      className="flex-1 resize-none overflow-hidden min-h-[80px] border-0"
                      rows={1}
                  />
                  <div className="flex justify-end mt-2">
                    <Button onClick={() => handleAddComment(commentText)} disabled={isCommenting || !commentText.trim()}>
                        {isCommenting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Comment
                    </Button>
                  </div>
              </div>
            )}

            <div className="w-full space-y-4 pt-4 border-t">
                <h3 className="font-headline text-lg font-bold">{comments?.length || 0} Comments</h3>
                {topLevelComments.map(comment => (
                    <CommentThread
                        key={comment.id}
                        comment={{...comment, parentId: comment.parentId || null }}
                        allComments={comments || []}
                        postId={post.id}
                        postAuthorId={post.uid}
                        isPostAuthor={isOwner}
                        commentAction={async (postId, text, parentId) => { handleAddComment(text, parentId) }}
                        voteAction={async (postId, commentId, vote) => { handleVoteOnComment(commentId, vote)}}
                        pinAction={async () => { /* Not implemented for marketplace */}}
                    />
                ))}
            </div>
            </CardContent>
        </Card>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post "{post.itemName}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
                >
                Delete
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {isOwner && (
            <EditMarketplacePostDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                post={post}
            />
        )}
    </div>
  );
}
