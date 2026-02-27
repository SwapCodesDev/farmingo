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
import { CreateMarketplacePostForm } from './create-marketplace-post-form';

export function CreateMarketplacePostDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create a Marketplace Post</DialogTitle>
          <DialogDescription>
            List an item for sale or trade in the Indirect Market.
          </DialogDescription>
        </DialogHeader>
        <CreateMarketplacePostForm onPostCreated={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
