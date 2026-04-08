'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  BarChart3, 
  Loader2, 
  MapPin, 
  Search, 
  Calendar as CalendarIcon,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Table as TableIcon,
  History
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { useTranslations } from 'next-intl';
import { analyzeDemandSupply, type DemandSupplyResponse } from '@/app/actions/demand-supply';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Mapping Data ---
const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amarawati", "Beed", "Bhandara", "Buldhana",
  "Chandrapur", "Chattrapati Sambhajinagar", "Dharashiv(Usmanabad)",
  "Dhule", "Gadchiroli", "Gondiya", "Hingoli", "Jalana", "Jalgaon",
  "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar",
  "Nashik", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli",
  "Satara", "Sholapur", "Sindhudurg", "Thane", "Vashim", "Wardha", "Yavatmal"
];

const CATEGORY_MAP = {
  "Cereals": ["Bajra(Pearl Millet/Cumbu)", "Maize", "Rice", "Wheat"],
  "Pulses": ["Arhar Dal(Tur Dal)", "Bengal Gram Dal(Chana Dal)", "Green Gram Dal(Moong Dal)", "Masur Dal", "Mataki", "Kidney Beans(Rajma)"],
  "Fruits": ["Orange", "Water Melon", "Apple", "Banana", "Mango", "Grapes"],
  "Vegetables": ["Potato", "Onion", "Tomato", "Pumpkin", "Green Chilli", "Raddish"],
  "Spices": ["Black pepper", "Chili Red", "Cinamon(Dalchini)", "Ginger(Dry)", "Turmeric"]
};

type CategoryName = keyof typeof CATEGORY_MAP;

const formSchema = z.object({
  district: z.string().min(1, 'Please select a district.'),
  category: z.string().min(1, 'Please select a category.'),
  commodity: z.string().min(1, 'Please select a commodity.'),
  date: z.date({
    required_error: "A target date is required.",
  }),
});

