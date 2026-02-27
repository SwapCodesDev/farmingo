'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFirestore, useDoc, useCollection, useUser } from '@/firebase';
import { doc, collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { sendMessage, markConversationAsRead } from '@/lib/actions/messages';
import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';

type ConversationDoc = {
  id: string;
  participants: string[];
  participantDetails: { [key: string]: { username: string; photoURL?: string } };
};

type MessageDoc = {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
};

interface ConversationClientProps {
  conversationId: string;
}

export function ConversationClient({ conversationId }: ConversationClientProps) {
  const isMobile = useIsMobile();
  const firestore = useFirestore();
  const { user: currentUser, loading: userLoading } = useUser();
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { showProfile } = useUserProfileDialog();

  const conversationRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'conversations', conversationId);
  }, [firestore, conversationId]);

  const { data: conversation, loading: conversationLoading } = useDoc<ConversationDoc>(conversationRef);

  const messagesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
  }, [firestore, conversationId]);

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


  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div:first-child');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);


  const handleSendMessage = async () => {
    if (!message.trim() || !firestore || !currentUser) return;
    try {
        await sendMessage(firestore, conversationId, currentUser.uid, message);
        setMessage('');
    } catch(e) {
        console.error("Failed to send message", e);
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
                <p>You must be logged in to view messages.</p>
            </CardContent>
        </Card>
    );
  }

  if (conversationLoading) {
    return <div className="flex items-center justify-center h-full"><p>Loading conversation...</p></div>;
  }

  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p>Conversation not found.</p>
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
          {messagesLoading && <p>Loading messages...</p>}
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
                  'max-w-xs rounded-lg p-3 text-sm',
                  isCurrentUserMsg
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p>{msg.text}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isCurrentUserMsg
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
                  {format(sentAt, 'p')}
                </p>
              </div>
            </div>
          )})}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="relative">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && message.trim()) {
                handleSendMessage();
              }
            }}
            className="pr-12"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            disabled={!message.trim()}
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
