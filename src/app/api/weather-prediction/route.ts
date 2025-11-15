'use server';
import { getWeatherAnalysisFlow } from '@/ai/flows/weather-prediction';
import { appRoute } from '@genkit-ai/next';

export const POST = appRoute({
    flow: getWeatherAnalysisFlow
});
