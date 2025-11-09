'use server';

import {
  getWeatherAnalysis,
  type WeatherAnalysisOutput,
} from '@/ai/flows/weather-prediction';

export async function getWeatherAnalysisAction(
  location: string
): Promise<{
  success: boolean;
  data?: WeatherAnalysisOutput;
  error?: string;
}> {
  if (!location) {
    return { success: false, error: 'Location is required.' };
  }

  try {
    const result = await getWeatherAnalysis({ location });
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    // In a production app, you'd want to log this error to a monitoring service.
    return { success: false, error: 'Failed to get weather analysis from AI model.' };
  }
}
