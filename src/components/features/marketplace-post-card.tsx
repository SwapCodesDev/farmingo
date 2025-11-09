'use client';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { MessageSquare, MoreVertical, Trash2, Edit, Share2, Tag, Tractor, Wrench } from 'lucide-react';
import { cn, formatUsername, formatTimestamp } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
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
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import type { MarketplacePost } from './marketplace-client';
import { Badge } from '../ui/badge';
import { VoteControl } from './vote-control';
import { deleteMarketplacePost } from '@/lib/actions/marketplace-post';
import { useFirestore } from '@/firebase';
import { EditMarketplacePostDialog } from './edit-marketplace-post-dialog';
import type { UserProfile } from '@/types';

interface MarketplacePostCardProps {
  post: MarketplacePost;
  voteAction: (vote: 'up' | 'down') => void;
}

const TRUNCATE_LENGTH = 200;

export function MarketplacePostCard({ post, voteAction }: MarketplacePostCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { showProfile } = useUserProfileDialog();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!firestore) return;
    try {
        await deleteMarketplacePost(firestore, post.id);
        toast({ title: "Post Deleted", description: "Your marketplace post has been removed."});
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error deleting post', description: error.message });
    }
    setIsDeleteDialogOpen(false);
  };
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const isOwner = user?.uid === post.uid;

  const isLongPost = post.description.length > TRUNCATE_LENGTH;
  const truncatedText = isLongPost ? `${post.description.substring(0, TRUNCATE_LENGTH)}...` : post.description;
  const postUrl = `/marketplace/posts/${post.id}`;

  const getConditionIcon = () => {
    switch(post.condition) {
        case 'New': return <Tag className="h-4 w-4" />;
        case 'Used': return <Tractor className="h-4 w-4" />;
        case 'For Hire': return <Wrench className="h-4 w-4" />;
        default: return null;
    }
  }

  return (
    <>
      <div className="bg-card p-4 rounded-lg border hover:border-primary/50 transition-colors duration-200 flex flex-col sm:flex-row gap-4">
        <Link href={postUrl} className='sm:w-1/3 aspect-video sm:aspect-square relative block flex-shrink-0'>
            <Image src={post.imageUrl} alt={post.itemName} layout="fill" objectFit="cover" className="rounded-md border" />
        </Link>
        <div className="flex flex-col flex-grow">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className='flex items-center gap-2'>
                    Posted by
                    <Avatar className="h-6 w-6 cursor-pointer" onClick={(e) => { e.preventDefault(); showProfile(post.author); }}>
                    <AvatarImage src={post.authorPhotoURL} alt={post.author} />
                    <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                    </Avatar>
                    <button onClick={(e) => { e.preventDefault(); showProfile(post.author); }} className="font-bold text-foreground hover:underline">
                        {formatUsername(post.author, post.authorRole)}
                    </button>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{formatTimestamp(post.createdAt)}</span>
                {isOwner && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
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
                )}
            </div>

            <Link href={postUrl} className='cursor-pointer group flex-grow'>
                <h2 className="font-bold text-lg mt-2 group-hover:underline">{post.itemName}</h2>
                <div className='flex items-center gap-2 flex-wrap my-2 text-sm'>
                    <Badge variant="outline" className="flex items-center gap-2">
                        {getConditionIcon()}
                        {post.condition}
                    </Badge>
                     <Badge variant="secondary">Qty: {post.quantity}</Badge>
                </div>
                <div 
                    className="mt-2 text-sm max-h-[100px] relative overflow-hidden"
                >
                <p className={cn(isLongPost && 'mask-gradient')}>
                    {truncatedText}
                </p>
                {isLongPost && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                )}
                </div>
            </Link>

            <div className="flex items-center justify-between mt-4">
                <p className="font-bold text-2xl text-primary">₹{post.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 text-muted-foreground -ml-1">
                    <VoteControl post={post} voteAction={voteAction} />
                    <Button variant="ghost" size="sm" asChild className="bg-muted/50 hover:bg-muted rounded-full">
                        <Link href={postUrl}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>{post.commentCount || 0}</span>
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="bg-muted/50 hover:bg-muted rounded-full">
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this marketplace post.
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
    </>
  );
}
