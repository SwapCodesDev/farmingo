'use server';

import { getApiEndpoint } from '@/lib/utils';

export async function predictDiseaseApi(formData: FormData): Promise<any> {
  const cropName = formData.get('crop_name') as string;
  const file = formData.get('file') as File;

  if (!cropName || !file || file.size === 0) {
    throw new Error('Crop name and an image file are required.');
  }

  const baseEndpoint = getApiEndpoint(
    process.env.DISEASE_PREDICTION_API_URL,
    process.env.FARMINGO_API_BASE_URL,
    'https://swapcodes-farmingo.hf.space',
    '/crop_disease_prediction'
  );
  const endpoint = `${baseEndpoint}?crop_name=${encodeURIComponent(cropName)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData, // The FormData can be sent directly
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to get crop disease prediction:', error);
    throw new Error(error.message || 'Failed to fetch from the API endpoint.');
  }
}
