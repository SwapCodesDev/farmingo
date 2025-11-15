'use server';
import { translateTextFlow } from '@/ai/flows/translate-text';
import { appRoute } from '@genkit-ai/next';

export const POST = appRoute({
    flow: translateTextFlow
});
