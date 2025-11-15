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
    { value: 'as', label: 'অসমীয়া (Assamese)' },
    { value: 'bn', label: 'বাংলা (Bengali)' },
    { value: 'brx', label: 'बोड़ो (Bodo)' },
    { value: 'doi', label: 'डोगरी (Dogri)' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'ks', label: 'کٲشُر (Kashmiri)' },
    { value: 'kok', label: 'कोंकणी (Konkani)' },
    { value: 'mai', label: 'मैथिली (Maithili)' },
    { value: 'ml', label: 'മലയാളം (Malayalam)' },
    { value: 'mni', label: 'manipuri (Meitei)' },
    { value: 'mr', label: 'मराठी (Marathi)' },
    { value: 'ne', label: 'नेपाली (Nepali)' },
    { value: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { value: 'sa', label: 'संस्कृतम् (Sanskrit)' },
    { value: 'sat', label: 'संताली (Santali)' },
    { value: 'sd', label: 'सिंधी (Sindhi)' },
    { value: 'ta', label: 'தமிழ் (Tamil)' },
    { value 'te', label: 'తెలుగు (Telugu)' },
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
