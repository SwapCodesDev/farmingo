
'use client';

import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export function SettingsNav() {
  const pathname = usePathname();
  const t = useTranslations('Settings');

  const sidebarNavItems = [
    {
      title: t('profile'),
      href: '/settings/profile',
    },
    {
      title: t('privacy'),
      href: '/settings/privacy',
    },
    {
      title: t('appearance'),
      href: '/settings/appearance',
    },
    {
      title: t('notifications'),
      href: '/settings/notifications',
    },
    {
      title: t('translation'),
      href: '/settings/translation',
    },
  ];

  return (
    <nav className="flex space-x-2 overflow-x-auto pb-1 lg:flex-col lg:space-x-0 lg:space-y-1 lg:overflow-x-visible lg:pb-0">
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start shrink-0'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}

