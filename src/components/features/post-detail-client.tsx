'use client';
import type { Post, Comment } from '@/lib/actions/community';
import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, orderBy, query, Timestamp, doc } from 'firebase/firestore';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { Loader2, ArrowLeft, Pin } from 'lucide-react';
import { PostCard } from './post-card';
import { CommentThread } from './comment-thread';
import { Card, CardContent } from '../ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types';
import { Separator } from '../ui/separator';

interface PostDetailClientProps {
  postId: string;
}

export function PostDetailClient({ postId }: PostDetailClientProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { addComment, voteOnPost, voteOnComment, pinComment } = useAuthActions();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
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

  const { data: comments, loading: commentsLoading } = useCollection<Comment & { createdAt: Timestamp | Date | string, parentId: string | null, id: string, commentCount?: number, authorRole?: UserProfile['role'] }>(commentsQuery);

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

  
  if (postLoading || commentsLoading) {
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

  return (
    <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-4 -ml-4">
            <Link href={`/c/${post.communityId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to c/{post.communityId}
            </Link>
        </Button>
        <Card>
            <CardContent className="p-0">
                <PostCard post={post} voteAction={(vote) => voteOnPost(post.id, vote)} isDetailView={true} />
            
            <div className="p-4 sm:p-6">
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
            </div>
            </CardContent>
        </Card>
    </div>
  );
}
