
'use client';

import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  ShoppingCart,
  Users,
  Bug,
  TrendingUp,
  CloudSun,
  Bot,
  Store,
  Search,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { useSearch } from '@/context/search-provider';

const allAiTools = [
  {
    title: 'Crop Price Prediction',
    description: 'Get AI-powered price forecasts for your crops.',
    href: '/price-prediction',
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    disabled: false,
  },
  {
    title: 'Crop Disease Diagnosis',
    description: 'Upload a photo to diagnose crop diseases instantly.',
    href: '/disease-diagnosis',
    icon: <Bug className="w-8 h-8 text-primary" />,
    disabled: false,
  },
  {
    title: 'Weather Prediction & Advice',
    description: 'Get forecasts and actionable farming tips for your location.',
    href: '/weather-prediction',
    icon: <CloudSun className="w-8 h-8 text-primary" />,
    disabled: false,
  },
];

const allPlatformFeatures = [
  {
    title: 'Marketplace',
    description: 'Buy and sell agricultural products directly.',
    href: '/marketplace',
    icon: <Store className="w-8 h-8 text-primary" />,
    disabled: false,
  },
  {
    title: 'Community Hub',
    description: 'Connect with fellow farmers and share knowledge.',
    href: '/community',
    icon: <Users className="w-8 h-8 text-primary" />,
    disabled: false,
  },
];

export default function DashboardPage() {
  const { user, loading } = useUser();
  const { searchTerm } = useSearch();

  const welcomeMessage = () => {
    if (loading) {
      return <Skeleton className="h-10 w-1/2" />;
    }
    if (user?.displayName) {
      return `Welcome, ${user.displayName}!`;
    }
    return 'Welcome, Farmer!';
  };

  const filteredAiTools = useMemo(() => {
    if (!searchTerm) return allAiTools;
    return allAiTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredPlatformFeatures = useMemo(() => {
    if (!searchTerm) return allPlatformFeatures;
    return allPlatformFeatures.filter(
      (feature) =>
        feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {welcomeMessage()}
        </h1>
        <p className="text-muted-foreground mt-2">
          Your all-in-one solution for modern farming. What would you like to do
          today?
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Bot className="w-8 h-8 text-accent" />
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            AI-Powered Insights
          </h2>
        </div>
        <Separator />
        {filteredAiTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAiTools.map((feature) => (
              <Card
                key={feature.title}
                className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  {feature.icon}
                  <div className="flex-1">
                    <CardTitle className="font-headline text-xl">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    variant={feature.disabled ? 'secondary' : 'default'}
                    disabled={feature.disabled}
                  >
                    <Link href={feature.href}>
                      {feature.disabled ? 'Coming Soon' : 'Get Started'}{' '}
                      {!feature.disabled && (
                        <ArrowRight className="ml-2 h-4 w-4" />
                      )}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No matching AI tools found.</p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-accent" />
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            Community & Commerce
          </h2>
        </div>
        <Separator />
         {filteredPlatformFeatures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPlatformFeatures.map((feature) => (
                <Card
                key={feature.title}
                className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <div className="flex-1">
                    <CardTitle className="font-headline text-xl">
                        {feature.title}
                    </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription>{feature.description}</CardDescription>
                </CardContent>
                <CardFooter>
                    <Button
                    asChild
                    className="w-full"
                    variant={feature.disabled ? 'secondary' : 'default'}
                    disabled={feature.disabled}
                    >
                    <Link href={feature.href}>
                        {feature.disabled ? 'Coming Soon' : 'Go to ' + feature.title}
                        {!feature.disabled && (
                        <ArrowRight className="ml-2 h-4 w-4" />
                        )}
                    </Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
         ) : (
            <p className="text-muted-foreground text-center py-4">No matching platform features found.</p>
         )}
      </section>
    </div>
  );
}
