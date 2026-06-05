
'use client';
import { useMemo } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

interface VotableItem {
  id: string;
  upvotes?: string[];
  downvotes?: string[];
}

interface VoteControlProps {
  post: VotableItem;
  voteAction: (vote: 'up' | 'down') => void;
  orientation?: 'vertical' | 'horizontal';
}

export function VoteControl({ post, voteAction, orientation = 'horizontal' }: VoteControlProps) {
  const { user } = useUser();

  const userVote = useMemo(() => {
    if (!user) return null;
    if (post.upvotes?.includes(user.uid)) return 'up';
    if (post.downvotes?.includes(user.uid)) return 'down';
    return null;
  }, [post.upvotes, post.downvotes, user]);

  const score = useMemo(() => {
    const upvotes = post.upvotes?.length || 0;
    const downvotes = post.downvotes?.length || 0;
    return upvotes - downvotes;
  }, [post.upvotes, post.downvotes]);

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
        // Here you might want to trigger a login modal
        console.log("User not logged in");
        return;
    }
    voteAction(voteType);
  };

  return (
    <div className={cn("flex items-center gap-1 bg-muted/50 rounded-full",
      orientation === 'vertical' && 'flex-col w-10 py-2'
    )}>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleVote('up')} disabled={!user}>
        <ArrowBigUp className={cn(userVote === 'up' && 'fill-primary text-primary')} />
      </Button>
      <span className="font-bold text-sm min-w-[2ch] text-center">{score}</span>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleVote('down')} disabled={!user}>
        <ArrowBigDown className={cn(userVote === 'down' && 'fill-destructive text-destructive')} />
      </Button>
    </div>
  );
}
