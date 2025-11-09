'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Sprout,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getWeatherAnalysisAction } from '@/app/actions/predict-weather';
import { type WeatherAnalysisOutput } from '@/ai/flows/weather-prediction';
import { useUser } from '@/firebase';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  location: z.string().min(2, 'Location must be at least 2 characters long.'),
});

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
  const { user } = useUser();
  const [result, setResult] = useState<WeatherAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
    },
  });

    // TODO: Fetch user's default location from profile
    // React.useEffect(() => {
    //     if (user?.profile?.location) {
    //         form.setValue('location', user.profile.location);
    //     }
    // }, [user, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const { success, data, error } = await getWeatherAnalysisAction(values.location);
    setIsLoading(false);

    if (success && data) {
      setResult(data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error || 'An unexpected error occurred.',
      });
    }
  }

  const WeatherIcon = weatherIcons[result?.forecast.description.toLowerCase() || 'default'] || weatherIcons.default;


  return (
    <div className="space-y-8">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Enter Location</CardTitle>
          <CardDescription>Enter a city name to get the weather forecast and farming advice.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., Delhi, India" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="h-10">
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Get Analysis
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
      )}

      {result && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center justify-between">
                <span>Weather for {result.location}</span>
                <div className="flex items-center gap-2">
                    <WeatherIcon className="h-8 w-8 text-primary" />
                    <span className="capitalize text-xl text-muted-foreground">{result.forecast.description}</span>
                </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><Thermometer className="h-4 w-4"/>Temperature</p>
                    <p className="font-headline text-2xl font-bold">{result.forecast.temperature.toFixed(1)}°C</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium text-muted-foreground">Humidity</p>
                    <p className="font-headline text-2xl font-bold">{result.forecast.humidity}%</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1"><Wind className="h-4 w-4"/>Wind Speed</p>
                    <p className="font-headline text-2xl font-bold">{result.forecast.windSpeed.toFixed(1)} km/h</p>
                </div>
                 <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium text-muted-foreground">Chance of Rain</p>
                    <p className="font-headline text-2xl font-bold">{result.forecast.precipitationChance}%</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-headline text-lg font-semibold mb-3 flex items-center gap-2">
                        <Construction className="h-5 w-5 text-accent"/>
                        Suitable Activities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.suitableActivities.map((activity, index) => (
                            <Badge key={index} variant="outline" className="text-base px-3 py-1">{activity}</Badge>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-headline text-lg font-semibold mb-3 flex items-center gap-2">
                        <Combine className="h-5 w-5 text-accent"/>
                        Recommended for Harvest
                    </h4>
                     <div className="flex flex-wrap gap-2">
                        {result.recommendedCropsForHarvest.length > 0 ? (
                            result.recommendedCropsForHarvest.map((crop, index) => (
                                <Badge key={index} variant="outline" className="text-base px-3 py-1">{crop}</Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">Not ideal for harvesting.</p>
                        )}
                    </div>
                </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-headline text-xl font-semibold mb-3 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary"/>
                Farming Recommendations
              </h4>
              <div className="space-y-4">
                {result.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-primary/10 rounded-lg">
                        <Badge variant="secondary" className="mb-2">{rec.category}</Badge>
                        <p className="font-semibold mb-1">{rec.title}</p>
                        <p className="text-sm text-muted-foreground">{rec.tip}</p>
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
