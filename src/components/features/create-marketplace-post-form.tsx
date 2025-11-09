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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useFirestore, useUser } from '@/firebase';
import { createMarketplacePost } from '@/firebase/actions/marketplace-post';


const formSchema = z.object({
  itemName: z
    .string()
    .min(3, 'Item name must be at least 3 characters long.')
    .max(100, 'Item name cannot be longer than 100 characters.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long.')
    .max(2000, 'Description cannot be longer than 2000 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  quantity: z.string().min(1, "Quantity is required."),
  condition: z.enum(["New", "Used", "For Hire"]),
  imageUrl: z.string().url('An image is required.'),
});

interface CreateMarketplacePostFormProps {
  onPostCreated?: () => void;
}

export function CreateMarketplacePostForm({ onPostCreated }: CreateMarketplacePostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: '',
      description: '',
      price: '' as any, // Initialize as empty string to fix controlled/uncontrolled error
      quantity: '1',
      condition: 'Used',
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
        toast({ variant: 'destructive', title: "Authentication error", description: "You must be logged in to create a post."});
        return;
    }
    setIsLoading(true);
    try {
      await createMarketplacePost(firestore, user, values);
      toast({
        title: 'Post created!',
        description: 'Your item is now listed in the indirect market.',
      });
      form.reset();
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onPostCreated?.();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create post',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <FormField
            control={form.control}
            name="imageUrl"
            render={() => (
                <FormItem>
                    <FormLabel>Item Image</FormLabel>
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
          <FormField
            control={form.control}
            name="itemName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Slightly used tractor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 50000" {...field} onChange={event => field.onChange(+event.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1 or 50kg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the item's condition" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Used">Used</SelectItem>
                            <SelectItem value="For Hire">For Hire</SelectItem>
                        </SelectContent>
                    </Select>
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
                    placeholder="Describe the item, its condition, and any other relevant details..."
                    className="resize-none"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Post
          </Button>
        </div>
      </form>
    </Form>
  );
}
