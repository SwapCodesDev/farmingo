'use client';

import { useMemo } from 'react';
import { Calendar, Leaf, Lightbulb, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

/**
 * Indian farming seasons:
 * - Kharif (June–October): Monsoon crops — rice, maize, cotton, sugarcane
 * - Rabi (November–February): Winter crops — wheat, barley, mustard, gram
 * - Zaid (March–May): Summer crops — watermelon, cucumber, moong
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 5 && month <= 9) return 'kharif';   // Jun–Oct
  if (month >= 10 || month <= 1) return 'rabi';     // Nov–Feb
  return 'zaid';                                     // Mar–May
}

const farmingTips = [
  'tip-1',
  'tip-2',
  'tip-3',
  'tip-4',
  'tip-5',
  'tip-6',
  'tip-7',
] as const;

function getTipOfTheDay(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return farmingTips[dayOfYear % farmingTips.length];
}

export function DashboardQuickStats() {
  const t = useTranslations('Dashboard');

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const season = getCurrentSeason();
  const tipKey = getTipOfTheDay();

  const stats = [
    {
      icon: Calendar,
      label: t('stats.today'),
      value: today,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      icon: Leaf,
      label: t('stats.season'),
      value: t(`stats.seasons.${season}`),
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      icon: Lightbulb,
      label: t('stats.tip'),
      value: t(`stats.tips.${tipKey}`),
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      icon: Cpu,
      label: t('stats.ai-tools'),
      value: t('stats.ai-tools-count'),
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            'group relative overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5',
            stat.borderColor,
            'bg-card'
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Decorative glow */}
          <div className={cn('absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40', stat.bg)} />

          <div className="relative flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
            <div className={cn('p-2 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0', stat.bg)}>
              <stat.icon className={cn('w-4 h-4 sm:w-5 sm:h-5', stat.color)} />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">
                {stat.label}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug line-clamp-2">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
