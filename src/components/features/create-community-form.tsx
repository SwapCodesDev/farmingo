'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Trash, CheckCircle, XCircle, Leaf, Globe, Eye, Lock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import type { CommunityData } from '@/lib/actions/community';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { ImageCropDialog } from './image-crop-dialog';


const formSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters.')
    .max(21, 'Name cannot be longer than 21 characters.')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Only letters, numbers, and underscores are allowed.'
    ),
  description: z
    .string()
    .min(1, 'Description is required.')
    .max(500, 'Description cannot be longer than 500 characters.'),
  bannerUrl: z.string().optional(),
  iconUrl: z.string().optional(),
  type: z.enum(["public", "restricted", "private"]).default("public"),
  isMature: z.boolean().default(false),
});

interface CreateCommunityFormProps {
  onNext?: (data: Partial<CommunityData>) => void;
  onBack?: () => void;
  initialData?: Partial<CommunityData>;
  isStyleStep?: boolean;
  isSettingsStep?: boolean;
}

export function CreateCommunityForm({
  onNext,
  onBack,
  initialData,
  isStyleStep = false,
  isSettingsStep = false,
}: CreateCommunityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  
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

  const { toast } = useToast();
  const { createCommunity } = useAuthActions();
  const router = useRouter();

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      bannerUrl: initialData?.bannerUrl || '',
      iconUrl: initialData?.iconUrl || '',
      type: initialData?.type || 'public',
      isMature: initialData?.isMature || false,
    },
    mode: 'onChange',
  });

  const communityId = form
    .watch('name')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  const watchDescription = form.watch('description');
  const watchBannerUrl = form.watch('bannerUrl');
  const watchIconUrl = form.watch('iconUrl');

  const debouncedName = useDebounce(communityId, 500);

  const checkNameAvailability = useCallback(async (name: string) => {
    if (name.length < 3) {
      setIsNameAvailable(null);
      return;
    }
    setIsCheckingName(true);
    if (firestore) {
      const communityRef = doc(firestore, 'communities', name);
      const communityDoc = await getDoc(communityRef);
      setIsNameAvailable(!communityDoc.exists());
    }
    setIsCheckingName(false);
  }, [firestore]);


  useEffect(() => {
    if (debouncedName && debouncedName === communityId) {
        checkNameAvailability(debouncedName);
    }
  }, [debouncedName, communityId, checkNameAvailability]);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'bannerUrl' | 'iconUrl',
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
    if (isSettingsStep) {
        // Final submission step
        if (!initialData?.id || !initialData.name || !initialData.description) {
            toast({ variant: 'destructive', title: 'Error', description: 'Community details are missing.' });
            return;
        }
        setIsLoading(true);
        try {
            const finalData: CommunityData = {
                id: initialData.id,
                name: initialData.name,
                description: initialData.description,
                bannerUrl: initialData.bannerUrl,
                iconUrl: initialData.iconUrl,
                type: values.type,
                isMature: values.isMature,
            };

            await createCommunity(finalData);

            toast({
                title: 'Community Created!',
                description: `c/${initialData.id} is now live.`,
            });
            onNext?.(values); // This will close the dialog
            router.push(`/c/${initialData.id}`);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Failed to create community',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    } else if (isStyleStep) {
        onNext?.({ bannerUrl: values.bannerUrl, iconUrl: values.iconUrl });
    } else {
        // This is the first step, pass data to parent
        if (isNameAvailable === false) {
            toast({
                variant: 'destructive',
                title: 'Community name taken',
                description: 'Please choose a different name.',
            });
            return;
        }
        onNext?.({ id: communityId, name: values.name, description: values.description });
    }
  }

  const nameLength = form.watch('name').length;
  const descriptionLength = watchDescription.length;
  const isNextDisabled =
    !form.formState.isValid || isLoading || isCheckingName || isNameAvailable === false || !watchDescription.trim();

  if (isSettingsStep) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                                >
                                    <FormItem>
                                        <Label className={cn("flex items-center space-x-3 space-y-0 rounded-md border p-4 transition-colors", field.value === 'public' && "border-primary bg-primary/5")}>
                                            <FormControl>
                                                <RadioGroupItem value="public" />
                                            </FormControl>
                                            <div className="flex items-center gap-3">
                                                <Globe className="h-5 w-5"/>
                                                <div className="space-y-1">
                                                    <p className="font-bold">Public</p>
                                                    <p className="text-xs text-muted-foreground">Anyone can view, post, and comment to this community</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </FormItem>
                                    <FormItem>
                                        <Label className={cn("flex items-center space-x-3 space-y-0 rounded-md border p-4 transition-colors", field.value === 'restricted' && "border-primary bg-primary/5")}>
                                            <FormControl>
                                                <RadioGroupItem value="restricted" />
                                            </FormControl>
                                            <div className="flex items-center gap-3">
                                                <Eye className="h-5 w-5"/>
                                                <div className="space-y-1">
                                                    <p className="font-bold">Restricted</p>
                                                    <p className="text-xs text-muted-foreground">Anyone can view, but only approved users can contribute</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </FormItem>
                                    <FormItem>
                                        <Label className={cn("flex items-center space-x-3 space-y-0 rounded-md border p-4 transition-colors", field.value === 'private' && "border-primary bg-primary/5")}>
                                            <FormControl>
                                                <RadioGroupItem value="private" />
                                            </FormControl>
                                            <div className="flex items-center gap-3">
                                                <Lock className="h-5 w-5"/>
                                                <div className="space-y-1">
                                                    <p className="font-bold">Private</p>
                                                    <p className="text-xs text-muted-foreground">Only approved users can view and contribute</p>
                                                </div>
                                            </div>
                                        </Label>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Separator />
                    <FormField
                        control={form.control}
                        name="isMature"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" /> Mature (18+)
                                </FormLabel>
                                <FormDescription>
                                    Users must be over 18 to view and contribute.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    {onBack && <Button type="button" variant="ghost" onClick={onBack}>Back</Button>}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Community
                    </Button>
                </div>
            </form>
        </Form>
    )
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow">
                <div className="order-2 md:order-1 flex flex-col space-y-4">
                    {!isStyleStep ? (
                    <>
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Community name *</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input placeholder="Community name" {...field} maxLength={21}/>
                                <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                                    {isCheckingName ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                                    isNameAvailable === true ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                                    isNameAvailable === false ? <XCircle className="h-4 w-4 text-destructive" /> :
                                    null
                                    }
                                </div>
                            </div>
                        </FormControl>
                        <div className="flex justify-between items-center text-xs">
                            <FormMessage />
                            <span className="text-muted-foreground ml-auto">{nameLength} / 21</span>
                        </div>
                        {isNameAvailable === false && (
                            <p className="text-sm font-medium text-destructive">
                            c/{communityId} is already taken
                            </p>
                        )}
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="A name and description help people understand what your community is all about."
                            {...field}
                            rows={4}
                            maxLength={500}
                            />
                        </FormControl>
                        <div className="flex justify-between items-center text-xs">
                                <FormMessage />
                                <span className="text-muted-foreground ml-auto">{descriptionLength} / 500</span>
                            </div>
                        </FormItem>
                    )}
                    />
                    </>
                    ) : (
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="bannerUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banner</FormLabel>
                                    <FormDescription>Recommended aspect ratio: 4:1</FormDescription>
                                    <div className="flex items-center gap-2">
                                        <Input value={field.value ? 'banner.webp' : ''} readOnly placeholder="No banner selected" className="flex-grow bg-muted" />
                                        <Button type="button" variant="outline" onClick={() => bannerInputRef.current?.click()}>Change</Button>
                                        {field.value && <Button type="button" variant="ghost" size="icon" onClick={() => form.setValue('bannerUrl', '')}><Trash className="h-4 w-4" /></Button>}
                                    </div>
                                    <FormControl>
                                    <Input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'bannerUrl', 4)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="iconUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormDescription>Recommended ratio: 1:1 (square)</FormDescription>
                                    <div className="flex items-center gap-2">
                                        <Input value={field.value ? 'icon.webp' : ''} readOnly placeholder="No icon selected" className="flex-grow bg-muted" />
                                        <Button type="button" variant="outline" onClick={() => iconInputRef.current?.click()}>Change</Button>
                                        {field.value && <Button type="button" variant="ghost" size="icon" onClick={() => form.setValue('iconUrl', '')}><Trash className="h-4 w-4" /></Button>}
                                    </div>
                                    <FormControl>
                                    <Input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'iconUrl', 1)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    )}
                </div>
                <div className="order-1 md:order-2">
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Preview</h3>
                    <Card className="shadow-lg overflow-hidden">
                        <div className="relative h-24 bg-muted">
                            {watchBannerUrl && <Image src={watchBannerUrl} alt="Banner Preview" layout="fill" objectFit="cover" />}
                        </div>
                        <CardHeader className="pt-2">
                            <div className="flex items-end gap-3 -mt-8">
                                <Avatar className="h-16 w-16 border-4 border-card bg-muted">
                                    {watchIconUrl && <AvatarImage src={watchIconUrl} />}
                                    <AvatarFallback><Leaf className="h-8 w-8" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">
                                        c/{communityId || 'communityname'}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">1 member • 1 online</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground h-12 line-clamp-3">
                                {watchDescription || 'Your community description will appear here.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-auto">
                {onBack && <Button type="button" variant="ghost" onClick={onBack}>Back</Button>}
                <Button type="submit" disabled={isNextDisabled && !isStyleStep}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Next
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
