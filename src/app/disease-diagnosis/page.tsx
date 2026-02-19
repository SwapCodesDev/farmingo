import { SettingsDiseasePrediction } from "@/components/features/settings-disease-prediction";

export default function DiseaseDiagnosisPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
                    Crop Disease Diagnosis
                </h1>
                <p className="text-muted-foreground">
                    Upload an image to predict the disease of a crop using our API-powered model.
                </p>
            </div>
            <SettingsDiseasePrediction />
        </div>
    );
}
