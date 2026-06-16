'use client';
import { Firestore, doc, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Auth, User, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import {
  FirestorePermissionError,
  type SecurityRuleContext,
} from '@/firebase/errors';
import type { UserProfile } from '@/types';

type ProfileData = {
  displayName: string;
  username: string;
  region: string;
  photoURL?: string;
  bannerURL?: string;
};

export async function updateUserProfile(
  firestore: Firestore,
  user: User,
  data: ProfileData
) {
  const shouldUpdateAuthPhoto = data.photoURL && 
                                !data.photoURL.startsWith('data:') && 
                                data.photoURL.length <= 2048;

  if (user.displayName !== data.displayName || (shouldUpdateAuthPhoto && user.photoURL !== data.photoURL)) {
      const updatePayload: { displayName?: string; photoURL?: string } = {
        displayName: data.displayName,
      };
      if (shouldUpdateAuthPhoto) {
        updatePayload.photoURL = data.photoURL;
      }
      await updateProfile(user, updatePayload);
  }

  const userDocRef = doc(firestore, 'users', user.uid);
  const updateData: Partial<UserProfile> = {
    displayName: data.displayName,
    username: data.username,
    region: data.region,
  };

  if (data.photoURL) {
    updateData.photoURL = data.photoURL;
  }
  if (data.bannerURL !== undefined) {
    updateData.bannerURL = data.bannerURL;
  }

  await updateDoc(userDocRef, updateData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userDocRef.path,
        operation: 'update',
        requestResourceData: updateData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      // Re-throw to be caught by the calling function's try/catch
      throw serverError;
    });
}

export async function sendPasswordReset(auth: Auth, email: string) {
    await sendPasswordResetEmail(auth, email);
}

export async function followUser(
  firestore: Firestore,
  currentUserId: string,
  targetUserId: string
) {
  const batch = writeBatch(firestore);
  const now = serverTimestamp();

  // Add to current user's following list
  const followingRef = doc(firestore, 'users', currentUserId, 'following', targetUserId);
  batch.set(followingRef, { createdAt: now });

  // Add to target user's followers list
  const followersRef = doc(firestore, 'users', targetUserId, 'followers', currentUserId);
  batch.set(followersRef, { createdAt: now });

  await batch.commit().catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: followingRef.path,
      operation: 'create',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export async function unfollowUser(
  firestore: Firestore,
  currentUserId: string,
  targetUserId: string
) {
  const batch = writeBatch(firestore);

  // Remove from current user's following list
  const followingRef = doc(firestore, 'users', currentUserId, 'following', targetUserId);
  batch.delete(followingRef);

  // Remove from target user's followers list
  const followersRef = doc(firestore, 'users', targetUserId, 'followers', currentUserId);
  batch.delete(followersRef);

  await batch.commit().catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: followingRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}

export async function updateUserPrivacySettings(
  firestore: Firestore,
  userId: string,
  privacySettings: UserProfile['privacySettings']
) {
  const userDocRef = doc(firestore, 'users', userId);
  const updateData = { privacySettings };

  await updateDoc(userDocRef, updateData).catch((serverError) => {
    const permissionError = new FirestorePermissionError({
      path: userDocRef.path,
      operation: 'update',
      requestResourceData: updateData,
    });
    errorEmitter.emit('permission-error', permissionError);
    throw serverError;
  });
}
