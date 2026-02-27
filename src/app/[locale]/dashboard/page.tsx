
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
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { useSearch } from '@/context/search-provider';
import { useTranslations } from 'next-intl';

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
      disabled: false,
    },
    {
      title: navT('disease-diagnosis'),
      description: t('descriptions.disease-diagnosis'),
      href: '/disease-diagnosis',
      icon: <Bug className="w-8 h-8 text-primary" />,
      disabled: false,
    },
    {
      title: navT('crop-recommendation'),
      description: t('descriptions.crop-recommendation'),
      href: '/crop-recommendation',
      icon: <Sprout className="w-8 h-8 text-primary" />,
      disabled: false,
    },
    {
      title: navT('weather-prediction'),
      description: t('descriptions.weather-prediction'),
      href: '/weather-prediction',
      icon: <CloudSun className="w-8 h-8 text-primary" />,
      disabled: false,
    },
  ], [navT, t]);

  const allPlatformFeatures = useMemo(() => [
    {
      title: navT('marketplace'),
      description: t('descriptions.marketplace'),
      href: '/marketplace',
      icon: <Store className="w-8 h-8 text-primary" />,
      disabled: false,
    },
    {
      title: navT('community'),
      description: t('descriptions.community'),
      href: '/community',
      icon: <Users className="w-8 h-8 text-primary" />,
      disabled: false,
    },
  ], [navT, t]);

  const welcomeMessage = () => {
    if (loading) {
      return <Skeleton className="h-10 w-1/2" />;
    }
    if (user?.displayName) {
      return t('welcome', { name: user.displayName });
    }
    return t('welcome-generic');
  };

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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
          {welcomeMessage()}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Bot className="w-8 h-8 text-accent" />
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            {t('ai-insights')}
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
                      {feature.disabled ? t('coming-soon') : t('get-started')}{' '}
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
          <p className="text-muted-foreground text-center py-4">{t('no-matching-ai')}</p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-accent" />
          <h2 className="font-headline text-2xl font-bold tracking-tight">
            {t('community-commerce')}
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
                        {feature.disabled ? t('coming-soon') : t('go-to', { feature: feature.title })}
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
            <p className="text-muted-foreground text-center py-4">{t('no-matching-platform')}</p>
         )}
      </section>
    </div>
  );
}
