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

function getQueryKey(query: Query | null): string {
  if (!query) return '';
  const q = query as any;
  const path = q.path || q._query?.path?.segments?.join('/') || '';
  const filters = q._query?.filters ? JSON.stringify(q._query.filters) : '';
  const orders = q._query?.explicitOrderBy ? JSON.stringify(q._query.explicitOrderBy) : '';
  return `${path}:${filters}:${orders}`;
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
            const q = query as any;
            const path = q.path || q._query?.path?.segments?.join('/') || 'unknown path';
            const permissionError = new FirestorePermissionError({
                path: path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [getQueryKey(query), query]);

  return { data, loading, error };
}
