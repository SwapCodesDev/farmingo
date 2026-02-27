'use client';
import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseApp | null>(null);
export const AuthContext = createContext<Auth | null>(null);
export const FirestoreContext = createContext<Firestore | null>(null);

export const FirebaseProvider = ({
  children,
  app,
  auth,
  firestore,
}: {
  children: React.ReactNode;
} & FirebaseServices) => {
  return (
    <FirebaseContext.Provider value={app}>
      <AuthContext.Provider value={auth}>
        <FirestoreContext.Provider value={firestore}>
          {children}
          <FirebaseErrorListener />
        </FirestoreContext.Provider>
      </AuthContext.Provider>
    </FirebaseContext.Provider>
  );
};

export const useFirebaseApp = () => useContext(FirebaseContext);
export const useAuth = () => useContext(AuthContext);
export const useFirestore = () => useContext(FirestoreContext);
export const useFirebase = () => ({
  app: useFirebaseApp(),
  auth: useAuth(),
  firestore: useFirestore(),
});
