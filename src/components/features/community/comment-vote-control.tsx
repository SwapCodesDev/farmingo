'use client';
import type { Comment } from '@/types';
import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentVoteControlProps {
  comment: Comment & { id: string; upvotes?: string[]; downvotes?: string[] };
  voteAction: (vote: 'up' | 'down') => Promise<void> | void;
}

export function CommentVoteControl({ comment, voteAction }: CommentVoteControlProps) {
  const { user } = useUser();

  const realUserVote = useMemo(() => {
    if (!user) return null;
    if (comment.upvotes?.includes(user.uid)) return 'up';
    if (comment.downvotes?.includes(user.uid)) return 'down';
    return null;
  }, [comment.upvotes, comment.downvotes, user]);

  const realScore = useMemo(() => {
    const upvotes = comment.upvotes?.length || 0;
    const downvotes = comment.downvotes?.length || 0;
    return upvotes - downvotes;
  }, [comment.upvotes, comment.downvotes]);

  const [optimisticVote, setOptimisticVote] = useState<'up' | 'down' | null>(realUserVote);
  const [optimisticScore, setOptimisticScore] = useState<number>(realScore);
  const [votingType, setVotingType] = useState<'up' | 'down' | null>(null);

  // Sync with real data when it changes on database
  useEffect(() => {
    setOptimisticVote(realUserVote);
    setOptimisticScore(realScore);
  }, [realUserVote, realScore]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user || votingType !== null) {
        return;
    }

    const previousVote = optimisticVote;
    const previousScore = optimisticScore;

    let nextVote: 'up' | 'down' | null = null;
    let scoreDelta = 0;

    if (voteType === 'up') {
      if (previousVote === 'up') {
        nextVote = null;
        scoreDelta = -1;
      } else if (previousVote === 'down') {
        nextVote = 'up';
        scoreDelta = 2;
      } else {
        nextVote = 'up';
        scoreDelta = 1;
      }
    } else if (voteType === 'down') {
      if (previousVote === 'down') {
        nextVote = null;
        scoreDelta = 1;
      } else if (previousVote === 'up') {
        nextVote = 'down';
        scoreDelta = -2;
      } else {
        nextVote = 'down';
        scoreDelta = -1;
      }
    }

    // Apply immediate optimistic changes in UI
    setOptimisticVote(nextVote);
    setOptimisticScore(previousScore + scoreDelta);
    setVotingType(voteType);

    try {
      await voteAction(voteType);
    } catch (error) {
      console.error("Failed to register comment vote:", error);
      // Revert back on failure
      setOptimisticVote(previousVote);
      setOptimisticScore(previousScore);
    } finally {
      setVotingType(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-1 bg-muted/50 rounded-full")}>
      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleVote('up')} disabled={!user || votingType !== null}>
        {votingType === 'up' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        ) : (
          <ArrowBigUp className={cn("h-4 w-4", optimisticVote === 'up' && 'fill-primary text-primary')} />
        )}
      </Button>
      <span className="font-bold text-xs min-w-[2ch] text-center">{optimisticScore}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleVote('down')} disabled={!user || votingType !== null}>
        {votingType === 'down' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
        ) : (
          <ArrowBigDown className={cn("h-4 w-4", optimisticVote === 'down' && 'fill-destructive text-destructive')} />
        )}
      </Button>
    </div>
  );
}
