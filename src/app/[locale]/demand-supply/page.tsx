import { DemandSupplyClient } from "@/components/features/tools/demand-supply-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function DemandSupplyPage() {
    const t = await getTranslations('AI.demand-supply');
    const commonT = await getTranslations('Common');

    return (
        <div className="space-y-6">
            <Button asChild variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {commonT('back-to-dashboard')}
                </Link>
            </Button>
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
