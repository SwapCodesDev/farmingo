
'use client';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function WelcomePage() {
  const t = useTranslations('Dashboard');
  const welcomeT = useTranslations('Welcome');
  const navT = useTranslations('Navigation');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center items-center gap-4 mb-6">
          <Leaf className="w-16 h-16 text-primary" />
          <h1 className="font-headline text-6xl font-bold tracking-tight">
            Farmingo
          </h1>
        </div>
        <p className="font-headline text-2xl text-muted-foreground mb-10">
          {t('subtitle')}
        </p>
        <div className="space-y-4">
          <p className="text-lg">
            {welcomeT('tagline')}
          </p>
          <div className="flex justify-center gap-4 pt-6">
            <Button asChild size="lg" className="px-8 shadow-md">
              <Link href="/signup">{navT('signup')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 bg-background">
              <Link href="/login">{navT('login')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
