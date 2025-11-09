'use client';

import { UserProfileDialog } from '@/components/features/user-profile-dialog';
import { createContext, useContext, useState, ReactNode } from 'react';

type UserProfileDialogContextType = {
  showProfile: (username: string) => void;
  hideProfile: () => void;
};

const UserProfileDialogContext =
  createContext<UserProfileDialogContextType | null>(null);

export function UserProfileDialogProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showProfile = (user: string) => {
    setUsername(user);
    setIsOpen(true);
  };

  const hideProfile = () => {
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setUsername(null);
    }
  };

  return (
    <UserProfileDialogContext.Provider value={{ showProfile, hideProfile }}>
      {children}
      <UserProfileDialog
        username={username}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
      />
    </UserProfileDialogContext.Provider>
  );
}

export const useUserProfileDialog = () => {
  const context = useContext(UserProfileDialogContext);
  if (!context) {
    throw new Error(
      'useUserProfileDialog must be used within a UserProfileDialogProvider'
    );
  }
  return context;
};
