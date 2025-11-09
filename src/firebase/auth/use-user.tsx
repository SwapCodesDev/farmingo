'use client';
import { useState, useEffect, useContext } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { AuthContext } from '@/firebase/provider';
import { onIdTokenChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export interface AppUser extends FirebaseAuthUser {
  token: string;
}

export const useUser = () => {
  const auth = useContext(AuthContext);
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
    const unsubscribe = onIdTokenChanged(
      auth,
      async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          const token = await fbUser.getIdToken();
          setUser({ ...fbUser, token });
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

    return () => unsubscribe();
  }, [auth, router]);

  return { user, firebaseUser, loading };
};
