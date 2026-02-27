'use server';

/**
 * @fileOverview Provides weather analysis and farming recommendations using OpenWeatherMap and Groq.
 */

import { ai, groq, GROQ_MODELS } from '@/ai/genkit';
import { z } from 'genkit';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const fetchWeatherData = ai.defineTool(
  {
    name: 'fetchWeatherData',
    description: 'Fetch current weather data from OpenWeatherMap using coordinates.',
    inputSchema: z.object({
      lat: z.number(),
      lon: z.number(),
    }),
    outputSchema: z.object({
      name: z.string(),
      description: z.string(),
      temp: z.number(),
      tempMin: z.number(),
      tempMax: z.number(),
      feelsLike: z.number(),
      humidity: z.number(),
      windSpeed: z.number(),
      rain1h: z.number(),
    }),
  },
  async ({ lat, lon }) => {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OPENWEATHER_API_KEY is not defined in environment variables.');
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      name: data.name || 'Unknown Location',
      description: data.weather[0]?.description || 'unknown',
      temp: data.main.temp,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: Number((data.wind.speed * 3.6).toFixed(2)), // m/s to km/h
      rain1h: data.rain?.['1h'] || 0,
    };
  }
);

const WeatherAnalysisInputSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});
export type WeatherAnalysisInput = z.infer<typeof WeatherAnalysisInputSchema>;

const WeatherAnalysisOutputSchema = z.object({
    location: z.string(),
    forecast: z.object({
        temperature: z.number(),
        tempMin: z.number(),
        tempMax: z.number(),
        feelsLike: z.number(),
        humidity: z.number(),
        windSpeed: z.number(),
        description: z.string(),
        rain1h: z.number(),
    }),
    recommendations: z.array(z.object({
        category: z.string(),
        title: z.string(),
        tip: z.string(),
    })),
    suitableActivities: z.array(z.string()),
    recommendedCropsForHarvest: z.array(z.string()),
});
export type WeatherAnalysisOutput = z.infer<typeof WeatherAnalysisOutputSchema>;

export async function getWeatherAnalysis(input: WeatherAnalysisInput): Promise<WeatherAnalysisOutput> {
  return getWeatherAnalysisFlow(input);
}

export const getWeatherAnalysisFlow = ai.defineFlow({
    name: 'getWeatherAnalysisFlow',
    inputSchema: WeatherAnalysisInputSchema,
    outputSchema: WeatherAnalysisOutputSchema,
}, async (input) => {
    // 1. Fetch real weather data
    const weatherData = await fetchWeatherData(input);

    // 2. Generate specialized agricultural analysis via Groq
    const analysisPrompt = `You are a senior agricultural consultant. Analyze the following weather data for ${weatherData.name}:
    - Current Temperature: ${weatherData.temp}°C (Feels like: ${weatherData.feelsLike}°C)
    - Low/High: ${weatherData.tempMin}°C / ${weatherData.tempMax}°C
    - Humidity: ${weatherData.humidity}%
    - Wind Speed: ${weatherData.windSpeed} km/h
    - Condition: ${weatherData.description}
    - Recent Rain (1h): ${weatherData.rain1h}mm
    
    Provide a detailed farming advisory. 
    You MUST respond with a JSON object containing EXACTLY these keys:
    - "recommendations": An array of objects, each with "category" (e.g., Irrigation, Pest Control, Fertilization), "title", and "tip" (detailed advice).
    - "suitableActivities": An array of strings representing specific farming tasks good for today.
    - "recommendedCropsForHarvest": An array of strings representing crops that are safe or ideal to harvest now.
    
    Tone: Professional, helpful, and focused on crop safety and efficiency.`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.text,
      messages: [
        { role: 'system', content: 'You are an agricultural AI expert that always returns strictly valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    return WeatherAnalysisOutputSchema.parse({
        location: weatherData.name,
        forecast: {
            temperature: weatherData.temp,
            tempMin: weatherData.tempMin,
            tempMax: weatherData.tempMax,
            feelsLike: weatherData.feelsLike,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            description: weatherData.description,
            rain1h: weatherData.rain1h,
        },
        recommendations: result.recommendations || [],
        suitableActivities: result.suitableActivities || [],
        recommendedCropsForHarvest: result.recommendedCropsForHarvest || [],
    });
});