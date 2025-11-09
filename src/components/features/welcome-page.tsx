'use client';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="max-w-2xl">
        <div className="flex justify-center items-center gap-4 mb-6">
          <Leaf className="w-16 h-16 text-primary" />
          <h1 className="font-headline text-6xl font-bold tracking-tight">
            Farmingo
          </h1>
        </div>
        <p className="font-headline text-2xl text-muted-foreground mb-10">
          Your all-in-one platform for modern farming.
        </p>
        <div className="space-y-4">
          <p className="text-lg">
            Get AI-powered crop insights, connect with a community of farmers, and trade on our exclusive marketplace.
          </p>
          <div className="flex justify-center gap-4 pt-6">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
