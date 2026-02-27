import { SettingsDiseasePrediction } from "@/components/features/settings-disease-prediction";
import { getTranslations } from "next-intl/server";

export default async function DiseaseDiagnosisPage() {
    const t = await getTranslations('AI.disease-diagnosis');

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
            <SettingsDiseasePrediction />
        </div>
    );
}
