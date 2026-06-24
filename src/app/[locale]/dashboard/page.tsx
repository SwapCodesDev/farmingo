
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
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Zap,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardSkeleton } from '@/components/features/shared/skeletons';
import { useMemo } from 'react';
import { useSearch } from '@/context/search-provider';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DashboardWeatherWidget } from '@/components/features/dashboard/dashboard-weather-widget';
import { DashboardLiveFeed } from '@/components/features/dashboard/dashboard-live-feed';
import { DashboardQuickStats } from '@/components/features/dashboard/dashboard-quick-stats';
import { DashboardQuickActions } from '@/components/features/dashboard/dashboard-quick-actions';
import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images';

function getTimeOfDay(): { key: string; Icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { key: 'morning', Icon: Sunrise };
  if (hour >= 12 && hour < 17) return { key: 'afternoon', Icon: Sun };
  if (hour >= 17 && hour < 21) return { key: 'evening', Icon: Sunset };
  return { key: 'night', Icon: Moon };
}

// Unique gradient configurations per tool card
const toolGradients = [
  { border: 'from-emerald-500/40 via-green-500/20 to-transparent', glow: 'bg-emerald-500' },
  { border: 'from-rose-500/40 via-pink-500/20 to-transparent', glow: 'bg-rose-500' },
  { border: 'from-green-500/40 via-lime-500/20 to-transparent', glow: 'bg-green-500' },
  { border: 'from-sky-500/40 via-blue-500/20 to-transparent', glow: 'bg-sky-500' },
  { border: 'from-amber-500/40 via-orange-500/20 to-transparent', glow: 'bg-amber-500' },
];

export default function DashboardPage() {
  const { user, loading } = useUser();
  const { searchTerm } = useSearch();
  const t = useTranslations('Dashboard');
  const navT = useTranslations('Navigation');

  const heroBg = useMemo(() => 
    placeholderImages.find(img => img.id === 'dashboard-welcome-bg')?.imageUrl || "https://picsum.photos/seed/plant/1080/600",
  []);

  const timeOfDay = useMemo(() => getTimeOfDay(), []);

  const allAiTools = useMemo(() => [
    {
      title: navT('price-prediction'),
      description: t('descriptions.price-prediction'),
      href: '/price-prediction',
      icon: <TrendingUp className="w-7 h-7" />,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      featured: true,
    },
    {
      title: navT('disease-diagnosis'),
      description: t('descriptions.disease-diagnosis'),
      href: '/disease-diagnosis',
      icon: <Bug className="w-7 h-7" />,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      featured: true,
    },
    {
      title: navT('crop-recommendation'),
      description: t('descriptions.crop-recommendation'),
      href: '/crop-recommendation',
      icon: <Sprout className="w-7 h-7" />,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-500/10",
      featured: false,
    },
    {
      title: navT('weather-prediction'),
      description: t('descriptions.weather-prediction'),
      href: '/weather-prediction',
      icon: <CloudSun className="w-7 h-7" />,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
      featured: false,
    },
    {
      title: navT('demand-supply'),
      description: t('descriptions.demand-supply'),
      href: '/demand-supply',
      icon: <BarChart3 className="w-7 h-7" />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  const TimeIcon = timeOfDay.Icon;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* ═══════════════ Hero Header ═══════════════ */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/10 p-5 sm:p-8 md:p-10 shadow-sm">
        {/* Decorative background elements */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03] pointer-events-none" />
        
        {/* Faded Plant Background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.07] pointer-events-none overflow-hidden select-none">
            <Image 
              src={heroBg}
              alt="Agricultural background"
              fill
              className="object-cover object-right-top grayscale contrast-125"
              priority
              data-ai-hint="green plant"
            />
        </div>
        
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-background/60 backdrop-blur-sm border-primary/20 text-primary px-3 py-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    {t('powered-by-ai')}
                </Badge>
            </div>
            <DashboardWeatherWidget />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-primary/10">
                <TimeIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t(`greeting.${timeOfDay.key}`)}
              </span>
            </div>
            <h1 className="font-headline text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {loading ? <Skeleton className="h-12 w-64" /> : (
                    user?.displayName ? t('welcome', { name: user.displayName.split(' ')[0] }) : t('welcome-generic')
                )}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════ Quick Stats ═══════════════ */}
      <DashboardQuickStats />

      {/* ═══════════════ Quick Actions ═══════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-headline text-lg font-bold tracking-tight">{t('quick-actions-title')}</h2>
        </div>
        <DashboardQuickActions />
      </section>

      {/* ═══════════════ Live Data Feed ═══════════════ */}
      <section className="space-y-6">
        <DashboardLiveFeed />
      </section>

      {/* ═══════════════ AI Insights Section ═══════════════ */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10">
                <Bot className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight">
                {t('ai-insights')}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t('ai-insights-desc')}</p>
            </div>
          </div>
          {searchTerm && (
            <Badge variant="secondary" className="px-4 py-1">
                Results for &quot;{searchTerm}&quot;
            </Badge>
          )}
        </div>

        {filteredAiTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            {filteredAiTools.map((feature, index) => {
              const gradient = toolGradients[index % toolGradients.length];
              return (
                <Card
                  key={feature.title}
                  className={cn(
                      "group relative flex flex-col overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5 border-transparent rounded-2xl md:rounded-3xl",
                      feature.featured ? "lg:col-span-6" : "lg:col-span-4"
                  )}
                  style={{
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Gradient top border */}
                  <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", gradient.border)} />

                  {/* Corner glow */}
                  <div className={cn("absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500", gradient.glow)} />

                  {/* Hover shimmer overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                  
                  <CardHeader className="relative flex flex-row items-start gap-4 pb-3">
                    <div className={cn("p-3.5 rounded-2xl shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg flex items-center justify-center", feature.bg)}>
                      <div className={feature.color}>
                        {feature.icon}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                      {feature.featured && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[11px]">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {t('priority-analysis')}
                          </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex-grow">
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="relative border-t border-border/50 bg-muted/10 py-3.5">
                    <Button
                      asChild
                      className="w-full shadow-sm group-hover:shadow-md transition-all rounded-xl h-10"
                    >
                      <Link href={feature.href}>
                        {t('get-started')}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed rounded-3xl bg-muted/5">
            <SearchX className="w-14 h-14 text-muted-foreground/40" />
            <div className="space-y-1">
                <h3 className="text-xl font-bold">{t('no-matching-ai')}</h3>
                <p className="text-muted-foreground">Try searching for &quot;Market&quot; or &quot;Crops&quot;</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
