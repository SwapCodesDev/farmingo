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
import { Globe, Languages } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const availableLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'bn', label: 'বাংলা (Bengali)' },
    { value: 'mr', label: 'मराठी (Marathi)' },
    { value: 'te', label: 'తెలుగు (Telugu)' },
    { value: 'ta', label: 'தமிழ் (Tamil)' },
    { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { value: 'ml', label: 'മലയാളം (Malayalam)' },
    { value: 'as', label: 'অসমীয়া (Assamese)' },
    { value: 'mai', label: 'मैथिली (Maithili)' },
    { value: 'ks', label: 'कٲشُر (Kashmiri)' },
    { value: 'ne', label: 'नेपाली (Nepali)' },
    { value: 'sat', label: 'संताली (Santali)' },
    { value: 'kok', label: 'कोंकणी (Konkani)' },
    { value: 'sd', label: 'सिंधी (Sindhi)' },
    { value: 'mni', label: 'Manipuri (Meitei)' },
    { value: 'doi', label: 'डोगरी (Dogri)' },
    { value: 'brx', label: 'बोड़ो (Bodo)' },
    { value: 'sa', label: 'संस्कृतम् (Sanskrit)' },
];


export default function TranslationSettingsPage() {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSaveChanges = () => {
    // In a real app, you'd save this to the user's profile in Firestore.
    toast({
        title: "Preferences Saved",
        description: "Your translation settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Translation</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred language and manage automatic translation settings.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Default Language</CardTitle>
          <CardDescription>
            This language will be used as the primary target for the "Translate" feature.
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
          <CardTitle>Auto-translation Settings</CardTitle>
          <CardDescription>
            Choose which types of content should be automatically translated to your default language.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox id="auto-community-posts" />
            <Label htmlFor="auto-community-posts" className="font-medium">
              Community Posts
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="auto-market-posts" />
            <Label htmlFor="auto-market-posts" className="font-medium">
              Marketplace Posts
            </Label>
          </div>
           <div className="flex items-center space-x-3">
            <Checkbox id="auto-comments" />
            <Label htmlFor="auto-comments" className="font-medium">
              Comments
            </Label>
          </div>
           <div className="flex items-center space-x-3">
            <Checkbox id="auto-market-items" />
            <Label htmlFor="auto-market-items" className="font-medium">
              Market Items (Descriptions)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveChanges}>Save Changes</Button>
    </div>
  );
}
