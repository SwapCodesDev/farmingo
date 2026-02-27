'use server';

import {
  diagnoseCropDisease,
  type DiagnoseCropDiseaseOutput,
} from '@/ai/flows/crop-disease-diagnosis';

export async function diagnoseDisease(
  photoDataUri: string
): Promise<{
  success: boolean;
  data?: DiagnoseCropDiseaseOutput;
  error?: string;
}> {
  if (!photoDataUri) {
    return { success: false, error: 'Image data is required.' };
  }

  try {
    const result = await diagnoseCropDisease({ photoDataUri });
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    // In a production app, you'd want to log this error to a monitoring service.
    return { success: false, error: 'Failed to get diagnosis from AI model.' };
  }
}
