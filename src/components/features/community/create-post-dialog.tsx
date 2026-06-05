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
import { CreatePostForm } from './create-post-form';

export function CreatePostDialog({ children, communityId }: { children: React.ReactNode; communityId?: string; }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, questions, or updates with the community.
          </DialogDescription>
        </DialogHeader>
        <CreatePostForm onPostCreated={() => setIsOpen(false)} communityId={communityId} />
      </DialogContent>
    </Dialog>
  );
}
