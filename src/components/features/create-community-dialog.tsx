'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateCommunityForm } from './create-community-form';

export function CreateCommunityDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create a New Community</DialogTitle>
          <DialogDescription>
            Start a new discussion hub for a specific topic, crop, or region.
          </DialogDescription>
        </DialogHeader>
        <CreateCommunityForm onCommunityCreated={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
