'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { testApi } from '@/app/actions/test-api';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  crop: z.string().min(1, 'Crop is required.'),
  region: z.string().min(1, 'Region is required.'),
  date: z.string().min(1, 'Date is required (YYYY-MM-DD).'),
});

type PriceResponse = {
    crop: string;
    region: string;
    date: string;
    predicted_price: number;
    error?: string;
}

export function SettingsPricePrediction() {
  const [result, setResult] = useState<PriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: 'kolhapur',
      crop: 'wheat',
      date: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
        const data = await testApi(values);
        setResult(data);
    } catch (error: any) {
        setResult({ error: error.message } as any);
        toast({
            variant: 'destructive',
            title: 'Prediction Failed',
            description: error || 'An unexpected error occurred.',
        });
    }
    setIsLoading(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Enter Crop Details</CardTitle>
          <CardDescription>Get a market price prediction for a specific crop.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                              format(new Date(field.value), 'PPP')
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
                          selected={new Date(field.value)}
                           onSelect={(day) => field.onChange(day?.toISOString().split('T')[0])}
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
              Analyzing market data. Please wait.
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
        {result && !result.error && (
          <Card className="w-full animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">
                Prediction Result
              </CardTitle>
               <CardDescription className="capitalize">
                {result.crop} in {result.region} on {format(new Date(result.date), 'PPP')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="rounded-lg bg-primary/10 p-6 text-center">
                  <p className="text-sm font-medium text-primary">
                    Predicted Market Price
                  </p>
                  <p className="font-headline text-5xl font-bold text-primary">
                    {typeof result.predicted_price === 'number' ? `₹${result.predicted_price.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
