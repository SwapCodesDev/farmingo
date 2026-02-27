
'use client';

import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AppearanceSettingsPage() {
  const { setTheme, theme } = useTheme();
  const t = useTranslations('Settings');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('appearance')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('appearance-desc')}
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t('theme')}</CardTitle>
          <CardDescription>
            {t('theme-desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                theme === 'light' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-6 w-6 mx-auto mb-2" />
              <p className="text-center font-medium">{t('theme-light')}</p>
            </div>
            <div
              className={`rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                theme === 'dark' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-6 w-6 mx-auto mb-2" />
              <p className="text-center font-medium">{t('theme-dark')}</p>
            </div>
            <div
              className={`rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                theme === 'system' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => setTheme('system')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mx-auto mb-2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/>
                <path d="M12 2v20"/>
              </svg>
              <p className="text-center font-medium">{t('theme-system')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
