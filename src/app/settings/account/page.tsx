'use client';
import { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, Copy } from 'lucide-react';
import { sendPasswordReset } from '@/lib/actions/profile';

export default function AccountSettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings. Set your preferred language and timezone.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>User ID</CardTitle>
          <CardDescription>
            This is your unique user identifier.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                <code className="text-sm text-muted-foreground truncate">{user?.uid}</code>
                <Button variant="ghost" size="icon" onClick={handleCopyUid}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Your email address is {user?.email}. This cannot be changed.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            To change your password, we will send a reset link to your email address.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={handlePasswordReset}
            variant="outline"
            disabled={isResetting}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            {isResetting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Send Password Reset Email
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