export function DemandSupplyClient() {
  const [result, setResult] = useState<DemandSupplyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('AI.demand-supply');
  const commonT = useTranslations('Common');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district: 'Pune',
      category: 'Vegetables',
      commodity: 'Onion',
      date: new Date(),
    },
  });

  const selectedCategory = form.watch('category') as CategoryName;

  const availableCommodities = useMemo(() => {
    return CATEGORY_MAP[selectedCategory] || [];
  }, [selectedCategory]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeDemandSupply({
        district: values.district,
        commodity: values.commodity,
        category: values.category,
        target_date: format(values.date, 'yyyy-MM-dd'),
      });
      setResult(data);
      toast({
        title: commonT('success'),
        description: 'Market analysis completed.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message || 'Failed to fetch market data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Analyze Trends
            </CardTitle>
            <CardDescription>Select regional and crop details for a strategic outlook.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('district')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-64">
                          {MAHARASHTRA_DISTRICTS.map(district => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category')}</FormLabel>
                      <Select onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue('commodity', CATEGORY_MAP[val as CategoryName][0]);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(CATEGORY_MAP).map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="commodity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('commodity')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select commodity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableCommodities.map(commodity => (
                            <SelectItem key={commodity} value={commodity}>
                              {commodity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('target-date')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
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
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
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
                    <BarChart3 className="mr-2 h-4 w-4" />
                  )}
                  {t('analyze')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {!result && !isLoading && (
            <Card className="h-full flex flex-col items-center justify-center bg-muted/50 border-dashed py-20">
              <CardContent className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium font-headline">{t('awaiting')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('awaiting-desc')}
                </p>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <Card className="h-full flex flex-col items-center justify-center bg-muted/50 border-dashed py-20">
              <CardContent className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <h3 className="mt-4 text-lg font-medium">{t('analyzing')}</h3>
                <p className="mt-1 text-sm text-muted-foreground italic">
                  Evaluating supply and demand trends...
                </p>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-primary/20 overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-2">
                        <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {t('live-supply')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold">{result.live_supply.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Found on {result.date_found}</p>
                    </CardContent>
                </Card>
                <Card className="border-accent/20 overflow-hidden">
                    <CardHeader className="bg-accent/5 pb-2">
                        <CardTitle className="text-sm font-semibold text-accent-foreground uppercase tracking-wider flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Historical Demand
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4  text-center">
                        <p className="text-3xl font-bold text-accent-foreground">{result.baseline_qty.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Tons (Historical Baseline)</p>
                    </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Market Report
                    </CardTitle>
                    <CardDescription>Comparison against historical baseline for {form.getValues('commodity')}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('supply-gap')}</span>
                                <span className={cn("font-bold", result.analysis.supply_gap_pct < 0 ? "text-destructive" : "text-green-600")}>
                                    {result.analysis.supply_gap_pct > 0 ? '+' : ''}{result.analysis.supply_gap_pct.toFixed(2)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full", result.analysis.supply_gap_pct < 0 ? "bg-destructive" : "bg-green-600")}
                                    style={{ width: `${Math.min(Math.abs(result.analysis.supply_gap_pct), 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('price-shift')}</span>
                                <span className={cn("font-bold", result.analysis.price_shift_pct < 0 ? "text-destructive" : "text-green-600")}>
                                    {result.analysis.price_shift_pct > 0 ? '+' : ''}{result.analysis.price_shift_pct.toFixed(2)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full", result.analysis.price_shift_pct < 0 ? "bg-destructive" : "bg-green-600")}
                                    style={{ width: `${Math.min(Math.abs(result.analysis.price_shift_pct), 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 border border-dashed grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                            <p className="text-muted-foreground font-medium">{t('baseline-qty')}</p>
                            <p className="font-bold">{result.baseline_qty.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground font-medium">{t('baseline-price')}</p>
                            <p className="font-bold">₹{result.baseline_price.toLocaleString()}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('condition')}</p>
                                <p className="text-lg font-bold text-primary">{result.analysis.condition}</p>
                            </div>
                            <Badge variant="outline" className="w-fit">
                                {t('confidence')}: {result.analysis.confidence}
                            </Badge>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="text-sm leading-relaxed">
                                <p className="font-bold text-primary mb-1">Strategic Recommendation</p>
                                <p className="text-muted-foreground">{result.recommendation}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
              </Card>

              {/* Technical Verification Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <TableIcon className="h-5 w-5 text-primary" />
                    Technical Verification Table
                  </CardTitle>
                  <CardDescription>Detailed statistical metrics for this market analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-bold">Metric</TableHead>
                          <TableHead className="font-bold">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Data Source Date</TableCell>
                          <TableCell>{result.date_found}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Live Supply (T)</TableCell>
                          <TableCell>{result.live_supply.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Live Price (₹/T)</TableCell>
                          <TableCell>₹{result.live_price.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Historical Demand (T)</TableCell>
                          <TableCell>{result.baseline_qty.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Historical Price (₹/T)</TableCell>
                          <TableCell>₹{result.baseline_price.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Supply Gap (%)</TableCell>
                          <TableCell className={cn(result.analysis.supply_gap_pct > 0 ? "text-green-600" : "text-destructive")}>
                            {result.analysis.supply_gap_pct > 0 ? '+' : ''}{result.analysis.supply_gap_pct.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Price Shift (%)</TableCell>
                          <TableCell className={cn(result.analysis.price_shift_pct > 0 ? "text-green-600" : "text-destructive")}>
                            {result.analysis.price_shift_pct > 0 ? '+' : ''}{result.analysis.price_shift_pct.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Z-Score</TableCell>
                          <TableCell>{result.analysis.z_score.toFixed(2)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Condition</TableCell>
                          <TableCell>{result.analysis.condition}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Confidence</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{result.analysis.confidence}</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-6 space-y-2 text-xs text-muted-foreground border-t pt-4">
                    <p className="flex items-start gap-2">
                        <span className="shrink-0">•</span>
                        <span>A Z-Score of {result.analysis.z_score.toFixed(2)} indicates how many standard deviations the current supply is from the historical mean.</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="shrink-0">•</span>
                        <span>The Price Shift of {result.analysis.price_shift_pct.toFixed(2)}% confirms if the volume change is impacting market value.</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="shrink-0">•</span>
                        <span>Calculation uses a 14-day rolling window for seasonal normalization.</span>
                    </p>
                    <p className="mt-4 opacity-60 text-[10px] italic">
                        Note: Values are provided for statistical reference only.
                    </p>
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
