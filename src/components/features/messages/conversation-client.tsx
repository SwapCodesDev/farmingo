'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, ArrowLeft, Loader2, Check, CheckCheck, ImageIcon, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFirestore, useDoc, useCollection, useUser } from '@/firebase';
import { doc, collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { sendMessage, markConversationAsRead, markMessagesAsRead } from '@/lib/actions/messages';
import { imageToWebPBase64 } from '@/lib/image-processing';
import { Card, CardContent } from '../../ui/card';
import { format } from 'date-fns';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { useTranslations } from 'next-intl';

type ConversationDoc = {
  id: string;
  participants: string[];
  participantDetails: { [key: string]: { username: string; photoURL?: string } };
  lastMessage: {
    id: string;
    text: string;
    senderId: string;
    createdAt: Timestamp;
    status: 'sent' | 'delivered' | 'read';
    imageUrl?: string;
  };
  lastRead: { [key: string]: Timestamp };
  unreadCount?: { [key: string]: number };
};

type MessageDoc = {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  createdAt: Timestamp;
  status: 'sent' | 'delivered' | 'read';
};

interface ConversationClientProps {
  conversationId: string;
}

export function ConversationClient({ conversationId }: ConversationClientProps) {
  const isMobile = useIsMobile();
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();
  const [message, setMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showProfile } = useUserProfileDialog();
  const t = useTranslations('Messages');

  const conversationRef = useMemo(() => {
    if (!firestore || !currentUser) return null;
    return doc(firestore, 'conversations', conversationId);
  }, [firestore, conversationId, currentUser]);

  const { data: conversation, loading: conversationLoading } = useDoc<ConversationDoc>(conversationRef);

  const messagesQuery = useMemo(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
  }, [firestore, conversationId, currentUser]);

  const { data: messages, loading: messagesLoading } = useCollection<MessageDoc>(messagesQuery);

  const otherParticipant = useMemo(() => {
    if (!conversation || !currentUser) return null;
    const otherId = conversation.participants.find(p => p !== currentUser.uid);
    if (!otherId) return null;
    return conversation.participantDetails[otherId];
  }, [conversation, currentUser]);

  // Effect to mark conversation as read
  useEffect(() => {
    if (firestore && conversationId && currentUser) {
      markConversationAsRead(firestore, conversationId, currentUser.uid);
    }
  }, [firestore, conversationId, currentUser, messages]);

  // Effect to mark messages as read in subcollection
  useEffect(() => {
    if (!firestore || !messages || !currentUser || !conversationId) return;
    const unreadIds = messages
      .filter((m) => m.senderId !== currentUser.uid && m.status !== 'read')
      .map((m) => m.id);

    if (unreadIds.length > 0) {
      markMessagesAsRead(firestore, conversationId, currentUser.uid, unreadIds);
    }
  }, [firestore, messages, currentUser, conversationId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div:first-child');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderMessageText = (text: string, isCurrentUser: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "underline break-all font-semibold",
              isCurrentUser
                ? "text-sky-100 hover:text-sky-50"
                : "text-blue-600 hover:text-blue-800"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };


  const handleSendMessage = async () => {
    if ((!message.trim() && !imagePreview) || !firestore || !currentUser) return;
    setIsSending(true);
    try {
        let imgBase64 = undefined;
        if (attachedImage) {
          imgBase64 = await imageToWebPBase64(attachedImage, 0.6);
        }
        await sendMessage(firestore, conversationId, currentUser.uid, message, imgBase64);
        setMessage('');
        setAttachedImage(null);
        setImagePreview(null);
    } catch(e) {
        console.error("Failed to send message", e);
    } finally {
        setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (userLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!currentUser) {
    return (
        <Card>
            <CardContent className="p-6">
                <p>{t('login-required')}</p>
            </CardContent>
        </Card>
    );
  }

  if (conversationLoading) {
    return <div className="flex items-center justify-center h-full"><p>{t('loading-conversation')}</p></div>;
  }

  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p>{t('conversation-not-found')}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button asChild variant="ghost" size="icon" className="mr-2">
              <Link href="/messages">
                <ArrowLeft />
              </Link>
            </Button>
          )}
           <button
            className="flex items-center gap-3 group"
            onClick={() => otherParticipant && showProfile(otherParticipant.username)}
            disabled={!otherParticipant}
          >
          <Avatar className="h-8 w-8">
            <AvatarImage src={otherParticipant?.photoURL} alt={otherParticipant?.username} />
            <AvatarFallback>
              {getInitials(otherParticipant?.username || '')}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold group-hover:underline">{otherParticipant?.username}</h3>
          </button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messagesLoading && <p>{t('loading-messages')}</p>}
          {messages?.map((msg) => {
             const isCurrentUserMsg = msg.senderId === currentUser.uid;
             const senderDetails = conversation.participantDetails[msg.senderId];
             const sentAt = msg.createdAt instanceof Timestamp ? msg.createdAt.toDate() : new Date();

            return (
            <div
              key={msg.id}
              className={cn(
                'flex items-end gap-3',
                isCurrentUserMsg && 'flex-row-reverse'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={senderDetails?.photoURL}
                  alt={senderDetails?.username}
                />
                <AvatarFallback>
                  {getInitials(senderDetails?.username || '')}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'max-w-xs rounded-lg p-3 text-sm flex flex-col',
                  isCurrentUserMsg
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {msg.imageUrl && (
                  <div className="relative max-w-[200px] mb-2 rounded-md overflow-hidden bg-black/5 border border-black/10">
                    <img
                      src={msg.imageUrl}
                      alt="Shared media"
                      className="w-full h-auto object-contain max-h-[160px]"
                    />
                  </div>
                )}
                {msg.text && <p className="whitespace-pre-wrap">{renderMessageText(msg.text, isCurrentUserMsg)}</p>}
                <p
                  className={cn(
                    'text-[10px] mt-1 flex items-center justify-end gap-1 select-none',
                    isCurrentUserMsg
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
                  {format(sentAt, 'p')}
                  {isCurrentUserMsg && (
                    <span className="inline-flex">
                      {msg.status === 'sent' && <Check className="h-3 w-3 text-primary-foreground/60" />}
                      {msg.status === 'delivered' && <CheckCheck className="h-3 w-3 text-primary-foreground/75" />}
                      {msg.status === 'read' && <CheckCheck className="h-3 w-3 text-sky-200" />}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )})}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex flex-col gap-3">
        {imagePreview && (
          <div className="relative inline-block self-start p-1 bg-muted rounded-lg border">
            <img src={imagePreview} alt="Upload preview" className="h-20 w-auto object-cover rounded-md" />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:scale-105 transition-transform"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
            disabled={isSending}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Input
            placeholder={t('input-placeholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && (message.trim() || imagePreview)) {
                handleSendMessage();
              }
            }}
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || (!message.trim() && !imagePreview)}
            onClick={handleSendMessage}
            className="flex-shrink-0"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
