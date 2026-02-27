
'use server';

/**
 * @fileOverview Crop disease diagnosis AI agent using Groq Vision.
 */

import { ai, groq, GROQ_MODELS } from '@/ai/genkit';
import { z } from 'genkit';

const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of a plant as a data URI."),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  diseaseName: z.string(),
  confidence: z.number(),
  affectedSeverity: z.string(),
  immediateSteps: z.string(),
  followUpSteps: z.string(),
  communityPostsLink: z.string(),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  return diagnoseCropDiseaseFlow(input);
}

export const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async input => {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.vision,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image as an agricultural expert. Diagnose any crop disease present. Respond ONLY with a JSON object containing these keys: "diseaseName", "confidence" (0-1), "affectedSeverity", "immediateSteps", "followUpSteps", and "communityPostsLink" (set to "/community").' },
            { type: 'image_url', image_url: { url: input.photoDataUri } }
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return DiagnoseCropDiseaseOutputSchema.parse({
        diseaseName: result.diseaseName || 'Unknown',
        confidence: result.confidence || 0.5,
        affectedSeverity: result.affectedSeverity || 'Unknown',
        immediateSteps: result.immediateSteps || 'No immediate steps identified.',
        followUpSteps: result.followUpSteps || 'No follow-up steps identified.',
        communityPostsLink: result.communityPostsLink || '/community'
    });
  }
);
