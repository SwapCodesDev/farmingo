'use server';
import { predictCropPriceFlow } from '@/ai/flows/crop-price-prediction';
import { appRoute } from '@genkit-ai/next';

export const POST = appRoute({
    flow: predictCropPriceFlow
});
