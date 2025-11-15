'use server';

/**
 * @fileOverview Provides weather analysis and farming recommendations.
 *
 * - getWeatherAnalysis - A function that provides weather-based farming advice.
 * - WeatherAnalysisInput - The input type for the flow.
 * - WeatherAnalysisOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define a tool for the AI to use to get weather data.
// In a real app, this would call a weather API.
const getWeatherForLocation = ai.defineTool(
  {
    name: 'getWeatherForLocation',
    description: 'Get the current weather for a given location.',
    inputSchema: z.object({
      location: z.string().describe('The city and country, e.g., "Delhi, India"'),
    }),
    outputSchema: z.object({
      temperature: z.number().describe('Temperature in Celsius.'),
      humidity: z.number().describe('Humidity percentage.'),
      windSpeed: z.number().describe('Wind speed in km/h.'),
      description: z.string().describe('A brief text description of the weather (e.g., "scattered clouds").'),
      precipitationChance: z.number().describe('Chance of precipitation in percentage.'),
    }),
  },
  async ({ location }) => {
    // This is a mock implementation.
    // In a real-world scenario, you would call a weather API here.
    console.log(`Fetching weather for ${location}...`);
    // Let's generate some plausible random data.
    const temp = 15 + Math.random() * 15; // 15-30 C
    const humidity = 40 + Math.random() * 50; // 40-90%
    const windSpeed = 5 + Math.random() * 15; // 5-20 km/h
    const precip = Math.random() < 0.3 ? Math.random() * 100 : 0; // 30% chance of rain
    const descriptions = ["clear sky", "few clouds", "scattered clouds", "broken clouds", "shower rain", "rain", "thunderstorm", "snow", "mist"];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    return {
      temperature: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(0)),
      windSpeed: parseFloat(windSpeed.toFixed(1)),
      description: description,
      precipitationChance: parseFloat(precip.toFixed(0)),
    };
  }
);


const WeatherAnalysisInputSchema = z.object({
  location: z.string(),
});
export type WeatherAnalysisInput = z.infer<typeof WeatherAnalysisInputSchema>;


const WeatherAnalysisOutputSchema = z.object({
    location: z.string().describe("The location for the weather analysis."),
    forecast: z.object({
        temperature: z.number().describe('Temperature in Celsius.'),
        humidity: z.number().describe('Humidity percentage.'),
        windSpeed: z.number().describe('Wind speed in km/h.'),
        description: z.string().describe('A brief text description of the weather (e.g., "scattered clouds").'),
        precipitationChance: z.number().describe('Chance of precipitation in percentage.'),
    }),
    recommendations: z.array(z.object({
        category: z.string().describe("The category of the recommendation (e.g., 'Irrigation', 'Pest Control', 'Planting')."),
        title: z.string().describe("A short, catchy title for the tip."),
        tip: z.string().describe('The detailed recommendation or tip for the farmer.'),
    })).describe("An array of 2-3 actionable recommendations for farmers based on the weather forecast."),
    suitableActivities: z.array(z.string()).describe("A list of 2-3 farming activities that are most suitable for the current weather conditions."),
    recommendedCropsForHarvest: z.array(z.string()).describe("A list of 1-2 crops that are ideal for harvesting in the current weather, if applicable. If no crops are suitable for harvest, return an empty array."),
});
export type WeatherAnalysisOutput = z.infer<typeof WeatherAnalysisOutputSchema>;


export async function getWeatherAnalysis(
  input: WeatherAnalysisInput
): Promise<WeatherAnalysisOutput> {
  return getWeatherAnalysisFlow(input);
}


export const getWeatherAnalysisFlow = ai.defineFlow({
    name: 'getWeatherAnalysisFlow',
    inputSchema: WeatherAnalysisInputSchema,
    outputSchema: WeatherAnalysisOutputSchema,
}, async (input) => {
    const prompt = `
    You are an expert agricultural advisor. Your role is to provide actionable,
    easy-to-understand advice to farmers based on the weather forecast.
    
    1. First, use the getWeatherForLocation tool to get the weather for the user's location.
    2. Then, analyze the weather data you receive.
    3. Based on the forecast, generate the following:
       a. A list of 2-3 suitable farming activities for the day (e.g., "Soil preparation", "Indoor planting", "Equipment maintenance").
       b. A list of 1-2 crops that would be ideal to harvest under these weather conditions. If conditions are poor for harvesting (e.g., heavy rain), return an empty list.
       c. An array of 2-3 general farming recommendations. For each recommendation, provide a category, a short title, and a descriptive tip. Make the tips specific to the weather conditions. For example, if it's hot and dry, recommend specific irrigation techniques. If it's windy, warn about soil erosion.

    The user's location is: {{{location}}}
  `;

  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: prompt,
    tools: [getWeatherForLocation],
    input: input,
    output: {
      schema: WeatherAnalysisOutputSchema,
    },
  });

  return output!;
});
