import { SettingsPricePrediction } from "@/components/features/settings-price-prediction";

export default function PricePredictionPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Crop Price Prediction</h3>
                <p className="text-sm text-muted-foreground">
                    Predict the price of a crop based on region and date.
                </p>
            </div>
            <SettingsPricePrediction />
        </div>
    );
}
