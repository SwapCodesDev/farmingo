'use server';

import { z } from 'zod';

const formSchema = z.object({
  district: z.string().min(1, 'District is required.'),
  commodity: z.string().min(1, 'Commodity is required.'),
  category: z.string().min(1, 'Category is required.'),
  target_date: z.string().min(1, 'Target date is required.'),
});

export type DemandSupplyResponse = {
  status: string;
  date_found: string;
  data_source: string;
  live_supply: number;
  live_price: number;
  baseline_qty: number;
  baseline_price: number;
  analysis: {
    z_score: number;
    supply_gap_pct: number;
    price_shift_pct: number;
    condition: string;
    confidence: string;
  };
  recommendation: string;
  error: string | null;
};

/**
 * Server action to fetch demand and supply analysis from the API.
 */
export async function analyzeDemandSupply(
  values: z.infer<typeof formSchema>
): Promise<DemandSupplyResponse> {
  const endpoint = 'https://psychological-odelia-unincriminated.ngrok-free.dev/demand_supply';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        district: values.district.toLowerCase(),
        commodity: values.commodity.toLowerCase(),
        category: values.category.toLowerCase(),
        target_date: values.target_date,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorBody}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Demand Supply API error:', error);
    throw new Error(error.message || 'Failed to analyze demand and supply.');
  }
}
