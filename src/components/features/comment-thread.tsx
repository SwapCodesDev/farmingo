'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { Comment } from '@/lib/actions/community';
import { useUser } from '@/firebase';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, MoreVertical, Edit, Trash2, Pin, PinOff } from 'lucide-react';
import { cn, formatUsername } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { CommentVoteControl } from './comment-vote-control';
import type { UserProfile } from '@/types';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';


type CommentWithId = Comment & { id: string; createdAt: Timestamp | Date | string; parentId: string | null; upvotes?: string[]; downvotes?: string[]; authorRole?: UserProfile['role'] };

interface CommentThreadProps {
  comment: CommentWithId;
  allComments: CommentWithId[];
  postId: string;
  postAuthorId: string;
  isPinned?: boolean;
  isPostAuthor: boolean;
  depth?: number;
  commentAction: (postId: string, text: string, parentId: string | null) => Promise<void>;
  voteAction: (postId: string, commentId: string, vote: 'up' | 'down') => Promise<void>;
  pinAction: (postId: string, commentId: string | null) => Promise<void>;
}

export function CommentThread({ comment, allComments, postId, postAuthorId, isPinned = false, isPostAuthor, commentAction, voteAction, pinAction, depth = 0 }: CommentThreadProps) {
  const { user } = useUser();
  const { showProfile } = useUserProfileDialog();
  const { updateComment, deleteComment } = useAuthActions();
  const { toast } = useToast();

  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.text);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const isOwner = user?.uid === comment.uid;
  const isCommentByPostAuthor = comment.uid === postAuthorId;

  const childComments = useMemo(() => {
    return allComments.filter(c => c.parentId === comment.id);
  }, [allComments, comment.id]);

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await commentAction(postId, replyText, comment.id);
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    setIsSubmitting(true);
    try {
        await updateComment(postId, comment.id, editText);
        setIsEditing(false);
        toast({ title: "Comment updated!" });
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Failed to update comment", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    try {
        await deleteComment(postId, comment.id);
        toast({ title: "Comment deleted" });
    } catch(error: any) {
        toast({ variant: 'destructive', title: "Failed to delete comment", description: error.message });
    }
    setIsDeleting(false);
  }

  const handlePin = async () => {
    try {
      const newPinnedId = isPinned ? null : comment.id;
      await pinAction(postId, newPinnedId);
      toast({ title: isPinned ? "Comment unpinned" : "Comment pinned!" });
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Failed to update pin", description: error.message });
    }
  }


  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <>
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('flex gap-3', depth > 0 && 'ml-6')}>
      <div className="flex flex-col items-center">
        <Avatar className="h-8 w-8 cursor-pointer" onClick={() => showProfile(comment.author)}>
          <AvatarImage src={comment.authorPhotoURL} alt={comment.author} />
          <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
        </Avatar>
        <CollapsibleTrigger asChild>
          <div
            className="w-px flex-1 my-2 bg-border hover:bg-primary cursor-pointer transition-colors"
          ></div>
        </CollapsibleTrigger>
      </div>

      <div className="flex-1">
        <div className={cn("p-3 rounded-lg", depth % 2 === 0 ? "bg-muted/50" : "bg-muted/25", isPinned && "border-2 border-primary/50")}>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <button onClick={() => showProfile(comment.author)} className="font-semibold text-sm hover:underline">
                {formatUsername(comment.author, comment.authorRole)}
              </button>
              {isCommentByPostAuthor && <Badge variant="secondary">Author</Badge>}
              <p className="text-muted-foreground">•</p>
              <p className="text-muted-foreground">
                {formatTimestamp(comment.createdAt)}
              </p>
            </div>
            <div className="flex items-center">
              {isPinned && <Pin className="h-4 w-4 text-primary mr-2" />}
              <CollapsibleTrigger asChild>
                <span className="cursor-pointer text-muted-foreground hover:text-primary mr-2">
                  {isOpen ? '[-]' : `[+${childComments.length}]`}
                </span>
              </CollapsibleTrigger>
                {(isOwner || isPostAuthor) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isPostAuthor && (
                                <DropdownMenuItem onClick={handlePin}>
                                    {isPinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                                    <span>{isPinned ? 'Unpin' : 'Pin'} Comment</span>
                                </DropdownMenuItem>
                            )}
                            {isOwner && (
                                <>
                                <DropdownMenuItem onClick={() => { setIsEditing(true); setIsReplying(false) }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsDeleting(true)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
          </div>

          <CollapsibleContent>
            {isEditing ? (
                 <div className="mt-3 flex flex-col gap-2">
                    <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="text-sm"
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleEditSubmit}
                            disabled={isSubmitting || !editText.trim()}
                        >
                            {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                <p className="text-sm mt-2">{comment.text}</p>
                <div className="flex items-center gap-2 mt-3 text-muted-foreground -ml-1">
                <CommentVoteControl postId={postId} comment={comment} voteAction={voteAction} />
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-3 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full"
                    onClick={() => { setIsReplying(!isReplying); setIsEditing(false); }}
                    disabled={!user}
                >
                    <MessageSquare className="mr-1 h-3 w-3" />
                    Reply
                </Button>
                </div>
                </>
            )}

            {isReplying && (
              <div className="mt-3 flex flex-col gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Replying to ${formatUsername(comment.author, comment.authorRole)}...`}
                  rows={2}
                  className="text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={isSubmitting || !replyText.trim()}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </div>
              </div>
            )}
            <div className="mt-4 space-y-4">
              {childComments.map(child => (
                <CommentThread
                  key={child.id}
                  comment={child}
                  allComments={allComments}
                  postId={postId}
                  postAuthorId={postAuthorId}
                  isPostAuthor={isPostAuthor}
                  commentAction={commentAction}
                  voteAction={voteAction}
                  pinAction={pinAction}
                  depth={depth + 1}
                />
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
     <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
