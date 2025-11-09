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
import { CreateProductForm } from './create-product-form';

export function CreateProductDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>List a New Product</DialogTitle>
          <DialogDescription>
            Add a new item to the Verified Marketplace.
          </DialogDescription>
        </DialogHeader>
        <CreateProductForm onProductCreated={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
