import { SettingsPricePrediction } from "@/components/features/settings-price-prediction";
import { getTranslations } from "next-intl/server";

export default async function PricePredictionPage() {
    const t = await getTranslations('AI.price-prediction');

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
            <SettingsPricePrediction />
        </div>
    );
}
