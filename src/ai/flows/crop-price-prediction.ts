
'use server';

/**
 * @fileOverview Provides crop crop price predictions using Groq.
 */

import { ai, groq, GROQ_MODELS } from '@/ai/genkit';
import { z } from 'genkit';

const PredictCropPriceInputSchema = z.object({
  region: z.string(),
  crop: z.string(),
  variety: z.string(),
  date: z.string(),
});
export type PredictCropPriceInput = z.infer<typeof PredictCropPriceInputSchema>;

const PredictCropPriceOutputSchema = z.object({
  predictedPrice: z.number(),
  confidence: z.number(),
  recommendedListingPrice: z.number(),
  factors: z.array(z.string()),
});
export type PredictCropPriceOutput = z.infer<typeof PredictCropPriceOutputSchema>;

export async function predictCropPrice(input: PredictCropPriceInput): Promise<PredictCropPriceOutput> {
  return predictCropPriceFlow(input);
}

export const predictCropPriceFlow = ai.defineFlow(
  {
    name: 'predictCropPriceFlow',
    inputSchema: PredictCropPriceInputSchema,
    outputSchema: PredictCropPriceOutputSchema,
  },
  async input => {
    const prompt = `Act as an agricultural market analyst. Predict the market price for the following crop:
    Region: ${input.region}
    Crop: ${input.crop}
    Variety: ${input.variety}
    Expected Sale Date: ${input.date}
    
    You MUST respond with a JSON object containing:
    - "predictedPrice": numeric market value per unit.
    - "confidence": numeric value between 0 and 1.
    - "recommendedListingPrice": suggested price for a seller listing.
    - "factors": an array of strings representing market drivers (e.g. seasonal demand, weather).`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.text,
      messages: [{ role: 'system', content: 'You are an agricultural economist.' }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return PredictCropPriceOutputSchema.parse({
        predictedPrice: Number(result.predictedPrice) || 0,
        confidence: Number(result.confidence) || 0,
        recommendedListingPrice: Number(result.recommendedListingPrice) || 0,
        factors: Array.isArray(result.factors) ? result.factors : []
    });
  }
);
