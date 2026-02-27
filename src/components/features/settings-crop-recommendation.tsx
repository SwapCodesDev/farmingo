'use client';

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { recommendCrop } from "@/app/actions/recommend-crop";
import { Loader2, MapPin, Cloudy, Sun, Droplets, Waves, Thermometer, Leaf, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { useTranslations } from "next-intl";

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
    error?: string;
};


export function SettingsCropRecommendation() {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<RecommendationResponse | null>(null);
    const { toast } = useToast();
    const t = useTranslations('AI.crop-recommendation');
    const commonT = useTranslations('Common');

    const handleGetRecommendation = () => {
        setIsLoading(true);
        setResponse(null);

        if (!navigator.geolocation) {
            toast({
                variant: 'destructive',
                title: commonT('error'),
                description: 'Your browser does not support geolocation.'
            });
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                recommendCrop({
                    auto_location: false,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
                .then(data => {
                    setResponse(data);
                    toast({ title: commonT('success'), description: "Found a suitable crop for your location."})
                })
                .catch((error: any) => {
                    setResponse({ error: error.message } as any);
                    toast({
                        variant: 'destructive',
                        title: commonT('error'),
                        description: error.message || 'Could not fetch crop recommendations.'
                    });
                })
                .finally(() => setIsLoading(false));
            },
            (error) => {
                toast({
                    variant: 'destructive',
                    title: 'Location Error',
                    description: error.message || 'Could not fetch your location.'
                });
                setIsLoading(false);
            }
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t('get-button')}</CardTitle>
                    <CardDescription>
                        {t('get-desc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGetRecommendation} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        {t('use-location')}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">{t('fetching')}</p>
                </div>
            )}

            {response && !response.error && (
                 <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-3">
                            <Leaf className="h-8 w-8 text-primary" />
                            <span>{t('recommendation-for', { location: response.state })}</span>
                        </CardTitle>
                        <CardDescription>
                            Based on your location and current weather conditions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-lg bg-primary/10 text-center">
                            <p className="text-sm font-medium text-primary">{t('top-recommended')}</p>
                            <p className="font-headline text-4xl font-bold text-primary capitalize">{response.predicted_crop}</p>
                            <Badge variant="secondary" className="mt-2">{t('score')}: {(response.predicted_score * 100).toFixed(0)}%</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2"><Thermometer className="h-5 w-5 text-muted-foreground" /> Temp: <strong>{response.weather.temperature.toFixed(1)}°C</strong></div>
                            <div className="flex items-center gap-2"><Droplets className="h-5 w-5 text-muted-foreground" /> Humidity: <strong>{response.weather.humidity.toFixed(0)}%</strong></div>
                            <div className="flex items-center gap-2"><Sun className="h-5 w-5 text-muted-foreground" /> Rainfall: <strong>{response.weather.rainfall}mm</strong></div>
                            <div className="flex items-center gap-2"><Waves className="h-5 w-5 text-muted-foreground" /> pH: <strong>{response.weather.ph.toFixed(1)}</strong></div>
                        </div>

                        <Separator />

                        {response.fully_suitable.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    {t('suitable-title')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {response.fully_suitable.map(crop => <Badge key={crop} variant="outline" className="capitalize">{crop}</Badge>)}
                                </div>
                            </div>
                        )}
                        {response.partially_suitable.length > 0 && (
                             <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Cloudy className="h-5 w-5 text-amber-600" />
                                    {t('partially-title')}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {response.partially_suitable.map(crop => <Badge key={crop} variant="secondary" className="capitalize">{crop}</Badge>)}
                                </div>
                            </div>
                        )}
                    </CardContent>
                 </Card>
            )}

            {response?.error && (
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">{commonT('error')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{response.error}</p>
                    </CardContent>
                </Card>
            )}

        </div>
    )
}
