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
import { Loader2, MessageSquare } from 'lucide-react';
import { cn, formatUsername } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CommentVoteControl } from './comment-vote-control';
import type { UserProfile } from '@/types';


type CommentWithId = Comment & { id: string; createdAt: Timestamp | Date | string; parentId: string | null; upvotes?: string[]; downvotes?: string[]; authorRole?: UserProfile['role'] };

interface CommentThreadProps {
  comment: CommentWithId;
  allComments: CommentWithId[];
  postId: string;
  depth?: number;
  // This prop allows us to pass the correct action for adding a comment
  commentAction: (postId: string, text: string, parentId: string | null) => Promise<void>;
  voteAction: (postId: string, commentId: string, vote: 'up' | 'down') => Promise<void>;
}

export function CommentThread({ comment, allComments, postId, commentAction, voteAction, depth = 0 }: CommentThreadProps) {
  const { user } = useUser();
  const { showProfile } = useUserProfileDialog();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

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
        <div className={cn("p-3 rounded-lg", depth % 2 === 0 ? "bg-muted/50" : "bg-muted/25")}>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <button onClick={() => showProfile(comment.author)} className="font-semibold text-sm hover:underline">
                {formatUsername(comment.author, comment.authorRole)}
              </button>
              <p className="text-muted-foreground">•</p>
              <p className="text-muted-foreground">
                {formatTimestamp(comment.createdAt)}
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <span className="cursor-pointer text-muted-foreground hover:text-primary">
                {isOpen ? '[-]' : `[+${childComments.length}]`}
              </span>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <p className="text-sm mt-2">{comment.text}</p>
            <div className="flex items-center gap-2 mt-3 text-muted-foreground -ml-1">
               <CommentVoteControl postId={postId} comment={comment} voteAction={voteAction} />
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-3 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full"
                onClick={() => setIsReplying(!isReplying)}
                disabled={!user}
              >
                <MessageSquare className="mr-1 h-3 w-3" />
                Reply
              </Button>
            </div>
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
                  commentAction={commentAction}
                  voteAction={voteAction}
                  depth={depth + 1}
                />
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}
