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
import { Loader2, ImageIcon, Eraser } from 'lucide-react';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { updateProduct } from '@/lib/actions/marketplace';
import type { Product } from '@/types';
import { ImageCropDialog } from '../shared/image-crop-dialog';
import { useImageCrop } from '@/hooks/use-image-crop';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  category: z.string().min(1, 'Category is required.'),
  stock: z.coerce.number().int().min(1, 'Stock must be at least 1.'),
  unit: z.string().min(1, 'Unit is required.'),
  moq: z.coerce.number().int().min(1, 'Minimum order quantity must be at least 1.'),
  origin: z.string().min(3, 'Origin/Location must be at least 3 characters.'),
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
    const {
      imagePreview,
      setImagePreview,
      cropState,
      setCropState,
      handleImageSelect,
      clearImage,
    } = useImageCrop(1, product.imageUrl);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category || 'Vegetables',
            stock: product.stock || 1,
            unit: product.unit || 'kg',
            moq: product.moq || 1,
            origin: product.origin || '',
        },
    });

    useEffect(() => {
        form.reset({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            category: product.category || 'Vegetables',
            stock: product.stock || 1,
            unit: product.unit || 'kg',
            moq: product.moq || 1,
            origin: product.origin || '',
        });
        setImagePreview(product.imageUrl);
      }, [product, form]);

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
        <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
                Make changes to your product listing. Click save when you're done.
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <div className="grid gap-4">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {["Vegetables", "Fruits", "Grains & Cereals", "Seeds", "Fertilizers", "Tools & Equipment"].map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Origin (Farm Location)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Nashik, Maharashtra" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            name="unit"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {["kg", "quintal", "ton", "litre", "crate", "packet", "piece"].map(u => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Available Stock</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="moq"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Min. Order (MOQ)</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                className="resize-y"
                                rows={3}
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
                                        Change Image
                                    </Button>
                                    <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, (cropped) => form.setValue('imageUrl', cropped, { shouldValidate: true, shouldDirty: true }))} />
                                    </div>
                                </FormControl>
                                {imagePreview && (
                                    <div className="relative w-full h-40 mt-2">
                                    <Image src={imagePreview} alt="Image preview" fill className="rounded-md border object-cover" />
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <DialogFooter className="mt-4">
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
        <ImageCropDialog 
            isOpen={cropState.isOpen}
            onOpenChange={(isOpen) => setCropState(prev => ({...prev, isOpen}))}
            imageSrc={cropState.imageSrc}
            aspect={cropState.aspect}
            onCropComplete={cropState.onComplete}
        />
        </>
    );
}

