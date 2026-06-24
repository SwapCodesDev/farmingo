'use client';

import { Camera, CloudSun, TrendingUp, Sprout, Store, MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function DashboardQuickActions() {
  const t = useTranslations('Dashboard');

  const actions = [
    {
      icon: Camera,
      label: t('quick-actions.scan-crop'),
      href: '/disease-diagnosis',
      gradient: 'from-rose-500/10 to-orange-500/10',
      hoverGradient: 'hover:from-rose-500/20 hover:to-orange-500/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      borderColor: 'border-rose-500/20 hover:border-rose-500/40',
    },
    {
      icon: CloudSun,
      label: t('quick-actions.check-weather'),
      href: '/weather-prediction',
      gradient: 'from-sky-500/10 to-blue-500/10',
      hoverGradient: 'hover:from-sky-500/20 hover:to-blue-500/20',
      iconColor: 'text-sky-600 dark:text-sky-400',
      borderColor: 'border-sky-500/20 hover:border-sky-500/40',
    },
    {
      icon: TrendingUp,
      label: t('quick-actions.market-prices'),
      href: '/price-prediction',
      gradient: 'from-emerald-500/10 to-green-500/10',
      hoverGradient: 'hover:from-emerald-500/20 hover:to-green-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    },
    {
      icon: Sprout,
      label: t('quick-actions.crop-advice'),
      href: '/crop-recommendation',
      gradient: 'from-lime-500/10 to-green-500/10',
      hoverGradient: 'hover:from-lime-500/20 hover:to-green-500/20',
      iconColor: 'text-lime-600 dark:text-lime-400',
      borderColor: 'border-lime-500/20 hover:border-lime-500/40',
    },
    {
      icon: Store,
      label: t('quick-actions.marketplace'),
      href: '/marketplace',
      gradient: 'from-violet-500/10 to-purple-500/10',
      hoverGradient: 'hover:from-violet-500/20 hover:to-purple-500/20',
      iconColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-500/20 hover:border-violet-500/40',
    },
    {
      icon: MessageCircle,
      label: t('quick-actions.community'),
      href: '/community',
      gradient: 'from-amber-500/10 to-yellow-500/10',
      hoverGradient: 'hover:from-amber-500/20 hover:to-yellow-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/40',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 sm:flex-nowrap sm:overflow-x-auto sm:pb-2 sm:scrollbar-none sm:-mx-1 sm:px-1">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            'group flex items-center gap-1.5 sm:gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border whitespace-nowrap',
            'bg-gradient-to-r transition-all duration-300',
            'hover:shadow-md hover:scale-[1.03] active:scale-[0.98]',
            action.gradient,
            action.hoverGradient,
            action.borderColor
          )}
        >
          <action.icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110', action.iconColor)} />
          <span className="text-xs sm:text-sm font-semibold text-foreground">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
