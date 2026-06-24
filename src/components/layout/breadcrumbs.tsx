'use client';

import { Link, usePathname } from '@/i18n/routing';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import { useTranslations } from 'next-intl';

const KNOWN_KEYS = [
  'dashboard',
  'price-prediction',
  'disease-diagnosis',
  'crop-recommendation',
  'weather-prediction',
  'demand-supply',
  'marketplace',
  'community',
  'messages',
  'profile',
  'settings',
  'login',
  'signup'
];

export function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  // Split pathname into segments, ignoring empty parts
  const segments = pathname.split('/').filter(Boolean);

  // If we're on the welcome root page, don't show breadcrumbs
  if (pathname === '/') {
    return null;
  }

  // Determine if the first segment is dashboard
  const startsWithDashboard = segments[0] === 'dashboard';

  // Build the breadcrumb items
  const items: { label: string; href: string; isLast: boolean }[] = [];

  // Always start with Dashboard as the root if we are inside dashboard or any tool page
  if (!startsWithDashboard) {
    items.push({
      label: t('dashboard'),
      href: '/dashboard',
      isLast: false,
    });
  }

  // Add the pathname segments
  let currentHref = '';
  segments.forEach((segment, index) => {
    // Skip dashboard if it was already prepended
    if (segment === 'dashboard' && index === 0 && !startsWithDashboard) {
      return;
    }

    currentHref += `/${segment}`;
    const isLast = index === segments.length - 1;

    let label = segment;
    if (KNOWN_KEYS.includes(segment)) {
      label = t(segment);
    } else {
      // Fallback formatting: capitalize and replace hyphens/underscores
      label = segment
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    items.push({
      label,
      href: currentHref,
      isLast,
    });
  });

  return (
    <nav aria-label="Breadcrumbs" className="hidden md:flex items-center text-sm text-muted-foreground">
      <ol className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.href} className="flex items-center gap-1.5 sm:gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
              {isLast ? (
                <span className="font-medium text-foreground flex items-center gap-1">
                  {isFirst && <LayoutDashboard className="h-3.5 w-3.5" />}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {isFirst && <LayoutDashboard className="h-3.5 w-3.5" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
