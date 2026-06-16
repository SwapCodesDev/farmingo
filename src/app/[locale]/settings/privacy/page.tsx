'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ShieldCheck, Lock, Users, Globe } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { updateUserPrivacySettings } from '@/lib/actions/profile';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

const privacySchema = z.object({
  postsVisibility: z.enum(['public', 'followers', 'private']),
  commentsVisibility: z.enum(['public', 'followers', 'private']),
  followersVisibility: z.enum(['public', 'followers', 'private']),
  followingVisibility: z.enum(['public', 'followers', 'private']),
});

export default function PrivacySettingsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const t = useTranslations('Settings');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof privacySchema>>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      postsVisibility: 'public',
      commentsVisibility: 'public',
      followersVisibility: 'public',
      followingVisibility: 'public',
    },
  });

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const privacy = userData.privacySettings || {};
          form.reset({
            postsVisibility: privacy.postsVisibility || 'public',
            commentsVisibility: privacy.commentsVisibility || 'public',
            followersVisibility: privacy.followersVisibility || 'public',
            followingVisibility: privacy.followingVisibility || 'public',
          });
        }
      });
    }
  }, [user, firestore, form]);

  const onSubmit = async (values: z.infer<typeof privacySchema>) => {
    if (!user || !firestore) return;
    setIsLoading(true);
    try {
      await updateUserPrivacySettings(firestore, user.uid, values);
      form.reset(values);
      toast({
        title: 'Privacy Settings Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const visibilityOptions = [
    { value: 'public', label: t('privacy-visibility-everyone'), icon: Globe },
    { value: 'followers', label: t('privacy-visibility-followers'), icon: Users },
    { value: 'private', label: t('privacy-visibility-private'), icon: Lock },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t('privacy')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('privacy-desc')}
          </p>
        </div>
        <Separator />
        
        <Card>
          <CardContent className="pt-6 space-y-6">
            <FormField
              control={form.control}
              name="postsVisibility"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-between border-b pb-4">
                  <div className="space-y-0.5 md:col-span-2">
                    <FormLabel>{t('privacy-posts-visibility')}</FormLabel>
                    <FormDescription>
                      Control who can view your posts on your profile page.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="h-4 w-4 text-muted-foreground" />
                              <span>{opt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commentsVisibility"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-between border-b pb-4">
                  <div className="space-y-0.5 md:col-span-2">
                    <FormLabel>{t('privacy-comments-visibility')}</FormLabel>
                    <FormDescription>
                      Control who can view your comments on your profile page.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="h-4 w-4 text-muted-foreground" />
                              <span>{opt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followersVisibility"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-between border-b pb-4">
                  <div className="space-y-0.5 md:col-span-2">
                    <FormLabel>{t('privacy-followers-visibility')}</FormLabel>
                    <FormDescription>
                      Control who can view the list of your followers.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="h-4 w-4 text-muted-foreground" />
                              <span>{opt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followingVisibility"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-between">
                  <div className="space-y-0.5 md:col-span-2">
                    <FormLabel>{t('privacy-following-visibility')}</FormLabel>
                    <FormDescription>
                      Control who can view the list of users you follow.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <opt.icon className="h-4 w-4 text-muted-foreground" />
                              <span>{opt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isDirty}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('save')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
