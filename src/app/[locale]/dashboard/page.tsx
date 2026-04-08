
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
import { Link } from '@/i18n/routing';
import {
  ArrowRight,
  Users,
  Bug,
  TrendingUp,
  CloudSun,
  Bot,
  Store,
  Sprout,
  BarChart3,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  SearchX
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useEffect, useState } from 'react';
import { useSearch } from '@/context/search-provider';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const { searchTerm } = useSearch();
  const t = useTranslations('Dashboard');
  const navT = useTranslations('Navigation');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    return () => clearInterval(timer);
  }, []);

  const allAiTools = useMemo(() => [
    {
      title: navT('price-prediction'),
      description: t('descriptions.price-prediction'),
      href: '/price-prediction',
      icon: <TrendingUp className="w-10 h-10 text-primary" />,
      color: "bg-primary/10",
      featured: true,
    },
    {
      title: navT('disease-diagnosis'),
      description: t('descriptions.disease-diagnosis'),
      href: '/disease-diagnosis',
      icon: <Bug className="w-10 h-10 text-accent" />,
      color: "bg-accent/10",
      featured: true,
    },
    {
      title: navT('crop-recommendation'),
      description: t('descriptions.crop-recommendation'),
      href: '/crop-recommendation',
      icon: <Sprout className="w-8 h-8 text-green-600" />,
      color: "bg-green-100",
      featured: false,
    },
    {
      title: navT('weather-prediction'),
      description: t('descriptions.weather-prediction'),
      href: '/weather-prediction',
      icon: <CloudSun className="w-8 h-8 text-blue-500" />,
      color: "bg-blue-100",
      featured: false,
    },
    {
      title: navT('demand-supply'),
      description: t('descriptions.demand-supply'),
      href: '/demand-supply',
      icon: <BarChart3 className="w-8 h-8 text-orange-500" />,
      color: "bg-orange-100",
      featured: false,
    },
  ], [navT, t]);

  const allPlatformFeatures = useMemo(() => [
    {
      title: navT('marketplace'),
      description: t('descriptions.marketplace'),
      href: '/marketplace',
      icon: <Store className="w-8 h-8 text-primary" />,
      stats: "Verified Sellers",
    },
    {
      title: navT('community'),
      description: t('descriptions.community'),
      href: '/community',
      icon: <Users className="w-8 h-8 text-accent" />,
      stats: "Active Farmers",
    },
  ], [navT, t]);

  const filteredAiTools = useMemo(() => {
    if (!searchTerm) return allAiTools;
    return allAiTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allAiTools]);

  const filteredPlatformFeatures = useMemo(() => {
    if (!searchTerm) return allPlatformFeatures;
    return allPlatformFeatures.filter(
      (feature) =>
        feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allPlatformFeatures]);

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary/20 via-background to-background border p-8 md:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <Bot className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-primary px-3 py-1">
                <Sparkles className="w-3 h-3 mr-2" />
                AI-Powered Platform
            </Badge>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground ml-auto bg-background/50 px-3 py-1 rounded-full border">
                <Clock className="w-3 h-3" />
                {currentTime || "Loading..."}
                <Separator orientation="vertical" className="h-3 mx-1" />
                <CalendarIcon className="w-3 h-3" />
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>

          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {loading ? <Skeleton className="h-12 w-64" /> : (
                user?.displayName ? t('welcome', { name: user.displayName }) : t('welcome-generic')
            )}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* AI Insights Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
                <Bot className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-headline text-2xl font-bold tracking-tight">
              {t('ai-insights')}
            </h2>
          </div>
          {searchTerm && (
            <Badge variant="secondary" className="px-4 py-1">
                Showing results for "{searchTerm}"
            </Badge>
          )}
        </div>

        {filteredAiTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {filteredAiTools.map((feature, index) => (
              <Card
                key={feature.title}
                className={cn(
                    "group relative flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-primary/5",
                    feature.featured ? "lg:col-span-6" : "lg:col-span-4"
                )}
              >
                <div className={cn("absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full blur-3xl opacity-20", 
                    index % 2 === 0 ? "bg-primary" : "bg-accent"
                )} />
                
                <CardHeader className="relative flex flex-row items-start gap-5 pb-4">
                  <div className={cn("p-4 rounded-2xl shrink-0 transition-transform duration-500 group-hover:scale-110", feature.color)}>
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    {feature.featured && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Priority Tool</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative flex-grow">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="relative border-t bg-muted/20 py-4">
                  <Button
                    asChild
                    className="w-full shadow-md group-hover:shadow-lg transition-all"
                  >
                    <Link href={feature.href}>
                      {t('get-started')}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed rounded-3xl">
            <SearchX className="w-16 h-16 text-muted-foreground/50" />
            <div className="space-y-1">
                <h3 className="text-xl font-bold">{t('no-matching-ai')}</h3>
                <p className="text-muted-foreground">Try searching for something like "Weather" or "Prices"</p>
            </div>
          </div>
        )}
      </section>

      {/* Platform Features Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-accent/10">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            {t('community-commerce')}
          </h2>
        </div>
        
        {filteredPlatformFeatures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPlatformFeatures.map((feature) => (
                <Card
                key={feature.title}
                className="group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-accent/30"
                >
                <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="relative flex flex-row items-center gap-6">
                    <div className="p-5 rounded-full bg-background border-2 border-muted group-hover:border-accent group-hover:bg-accent/5 transition-all duration-500">
                        {feature.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                        <CardTitle className="font-headline text-2xl">
                            {feature.title}
                        </CardTitle>
                        <p className="text-xs font-bold text-accent uppercase tracking-widest">{feature.stats}</p>
                    </div>
                </CardHeader>
                <CardContent className="relative">
                    <CardDescription className="text-base min-h-[3rem]">
                        {feature.description}
                    </CardDescription>
                </CardContent>
                <CardFooter className="relative">
                    <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500"
                    >
                    <Link href={feature.href}>
                        {t('go-to', { feature: feature.title })}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
         ) : (
            <p className="text-muted-foreground text-center py-10 bg-muted/20 rounded-3xl border-2 border-dashed">{t('no-matching-platform')}</p>
         )}
      </section>

      {/* Footer Info / Tip Section */}
      <div className="mt-4 p-6 rounded-3xl bg-primary text-primary-foreground shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 transition-transform hover:scale-[1.01]">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-md">
                <Sprout className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-lg">Pro Tip for Today</h4>
                <p className="text-sm opacity-90">Use the Crop Recommendation tool to optimize your planting schedule based on seasonal humidity.</p>
            </div>
        </div>
        <Button variant="secondary" size="lg" asChild className="shrink-0 font-bold">
            <Link href="/crop-recommendation">Try it now</Link>
        </Button>
      </div>
    </div>
  );
}
