'use client';

import { useState } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Combine,
  Construction,
  Leaf,
  Loader2,
  MapPin,
  Sun,
  Thermometer,
  Wind,
  Droplets,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getWeatherAnalysisAction } from '@/app/actions/predict-weather';
import { type WeatherAnalysisOutput } from '@/ai/flows/weather-prediction';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useTranslations } from 'next-intl';

const weatherIcons: { [key: string]: React.ElementType } = {
  'clear sky': Sun,
  'few clouds': CloudSun,
  'scattered clouds': Cloud,
  'broken clouds': Cloud,
  'overcast clouds': Cloud,
  'shower rain': CloudDrizzle,
  rain: CloudRain,
  thunderstorm: CloudLightning,
  snow: CloudSnow,
  mist: CloudFog,
  default: Cloud,
};

export function WeatherPredictionClient() {
  const [result, setResult] = useState<WeatherAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('AI.weather');
  const commonT = useTranslations('Common');

  const fetchWeatherByGeolocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const { success, data, error } = await getWeatherAnalysisAction(latitude, longitude);
        setIsLoading(false);

        if (success && data) {
          setResult(data);
        } else {
          toast({
            variant: 'destructive',
            title: commonT('error'),
            description: error || 'An unexpected error occurred.',
          });
        }
      },
      (error) => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          title: 'Location Error',
          description: error.message || 'Could not retrieve your location.',
        });
      }
    );
  };

  const WeatherIcon = weatherIcons[result?.forecast.description.toLowerCase() || 'default'] || weatherIcons.default;

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Live Weather Advisory
          </CardTitle>
          <CardDescription>
            Use your current location to get real-time weather data and AI-powered farming advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={fetchWeatherByGeolocation} 
            disabled={isLoading} 
            size="lg"
            className="w-full sm:w-auto shadow-md"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-5 w-5" />
            )}
            Use My Current Location
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 shadow-lg">
          <CardHeader className="bg-muted/30">
            <CardTitle className="font-headline text-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span>{t('weather-for', { location: result.location })}</span>
                </div>
                <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full border border-primary/10 shadow-sm">
                    <WeatherIcon className="h-8 w-8 text-primary" />
                    <span className="capitalize text-lg font-semibold">{result.forecast.description}</span>
                </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                        <Thermometer className="h-3 w-3"/> Temp
                    </p>
                    <p className="font-headline text-3xl font-bold">{result.forecast.temperature.toFixed(1)}°C</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Feels like {result.forecast.feelsLike.toFixed(1)}°C</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                        <Droplets className="h-3 w-3"/> Humidity
                    </p>
                    <p className="font-headline text-3xl font-bold">{result.forecast.humidity}%</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Moisture content</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                        <Wind className="h-3 w-3"/> Wind
                    </p>
                    <p className="font-headline text-3xl font-bold">{result.forecast.windSpeed.toFixed(1)} <span className="text-sm">km/h</span></p>
                    <p className="text-[10px] text-muted-foreground mt-1">Air velocity</p>
                </div>
                 <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1 mb-1">
                        <CloudRain className="h-3 w-3"/> Rain
                    </p>
                    <p className="font-headline text-3xl font-bold">{result.forecast.rain1h.toFixed(1)} <span className="text-sm">mm</span></p>
                    <p className="text-[10px] text-muted-foreground mt-1">Last 1 hour</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-accent/20 bg-accent/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Construction className="h-4 w-4 text-accent"/>
                            SUITABLE ACTIVITIES
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {result.suitableActivities.map((activity, index) => (
                            <Badge key={index} variant="secondary" className="bg-background/80 hover:bg-background">{activity}</Badge>
                        ))}
                    </CardContent>
                </Card>
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Combine className="h-4 w-4 text-primary"/>
                            RECOMMENDED FOR HARVEST
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {result.recommendedCropsForHarvest.length > 0 ? (
                            result.recommendedCropsForHarvest.map((crop, index) => (
                                <Badge key={index} className="bg-primary/80 hover:bg-primary">{crop}</Badge>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground italic">Conditions not ideal for harvesting today.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <div>
              <h4 className="font-headline text-xl font-bold mb-4 flex items-center gap-2">
                <Leaf className="h-6 w-6 text-primary"/>
                Farmer Advisory & Tips
              </h4>
              <div className="grid gap-4">
                {result.recommendations.map((rec, index) => (
                    <div key={index} className="p-5 border rounded-xl bg-card hover:border-primary/30 transition-colors shadow-sm">
                        <Badge variant="outline" className="mb-3 border-primary/20 text-primary uppercase text-[10px] tracking-widest">{rec.category}</Badge>
                        <p className="font-bold text-lg mb-2 text-foreground">{rec.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{rec.tip}</p>
                    </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
