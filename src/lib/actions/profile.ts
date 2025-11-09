'use client';
import { Firestore, doc, updateDoc } from 'firebase/firestore';
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
};

export async function updateUserProfile(
  firestore: Firestore,
  user: User,
  data: ProfileData
) {
  if (user.displayName !== data.displayName) {
      await updateProfile(user, {
        displayName: data.displayName,
      });
  }

  const userDocRef = doc(firestore, 'users', user.uid);
  const updateData: Partial<UserProfile> = {
    displayName: data.displayName,
    username: data.username,
    region: data.region,
  };

  updateDoc(userDocRef, updateData)
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
