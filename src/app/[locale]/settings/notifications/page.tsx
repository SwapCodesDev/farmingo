
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
import { useTranslations } from 'next-intl';

export default function NotificationsSettingsPage() {
    const { toast } = useToast();
    const t = useTranslations('Settings');
    const commonT = useTranslations('Common');

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your notification preferences have been updated.",
        });
    };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('notifications')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('notifications-desc')}
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
              {t('mentions')}
            </label>
            <p className="text-sm text-muted-foreground ml-auto">
              {t('mentions-desc')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="new-messages" defaultChecked/>
            <label
              htmlFor="new-messages"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('new-messages')}
            </label>
             <p className="text-sm text-muted-foreground ml-auto">
              {t('new-messages-desc')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="product-updates" />
            <label
              htmlFor="product-updates"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('product-updates')}
            </label>
             <p className="text-sm text-muted-foreground ml-auto">
              {t('product-updates-desc')}
            </p>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>{t('push-notifications')}</CardTitle>
          <CardDescription>
            {t('push-desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="push-everything" disabled />
            <label
              htmlFor="push-everything"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('push-everything')}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push-email" defaultChecked disabled/>
            <label
              htmlFor="push-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('push-same-email')}
            </label>
          </div>
           <div className="flex items-center space-x-2">
            <Checkbox id="push-nothing" disabled/>
            <label
              htmlFor="push-nothing"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('push-nothing')}
            </label>
          </div>
        </CardContent>
      </Card>
      <Button onClick={handleSaveChanges}>{t('save')}</Button>
    </div>
  );
}
