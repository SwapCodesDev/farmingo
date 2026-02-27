'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Bug, AlertTriangle, ShieldCheck, FlaskConical, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { predictDiseaseApi } from '@/app/actions/predict-disease-api';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { useTranslations } from 'next-intl';

const allowedCrops = ["Chilli", "Corn", "Melon", "Onion", "Tomato", "Wheat", "Groundnut"] as const;

const diseaseFormSchema = z.object({
    crop_name: z.enum(allowedCrops, {
        errorMap: () => ({ message: "Please select a valid crop from the list." })
    }),
    file: z.instanceof(File).refine(file => file.size > 0, 'An image file is required.'),
});

type DiseaseResponse = {
    predicted_disease: string;
    confidence: number;
    cause: string;
    symptoms: string;
    precautions: string[];
    cure: {
        chemical: string[];
        organic: string[];
    };
    error?: string;
}

export function SettingsDiseasePrediction() {
  const [diseaseResponse, setDiseaseResponse] = useState<DiseaseResponse | null>(null);
  const [isDiseaseLoading, setIsDiseaseLoading] = useState(false);
  const [diseaseImagePreview, setDiseaseImagePreview] = useState<string | null>(null);
  const diseaseFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const t = useTranslations('AI.disease-diagnosis');
  const commonT = useTranslations('Common');

  const diseaseForm = useForm<z.infer<typeof diseaseFormSchema>>({
    resolver: zodResolver(diseaseFormSchema),
    defaultValues: {
        crop_name: 'Chilli',
        file: undefined,
    },
  });


const handleDiseaseFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 4 * 1024 * 1024) { // 4MB limit
            toast({ variant: 'destructive', title: 'Image too large', description: 'Please upload an image under 4MB.'})
            return;
        }
        diseaseForm.setValue('file', file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setDiseaseImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
}

async function onDiseaseSubmit(values: z.infer<typeof diseaseFormSchema>) {
    setIsDiseaseLoading(true);
    setDiseaseResponse(null);
    try {
        const formData = new FormData();
        formData.append('crop_name', values.crop_name);
        formData.append('file', values.file);

        const result = await predictDiseaseApi(formData);
        setDiseaseResponse(result);
        toast({
            title: commonT('success'),
            description: 'Received a response from the disease prediction API.',
        });
    } catch (error: any) {
        setDiseaseResponse({ error: error.message } as any);
        toast({
            variant: 'destructive',
            title: commonT('error'),
            description: error.message || 'An unknown error occurred.',
        });
    } finally {
        setIsDiseaseLoading(false);
    }
}

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('upload')}</CardTitle>
           <CardDescription>
            {t('upload-desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...diseaseForm}>
            <form onSubmit={diseaseForm.handleSubmit(onDiseaseSubmit)} className="space-y-6">
                <FormField
                  control={diseaseForm.control}
                  name="crop_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Name</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a crop" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedCrops.map(crop => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={diseaseForm.control}
                    name="file"
                    render={() => (
                        <FormItem>
                            <FormLabel>Image File</FormLabel>
                             <div
                                className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/10 transition-colors"
                                onClick={() => diseaseFileInputRef.current?.click()}
                            >
                                <FormControl>
                                    <Input type="file" accept="image/*" onChange={handleDiseaseFileChange} ref={diseaseFileInputRef} className="hidden"/>
                                </FormControl>
                                {isDiseaseLoading ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                ) : diseaseImagePreview ? (
                                    <Image
                                        src={diseaseImagePreview}
                                        alt="Crop preview"
                                        width={150}
                                        height={150}
                                        className="max-h-full w-auto rounded-md object-contain"
                                    />
                                    ) : (
                                    <>
                                        <Upload className="h-12 w-12 text-muted-foreground" />
                                        <p className="mt-2 font-semibold">Click to upload image</p>
                                    </>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
              <Button type="submit" disabled={isDiseaseLoading} className="w-full">
                {isDiseaseLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bug className="mr-2 h-4 w-4" />}
                {t('diagnose')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isDiseaseLoading ? (
            <Card className="flex items-center justify-center animate-pulse">
                <div className="text-center p-6">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <h3 className="mt-4 text-lg font-medium">{t('analyzing')}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('analyzing-desc')}
                    </p>
                </div>
            </Card>
        ) : diseaseResponse ? (
            diseaseResponse.error ? (
                <Card className="flex items-center justify-center border-destructive">
                    <div className="text-center p-6">
                        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                        <h3 className="mt-4 text-lg font-medium text-destructive">{commonT('error')}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {diseaseResponse.error}
                        </p>
                    </div>
                </Card>
            ) : (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center justify-between">
                            <span>{diseaseResponse.predicted_disease}</span>
                            <Badge variant="outline" className="text-base">{(diseaseResponse.confidence).toFixed(2)}% Confident</Badge>
                        </CardTitle>
                        <CardDescription>{diseaseResponse.cause}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Symptoms</h4>
                            <p className="text-sm text-muted-foreground">{diseaseResponse.symptoms}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /> Precautions</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {diseaseResponse.precautions.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-amber-600" /> Chemical Cures</h4>
                                 <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {diseaseResponse.cure.chemical.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><TestTube className="h-5 w-5 text-green-600" /> Organic Cures</h4>
                                 <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {diseaseResponse.cure.organic.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        ) : (
            <Card className="flex items-center justify-center bg-muted/50 border-dashed">
                <div className="text-center p-6">
                    <Bug className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">{t('awaiting')}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('awaiting-desc')}
                    </p>
                </div>
            </Card>
        )}
    </div>
  );
}
