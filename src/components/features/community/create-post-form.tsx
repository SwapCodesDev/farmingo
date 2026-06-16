'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
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
import {
  Loader2,
  Bold,
  Italic,
  Code,
  ImageIcon,
  Eraser,
  Quote,
  Sparkles,
  Heading3,
  Link as LinkIcon,
  List,
  ListOrdered,
  Plus
} from 'lucide-react';
import { useAuthActions } from '@/hooks/use-auth-actions';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ImageCropDialog } from '../shared/image-crop-dialog';
import { useImageCrop } from '@/hooks/use-image-crop';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getImprovedText } from '@/app/actions/improve-text';
import { Popover, PopoverTrigger } from '@/components/ui/popover';

const InlinePopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
InlinePopoverContent.displayName = "InlinePopoverContent";
// Checkbox is replaced with native input checkbox to prevent Radix ref loops
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  communityIds: z.array(z.string()).min(1, 'Please select at least one community.'),
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
  const [isImprovingTitle, setIsImprovingTitle] = useState(false);
  const [isImprovingContent, setIsImprovingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { createPost } = useAuthActions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const firestore = useFirestore();

  const {
    imagePreview,
    setImagePreview,
    cropState,
    setCropState,
    handleImageSelect,
    clearImage,
  } = useImageCrop(16 / 9);

  const communitiesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'communities');
  }, [firestore]);

  const { data: communities, loading: communitiesLoading } = useCollection(
    communitiesQuery
  );

  const filteredCommunities = useMemo(() => {
    if (!communities) return [];
    return communities.filter((community) =>
      community.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [communities, searchQuery]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityIds: communityId ? [communityId] : [],
      title: '',
      text: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (communityId) {
        form.setValue('communityIds', [communityId]);
    }
  }, [communityId, form]);

  const applyFormatting = (
    formatType: 'bold' | 'italic' | 'code' | 'blockquote' | 'heading' | 'link' | 'unordered-list' | 'ordered-list'
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';
    let cursorOffset = 0;

    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? formattedText.length : 2;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? formattedText.length : 1;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        cursorOffset = selectedText ? formattedText.length : 1;
        break;
      case 'blockquote':
        formattedText = (selectedText || 'quote').split('\n').map(line => `> ${line}`).join('\n');
        cursorOffset = formattedText.length;
        break;
      case 'heading':
        formattedText = `### ${selectedText || 'Heading'}`;
        cursorOffset = formattedText.length;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](https://example.com)`;
        cursorOffset = selectedText ? formattedText.length : 1;
        break;
      case 'unordered-list':
        formattedText = (selectedText || 'list item').split('\n').map(line => `- ${line}`).join('\n');
        cursorOffset = formattedText.length;
        break;
      case 'ordered-list':
        formattedText = (selectedText || 'list item').split('\n').map((line, idx) => `${idx + 1}. ${line}`).join('\n');
        cursorOffset = formattedText.length;
        break;
    }

    const newText =
      textarea.value.substring(0, start) +
      formattedText +
      textarea.value.substring(end);
      
    form.setValue('text', newText, { shouldDirty: true, shouldValidate: true });
    
    textarea.focus();
    setTimeout(() => {
        const newCursorPosition = start + cursorOffset;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleImproveTitle = async () => {
    const currentTitle = form.getValues('title');
    if (!currentTitle) return;

    setIsImprovingTitle(true);
    try {
      const response = await getImprovedText({ text: currentTitle, type: 'title' });
      if (response.success && response.improvedText) {
        form.setValue('title', response.improvedText, { shouldDirty: true, shouldValidate: true });
        toast({
          title: 'Title Polished!',
          description: 'AI has improved your title to sound more engaging and natural.',
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Polish Failed',
        description: error.message || 'Could not improve the title.',
      });
    } finally {
      setIsImprovingTitle(false);
    }
  };

  const handleImproveContent = async () => {
    const currentContent = form.getValues('text');
    if (!currentContent) return;

    setIsImprovingContent(true);
    try {
      const response = await getImprovedText({ text: currentContent, type: 'content' });
      if (response.success && response.improvedText) {
        form.setValue('text', response.improvedText, { shouldDirty: true, shouldValidate: true });
        toast({
          title: 'Content Polished!',
          description: 'AI has improved your content styling and phrasing.',
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Polish Failed',
        description: error.message || 'Could not improve the content.',
      });
    } finally {
      setIsImprovingContent(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await Promise.all(
        values.communityIds.map((cId) =>
          createPost({
            communityId: cId,
            title: values.title,
            text: values.text,
            imageUrl: values.imageUrl,
          })
        )
      );
      toast({
        title: 'Post created!',
        description: `Your post is now live in ${values.communityIds.length} ${values.communityIds.length === 1 ? 'community' : 'communities'}.`,
      });
      form.reset({
        communityIds: communityId ? [communityId] : [],
        title: '',
        text: '',
        imageUrl: '',
      });
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
            name="communityIds"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Communities</FormLabel>
                <Popover onOpenChange={(open) => { if (!open) setSearchQuery(''); }}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between h-auto min-h-10 text-left font-normal py-2 px-3",
                          !field.value?.length && "text-muted-foreground"
                        )}
                        disabled={communitiesLoading}
                      >
                        <div className="flex flex-wrap gap-1 items-center">
                          {field.value && field.value.length > 0 ? (
                            field.value.map((cId) => (
                              <Badge key={cId} variant="secondary" className="px-2 py-0.5 text-xs font-semibold">
                                c/{cId}
                              </Badge>
                            ))
                          ) : (
                            <span>Select communities to post in...</span>
                          )}
                        </div>
                        <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <InlinePopoverContent
                    className="w-[300px] p-2"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="space-y-2">
                      <div className="px-1 pb-1 border-b">
                        <Input
                          placeholder="Search communities..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-8 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                        {communitiesLoading ? (
                          <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading communities...
                          </div>
                        ) : filteredCommunities.length === 0 ? (
                          <div className="text-xs text-muted-foreground text-center py-6">
                            No communities found
                          </div>
                        ) : (
                          filteredCommunities.map((community) => {
                            const isDefault = community.id === communityId;
                            const isChecked = field.value?.includes(community.id);
                            return (
                              <div
                                key={community.id}
                                className="flex items-center space-x-2 rounded-md hover:bg-muted/50 p-2 cursor-pointer transition-colors"
                                onClick={() => {
                                  if (isDefault) return;
                                  
                                  const currentValues = field.value || [];
                                  let nextValues;
                                  if (currentValues.includes(community.id)) {
                                    nextValues = currentValues.filter((v) => v !== community.id);
                                  } else {
                                    nextValues = [...currentValues, community.id];
                                  }
                                  field.onChange(nextValues);
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isDefault}
                                  readOnly
                                  className="h-4 w-4 rounded border-primary text-primary accent-primary pointer-events-none"
                                />
                                <span className={cn(
                                  "text-sm font-medium leading-none select-none",
                                  isDefault && "text-muted-foreground font-semibold"
                                )}>
                                  c/{community.id} {isDefault && "(default)"}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </InlinePopoverContent>
                </Popover>
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
                  <div className="relative flex items-center">
                    <Input placeholder="An interesting title" className="pr-10" {...field} />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary/80"
                            disabled={isImprovingTitle || !form.watch('title')}
                            onClick={handleImproveTitle}
                          >
                            {isImprovingTitle ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>AI Polish Title (keeps it human-sounding)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
                <div className="flex items-center justify-between">
                  <FormLabel>Content</FormLabel>
                </div>
                <Tabs defaultValue="write" className="w-full">
                  <div className="flex items-center justify-between border-b pb-1.5 mb-2">
                    <TabsList className="h-8 p-0.5 bg-muted/60">
                      <TabsTrigger value="write" className="h-7 text-xs px-3.5">Write</TabsTrigger>
                      <TabsTrigger value="preview" className="h-7 text-xs px-3.5">Preview</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="write" className="space-y-2 focus-visible:ring-0 focus-visible:ring-offset-0 mt-0">
                    <TooltipProvider>
                      <div className="flex flex-wrap items-center gap-1 border-input border rounded-t-md p-1.5 bg-muted/20">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('bold')}><Bold className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Bold (**text**)</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('italic')}><Italic className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Italic (*text*)</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('heading')}><Heading3 className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Heading (### Heading)</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('blockquote')}><Quote className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Quote (&gt; text)</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('code')}><Code className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Code Block (`code`)</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('link')}><LinkIcon className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Hyperlink ([text](url))</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('unordered-list')}><List className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Bullet List (- item)</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => applyFormatting('ordered-list')}><ListOrdered className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Numbered List (1. item)</p></TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}><ImageIcon className="h-4 w-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Add Image</p></TooltipContent>
                        </Tooltip>

                        <div className="h-4 w-px bg-muted mx-1" />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 text-primary hover:text-primary/80 border-primary/30 bg-primary/5 hover:bg-primary/10"
                              disabled={isImprovingContent || !form.watch('text')}
                              onClick={handleImproveContent}
                            >
                              {isImprovingContent ? (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>AI Polish Content (keeps it human-sounding)</p></TooltipContent>
                        </Tooltip>

                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, (cropped) => form.setValue('imageUrl', cropped, { shouldValidate: true }))} />
                      </div>
                    </TooltipProvider>

                    <FormControl>
                      {(() => {
                        const { ref: fieldRef, ...restField } = field;
                        return (
                          <Textarea
                            placeholder="What's on your mind? You can use Markdown for formatting."
                            className="resize-none rounded-t-none mt-0 min-h-[150px]"
                            rows={6}
                            ref={(e) => {
                              fieldRef(e);
                              textareaRef.current = e;
                            }}
                            {...restField}
                          />
                        );
                      })()}
                    </FormControl>
                  </TabsContent>

                  <TabsContent value="preview" className="focus-visible:ring-0 focus-visible:ring-offset-0 mt-0">
                    <div className="border rounded-md p-4 min-h-[220px] bg-muted/10 max-h-[350px] overflow-y-auto break-words prose dark:prose-invert max-w-none">
                      {form.watch('text') ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {form.watch('text')}
                        </ReactMarkdown>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Nothing to preview yet. Switch to "Write" and type something!</span>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                <FormMessage />
              </FormItem>
            )}
          />
          {imagePreview && (
            <div className="relative w-full h-48 border rounded-md overflow-hidden">
              <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" className="bg-muted/10" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 shadow-md"
                onClick={() => {
                  clearImage(() => form.setValue('imageUrl', ''));
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading || isImprovingTitle || isImprovingContent}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post
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
