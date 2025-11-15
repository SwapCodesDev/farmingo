'use server';

/**
 * @fileOverview Provides crop price predictions based on user input.
 *
 * - predictCropPrice - A function that handles the crop price prediction process.
 * - PredictCropPriceInput - The input type for the predictCropPrice function.
 * - PredictCropPriceOutput - The return type for the predictCropPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCropPriceInputSchema = z.object({
  region: z.string().describe('The region where the crop is grown.'),
  crop: z.string().describe('The type of crop.'),
  variety: z.string().describe('The specific variety of the crop.'),
  date: z.string().describe('The date for which the price prediction is needed.'),
});
export type PredictCropPriceInput = z.infer<typeof PredictCropPriceInputSchema>;

const PredictCropPriceOutputSchema = z.object({
  predictedPrice: z.number().describe('The predicted market price for the crop.'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
  recommendedListingPrice: z.number().describe('The recommended listing price based on the prediction.'),
  factors: z.array(z.string()).describe('Top 3 factors affecting the prediction.'),
});
export type PredictCropPriceOutput = z.infer<typeof PredictCropPriceOutputSchema>;

export async function predictCropPrice(input: PredictCropPriceInput): Promise<PredictCropPriceOutput> {
  return predictCropPriceFlow(input);
}

const predictCropPricePrompt = ai.definePrompt({
  name: 'predictCropPricePrompt',
  input: {schema: PredictCropPriceInputSchema},
  output: {schema: PredictCropPriceOutputSchema},
  prompt: `You are an expert in agricultural economics, specializing in predicting crop prices.

  Based on the provided details, predict the market price for the specified crop.
  Also, suggest a recommended listing price, taking into account a reasonable profit margin and market demand.
  Identify the top 3 factors influencing your prediction.

  Region: {{{region}}}
  Crop: {{{crop}}}
  Variety: {{{variety}}}
  Date: {{{date}}}

  Ensure the predictedPrice and recommendedListingPrice are numbers.
  Ensure confidence is a number between 0 and 1.
  Ensure factors is an array of strings.
  `,
});

export const predictCropPriceFlow = ai.defineFlow(
  {
    name: 'predictCropPriceFlow',
    inputSchema: PredictCropPriceInputSchema,
    outputSchema: PredictCropPriceOutputSchema,
  },
  async input => {
    const {output} = await predictCropPricePrompt(input);
    return output!;
  }
);
