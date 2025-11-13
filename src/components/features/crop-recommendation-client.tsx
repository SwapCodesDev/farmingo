'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Leaf, MapPin, Cloudy, Sun, Droplets, Wind, Waves, Thermometer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { recommendCrop } from '@/app/actions/recommend-crop';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

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

export function CropRecommendationClient() {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<RecommendationResponse | null>(null);
    const { toast } = useToast();

    const handleGetRecommendation = (useAutoLocation: boolean) => {
        setIsLoading(true);
        setResponse(null);

        const getAndFetch = (latitude: number, longitude: number) => {
            recommendCrop({ auto_location: false, latitude, longitude })
                .then(setResponse)
                .catch(handleError)
                .finally(() => setIsLoading(false));
        }

        const handleError = (error: any) => {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Recommendation Failed',
                description: error.message || 'Could not fetch crop recommendations.'
            });
            setIsLoading(false);
        }

        if (useAutoLocation) {
             recommendCrop({ auto_location: true })
                .then(setResponse)
                .catch(handleError)
                .finally(() => setIsLoading(false));
        } else {
            if (!navigator.geolocation) {
                toast({
                    variant: 'destructive',
                    title: 'Geolocation Not Supported',
                    description: 'Your browser does not support geolocation.'
                });
                setIsLoading(false);
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
            <Card>
                <CardHeader>
                    <CardTitle>Get Recommendations</CardTitle>
                    <CardDescription>
                        Use your current location to get crop recommendations tailored to your local weather and soil conditions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={() => handleGetRecommendation(true)} disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Use Auto-Detected Location
                    </Button>
                    <Button onClick={() => handleGetRecommendation(false)} disabled={isLoading} className="w-full sm:w-auto" variant="outline">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Use Browser Location
                    </Button>
                </CardContent>
            </Card>

            {response && (
                 <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Recommendation for {response.state}</span>
                             <Badge variant="secondary" className="capitalize">
                                {response.status}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                           Based on current conditions at {response.coords.latitude.toFixed(4)}, {response.coords.longitude.toFixed(4)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-primary">Top Recommendation</h4>
                            <div className="p-4 bg-primary/10 rounded-lg text-center">
                                <p className="text-3xl font-bold font-headline capitalize">{response.predicted_crop}</p>
                                <p className="text-sm text-primary/80">Prediction Score: {response.predicted_score}</p>
                            </div>
                        </div>

                         <Separator />

                        <div>
                            <h4 className="font-semibold mb-3">Weather & Soil Data</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md"><Thermometer className="h-5 w-5 text-destructive" /> <span>Temp: {response.weather.temperature.toFixed(1)}°C</span></div>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md"><Droplets className="h-5 w-5 text-blue-500" /> <span>Humidity: {response.weather.humidity.toFixed(1)}%</span></div>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md"><Cloudy className="h-5 w-5 text-gray-500" /> <span>Rainfall: {response.weather.rainfall}mm</span></div>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md"><Waves className="h-5 w-5 text-green-600" /> <span>pH: {response.weather.ph.toFixed(2)}</span></div>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md"><strong>N:</strong><span>{response.weather.N}</span></div>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md"><strong>P:</strong><span>{response.weather.P}</span></div>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md"><strong>K:</strong><span>{response.weather.K}</span></div>
                            </div>
                        </div>

                         <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <h4 className="font-semibold mb-2">Fully Suitable Crops</h4>
                                {response.fully_suitable.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {response.fully_suitable.map(crop => <Badge key={crop} className="capitalize">{crop}</Badge>)}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">None</p>}
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2">Partially Suitable Crops</h4>
                                {response.partially_suitable.length > 0 ? (
                                     <div className="flex flex-wrap gap-2">
                                        {response.partially_suitable.map(crop => <Badge variant="secondary" key={crop} className="capitalize">{crop}</Badge>)}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">None</p>}
                            </div>
                        </div>
                       
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
