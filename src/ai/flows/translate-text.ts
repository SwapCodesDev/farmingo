
'use server';

/**
 * @fileOverview A flow to translate text using Groq Cloud API via Genkit.
 * 
 * - translateText - A function that handles the translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import { ai, groq, GROQ_MODELS } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateTextInputSchema = z.object({
  texts: z.array(z.string()).describe('The texts to be translated.'),
  targetLanguage: z.string().describe('The target language to translate the text into.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedTexts: z.array(z.string()).describe('The translated texts.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

export const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const prompt = `You are a professional agricultural translation assistant.
Translate the following list of strings into ${input.targetLanguage}. 

Guidelines:
1. Maintain all Markdown formatting (e.g., **bold**, *italics*, # headers).
2. Ensure technical agricultural terms are accurate.
3. Keep the same number of items in the output array as the input array.
4. Output MUST be valid JSON with the key "translatedTexts".

Input strings to translate:
${JSON.stringify(input.texts, null, 2)}
`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.text,
      messages: [
        { role: 'system', content: 'You are a professional translator. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Defensive handling of output structure
    const finalResult = {
        translatedTexts: Array.isArray(result.translatedTexts) ? result.translatedTexts : (Array.isArray(result) ? result : [])
    };

    return TranslateTextOutputSchema.parse(finalResult);
  }
);
