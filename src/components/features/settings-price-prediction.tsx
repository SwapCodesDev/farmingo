'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, TrendingUp, MapPin, Table as TableIcon, Info, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { useTranslations } from 'next-intl';
import { predictPrice, type PricePredictionResponse } from '@/app/actions/predict-price';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';

const commodities = [
  "onion", "tomato", "potato", "cabbage", "carrot", "chilli", "brinjal",
  "cucumber", "cauliflower", "beetroot", "bhindi", "garlic", "ginger",
  "sweet potato", "spring onion", "spinach", "methi", "coriander leaves",
  "bottle gourd", "ridge gourd", "bitter gourd", "snake gourd", "drumstick",
  "pumpkin", "capsicum"
] as const;

const formSchema = z.object({
  commodity: z.enum(commodities, {
    errorMap: () => ({ message: "Please select a valid commodity from the list." })
  }),
});

export function SettingsPricePrediction() {
  const [result, setResult] = useState<PricePredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('AI.price-prediction');
  const commonT = useTranslations('Common');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commodity: 'onion',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Geolocation is not supported by your browser.',
      });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsLocating(false);
        setIsLoading(true);
        setResult(null);
        try {
          const data = await predictPrice({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            commodity: values.commodity,
          });
          setResult(data);
          toast({
            title: 'Success',
            description: `Found market data for ${values.commodity} in ${data.state}.`,
          });
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Prediction Failed',
            description: error.message || 'Failed to get price prediction.',
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLocating(false);
        toast({
          variant: 'destructive',
          title: 'Location Access Denied',
          description: 'We need your location to find local market prices. Please enable permissions.',
        });
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Find Local Prices
            </CardTitle>
            <CardDescription>Select a commodity. We will use your current location to find the best local market data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="commodity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('crop')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a commodity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {commodities.map(commodity => (
                            <SelectItem key={commodity} value={commodity} className="capitalize">
                              {commodity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading || isLocating} className="w-full">
                  {isLoading || isLocating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TrendingUp className="mr-2 h-4 w-4" />
                  )}
                  {isLocating ? 'Locating...' : t('predict')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {!result && !isLoading && !isLocating && (
            <Card className="h-full flex flex-col items-center justify-center bg-muted/50 border-dashed py-20">
              <CardContent className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium font-headline">{t('awaiting')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your local price analysis will appear here once you submit.
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card className="h-full flex flex-col items-center justify-center bg-muted/50 border-dashed py-20">
              <CardContent className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h3 className="mt-4 text-lg font-medium">{t('analyzing')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Accessing live agricultural market records...
                </p>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <Card className="overflow-hidden border-primary/20 shadow-md">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {result.state} Market Forecast
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Analyzing {result.filtered_count} verified market records for {form.getValues('commodity')}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-background border-primary/20 text-primary">
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Base Price (Quintal)</p>
                      <p className="text-4xl font-bold text-primary">₹{result.base_price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">Approx. ₹{result.base_price_kg}/kg</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-accent/10 border border-accent/20 text-center">
                      <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-2">Max Market Price</p>
                      <p className="text-4xl font-bold text-accent-foreground">₹{result.max_price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground mt-2 font-medium">Approx. ₹{result.max_price_kg}/kg</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <TableIcon className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-bold text-lg">Local APMC Transactions</h4>
                    </div>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Market Name</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.data.slice(0, 6).map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{item.market}</TableCell>
                              <TableCell>{item.district}</TableCell>
                              <TableCell className="text-right font-bold text-primary">₹{item.price.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {result.data.length > 6 && (
                      <p className="text-xs text-center text-muted-foreground mt-4 italic">
                        Viewing most relevant records for your proximity.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/30 border-dashed border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                      <p>
                        These prices are fetched directly from live <strong>{result.state}</strong> state APMC records. 
                        The predicted base price assumes standard quality grade.
                      </p>
                      <p>
                        Estimated price volatility range: <strong>₹{result.excel_min}/kg</strong> to <strong>₹{result.excel_max}/kg</strong>. 
                        Actual realization depends on moisture content and variety.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
