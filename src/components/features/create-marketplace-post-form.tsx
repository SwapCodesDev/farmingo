
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ImageIcon, Eraser, Phone, MapPin, Tag, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useFirestore, useUser } from '@/firebase';
import { createMarketplacePost } from '@/lib/actions/marketplace-post';
import { ImageCropDialog } from './image-crop-dialog';
import { Badge } from '../ui/badge';

const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  quantity: z.string().min(1, "Quantity is required (e.g., 5 kg, 1 unit)."),
  tags: z.array(z.string()).min(1, 'Add at least one tag.').max(3, 'Maximum 3 tags allowed.'),
  imageUrl: z.string().url('An image is required.'),
  contactInfo: z.string().refine((val) => emailRegex.test(val) || phoneRegex.test(val), {
    message: 'Please enter a valid email or phone number.',
  }),
  address: z.string().min(5, 'Full address/location is required (at least 5 characters).'),
});

interface CreateMarketplacePostFormProps {
  onPostCreated?: () => void;
}

export function CreateMarketplacePostForm({ onPostCreated }: CreateMarketplacePostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { user } = useUser();
  const [cropState, setCropState] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    aspect: number;
    onComplete: (croppedImage: string) => void;
  }>({
    isOpen: false,
    imageSrc: null,
    aspect: 1,
    onComplete: () => {},
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: '',
      description: '',
      price: '' as any,
      quantity: '',
      tags: [],
      contactInfo: '',
      address: '',
    },
  });

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({ variant: 'destructive', title: "Image too large", description: "Please upload an image smaller than 4MB."});
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
          setCropState({
              isOpen: true,
              imageSrc: reader.result as string,
              aspect: 4 / 3,
              onComplete: (croppedImage) => {
                  setImagePreview(croppedImage);
                  form.setValue('imageUrl', croppedImage, { shouldValidate: true });
              },
          });
      };
      reader.readAsDataURL(file);
    }
     if (event.target) {
        event.target.value = '';
    }
  };

  const addTag = () => {
    const currentTags = form.getValues('tags');
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && currentTags.length < 3 && !currentTags.includes(trimmedTag)) {
        form.setValue('tags', [...currentTags, trimmedTag], { shouldValidate: true });
        setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(t => t !== tagToRemove), { shouldValidate: true });
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
                        <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
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
            name="tags"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Tags (Max 3)</FormLabel>
                    <div className="flex gap-2 mb-2">
                        <Input 
                            placeholder="Add a tag (e.g., 'new', 'urgent')" 
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag();
                                }
                            }}
                        />
                        <Button type="button" size="icon" onClick={addTag} disabled={!tagInput.trim() || field.value.length >= 3}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {field.value.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1 pl-3 pr-1 py-1">
                                {tag}
                                <Button type="button" variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => removeTag(tag)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                    <FormDescription>Help others find your post with relevant tags.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}
          />
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Contact Information
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Email or 10-digit Phone" {...field} />
                    </FormControl>
                    <FormDescription>Buyers will use this to contact you.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Location/Address
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="City, State or Full Address" {...field} />
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
                    placeholder="Describe the item, its history, and any other relevant details..."
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
      <ImageCropDialog 
        isOpen={cropState.isOpen}
        onOpenChange={(isOpen) => setCropState(prev => ({...prev, isOpen}))}
        imageSrc={cropState.imageSrc}
        aspect={4 / 3}
        onCropComplete={cropState.onComplete}
      />
    </Form>
  );
}
