'use server';

import { z } from 'zod';

const formSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  commodity: z.string().min(1, 'Commodity is required.'),
});

export type PricePredictionResponse = {
  status: string;
  state: string;
  total_records: number;
  filtered_count: number;
  data: Array<{
    date: string;
    district: string;
    market: string;
    commodity: string;
    price: number;
  }>;
  base_price: number;
  max_price: number;
  base_price_kg: number;
  max_price_kg: number;
  excel_min: number;
  excel_max: number;
  message: string | null;
};

/**
 * Server action to fetch price prediction from the new coordinate-based API.
 */
export async function predictPrice(
  values: z.infer<typeof formSchema>
): Promise<PricePredictionResponse> {
  const endpoint = 'https://swapcodes-farmingo.hf.space/price_prediction';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: values.lat,
        lon: values.lon,
        commodity: values.commodity.toLowerCase()
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Price prediction API error:', error);
    throw new Error(error.message || 'Failed to fetch price prediction.');
  }
}
