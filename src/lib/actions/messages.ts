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
        text: 'Conversation started',
        senderId: currentUserId,
        createdAt: now,
    },
    lastRead: {
        [currentUserId]: now,
        [otherUserId]: now,
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


export async function sendMessage(firestore: Firestore, conversationId: string, senderId: string, text: string) {
    const batch = writeBatch(firestore);
    const now = serverTimestamp();

    // 1. Add the new message to the messages subcollection
    const messagesRef = collection(firestore, 'conversations', conversationId, 'messages');
    const newMessageRef = doc(messagesRef);
    const newMessageData = {
        senderId,
        text,
        createdAt: now,
    };
    batch.set(newMessageRef, newMessageData);

    // 2. Update the lastMessage on the parent conversation document
    const conversationRef = doc(firestore, 'conversations', conversationId);
    batch.update(conversationRef, {
        lastMessage: {
            text,
            senderId,
            createdAt: now,
        },
        updatedAt: now,
        [`lastRead.${senderId}`]: now,
    });

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
        [`lastRead.${userId}`]: serverTimestamp()
    };
    
    updateDoc(conversationRef, updateData)
    .catch((serverError) => {
        // Don't show an error for this, as it's a background task.
        // We can log it if needed.
        console.error("Failed to mark conversation as read:", serverError);
    });
}
