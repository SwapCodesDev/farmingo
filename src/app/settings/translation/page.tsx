'use client';

import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Globe, Languages } from 'lucide-react';

const availableLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'mr', label: 'मराठी (Marathi)' },
    { value: 'es', label: 'Español (Spanish)' },
    { value: 'fr', label: 'Français (French)' },
    { value: 'de', label: 'Deutsch (German)' },
    { value: 'zh', label: '中文 (Mandarin)' },
    { value: 'ja', label: '日本語 (Japanese)' },
];


export default function TranslationSettingsPage() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSaveChanges = () => {
    // In a real app, you'd save this to the user's profile in Firestore.
    toast({
        title: "Preferences Saved",
        description: `Your default language has been set to ${availableLanguages.find(l => l.value === selectedLanguage)?.label}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Translation</h3>
        <p className="text-sm text-muted-foreground">
          Choose the default language for content translation across the app.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Default Language</CardTitle>
          <CardDescription>
            This language will be used as the primary target for the "Translate" feature on posts and comments.
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
        <CardFooter>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
