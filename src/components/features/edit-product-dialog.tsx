'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { updateProduct } from '@/lib/actions/marketplace';
import type { Product } from './marketplace-client';


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

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function EditProductDialog({ isOpen, onOpenChange, product }: EditProductDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
        },
    });

    useEffect(() => {
        form.reset({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
        });
        setImagePreview(product.imageUrl);
      }, [product, form]);

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
            form.setValue('imageUrl', dataUri, { shouldValidate: true, shouldDirty: true });
          };
          reader.readAsDataURL(file);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore) return;
        setIsLoading(true);
        try {
            await updateProduct(firestore, product.id, values);
            toast({
                title: 'Product Updated!',
                description: 'Your changes have been saved.',
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to update product',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
                Make changes to your product listing. Click save when you're done.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                                    Change Image
                                </Button>
                                <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </div>
                            </FormControl>
                            {imagePreview && (
                                <div className="relative w-full h-48 mt-2">
                                <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded-md border" />
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                        <Input {...field} />
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
                        <Input type="number" {...field} />
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
                        className="resize-y"
                        rows={4}
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
        </Dialog>
    );
}
