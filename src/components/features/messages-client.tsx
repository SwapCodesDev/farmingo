'use client';
import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatTimestamp } from '@/lib/utils';
import { Search, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import type { User } from 'firebase/auth';
import { useFirestore } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useIsMobile } from '@/hooks/use-mobile';


type ConversationDoc = {
    id: string;
    participants: string[];
    participantDetails: { [key: string]: { username: string, photoURL?: string }};
    lastMessage: {
        text: string;
        senderId: string;
        createdAt: Timestamp;
    };
    lastRead: { [key: string]: Timestamp };
}

interface MessagesClientProps {
    currentUser: User;
}

export function MessagesClient({ currentUser }: MessagesClientProps) {
  const pathname = usePathname();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  const conversationsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
    );
  }, [firestore, currentUser.uid]);

  const { data: conversations, loading } = useCollection<ConversationDoc>(conversationsQuery);
  
  const sortedAndFilteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    const filtered = conversations.filter(conv => {
        const otherParticipantId = conv.participants.find(p => p !== currentUser.uid);
        if (!otherParticipantId) return false;
        const otherDetails = conv.participantDetails[otherParticipantId];
        return otherDetails.username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
        const dateA = a.lastMessage.createdAt instanceof Timestamp ? a.lastMessage.createdAt.toDate() : new Date();
        const dateB = b.lastMessage.createdAt instanceof Timestamp ? b.lastMessage.createdAt.toDate() : new Date();
        return dateB.getTime() - dateA.getTime();
    });
  }, [conversations, currentUser.uid, searchTerm]);


  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const selectedConvId = pathname.split('/').pop();
  
  return (
    <Card className="overflow-hidden h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-headline">Conversations</h2>
          <Button variant="ghost" size="icon">
            <Users className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-22rem)]">
        {loading && <p className="p-4 text-center text-muted-foreground">Loading conversations...</p>}
        {!loading && sortedAndFilteredConversations?.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
                {searchTerm ? `No conversations found for "${searchTerm}".` : "You have no conversations yet."}
            </p>
        )}
        {sortedAndFilteredConversations?.map((conv) => {
            const otherParticipantId = conv.participants.find(p => p !== currentUser.uid);
            const otherParticipantDetails = otherParticipantId ? conv.participantDetails[otherParticipantId] : null;

            if (!otherParticipantDetails) return null;
            
            const lastMessageDate = conv.lastMessage.createdAt instanceof Timestamp 
                ? conv.lastMessage.createdAt.toDate() 
                : new Date();

            const lastReadDate = conv.lastRead?.[currentUser.uid] instanceof Timestamp
                ? conv.lastRead[currentUser.uid].toDate()
                : new Date(0);

            const isUnread = lastMessageDate > lastReadDate && conv.lastMessage.senderId !== currentUser.uid;

          return (
            <Link
                href={`/messages/${conv.id}`}
                key={conv.id}
                className={cn(
                'flex items-center gap-4 p-4 w-full text-left hover:bg-muted/50 transition-colors',
                selectedConvId === conv.id && 'bg-muted'
                )}
            >
                <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipantDetails.photoURL} alt={otherParticipantDetails.username} />
                <AvatarFallback>
                    {getInitials(otherParticipantDetails.username)}
                </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className={cn("font-semibold truncate", isUnread && "text-primary")}>{otherParticipantDetails.username}</p>
                    <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTimestamp(conv.lastMessage.createdAt)}
                    </p>
                </div>
                <div className="flex justify-between items-start gap-2">
                    <p className={cn("text-sm text-muted-foreground truncate", isUnread && "font-semibold text-foreground")}>
                        {conv.lastMessage.senderId === currentUser.uid && "You: "}{conv.lastMessage.text}
                    </p>
                    {isUnread && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                    )}
                </div>
                </div>
            </Link>
          )
        })}
      </ScrollArea>
    </Card>
  );
}
