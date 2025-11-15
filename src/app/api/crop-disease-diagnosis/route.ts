'use server';
import { diagnoseCropDiseaseFlow } from '@/ai/flows/crop-disease-diagnosis';
import { appRoute } from '@genkit-ai/next';

export const POST = appRoute({
    flow: diagnoseCropDiseaseFlow
});
