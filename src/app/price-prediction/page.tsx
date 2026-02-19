import { SettingsPricePrediction } from "@/components/features/settings-price-prediction";

export default function PricePredictionPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                Crop Price Prediction
                </h1>
                <p className="text-muted-foreground">
                Predict the price of a crop based on region and date using our API-powered model.
                </p>
            </div>
            <SettingsPricePrediction />
        </div>
    );
}
