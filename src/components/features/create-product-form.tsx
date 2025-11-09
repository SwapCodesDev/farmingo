'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ImageIcon, Eraser } from 'lucide-react';
import Image from 'next/image';
import { useFirestore, useUser } from '@/firebase';
import { createProduct } from '@/lib/actions/marketplace';

const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Item name must be at least 3 characters long.')
    .max(50, 'Item name cannot be longer than 50 characters.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long.')
    .max(500, 'Description cannot be longer than 500 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  imageUrl: z.string().url('An image is required.'),
});

interface CreateProductFormProps {
  onProductCreated?: () => void;
}

export function CreateProductForm({ onProductCreated }: CreateProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '' as any,
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ variant: 'destructive', title: "Image too large", description: "Please upload an image smaller than 2MB."});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('imageUrl', dataUri, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: "Authentication error", description: "You must be logged in to create a product."});
        return;
    }
    setIsLoading(true);
    try {
      await createProduct(firestore, user, values);
      toast({
        title: 'Product listed!',
        description: 'Your product is now live in the marketplace.',
      });
      form.reset();
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onProductCreated?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to list product',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Fresh Organic Tomatoes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 250" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your product in detail..."
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="imageUrl"
            render={() => (
                <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                        <div>
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                        <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>
                    </FormControl>
                     {imagePreview && (
                        <div className="relative w-full h-48 mt-2">
                        <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded-md border" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                            setImagePreview(null);
                            form.setValue('imageUrl', '', { shouldValidate: true });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                        >
                            <Eraser className="h-4 w-4" />
                        </Button>
                        </div>
                    )}
                    <FormMessage />
                </FormItem>
            )}
           />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            List Product
          </Button>
        </div>
      </form>
    </Form>
  );
}
