import { DiseaseDiagnosisClient } from '@/components/features/disease-diagnosis-client';

export default function DiseaseDiagnosisPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          Crop Disease Diagnosis
        </h1>
        <p className="text-muted-foreground">
          Upload a photo of an affected plant to get an instant AI-powered
          diagnosis and treatment recommendations.
        </p>
      </div>
      <DiseaseDiagnosisClient />
    </div>
  );
}
