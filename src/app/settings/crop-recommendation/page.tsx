import { CropRecommendationClient } from '@/components/features/crop-recommendation-client';
import { Separator } from '@/components/ui/separator';

export default function CropRecommendationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Crop Recommendation</h3>
        <p className="text-sm text-muted-foreground">
          Get crop recommendations based on your location and local weather conditions.
        </p>
      </div>
      <Separator />
      <CropRecommendationClient />
    </div>
  );
}
