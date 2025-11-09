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
import { Loader2, Camera, Trash } from 'lucide-react';
import { useAuthActions } from '@/hooks/use-auth-actions';
import Image from 'next/image';
import type { Timestamp } from 'firebase/firestore';


type Community = {
    id: string;
    name: string;
    description: string;
    postCount: number;
    imageUrl?: string;
    creatorId: string;
    creatorUsername: string;
    createdAt: Timestamp;
}

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').max(21, 'Name cannot be longer than 21 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(100, 'Description cannot be longer than 100 characters.'),
  imageUrl: z.string().optional(),
});

interface EditCommunityDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    community: Community;
}

export function EditCommunityDialog({ isOpen, onOpenChange, community }: EditCommunityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(community.imageUrl || null);
  const { toast } = useToast();
  const { updateCommunity } = useAuthActions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: community.name,
      description: community.description,
      imageUrl: community.imageUrl,
    },
  });

  useEffect(() => {
    form.reset({
        name: community.name,
        description: community.description,
        imageUrl: community.imageUrl,
    });
    setImagePreview(community.imageUrl || null);
  }, [community, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(dataUri);
        form.setValue('imageUrl', dataUri, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updateCommunity(community.id, values);
      toast({
        title: 'Community Updated!',
        description: 'Your changes have been saved.',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update community',
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
          <DialogTitle>Edit Community</DialogTitle>
          <DialogDescription>
            Make changes to c/{community.id}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                      <FormLabel>Community Image</FormLabel>
                      <FormControl>
                          <div className='relative w-32 h-32'>
                              <div 
                                  className="w-32 h-32 rounded-full border-2 border-dashed bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 overflow-hidden"
                                  onClick={() => fileInputRef.current?.click()}
                              >
                                  {imagePreview ? (
                                      <Image src={imagePreview} alt="Community preview" layout="fill" objectFit="cover" />
                                  ) : (
                                      <Camera className="w-12 h-12 text-muted-foreground" />
                                  )}
                                  <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                              </div>
                              {imagePreview && (
                                  <Button 
                                      type="button" 
                                      variant="destructive" 
                                      size="icon" 
                                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                                      onClick={() => {
                                          setImagePreview(null);
                                          form.setValue('imageUrl', '', { shouldDirty: true });
                                      }}
                                  >
                                      <Trash className="h-4 w-4" />
                                  </Button>
                              )}
                          </div>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
