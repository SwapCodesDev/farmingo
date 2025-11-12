'use server';

import { z } from 'zod';

const formSchema = z.object({
  crop: z.string(),
  region: z.string(),
  date: z.string(),
});

/**
 * A server action to proxy the API test request.
 * This is not strictly necessary but keeps the client-side code cleaner
 * and avoids potential CORS issues if the API were hosted on a different domain.
 */
export async function testApi(values: z.infer<typeof formSchema>): Promise<any> {
  const validatedFields = formSchema.safeParse(values);
  if (!validatedFields.success) {
    throw new Error('Invalid input.');
  }

  // Use the explicit IP address for server-side fetch.
  const endpoint = 'http://127.0.0.1:8000/crop_price';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Failed to test API:', error);
    throw new Error(error.message || 'Failed to fetch from the API endpoint.');
  }
}
