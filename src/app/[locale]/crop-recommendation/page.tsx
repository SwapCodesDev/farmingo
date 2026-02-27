import { SettingsCropRecommendation } from "@/components/features/settings-crop-recommendation";
import { getTranslations } from "next-intl/server";

export default async function CropRecommendationPage() {
    const t = await getTranslations('AI.crop-recommendation');

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>
            <SettingsCropRecommendation />
        </div>
    );
}
