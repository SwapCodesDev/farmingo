'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const formSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters.').max(21, 'Name cannot be longer than 21 characters.'),
    description: z.string().min(10, 'Description must be at least 10 characters.').max(100, 'Description cannot be longer than 100 characters.'),
    imageUrl: z.string().optional(),
});

interface CreateCommunityFormProps {
    onCommunityCreated?: () => void;
}

export function CreateCommunityForm({ onCommunityCreated }: CreateCommunityFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { toast } = useToast();
    const { createCommunity } = useAuthActions();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            imageUrl: '',
        },
    });

    const communityId = form.watch('name').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUri = reader.result as string;
            setImagePreview(dataUri);
            form.setValue('imageUrl', dataUri);
          };
          reader.readAsDataURL(file);
        }
      };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await createCommunity({
                id: communityId,
                name: values.name,
                description: values.description,
                imageUrl: values.imageUrl,
            });
            toast({
                title: 'Community Created!',
                description: `c/${communityId} is now live.`
            });
            onCommunityCreated?.();
            router.push(`/c/${communityId}`);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Failed to create community',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-center">
                            <FormLabel>Community Image (Optional)</FormLabel>
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
                                                form.setValue('imageUrl', '');
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
                                <Input placeholder="e.g., Organic Farming" {...field} />
                            </FormControl>
                            <FormDescription>
                                This will be the URL: c/{communityId}
                            </FormDescription>
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
                                <Textarea placeholder="A place to discuss the benefits and challenges of organic farming." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading || !communityId}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Community
                    </Button>
                </div>
            </form>
        </Form>
    );
}
