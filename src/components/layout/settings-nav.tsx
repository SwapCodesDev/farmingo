'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
  },
  {
    title: 'Translation',
    href: '/settings/translation',
  },
  {
    title: 'My Orders',
    href: '/settings/orders',
  },
  {
    title: 'Crop Price Prediction',
    href: '/settings/price-prediction',
  },
  {
    title: 'Disease Prediction',
    href: '/settings/disease-prediction',
  },
  {
    title: 'Crop Recommendation',
    href: '/settings/crop-recommendation',
  },
  {
    title: 'API Testing',
    href: '/settings/api-testing',
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
