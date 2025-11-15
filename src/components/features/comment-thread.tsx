'use client';

import { useState, useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Comment } from '@/lib/actions/community';
import { useUser } from '@/firebase';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, MoreVertical, Edit, Trash2, Pin, PinOff, Languages } from 'lucide-react';
import { cn, formatUsername, formatTimestamp } from '@/lib/utils';
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
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
import { getTranslation } from '@/app/actions/translate';


type CommentWithId = Comment & { id: string; createdAt: Timestamp | Date | string; parentId: string | null; upvotes?: string[]; downvotes?: string[]; authorRole?: UserProfile['role'] };

interface CommentThreadProps {
  comment: CommentWithId;
  allComments: CommentWithId[];
  postId: string;
  postAuthorId: string;
  isPostAuthor: boolean;
  depth?: number;
  commentAction: (postId: string, text: string, parentId: string | null) => Promise<void>;
  voteAction: (postId: string, commentId: string, vote: 'up' | 'down') => Promise<void>;
  pinAction: (commentId: string) => Promise<void>;
  pinnedCommentId?: string | null;
}

const availableLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'mr', label: 'मराठी (Marathi)' },
    { value: 'bn', label: 'বাংলা (Bengali)' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { value: 'ta', label: 'தமிழ் (Tamil)' },
    { value: 'te', label: 'తెలుగు (Telugu)' },
    { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'ml', label: 'മലയാളം (Malayalam)' },
    { value: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { value: 'as', label: 'অসমীয়া (Assamese)' },
    { value: 'ks', label: 'कٲशुर (Kashmiri)' },
    { value: 'ne', label: 'नेपाली (Nepali)' },
    { value: 'sd', label: 'सिंधी (Sindhi)' },
    { value: 'ur', label: 'اردو (Urdu)'},
    { value: 'kok', label: 'कोंकणी (Konkani)' },
    { value: 'mni', label: 'Manipuri (Meitei)' },
    { value: 'brx', label: 'बोड़ो (Bodo)' },
    { value: 'doi', label: 'डोगरी (Dogri)' },
    { value: 'mai', label: 'मैथिली (Maithili)' },
    { value: 'sat', label: 'संताली (Santali)' },
    { value: 'sa', label: 'संस्कृतम् (Sanskrit)' },
];


export function CommentThread({ comment, allComments, postId, postAuthorId, isPostAuthor, pinnedCommentId, commentAction, voteAction, pinAction, depth = 0 }: CommentThreadProps) {
  const { user } = useUser();
  const { showProfile } = useUserProfileDialog();
  const { updateComment, deleteComment } = useAuthActions();
  const { toast } = useToast();

  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.text);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const isPinned = pinnedCommentId === comment.id;
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
      // @ts-ignore
      await pinAction(newPinnedId);
      toast({ title: isPinned ? "Comment unpinned" : "Comment pinned!" });
    } catch (error: any) {
        toast({ variant: 'destructive', title: "Failed to update pin", description: error.message });
    }
  }

  const handleTranslate = async (targetLanguage: string) => {
    if (isTranslating) return;
    setIsTranslating(true);
    const { success, translatedTexts, error } = await getTranslation({ texts: [comment.text], targetLanguage });
    setIsTranslating(false);
    if (success && translatedTexts && translatedTexts.length > 0) {
      setTranslatedText(translatedTexts[0]);
    } else {
      toast({ variant: 'destructive', title: 'Translation failed', description: error });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayedText = translatedText || comment.text;

  return (
    <>
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('flex gap-2 sm:gap-3', depth > 0 && 'ml-2 sm:ml-4')}>
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
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => showProfile(comment.author)} className="font-semibold text-sm hover:underline">
                {formatUsername(comment.author, comment.authorRole)}
              </button>
              {isCommentByPostAuthor && <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Author</Badge>}
              {isPinned && <Badge variant="default" className="bg-primary/80"><Pin className="mr-1 h-3 w-3" /> Pinned</Badge>}
              <p className="text-muted-foreground">•</p>
              <p className="text-muted-foreground">
                {formatTimestamp(comment.createdAt)}
              </p>
            </div>
            <div className="flex items-center">
              <CollapsibleTrigger asChild>
                <span className="cursor-pointer text-muted-foreground hover:text-primary mr-2">
                  {isOpen ? '[-]' : `[+${childComments.length}]`}
                </span>
              </CollapsibleTrigger>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Languages className="mr-2 h-4 w-4" />
                                <span>Translate</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {availableLanguages.map(lang => (
                                        <DropdownMenuItem key={lang.value} onClick={() => handleTranslate(lang.label.split(' ')[0])}>
                                            {lang.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
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
                <p className="text-sm mt-2">{isTranslating ? 'Translating...' : displayedText}</p>
                {translatedText && (
                    <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setTranslatedText(null)}>
                        Show original
                    </Button>
                )}
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
                  pinnedCommentId={pinnedCommentId}
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
