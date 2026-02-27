
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function OrderPlacedPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="mt-4 font-headline text-3xl">Order Placed!</CardTitle>
          <CardDescription className="mt-2">
            Thank you for your purchase. Your order has been successfully submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You will receive a confirmation email shortly. This is a demo app, so no real order has been processed.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/marketplace">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
