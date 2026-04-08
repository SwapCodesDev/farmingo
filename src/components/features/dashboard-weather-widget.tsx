
'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSun, Loader2, MapPin, Sun, Thermometer, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWeatherAnalysisAction } from '@/app/actions/predict-weather';
import { type WeatherAnalysisOutput } from '@/ai/flows/weather-prediction';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export function DashboardWeatherWidget() {
  const [weather, setWeather] = useState<WeatherAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('AI.weather');

  useEffect(() => {
    // Attempt auto-fetch on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        setLoading(true);
        const { data } = await getWeatherAnalysisAction(pos.coords.latitude, pos.coords.longitude);
        if (data) setWeather(data);
        setLoading(false);
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-background/50 rounded-2xl border border-dashed animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-xs font-medium">Fetching local forecast...</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-full bg-background/50 border-primary/20 hover:bg-primary/10 transition-all"
        onClick={() => {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                setLoading(true);
                const { data } = await getWeatherAnalysisAction(pos.coords.latitude, pos.coords.longitude);
                if (data) setWeather(data);
                setLoading(false);
            });
        }}
      >
        <Navigation className="h-3 w-3 mr-2" />
        <span className="text-xs">Show Local Weather</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-primary/10 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-2 pr-4 border-r border-primary/20">
        <Sun className="h-5 w-5 text-primary" />
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-tighter font-bold text-primary opacity-70">Current Temp</p>
          <p className="text-sm font-bold leading-none">{weather.forecast.temperature.toFixed(1)}°C</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <MapPin className="h-3 w-3 text-primary" />
        <span className="text-xs font-semibold">{weather.location}</span>
      </div>
      <Badge variant="secondary" className="bg-background/80 text-primary text-[10px] hidden md:inline-flex">
        {weather.forecast.description}
      </Badge>
    </div>
  );
}
