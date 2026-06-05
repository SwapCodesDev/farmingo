'use client';
import type { Comment } from '@/types';
import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentVoteControlProps {
  comment: Comment & { id: string; upvotes?: string[]; downvotes?: string[] };
  voteAction: (vote: 'up' | 'down') => void;
}

export function CommentVoteControl({ comment, voteAction }: CommentVoteControlProps) {
  const { user } = useUser();

  const userVote = useMemo(() => {
    if (!user) return null;
    if (comment.upvotes?.includes(user.uid)) return 'up';
    if (comment.downvotes?.includes(user.uid)) return 'down';
    return null;
  }, [comment.upvotes, comment.downvotes, user]);

  const score = useMemo(() => {
    const upvotes = comment.upvotes?.length || 0;
    const downvotes = comment.downvotes?.length || 0;
    return upvotes - downvotes;
  }, [comment.upvotes, comment.downvotes]);

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
        // Here you might want to trigger a login modal
        console.log("User not logged in");
        return;
    }
    voteAction(voteType);
  };

  return (
    <div className={cn("flex items-center gap-1 bg-muted/50 rounded-full")}>
      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleVote('up')} disabled={!user}>
        <ArrowBigUp className={cn("h-4 w-4", userVote === 'up' && 'fill-primary text-primary')} />
      </Button>
      <span className="font-bold text-xs min-w-[2ch] text-center">{score}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleVote('down')} disabled={!user}>
        <ArrowBigDown className={cn("h-4 w-4", userVote === 'down' && 'fill-destructive text-destructive')} />
      </Button>
    </div>
  );
}
