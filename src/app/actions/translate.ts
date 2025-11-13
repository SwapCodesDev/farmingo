'use server';

import {
  translateText,
  type TranslateTextInput,
} from '@/ai/flows/translate-text';
import { z } from 'zod';

const formSchema = z.object({
  texts: z.array(z.string().min(1)).min(1, 'At least one text is required.'),
  targetLanguage: z.string().min(1, 'Target language is required.'),
});

export async function getTranslation(
  values: z.infer<typeof formSchema>
): Promise<{
  success: boolean;
  translatedTexts?: string[];
  error?: string;
}> {
  const validatedFields = formSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const input: TranslateTextInput = validatedFields.data;

  try {
    const result = await translateText(input);
    return { success: true, translatedTexts: result.translatedTexts };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: 'Failed to get translation from AI model.',
    };
  }
}
