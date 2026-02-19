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
import type { Community } from '@/lib/actions/community';
import { ImageCropDialog } from './image-crop-dialog';


const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.').max(21, 'Name cannot be longer than 21 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.').max(500, 'Description cannot be longer than 500 characters.'),
  iconUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

interface EditCommunityDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    community: Community;
}

export function EditCommunityDialog({ isOpen, onOpenChange, community }: EditCommunityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { updateCommunity } = useAuthActions();
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
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
      name: community.name,
      description: community.description,
      iconUrl: community.iconUrl,
      bannerUrl: community.bannerUrl,
    },
  });
  
  const watchIconUrl = form.watch('iconUrl');
  const watchBannerUrl = form.watch('bannerUrl');


  useEffect(() => {
    form.reset({
        name: community.name,
        description: community.description,
        iconUrl: community.iconUrl,
        bannerUrl: community.bannerUrl,
    });
  }, [community, form]);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'iconUrl' | 'bannerUrl',
    aspect: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({ variant: 'destructive', title: "Image too large", description: "Please upload an image smaller than 4MB."});
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
          setCropState({
              isOpen: true,
              imageSrc: reader.result as string,
              aspect,
              onComplete: (croppedImage) => {
                  form.setValue(field, croppedImage, { shouldDirty: true });
              },
          });
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = '';
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
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Community</DialogTitle>
          <DialogDescription>
            Make changes to c/{community.id}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
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
                name="iconUrl"
                render={() => (
                    <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <div className="flex items-center gap-4">
                            <div 
                                className="relative h-16 w-16 rounded-full border-2 border-dashed bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 overflow-hidden"
                                onClick={() => iconInputRef.current?.click()}
                            >
                                {watchIconUrl ? (
                                    <Image src={watchIconUrl} alt="Icon preview" layout="fill" objectFit="cover" />
                                ) : (
                                    <Camera className="w-8 h-8 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-grow">
                                <Button type="button" variant="outline" className="w-full justify-start" onClick={() => iconInputRef.current?.click()}>Change Icon</Button>
                                <p className="text-xs text-muted-foreground mt-1">1:1 Ratio Recommended</p>
                            </div>
                        </div>
                        <FormControl>
                            <Input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'iconUrl', 1)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="bannerUrl"
                render={() => (
                    <FormItem>
                        <FormLabel>Banner</FormLabel>
                        <div className="relative h-36 w-full rounded-md border-2 border-dashed bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 overflow-hidden"
                             onClick={() => bannerInputRef.current?.click()}>
                            {watchBannerUrl ? (
                                <Image src={watchBannerUrl} alt="Banner preview" layout="fill" objectFit="cover" />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <Camera className="w-8 h-8 mx-auto" />
                                    <p className="text-xs mt-1">Click to upload banner</p>
                                </div>
                            )}
                        </div>
                        <FormControl>
                            <Input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'bannerUrl', 4)} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">4:1 Aspect Ratio Recommended</p>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <DialogFooter className="pt-4">
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
