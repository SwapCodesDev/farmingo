'use client';
import { useMemo, useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const AnimatedButton = motion(Button);

interface VotableItem {
  id: string;
  upvotes?: string[];
  downvotes?: string[];
}

interface VoteControlProps {
  post: VotableItem;
  voteAction: (vote: 'up' | 'down') => Promise<void> | void;
  orientation?: 'vertical' | 'horizontal';
}

export function VoteControl({ post, voteAction, orientation = 'horizontal' }: VoteControlProps) {
  const { user } = useUser();

  const realUserVote = useMemo(() => {
    if (!user) return null;
    if (post.upvotes?.includes(user.uid)) return 'up';
    if (post.downvotes?.includes(user.uid)) return 'down';
    return null;
  }, [post.upvotes, post.downvotes, user]);

  const realScore = useMemo(() => {
    const upvotes = post.upvotes?.length || 0;
    const downvotes = post.downvotes?.length || 0;
    return upvotes - downvotes;
  }, [post.upvotes, post.downvotes]);

  const [optimisticVote, setOptimisticVote] = useState<'up' | 'down' | null>(realUserVote);
  const [optimisticScore, setOptimisticScore] = useState<number>(realScore);
  const [votingType, setVotingType] = useState<'up' | 'down' | null>(null);

  // Sync optimistic state with real props when they change from snapshot
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
      console.error("Failed to register vote:", error);
      // Revert back on failure
      setOptimisticVote(previousVote);
      setOptimisticScore(previousScore);
    } finally {
      setVotingType(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-1 bg-muted/50 rounded-full",
      orientation === 'vertical' && 'flex-col w-10 py-2'
    )}>
      <AnimatedButton
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => handleVote('up')}
        disabled={!user || votingType !== null}
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
      >
        {votingType === 'up' ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <ArrowBigUp className={cn(optimisticVote === 'up' && 'fill-primary text-primary')} />
        )}
      </AnimatedButton>
      <span className="font-bold text-sm min-w-[2ch] text-center">{optimisticScore}</span>
      <AnimatedButton
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full"
        onClick={() => handleVote('down')}
        disabled={!user || votingType !== null}
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
      >
        {votingType === 'down' ? (
          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
        ) : (
          <ArrowBigDown className={cn(optimisticVote === 'down' && 'fill-destructive text-destructive')} />
        )}
      </AnimatedButton>
    </div>
  );
}
