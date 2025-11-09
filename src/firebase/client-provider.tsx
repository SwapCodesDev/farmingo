'use client';
import React, { useState, useEffect } from 'react';
import { FirebaseProvider, type FirebaseServices } from './provider';
import { initializeFirebase } from '.';

export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [firebaseServices, setFirebaseServices] =
    useState<FirebaseServices | null>(null);

  useEffect(() => {
    const services = initializeFirebase();
    setFirebaseServices(services);
  }, []);

  if (!firebaseServices) {
    return null; // or a loading spinner
  }

  return <FirebaseProvider {...firebaseServices}>{children}</FirebaseProvider>;
};
