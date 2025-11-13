'use server';

type RecommendCropPayload = {
    auto_location: boolean;
    latitude?: number;
    longitude?: number;
}

export async function recommendCrop(payload: RecommendCropPayload): Promise<any> {
    const endpoint = 'http://127.0.0.1:8000/recommend';
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
