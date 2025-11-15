import { genkitNextHandler } from '@genkit-ai/next';
import { ai } from '@/ai/genkit';
import '@/ai/flows/crop-disease-diagnosis';
import '@/ai/flows/crop-price-prediction';
import '@/ai/flows/weather-prediction';
import '@/ai/flows/translate-text';

export const { GET, POST } = genkitNextHandler(ai);
