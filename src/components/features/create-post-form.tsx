'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Loader2, Bold, Italic, Code, ImageIcon, Eraser, Quote } from 'lucide-react';
import { useAuthActions } from '@/hooks/use-auth-actions';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';

const formSchema = z.object({
  communityId: z.string().min(1, 'Please select a community.'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long.')
    .max(100, 'Title cannot be longer than 100 characters.'),
  text: z
    .string()
    .min(10, 'Post must be at least 10 characters long.')
    .max(2000, 'Post cannot be longer than 2000 characters.'),
  imageUrl: z.string().optional(),
});

interface CreatePostFormProps {
  onPostCreated?: () => void;
  communityId?: string;
}

export function CreatePostForm({ onPostCreated, communityId }: CreatePostFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { createPost } = useAuthActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firestore = useFirestore();

  const { data: communities, loading: communitiesLoading } = useCollection(
    firestore ? collection(firestore, 'communities') : null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityId: communityId || '',
      title: '',
      text: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (communityId) {
        form.setValue('communityId', communityId);
    }
  }, [communityId, form])

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

  const applyFormatting = (
    formatType: 'bold' | 'italic' | 'code' | 'blockquote'
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText;

    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'blockquote':
        formattedText = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        break;
    }

    const newText =
      textarea.value.substring(0, start) +
      formattedText +
      textarea.value.substring(end);
    form.setValue('text', newText, { shouldDirty: true });
    
    // Focus and place cursor after the inserted/formatted text
    textarea.focus();
    setTimeout(() => {
        const newCursorPosition = start + formattedText.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await createPost(values);
      toast({
        title: 'Post created!',
        description: 'Your post is now live for the community to see.',
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
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="communityId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Community</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={communitiesLoading || !!communityId}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a community to post in..." />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {communities?.map(community => (
                                <SelectItem key={community.id} value={community.id}>
                                    c/{community.id}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
           />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="An interesting title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <div className="flex items-center gap-1 border-input border rounded-t-md p-2 bg-transparent">
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('bold')}><Bold className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('italic')}><Italic className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('blockquote')}><Quote className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('code')}><Code className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}><ImageIcon className="h-4 w-4" /></Button>
                  <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                <FormControl>
                  <Textarea
                    ref={textareaRef}
                    placeholder="What's on your mind? You can use Markdown for formatting."
                    className="resize-none rounded-t-none mt-0"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {imagePreview && (
            <div className="relative w-full h-48">
              <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded-md" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => {
                  setImagePreview(null);
                  form.setValue('imageUrl', '');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post
          </Button>
        </div>
      </form>
    </Form>
  );
}
