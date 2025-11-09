'use client';
import type { Post, Comment } from '@/lib/actions/community';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, orderBy, query, Timestamp, doc } from 'firebase/firestore';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Loader2, MessageSquare, Share2, ArrowLeft, MoreVertical, Edit, Trash2, Pin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CommentThread } from './comment-thread';
import { VoteControl } from './vote-control';
import { Card, CardContent } from '../ui/card';
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
import { EditPostDialog } from './edit-post-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { formatUsername } from '@/lib/utils';
import type { UserProfile } from '@/types';
import { Separator } from '../ui/separator';


interface PostDetailClientProps {
  postId: string;
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  let html = content.replace(/>!([^>!]*)!</g, '<span class="bg-foreground text-foreground hover:bg-transparent rounded px-1 cursor-pointer transition-colors" onclick="this.classList.toggle(\'bg-foreground\'); this.classList.toggle(\'text-foreground\');">$1</span>');
  html = html.split('\n').map(line => {
    if (line.startsWith('> ')) {
      return `<blockquote class="border-l-4 border-primary pl-4 italic my-2">${line.substring(2)}</blockquote>`;
    }
    return line;
  }).join('\n');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*(.*?)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code class="bg-muted text-muted-foreground font-mono text-sm px-1 py-0.5 rounded">$1</code>');
  return <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: html.replace(/\n/g, '<br />') }} />;
};

export function PostDetailClient({ postId }: PostDetailClientProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { addComment, deletePost, voteOnComment, voteOnPost, pinComment } = useAuthActions();
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
    return doc(firestore, 'posts', postId);
  }, [firestore, postId]);
  
  const { data: post, loading: postLoading } = useDoc<Post & { createdAt: Timestamp | Date | string; upvotes?: string[]; downvotes?: string[], commentCount?: number, communityId?: string, authorRole?: UserProfile['role'], pinnedCommentId?: string }>(postRef);

  const commentsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, `posts/${postId}/comments`), orderBy('createdAt', 'asc'));
  }, [firestore, postId]);

  const { data: comments } = useCollection<Comment & { createdAt: Timestamp | Date | string, parentId: string | null, id: string, commentCount?: number, authorRole?: UserProfile['role'] }>(commentsQuery);

  const isPostAuthor = user?.uid === post?.uid;
  
  const pinnedComment = useMemo(() => {
    if (!post?.pinnedCommentId || !comments) return null;
    return comments.find(c => c.id === post.pinnedCommentId);
  }, [post, comments]);
  
  const topLevelComments = useMemo(() => {
    if (!comments) return [];
    return comments.filter(comment => !comment.parentId && comment.id !== post?.pinnedCommentId);
  }, [comments, post]);

  
  const handleAddComment = async (text: string, parentId: string | null = null) => {
    if (!text.trim() || !post) return;
    setIsCommenting(true);
    try {
      await addComment(post.id, text, parentId);
      if (!parentId) {
        setCommentText('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleVoteOnComment = async (commentId: string, vote: 'up' | 'down') => {
    if (!post) return;
    voteOnComment(postId, commentId, vote);
  }

  const handlePinComment = async (commentId: string | null) => {
    if (!post) return;
    pinComment(postId, commentId);
  }

  const handleDelete = async () => {
    if (!post) return;
    try {
      await deletePost(post.id);
      toast({ title: "Post Deleted", description: "Your post has been successfully removed."});
      router.push(`/c/${post.communityId}`);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting post', description: error.message });
    }
    setIsDeleteDialogOpen(false);
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  if (postLoading) {
    return <p>Loading post...</p>
  }
  
  if (!post) {
      return (
        <div className="text-center">
            <h2 className="text-2xl font-bold">Post not found</h2>
            <p className="text-muted-foreground">This post may have been deleted or the link is incorrect.</p>
            <Button asChild variant="outline" className="mt-4">
                <Link href="/community">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Community Hub
                </Link>
            </Button>
        </div>
      )
  }

  const isOwner = user?.uid === post.uid;

  return (
    <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-4 -ml-4">
            <Link href={`/c/${post.communityId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to c/{post.communityId}
            </Link>
        </Button>
        <Card>
            <CardContent className="p-4 sm:p-6">
                 <div className="flex items-start gap-3">
                <div className="w-full">
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

                    <h1 className="text-2xl font-bold font-headline mb-4">{post.title}</h1>

                    <div className="space-y-4">
                        {post.imageUrl && (
                            <div className="relative aspect-video w-full">
                                <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="contain" className="rounded-md border" />
                            </div>
                        )}
                        <MarkdownRenderer content={post.text} />
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground my-4 -ml-1">
              <VoteControl post={post} voteAction={(vote) => voteOnPost(post.id, vote)} />
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
                      placeholder="What are your thoughts?"
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
                {pinnedComment && (
                    <div>
                        <h3 className="font-headline text-lg font-bold flex items-center gap-2 mb-2">
                            <Pin className="h-5 w-5 text-primary" />
                            Pinned Comment
                        </h3>
                        <CommentThread
                            key={pinnedComment.id}
                            comment={{...pinnedComment, parentId: pinnedComment.parentId || null }}
                            allComments={comments || []}
                            postId={post.id}
                            postAuthorId={post.uid}
                            isPostAuthor={isPostAuthor}
                            pinnedCommentId={post.pinnedCommentId}
                            commentAction={async (postId, text, parentId) => { handleAddComment(text, parentId) }}
                            voteAction={async (postId, commentId, vote) => { handleVoteOnComment(commentId, vote)}}
                            pinAction={handlePinComment}
                        />
                         <Separator className="my-6" />
                    </div>
                )}
                <h3 className="font-headline text-lg font-bold">{topLevelComments.length} Comments</h3>
                {topLevelComments.map(comment => (
                    <CommentThread
                        key={comment.id}
                        comment={{...comment, parentId: comment.parentId || null }}
                        allComments={comments || []}
                        postId={post.id}
                        postAuthorId={post.uid}
                        isPostAuthor={isPostAuthor}
                        pinnedCommentId={post.pinnedCommentId}
                        commentAction={async (postId, text, parentId) => { handleAddComment(text, parentId) }}
                        voteAction={async (postId, commentId, vote) => { handleVoteOnComment(commentId, vote)}}
                        pinAction={handlePinComment}
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
              This action cannot be undone. This will permanently delete your
              post and all its comments.
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
        <EditPostDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            post={post}
        />
      )}
    </div>
  );
}
