'use server';

import {
  getWeatherAnalysis,
  type WeatherAnalysisOutput,
} from '@/ai/flows/weather-prediction';

export async function getWeatherAnalysisAction(
  lat: number,
  lon: number
): Promise<{
  success: boolean;
  data?: WeatherAnalysisOutput;
  error?: string;
}> {
  try {
    const result = await getWeatherAnalysis({ lat, lon });
    return { success: true, data: result };
  } catch (e: any) {
    console.error('Weather Analysis Action Error:', e);
    return { 
      success: false, 
      error: e.message || 'Failed to get weather analysis from AI model.' 
    };
  }
}
