
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
  Bug,
  TrendingUp,
  CloudSun,
  Bot,
  Sprout,
  BarChart3,
  Sparkles,
  SearchX,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { useSearch } from '@/context/search-provider';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DashboardWeatherWidget } from '@/components/features/dashboard-weather-widget';
import { DashboardLiveFeed } from '@/components/features/dashboard-live-feed';

export default function DashboardPage() {
  const { user, loading } = useUser();
  const { searchTerm } = useSearch();
  const t = useTranslations('Dashboard');
  const navT = useTranslations('Navigation');

  const allAiTools = useMemo(() => [
    {
      title: navT('price-prediction'),
      description: t('descriptions.price-prediction'),
      href: '/price-prediction',
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      color: "bg-primary/10",
      featured: true,
    },
    {
      title: navT('disease-diagnosis'),
      description: t('descriptions.disease-diagnosis'),
      href: '/disease-diagnosis',
      icon: <Bug className="w-8 h-8 text-accent" />,
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

  const filteredAiTools = useMemo(() => {
    if (!searchTerm) return allAiTools;
    return allAiTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allAiTools]);

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-r from-primary/20 via-background to-background border p-8 md:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5">
            <Bot className="w-96 h-96 rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-primary px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-2" />
                    Powered by AI
                </Badge>
            </div>
            <DashboardWeatherWidget />
          </div>

          <div className="space-y-2">
            <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
                {loading ? <Skeleton className="h-12 w-64" /> : (
                    user?.displayName ? t('welcome', { name: user.displayName.split(' ')[0] }) : t('welcome-generic')
                )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Live Data Feed Section */}
      <section className="space-y-6">
        <DashboardLiveFeed />
      </section>

      {/* AI Insights Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-accent/10">
                <Bot className="w-6 h-6 text-accent" />
            </div>
            <h2 className="font-headline text-2xl font-bold tracking-tight">
              {t('ai-insights')}
            </h2>
          </div>
          {searchTerm && (
            <Badge variant="secondary" className="px-4 py-1">
                Results for "{searchTerm}"
            </Badge>
          )}
        </div>

        {filteredAiTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {filteredAiTools.map((feature, index) => (
              <Card
                key={feature.title}
                className={cn(
                    "group relative flex flex-col overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-primary/5 rounded-[2rem]",
                    feature.featured ? "lg:col-span-6" : "lg:col-span-4"
                )}
              >
                <div className={cn("absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full blur-3xl opacity-20", 
                    index % 2 === 0 ? "bg-primary" : "bg-accent"
                )} />
                
                <CardHeader className="relative flex flex-row items-start gap-5 pb-4">
                  <div className={cn("p-4 rounded-2xl shrink-0 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center", feature.color)}>
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    {feature.featured && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Priority Analysis</Badge>
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
                    className="w-full shadow-md group-hover:shadow-lg transition-all rounded-xl"
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
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed rounded-[3rem]">
            <SearchX className="w-16 h-16 text-muted-foreground/50" />
            <div className="space-y-1">
                <h3 className="text-xl font-bold">{t('no-matching-ai')}</h3>
                <p className="text-muted-foreground">Try searching for "Market" or "Crops"</p>
            </div>
          </div>
        )}
      </section>

      {/* Footer Pro Tip */}
      <div className="p-8 rounded-[3rem] bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="flex items-center gap-6 text-left">
            <div className="p-5 bg-white/20 rounded-[2rem] backdrop-blur-xl group-hover:rotate-12 transition-transform duration-500">
                <Sprout className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
                <h4 className="font-black text-2xl uppercase tracking-tighter">Agricultural Optimizer</h4>
                <p className="text-primary-foreground/80 max-w-md">Use the Crop Recommendation tool to find the perfect variety for your soil moisture today.</p>
            </div>
        </div>
        <Button variant="secondary" size="lg" asChild className="shrink-0 font-bold px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">
            <Link href="/crop-recommendation">Launch Optimizer</Link>
        </Button>
      </div>
    </div>
  );
}
