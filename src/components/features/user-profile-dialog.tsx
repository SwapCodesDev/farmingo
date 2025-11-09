'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserProfileClient } from './user-profile-client';
import { ScrollArea } from '../ui/scroll-area';

interface UserProfileDialogProps {
  username: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function UserProfileDialog({
  username,
  isOpen,
  onOpenChange,
}: UserProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow -mt-4">
            <div className="p-6">
                {username && <UserProfileClient username={username} />}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
