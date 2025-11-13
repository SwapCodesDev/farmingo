'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, MapPin, Cloudy, Sun, Droplets, Wind, Waves, Thermometer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { testApi } from '@/app/actions/test-api';
import { recommendCrop } from '@/app/actions/recommend-crop';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  crop: z.string().min(1, 'Crop is required.'),
  region: z.string().min(1, 'Region is required.'),
  date: z.string().min(1, 'Date is required (YYYY-MM-DD).'),
});


type RecommendationResponse = {
    status: string;
    coords: {
        latitude: number;
        longitude: number;
    };
    weather: {
        N: number;
        P: number;
        K: number;
        temperature: number;
        humidity: number;
        ph: number;
        rainfall: number;
    };
    predicted_crop: string;
    predicted_score: number;
    fully_suitable: string[];
    partially_suitable: string[];
    state: string;
    season_code: number;
};


export default function ApiTestingPage() {
  const [priceResponse, setPriceResponse] = useState<any | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [recommendationResponse, setRecommendationResponse] = useState<RecommendationResponse | null>(null);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop: 'wheat',
      region: 'kolhapur',
      date: '2025-11-11',
    },
  });

  const currentValues = form.watch();
  const curlCommand = `curl -X 'POST' \\
  'http://127.0.0.1:8000/crop_price' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(currentValues, null, 2)}'`;

  const recommendCurlCommand = (auto: boolean) => `curl -X 'POST' \\
  'http://127.0.0.1:8000/recommend' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "auto_location": ${auto},
  "latitude": 0,
  "longitude": 0
}'`;


  async function onPriceSubmit(values: z.infer<typeof formSchema>) {
    setIsPriceLoading(true);
    setPriceResponse(null);
    try {
      const result = await testApi(values);
      setPriceResponse(result);
      toast({
        title: 'API Request Sent',
        description: 'Received a response from the server.',
      });
    } catch (error: any) {
      setPriceResponse({ error: error.message });
      toast({
        variant: 'destructive',
        title: 'API Request Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsPriceLoading(false);
    }
  }

  const handleGetRecommendation = (useAutoLocation: boolean) => {
    setIsRecommendLoading(true);
    setRecommendationResponse(null);

    const getAndFetch = (latitude?: number, longitude?: number) => {
        recommendCrop({ auto_location: useAutoLocation, latitude, longitude })
            .then(setRecommendationResponse)
            .catch(handleError)
            .finally(() => setIsRecommendLoading(false));
    }

    const handleError = (error: any) => {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Recommendation Failed',
            description: error.message || 'Could not fetch crop recommendations.'
        });
        setRecommendationResponse({ error: error.message } as any);
        setIsRecommendLoading(false);
    }

    if (useAutoLocation) {
         getAndFetch();
    } else {
        if (!navigator.geolocation) {
            toast({
                variant: 'destructive',
                title: 'Geolocation Not Supported',
                description: 'Your browser does not support geolocation.'
            });
            setIsRecommendLoading(false);
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => getAndFetch(position.coords.latitude, position.coords.longitude),
                handleError
            );
        }
    }
}


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API Testing</h3>
        <p className="text-sm text-muted-foreground">
          Use this page to test the available API endpoints.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>POST /crop_price</CardTitle>
          <CardDescription>
            Predicts the price of a crop based on region and date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onPriceSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="crop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., wheat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., kolhapur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPriceLoading}>
                {isPriceLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Execute
              </Button>
            </form>
          </Form>

           <div className="space-y-4 mt-6">
            <div>
              <h4 className="font-semibold">cURL Command</h4>
              <pre className="mt-2 w-full text-sm bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                <code>{curlCommand}</code>
              </pre>
            </div>

            {priceResponse && (
              <div>
                <h4 className="font-semibold">Server Response</h4>
                <pre className="mt-2 w-full text-sm bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                  <code>{JSON.stringify(priceResponse, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>POST /recommend</CardTitle>
          <CardDescription>
            Get crop recommendations based on your location and local weather conditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => handleGetRecommendation(true)} disabled={isRecommendLoading} className="w-full sm:w-auto">
                    {isRecommendLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Use Auto-Detected Location
                </Button>
                <Button onClick={() => handleGetRecommendation(false)} disabled={isRecommendLoading} className="w-full sm:w-auto" variant="outline">
                    {isRecommendLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Use Browser Location
                </Button>
            </div>
            
            <div className="space-y-4 mt-6">
                <div>
                  <h4 className="font-semibold">cURL Command (Auto-location)</h4>
                  <pre className="mt-2 w-full text-sm bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                    <code>{recommendCurlCommand(true)}</code>
                  </pre>
                </div>

                {recommendationResponse && (
                  <div>
                    <h4 className="font-semibold">Server Response</h4>
                    <pre className="mt-2 w-full text-sm bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                      <code>{JSON.stringify(recommendationResponse, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
        </CardContent>
      </Card>
    </div>
  );
}
