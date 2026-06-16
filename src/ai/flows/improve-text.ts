import { ai, groq, GROQ_MODELS } from '@/ai/genkit';
import { z } from 'genkit';

const ImproveTextInputSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['title', 'content']).default('content'),
});

export type ImproveTextInput = z.infer<typeof ImproveTextInputSchema>;

const ImproveTextOutputSchema = z.object({
  improvedText: z.string(),
});

export type ImproveTextOutput = z.infer<typeof ImproveTextOutputSchema>;

export async function improveText(input: ImproveTextInput): Promise<ImproveTextOutput> {
  return improveTextFlow(input);
}

export const improveTextFlow = ai.defineFlow(
  {
    name: 'improveTextFlow',
    inputSchema: ImproveTextInputSchema,
    outputSchema: ImproveTextOutputSchema,
  },
  async (input) => {
    let prompt = '';
    if (input.type === 'title') {
      prompt = `You are a helpful assistant that improves post titles for an online agriculture community named Farmingo.
Improve the following title to make it more engaging and clear. 
Guidelines:
1. Make it look like it was written by a human user, NOT an AI. Avoid overly promotional, clickbaity, or "robotic" sounding words (e.g. avoid starting with "Unlock", "Discover", "Revolutionize", or using excessive emojis).
2. Keep it natural, conversational, and focused on agriculture or community sharing.
3. Maintain the original core meaning and key details.
4. Keep it relatively short (under 100 characters).

Title to improve:
"${input.text}"
`;
    } else {
      prompt = `You are a helpful assistant that improves post content for an online agriculture community named Farmingo.
Improve the following text to make it clearer, better structured, and more engaging, while keeping the tone natural and human-like.
Guidelines:
1. Make it look like it was written by a human user, NOT an AI. Do NOT write in a robotic, corporate, or overly formal AI assistant tone. Avoid buzzwords like "delve", "testament", "moreover", "in conclusion", etc.
2. Keep all Markdown formatting (e.g. **bold**, *italics*, lists, blockquotes) intact or improve the markdown layout if appropriate.
3. Fix grammar, spelling, and phrasing errors.
4. Keep the same perspective (first person, second person, etc.) and original intent.

Text to improve:
"${input.text}"
`;
    }

    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.text,
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Return your response as a JSON object with the single key "improvedText".' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const finalResult = {
      improvedText: result.improvedText || input.text
    };

    return ImproveTextOutputSchema.parse(finalResult);
  }
);
