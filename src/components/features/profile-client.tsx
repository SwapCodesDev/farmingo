'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { KeyRound, Loader2, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, sendPasswordReset } from '@/lib/actions/profile';
import { Separator } from '../ui/separator';
import { useUserProfileDialog } from '@/context/user-profile-dialog-provider';
import { formatUsername } from '@/lib/utils';
import type { UserProfile } from '@/types';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required.'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username must be at most 20 characters.')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores.'
    ),
});

export function ProfileClient() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const { showProfile } = useUserProfileDialog();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [initialUsername, setInitialUsername] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      username: '',
    },
  });

  useEffect(() => {
    if (user && firestore) {
      form.setValue('displayName', user.displayName || '');

      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as UserProfile;
          setUserProfile(userData);
          form.setValue('username', userData.username || '');
          setInitialUsername(userData.username || '');
        }
      });
    }
  }, [user, firestore, form]);

  const isUsernameUnique = async (username: string) => {
    if (!firestore) return false;
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user || !firestore) return;
    setIsLoading(true);
    try {
      if (values.username !== initialUsername) {
        const isUnique = await isUsernameUnique(values.username);
        if (!isUnique) {
          form.setError('username', {
            type: 'manual',
            message: 'This username is already taken.',
          });
          setIsLoading(false);
          return;
        }
      }

      await updateUserProfile(firestore, user, values);
      setInitialUsername(values.username);
      toast({
        title: 'Profile Updated',
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

  const handlePasswordReset = async () => {
    if (!auth || !user?.email) return;
    setIsResetting(true);
    try {
      await sendPasswordReset(auth, user.email);
      toast({
        title: 'Password Reset Email Sent',
        description:
          'Please check your inbox for instructions to reset your password.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (userLoading) {
    return <p>Loading profile...</p>;
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You must be logged in to view this page.</p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const currentUsername = form.getValues('username');

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src={user.photoURL ?? undefined}
                alt={user.displayName ?? ''}
              />
              <AvatarFallback className="text-3xl">
                {getInitials(user.displayName || user.email || '')}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold font-headline">
              {user.displayName}
            </h2>
            {currentUsername && (
              <button onClick={() => showProfile(currentUsername)} className="text-sm text-muted-foreground hover:underline">
                {formatUsername(currentUsername, userProfile?.role)}
              </button>
            )}
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="unique_username"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
          <Separator className="my-6" />
          <CardHeader className="pt-0">
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handlePasswordReset}
              variant="outline"
              disabled={isResetting}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              {isResetting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Password Reset Email
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
