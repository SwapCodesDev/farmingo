
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useFirestore } from '@/firebase';
import { updateMarketplacePost } from '@/firebase/actions/marketplace-post';
import type { MarketplacePost } from './marketplace-client';

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

interface EditMarketplacePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  post: MarketplacePost;
}

export function EditMarketplacePostDialog({ isOpen, onOpenChange, post }: EditMarketplacePostDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post.imageUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        itemName: post.itemName,
        description: post.description,
        price: post.price,
        quantity: post.quantity,
        condition: post.condition,
        imageUrl: post.imageUrl,
    },
  });

  useEffect(() => {
    form.reset({
        itemName: post.itemName,
        description: post.description,
        price: post.price,
        quantity: post.quantity,
        condition: post.condition,
        imageUrl: post.imageUrl,
    });
    setImagePreview(post.imageUrl);
  }, [post, form]);

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
      await updateMarketplacePost(firestore, post.id, values);
      toast({
        title: 'Post updated!',
        description: 'Your changes have been saved.',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update post',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Marketplace Post</DialogTitle>
          <DialogDescription>
            Make changes to your listing. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
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
