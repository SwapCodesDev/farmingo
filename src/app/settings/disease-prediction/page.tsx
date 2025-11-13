import { SettingsDiseasePrediction } from "@/components/features/settings-disease-prediction";


export default function DiseasePredictionPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Crop Disease Prediction</h3>
                <p className="text-sm text-muted-foreground">
                    Upload an image to predict the disease of a crop.
                </p>
            </div>
            <SettingsDiseasePrediction />
        </div>
    );
}
