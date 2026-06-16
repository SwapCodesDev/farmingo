'use client';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  serverTimestamp,
  getDocs,
  query,
  where,
  limit,
  writeBatch,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';

// Finds an existing conversation or creates a new one.
export async function getOrCreateConversation(
  firestore: Firestore,
  currentUserId: string,
  otherUserId: string
): Promise<string> {

  const conversationsRef = collection(firestore, 'conversations');

  // Check if a conversation already exists
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', currentUserId)
  );

  const querySnapshot = await getDocs(q);
  const existingConversation = querySnapshot.docs.find(doc => doc.data().participants.includes(otherUserId) && doc.data().participants.length === 2);

  if (existingConversation) {
    return existingConversation.id;
  }

  // Create a new conversation
  const currentUserDoc = await getDoc(doc(firestore, 'users', currentUserId));
  const otherUserDoc = await getDoc(doc(firestore, 'users', otherUserId));

  if (!currentUserDoc.exists() || !otherUserDoc.exists()) {
      throw new Error("One or both users not found");
  }

  const currentUserData = currentUserDoc.data();
  const otherUserData = otherUserDoc.data();

  const batch = writeBatch(firestore);
  const newConversationRef = doc(conversationsRef);
  const now = serverTimestamp();

  const newConversationData = {
    participants: [currentUserId, otherUserId],
    participantDetails: {
        [currentUserId]: {
            username: currentUserData.username,
            photoURL: currentUserData.photoURL || '',
        },
        [otherUserId]: {
            username: otherUserData.username,
            photoURL: otherUserData.photoURL || '',
        }
    },
    createdAt: now,
    updatedAt: now,
    lastMessage: {
        id: 'start',
        text: 'Conversation started',
        senderId: currentUserId,
        createdAt: now,
        status: 'read' as const,
    },
    lastRead: {
        [currentUserId]: now,
        [otherUserId]: now,
    },
    unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0,
    }
  };
  
  batch.set(newConversationRef, newConversationData);

  await batch.commit().catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: newConversationRef.path,
        operation: 'create',
        requestResourceData: newConversationData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
  });

  return newConversationRef.id;
}


export async function sendMessage(
  firestore: Firestore,
  conversationId: string,
  senderId: string,
  text: string,
  imageUrl?: string
) {
    const batch = writeBatch(firestore);
    const now = serverTimestamp();

    // 1. Fetch the conversation participants to find the other user
    const conversationRef = doc(firestore, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    if (!conversationSnap.exists()) {
        throw new Error('Conversation not found');
    }
    const conversationData = conversationSnap.data();
    const participants = conversationData.participants as string[];
    const otherUserId = participants.find(p => p !== senderId);

    // 2. Add the new message to the messages subcollection
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const newMessageRef = doc(messagesRef);
    const newMessageData = {
        id: newMessageRef.id,
        senderId,
        text,
        imageUrl: imageUrl || '',
        createdAt: now,
        status: 'sent' as const,
    };
    batch.set(newMessageRef, newMessageData);

    // 3. Update the lastMessage on the parent conversation document
    const updateFields: any = {
        lastMessage: {
            id: newMessageRef.id,
            text,
            senderId,
            createdAt: now,
            status: 'sent' as const,
            imageUrl: imageUrl || '',
        },
        updatedAt: now,
        [`lastRead.${senderId}`]: now,
        [`unreadCount.${senderId}`]: 0,
    };

    if (otherUserId) {
        updateFields[`unreadCount.${otherUserId}`] = increment(1);
    }

    batch.update(conversationRef, updateFields);

    await batch.commit().catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: newMessageRef.path,
          operation: 'create',
          requestResourceData: newMessageData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}

export async function markConversationAsRead(firestore: Firestore, conversationId: string, userId: string) {
    const conversationRef = doc(firestore, 'conversations', conversationId);
    const updateData = {
        [`lastRead.${userId}`]: serverTimestamp(),
        [`unreadCount.${userId}`]: 0,
    };
    
    updateDoc(conversationRef, updateData)
    .catch((serverError) => {
        console.error("Failed to mark conversation as read:", serverError);
    });
}

export async function markMessagesAsRead(
  firestore: Firestore,
  conversationId: string,
  userId: string,
  messageIds: string[]
) {
  if (messageIds.length === 0) return;
  const batch = writeBatch(firestore);
  
  messageIds.forEach(id => {
    const messageRef = doc(firestore, 'conversations', conversationId, 'messages', id);
    batch.update(messageRef, { status: 'read' as const });
  });

  const conversationRef = doc(firestore, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);
  if (conversationSnap.exists()) {
    const conversationData = conversationSnap.data();
    const lastMessage = conversationData.lastMessage;
    if (lastMessage && lastMessage.senderId !== userId && messageIds.includes(lastMessage.id)) {
      batch.update(conversationRef, {
        'lastMessage.status': 'read' as const
      });
    }
  }

  await batch.commit().catch(e => {
    console.error("Failed to mark messages as read batch:", e);
  });
}

export async function markMessageAsDelivered(
  firestore: Firestore,
  conversationId: string,
  messageId: string
) {
  const batch = writeBatch(firestore);
  
  const messageRef = doc(firestore, 'conversations', conversationId, 'messages', messageId);
  batch.update(messageRef, { status: 'delivered' as const });

  const conversationRef = doc(firestore, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);
  if (conversationSnap.exists()) {
    const conversationData = conversationSnap.data();
    const lastMessage = conversationData.lastMessage;
    if (lastMessage && lastMessage.id === messageId && lastMessage.status === 'sent') {
      batch.update(conversationRef, {
        'lastMessage.status': 'delivered' as const
      });
    }
  }

  await batch.commit().catch(e => {
    console.error("Failed to mark message as delivered:", e);
  });
}
