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
import { ImageCropDialog } from '../shared/image-crop-dialog';
import { useImageCrop } from '@/hooks/use-image-crop';
import { doc, getDoc } from 'firebase/firestore';
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

interface CreateProductFormProps {
  onProductCreated?: () => void;
}

export function CreateProductForm({ onProductCreated }: CreateProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { user } = useUser();
  const {
    imagePreview,
    setImagePreview,
    cropState,
    setCropState,
    handleImageSelect,
    clearImage,
  } = useImageCrop(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '' as any,
      category: 'Vegetables',
      stock: '' as any,
      unit: 'kg',
      moq: '' as any,
      origin: '',
      imageUrl: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: "Authentication error", description: "You must be logged in to create a product."});
        return;
    }
    
    console.log("=== Listing Product Submission Debug ===");
    console.log("Authenticated UID:", user.uid);
    console.log("Product Form Data:", values);
    
    setIsLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      console.log("Fetching User Document:", userDocRef.path);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const uData = userDoc.data();
        console.log("User document exists:", uData);
        console.log("isVerified field (exact spelling):", uData.isVerified);
        console.log("isVerified type:", typeof uData.isVerified);
        if (uData.isverified !== undefined) {
          console.warn("Found lowercase 'isverified' field in document:", uData.isverified);
          console.warn("isverified type:", typeof uData.isverified);
        }
      } else {
        console.warn("CRITICAL: User document does NOT exist in Firestore at 'users/" + user.uid + "'!");
      }
      
      console.log("Triggering createProduct call...");
      await createProduct(firestore, user, values);
      console.log("SUCCESS: Product created successfully.");
      
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
      console.error("ERROR: Failed to create product listing:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to list product',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
      console.log("=== End Submission Debug ===");
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
                    <Input type="number" placeholder="e.g., 250" {...field} />
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
                    <Input type="number" placeholder="e.g., 100" {...field} />
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
                    <Input type="number" placeholder="e.g., 5" {...field} />
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
                        <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, (cropped) => form.setValue('imageUrl', cropped, { shouldValidate: true }))} />
                        </div>
                    </FormControl>
                      {imagePreview && (
                        <div className="relative w-full h-48 mt-2">
                        <Image src={imagePreview} alt="Image preview" fill className="rounded-md border object-cover" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                            clearImage(() => form.setValue('imageUrl', '', { shouldValidate: true }));
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
      <ImageCropDialog 
        isOpen={cropState.isOpen}
        onOpenChange={(isOpen) => setCropState(prev => ({...prev, isOpen}))}
        imageSrc={cropState.imageSrc}
        aspect={cropState.aspect}
        onCropComplete={cropState.onComplete}
      />
    </Form>
  );
}
