import { SettingsCropRecommendation } from "@/components/features/settings-crop-recommendation";

export default function CropRecommendationPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                    Crop Recommendation
                </h1>
                <p className="text-muted-foreground">
                    Get crop recommendations based on your location and local weather data from our API-powered model.
                </p>
            </div>
            <SettingsCropRecommendation />
        </div>
    );
}
