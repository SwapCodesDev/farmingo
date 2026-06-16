'use server';

import {
  improveText,
  type ImproveTextInput,
} from '@/ai/flows/improve-text';
import { z } from 'zod';

const formSchema = z.object({
  text: z.string().min(1, 'Text is required.'),
  type: z.enum(['title', 'content']).default('content'),
});

export async function getImprovedText(
  values: z.infer<typeof formSchema>
): Promise<{
  success: boolean;
  improvedText?: string;
  error?: string;
}> {
  const validatedFields = formSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const result = await improveText(validatedFields.data);
    return { success: true, improvedText: result.improvedText };
  } catch (e: any) {
    console.error('Improve text server action error:', e);
    return {
      success: false,
      error: e.message || 'Failed to improve text using AI.',
    };
  }
}
