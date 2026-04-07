import { DemandSupplyClient } from "@/components/features/demand-supply-client";
import { getTranslations } from "next-intl/server";

export default async function DemandSupplyPage() {
    const t = await getTranslations('AI.demand-supply');

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
            <DemandSupplyClient />
        </div>
    );
}
