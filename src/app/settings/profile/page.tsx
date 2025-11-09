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
import { Loader2, User as UserIcon, MapPin, KeyRound, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useFirestore, useUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, sendPasswordReset } from '@/lib/actions/profile';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

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
    region: z.string().min(1, 'Region is required.'),
});

export default function ProfileSettingsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [initialUsername, setInitialUsername] = useState('');

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      username: '',
      region: '',
    },
  });

  useEffect(() => {
    if (user && firestore) {
      form.setValue('displayName', user.displayName || '');

      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          form.setValue('username', userData.username || '');
          form.setValue('region', userData.region || '');
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
      form.reset(values, { keepIsDirty: false });
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
        description: 'Check your inbox for instructions to reset your password.',
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

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      toast({
        title: 'Copied to clipboard!',
        description: 'Your User ID has been copied.',
      });
    }
  };


  if (userLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            This is how others will see you on the site.
          </p>
        </div>
        <Separator />
        <Card>
          <CardContent className="pt-6 space-y-6">
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
                        placeholder="your_username"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Region</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g., Punjab, India"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
          <CardFooter>
            <Button
                type="submit"
                disabled={isLoading || !form.formState.isDirty}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update profile
            </Button>
          </CardFooter>
        </Card>
        
        <Separator />

        <div>
          <h3 className="text-lg font-medium">Account</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account security and identification.
          </p>
        </div>

        <Card>
          <CardContent className='pt-6 space-y-6'>
                <div className="space-y-2">
                  <FormLabel>User ID</FormLabel>
                  <div className="flex items-center justify-between p-3 rounded-md bg-muted mt-2">
                      <code className="text-sm text-muted-foreground truncate">{user?.uid}</code>
                      <Button type="button" variant="ghost" size="icon" onClick={handleCopyUid}>
                          <Copy className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <FormLabel>Email Address</FormLabel>
                  <p className="text-sm text-muted-foreground mt-2">
                      Your email address is {user?.email}. This cannot be changed.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  onClick={handlePasswordReset}
                  variant="outline"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  Send Password Reset Email
                </Button>
              </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
