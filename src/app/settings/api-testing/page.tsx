'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { testApi } from '@/app/actions/test-api';

const formSchema = z.object({
  crop: z.string().min(1, 'Crop is required.'),
  region: z.string().min(1, 'Region is required.'),
  date: z.string().min(1, 'Date is required (YYYY-MM-DD).'),
});

export default function ApiTestingPage() {
  const [response, setResponse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop: 'Wheat',
      region: 'North',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const currentValues = form.watch();
  const curlCommand = `curl -X POST "${window.location.origin}/api/genkit/flows/predictCropPriceFlow" \\
     -H "Content-Type: application/json" \\
     -d '${JSON.stringify({ input: { ...currentValues, variety: '' }})}'`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await testApi(values);
      setResponse(result);
      toast({
        title: 'API Request Sent',
        description: 'Received a response from the server.',
      });
    } catch (error: any) {
      setResponse({ error: error.message });
      toast({
        variant: 'destructive',
        title: 'API Request Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">API Testing</h3>
        <p className="text-sm text-muted-foreground">
          Use this page to test the available API endpoints.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>POST /crop_price</CardTitle>
          <CardDescription>
            Predicts the price of a crop based on region and date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
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
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY-MM-DD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Execute
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">cURL Command</h4>
          <pre className="mt-2 w-full text-sm bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
            <code>{curlCommand}</code>
          </pre>
        </div>

        {response && (
          <div>
            <h4 className="font-semibold">Server Response</h4>
            <pre className="mt-2 w-full text-sm bg-muted text-muted-foreground p-4 rounded-md overflow-x-auto">
              <code>{JSON.stringify(response, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
