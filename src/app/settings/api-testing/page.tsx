'use client';

import { useState, useRef } from 'react';
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
import { Loader2, Send, MapPin, Cloudy, Sun, Droplets, Wind, Waves, Thermometer, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { testApi } from '@/app/actions/test-api';
import { recommendCrop } from '@/app/actions/recommend-crop';
import { predictDiseaseApi } from '@/app/actions/predict-disease-api';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Label } from '@/components/ui/label';


const priceFormSchema = z.object({
  crop: z.string().min(1, 'Crop is required.'),
  region: z.string().min(1, 'Region is required.'),
  date: z.string().min(1, 'Date is required (YYYY-MM-DD).'),
});

const diseaseFormSchema = z.object({
    crop_name: z.string().min(1, 'Crop name is required.'),
    file: z.instanceof(File).refine(file => file.size > 0, 'An image file is required.'),
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
  const [diseaseResponse, setDiseaseResponse] = useState<any | null>(null);
  const [isDiseaseLoading, setIsDiseaseLoading] = useState(false);
  const [diseaseImagePreview, setDiseaseImagePreview] = useState<string | null>(null);
  const diseaseFileInputRef = useRef<HTMLInputElement>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const { toast } = useToast();

  const priceForm = useForm<z.infer<typeof priceFormSchema>>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      crop: 'wheat',
      region: 'kolhapur',
      date: '2025-11-11',
    },
  });

  const diseaseForm = useForm<z.infer<typeof diseaseFormSchema>>({
    resolver: zodResolver(diseaseFormSchema),
    defaultValues: {
        crop_name: 'chilli',
        file: undefined,
    },
  });


  const currentPriceValues = priceForm.watch();
  const curlPriceCommand = `curl -X 'POST' \\
  'http://127.0.0.1:8000/crop_price' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(currentPriceValues, null, 2)}'`;

  const recommendCurlCommand = `curl -X 'POST' \\
  'http://127.0.0.1:8000/recommend' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "auto_location": false,
  "latitude": ${coordinates?.lat || 18.5958},
  "longitude": ${coordinates?.lon || 73.7935}
}'`;

    const currentDiseaseCropName = diseaseForm.watch('crop_name');
    const currentDiseaseFile = diseaseForm.watch('file');
    const diseaseCurlCommand = `curl -X 'POST' \\
  'http://127.0.0.1:8000/crop_disease_prediction?crop_name=${currentDiseaseCropName}' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'file=@${currentDiseaseFile?.name || "temp_leaf.jpg"};type=${currentDiseaseFile?.type || "image/jpeg"}'`;


  async function onPriceSubmit(values: z.infer<typeof priceFormSchema>) {
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

  const handleFetchLocation = () => {
    setIsFetchingLocation(true);
    if (!navigator.geolocation) {
        toast({
            variant: 'destructive',
            title: 'Geolocation Not Supported',
            description: 'Your browser does not support geolocation.'
        });
        setIsFetchingLocation(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            setCoordinates({
                lat: position.coords.latitude,
                lon: position.coords.longitude
            });
            setIsFetchingLocation(false);
            toast({ title: 'Location Fetched', description: 'Coordinates have been updated.'})
        },
        (error) => {
            toast({
                variant: 'destructive',
                title: 'Location Error',
                description: error.message || 'Could not fetch your location.'
            });
            setIsFetchingLocation(false);
        }
    );
  }

  const handleGetRecommendation = () => {
    if (!coordinates) {
        toast({ variant: 'destructive', title: 'Coordinates Missing', description: 'Please fetch your location first.' });
        return;
    }
    setIsRecommendLoading(true);
    setRecommendationResponse(null);

    recommendCrop({
        auto_location: false,
        latitude: coordinates.lat,
        longitude: coordinates.lon
    })
    .then(setRecommendationResponse)
    .catch((error: any) => {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Recommendation Failed',
            description: error.message || 'Could not fetch crop recommendations.'
        });
        setRecommendationResponse({ error: error.message } as any);
    })
    .finally(() => setIsRecommendLoading(false));
}

const handleDiseaseFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        diseaseForm.setValue('file', file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setDiseaseImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
}

async function onDiseaseSubmit(values: z.infer<typeof diseaseFormSchema>) {
    setIsDiseaseLoading(true);
    setDiseaseResponse(null);
    try {
        const formData = new FormData();
        formData.append('crop_name', values.crop_name);
        formData.append('file', values.file);

        const result = await predictDiseaseApi(formData);
        setDiseaseResponse(result);
        toast({
            title: 'Prediction Successful',
            description: 'Received a response from the disease prediction API.',
        });
    } catch (error: any) {
        setDiseaseResponse({ error: error.message });
        toast({
            variant: 'destructive',
            title: 'Prediction Failed',
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setIsDiseaseLoading(false);
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
          <Form {...priceForm}>
            <form onSubmit={priceForm.handleSubmit(onPriceSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={priceForm.control}
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
                  control={priceForm.control}
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
                  control={priceForm.control}
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
                <code>{curlPriceCommand}</code>
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
            Get crop recommendations based on your browser's location and local weather conditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleFetchLocation} disabled={isFetchingLocation} variant="outline">
                        {isFetchingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Fetch Browser Location
                    </Button>
                    <Button onClick={handleGetRecommendation} disabled={isRecommendLoading || !coordinates}>
                        {isRecommendLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Send className="mr-2 h-4 w-4" />
                        )}
                        Execute
                    </Button>
                </div>
                 {coordinates && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input id="latitude" readOnly value={coordinates.lat.toFixed(4)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input id="longitude" readOnly value={coordinates.lon.toFixed(4)} />
                        </div>
                    </div>
                )}
            </div>
            
            <div className="space-y-4 mt-6">
                <div>
                  <h4 className="font-semibold">cURL Command</h4>
                  <pre className="mt-2 w-full text-sm bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                    <code>{recommendCurlCommand}</code>
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

       <Separator />

      <Card>
        <CardHeader>
          <CardTitle>POST /crop_disease_prediction</CardTitle>
          <CardDescription>
            Predicts the disease of a crop from an image.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...diseaseForm}>
            <form onSubmit={diseaseForm.handleSubmit(onDiseaseSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={diseaseForm.control}
                  name="crop_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., chilli" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={diseaseForm.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image File</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={handleDiseaseFileChange} ref={diseaseFileInputRef}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
              </div>
               {diseaseImagePreview && (
                <div className="relative w-48 h-48 mt-2">
                    <Image src={diseaseImagePreview} alt="Preview" layout="fill" objectFit="cover" className="rounded-md border" />
                </div>
               )}
              <Button type="submit" disabled={isDiseaseLoading}>
                {isDiseaseLoading ? (
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
                <code>{diseaseCurlCommand}</code>
              </pre>
            </div>

            {diseaseResponse && (
              <div>
                <h4 className="font-semibold">Server Response</h4>
                <pre className="mt-2 w-full text-sm bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
                  <code>{JSON.stringify(diseaseResponse, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
