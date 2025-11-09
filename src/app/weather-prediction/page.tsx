import { WeatherPredictionClient } from '@/components/features/weather-prediction-client';

export default function WeatherPredictionPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Weather Prediction & Advice
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered weather forecasts and actionable farming tips for your
          location.
        </p>
      </div>
      <WeatherPredictionClient />
    </div>
  );
}
