'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { predictPrice } from '@/app/actions/predict-price';
import type { PredictCropPriceOutput } from '@/ai/flows/crop-price-prediction';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  region: z.string().min(1, 'Region is required.'),
  crop: z.string().min(1, 'Crop is required.'),
  variety: z.string().min(1, 'Variety is required.'),
  date: z.date({
    required_error: 'A date is required.',
  }),
});

export function PricePredictionClient() {
  const [result, setResult] = useState<PredictCropPriceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: 'North',
      crop: 'Wheat',
      variety: 'HD-2967',
      date: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const { success, data, error } = await predictPrice(values);
    setIsLoading(false);

    if (success && data) {
      setResult(data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error || 'An unexpected error occurred.',
      });
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Enter Crop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Punjab" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wheat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="variety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variety</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HD-2967" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="mr-2 h-4 w-4" />
                )}
                Predict Price
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="font-headline text-2xl font-semibold">
              Predicting Price...
            </h2>
            <p className="text-muted-foreground">
              Our AI is analyzing market data. Please wait a moment.
            </p>
          </div>
        )}
        {!isLoading && !result && (
            <Card className="w-full h-full flex flex-col items-center justify-center bg-muted/50 border-dashed">
                <CardContent className="text-center p-6">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium font-headline">Awaiting Prediction</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Your price prediction will appear here.
                    </p>
                </CardContent>
            </Card>
        )}
        {result && (
          <Card className="w-full animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Prediction Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-accent/20 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Predicted Price
                  </p>
                  <p className="font-headline text-3xl font-bold text-accent-foreground">
                    ₹{result.predictedPrice.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/20 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Recommended Listing
                  </p>
                  <p className="font-headline text-3xl font-bold text-primary">
                    ₹{result.recommendedListingPrice.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Confidence
                </p>
                <p className="font-headline text-2xl font-bold text-foreground">
                  {(result.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <h4 className="font-headline font-semibold mb-2">
                  Top Influencing Factors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.factors.map((factor) => (
                    <Badge key={factor} variant="secondary">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
