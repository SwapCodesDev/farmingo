import { WeatherPredictionClient } from '@/components/features/tools/weather-prediction-client';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from 'next-intl/server';

export default async function WeatherPredictionPage() {
  const t = await getTranslations('AI.weather');
  const commonT = await getTranslations('Common');

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {commonT('back-to-dashboard')}
        </Link>
      </Button>
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
      <WeatherPredictionClient />
    </div>
  );
}
