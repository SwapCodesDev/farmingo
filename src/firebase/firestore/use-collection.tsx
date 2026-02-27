'use client';
import { useState, useEffect, useRef } from 'react';
import type {
  Query,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface HookResponse<T> {
  data: (T & { id: string })[] | null;
  loading: boolean;
  error: FirestoreError | null;
}

export function useCollection<T = DocumentData>(
  query: Query | null
): HookResponse<T> {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  
  const queryRef = useRef(query);

  useEffect(() => {
    // If the query is null or has changed, reset the state
    if (query !== queryRef.current) {
        setData(null);
        setLoading(true);
        setError(null);
        queryRef.current = query;
    }

    if (query === null) {
      setLoading(false);
      return;
    }
    
    // setLoading(true) is now handled by the reset logic above

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T & { id: string })
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (err.code === 'permission-denied') {
            // Firestore queries don't have a public `path` property, this is a workaround
            const path = (query as any)._query?.path?.segments.join('/');
            const permissionError = new FirestorePermissionError({
                path: path || 'unknown path',
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // We use a stable string representation of the query for the dependency array
  // This is a common pattern for Firestore hooks to prevent re-renders
  }, [query ? query.path : null, query ? JSON.stringify(query.where) : null, query ? JSON.stringify(query.orderBy) : null, query]);

  return { data, loading, error };
}
