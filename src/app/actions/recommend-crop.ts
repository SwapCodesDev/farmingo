'use server';

import { getApiEndpoint } from '@/lib/utils';

type RecommendCropPayload = {
    auto_location: boolean;
    latitude?: number;
    longitude?: number;
}

export async function recommendCrop(payload: RecommendCropPayload): Promise<any> {
    const endpoint = getApiEndpoint(
      process.env.CROP_RECOMMENDATION_API_URL,
      process.env.FARMINGO_API_BASE_URL,
      'https://swapcodes-farmingo.hf.space',
      '/recommend'
    );
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        return await response.json();
    } catch(error: any) {
        console.error('Failed to get crop recommendation:', error);
        throw new Error(error.message || 'Failed to fetch from the API endpoint.');
    }
}
