'use client';
import { useState, useEffect, useContext } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { AuthContext, FirestoreContext } from '@/firebase/provider';
import { onIdTokenChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export interface AppUser extends FirebaseAuthUser {
  token: string;
}

export const useUser = () => {
  const auth = useContext(AuthContext);
  const firestore = useContext(FirestoreContext);
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onIdTokenChanged(
      auth,
      async (fbUser) => {
        setFirebaseUser(fbUser);

        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }

        if (fbUser) {
          const token = await fbUser.getIdToken();
          setUser({ ...fbUser, token });

          if (firestore) {
            const userDocRef = doc(firestore, 'users', fbUser.uid);
            unsubscribeFirestore = onSnapshot(
              userDocRef,
              (snapshot) => {
                if (snapshot.exists()) {
                  const userData = snapshot.data();
                  setUser((currentUser) => {
                    if (!currentUser) return null;
                    return {
                      ...currentUser,
                      displayName: userData.displayName || currentUser.displayName,
                      photoURL: userData.photoURL || currentUser.photoURL,
                    };
                  });
                }
              },
              (error) => {
                console.error('Error listening to user document:', error);
              }
            );
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [auth, firestore, router]);

  return { user, firebaseUser, loading };
};
