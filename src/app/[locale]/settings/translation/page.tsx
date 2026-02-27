
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Languages } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';

const availableLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'mr', label: 'मराठी (Marathi)' },
    { value: 'bn', label: 'বাংলা (Bengali)' },
    { value: 'te', label: 'తెలుగు (Telugu)' },
    { value: 'ta', label: 'தமிழ் (Tamil)' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { value: 'ml', label: 'മലയാളം (Malayalam)' },
    { value: 'as', label: 'অसमীয়া (Assamese)' },
];

export default function TranslationSettingsPage() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const t = useTranslations('Settings');

  const handleSaveChanges = () => {
    toast({
        title: "Preferences Saved",
        description: "Your translation settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('translation')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('translation-desc')}
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t('language')}</CardTitle>
          <CardDescription>
            {t('language-desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4">
                <Languages className="h-6 w-6 text-muted-foreground" />
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full max-w-sm">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableLanguages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>{t('auto-translate-title')}</CardTitle>
          <CardDescription>
            {t('auto-translate-desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto-community-posts" className="text-base">{t('community-posts')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('community-posts-desc')}
              </p>
            </div>
            <Switch id="auto-community-posts" />
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto-market-posts" className="text-base">{t('market-posts')}</Label>
               <p className="text-sm text-muted-foreground">
                {t('market-posts-desc')}
              </p>
            </div>
            <Switch id="auto-market-posts" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveChanges}>{t('save')}</Button>
    </div>
  );
}
