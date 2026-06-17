'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  MessageSquare,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const navItems = [
    {
      href: '/dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
    },
    {
      href: '/marketplace',
      label: t('marketplace'),
      icon: ShoppingCart,
    },
    {
      href: '/community',
      label: t('community'),
      icon: Users,
    },
    {
      href: '/messages',
      label: t('messages'),
      icon: MessageSquare,
    },
    {
      href: '/profile',
      label: t('profile'),
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden h-16 shadow-lg safe-bottom">
      <div className="grid h-full grid-cols-5 items-center justify-items-center">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-[10px] font-medium gap-1 transition-colors",
                isActive 
                  ? "text-primary font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
