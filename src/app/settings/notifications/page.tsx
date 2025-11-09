'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsSettingsPage() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your notification preferences have been updated.",
        });
    };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you receive notifications.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which email notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="mentions" defaultChecked />
            <label
              htmlFor="mentions"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mentions
            </label>
            <p className="text-sm text-muted-foreground ml-auto">
              When someone mentions you in a post or comment.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="new-messages" defaultChecked/>
            <label
              htmlFor="new-messages"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              New Messages
            </label>
             <p className="text-sm text-muted-foreground ml-auto">
              When you receive a new direct message.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="product-updates" />
            <label
              htmlFor="product-updates"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Product Updates
            </label>
             <p className="text-sm text-muted-foreground ml-auto">
              News, updates, and marketing from Farmingo.
            </p>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Choose which push notifications you want to receive on your devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="push-everything" disabled />
            <label
              htmlFor="push-everything"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Everything
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push-email" defaultChecked disabled/>
            <label
              htmlFor="push-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Same as email
            </label>
          </div>
           <div className="flex items-center space-x-2">
            <Checkbox id="push-nothing" disabled/>
            <label
              htmlFor="push-nothing"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              No push notifications
            </label>
          </div>
        </CardContent>
      </Card>
      <Button onClick={handleSaveChanges}>Save Changes</Button>
    </div>
  );
}
