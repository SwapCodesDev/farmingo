'use client';
import { useState } from 'react';
import type { Post } from '@/lib/actions/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import { MessageSquare, MoreVertical, Trash2, Edit, Share2 } from 'lucide-react';
import { cn, formatUsername, formatTimestamp } from '@/lib/utils';
import { useAuthActions } from '@/hooks/use-auth-actions';
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
import { EditPostDialog } from './edit-post-dialog';
import { VoteControl } from './vote-control';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import type { UserProfile } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface PostCardProps {
  post: Post & { createdAt: Timestamp | Date | string, upvotes?: string[], downvotes?: string[], commentCount?: number, communityId?: string, authorRole?: UserProfile['role'] };
  voteAction: (vote: 'up' | 'down') => void;
}

const TRUNCATE_LENGTH = 400;

export function PostCard({ post, voteAction }: PostCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const { deletePost } = useAuthActions();
  const { showProfile } = useUserProfileDialog();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      toast({ title: "Post Deleted", description: "Your post has been successfully removed."});
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

  const isLongPost = post.text.length > TRUNCATE_LENGTH;
  const truncatedText = isLongPost ? `${post.text.substring(0, TRUNCATE_LENGTH)}` : post.text;
  const postUrl = `/community/${post.id}`;

  return (
    <>
      <div className="bg-card p-4 rounded-lg border hover:border-primary/50 transition-colors duration-200 flex flex-col">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link href={`/c/${post.communityId}`} className="font-bold text-foreground hover:underline">
                c/{post.communityId}
            </Link>
            <span>•</span>
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
            <span>•</span>
            <span>{formatTimestamp(post.createdAt)}</span>
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

        <Link href={postUrl} className='cursor-pointer group'>
            <h2 className="font-bold text-lg mt-2 group-hover:underline">{post.title}</h2>
            
            <div 
                className="mt-2 text-sm max-h-[250px] relative overflow-hidden"
            >
              {post.imageUrl && (
                  <div className="relative aspect-video w-full my-2">
                      <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="contain" className="rounded-md border" />
                  </div>
              )}
              <div className={cn('prose', isLongPost && 'mask-gradient')}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {truncatedText}
                </ReactMarkdown>
              </div>
               {isLongPost && (
               <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            )}
            </div>
        </Link>

        <div className="flex items-center gap-2 text-muted-foreground mt-4 -ml-1">
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
    </>
  );
}
