
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function OrderPlacedPage() {
  const t = await getTranslations('OrderPlaced');

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
      <Card className="w-full max-w-md text-center shadow-xl border-primary/20">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full animate-in zoom-in duration-500">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">{t('title')}</CardTitle>
          <CardDescription className="mt-2">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('desc')}
          </p>
          <Button asChild className="mt-6 w-full shadow-md">
            <Link href="/marketplace">{t('continue')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
