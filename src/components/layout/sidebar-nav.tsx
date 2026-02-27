
'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  Bug,
  ChevronDown,
  CloudSun,
  LayoutDashboard,
  Leaf,
  LogIn,
  LogOut,
  MessageSquare,
  ShoppingCart,
  Sprout,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Settings
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type NavCategoryProps = {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
    requiresAuth?: boolean;
  }[];
  user: any;
  pathname: string;
};

function NavCategory({ title, items, user, pathname }: NavCategoryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const filteredItems = items.filter(item => !item.requiresAuth || user);

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-semibold text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:hidden">
        {title}
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen ? 'rotate-0' : '-rotate-90'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          {filteredItems.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                disabled={item.disabled}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </CollapsibleContent>
       {/* Render icons only when collapsed */}
       <div className="hidden group-data-[collapsible=icon]:block">
          <SidebarMenu>
            {filteredItems.map(item => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/')}
                  disabled={item.disabled}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
    </Collapsible>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const t = useTranslations('Navigation');

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      // Redirect to home or login page after logout
      window.location.href = '/';
    }
  };

  const aiToolsNav = [
    { href: '/price-prediction', label: t('price-prediction'), icon: TrendingUp },
    { href: '/disease-diagnosis', label: t('disease-diagnosis'), icon: Bug },
    { href: '/crop-recommendation', label: t('crop-recommendation'), icon: Sprout },
    { href: '/weather-prediction', label: t('weather-prediction'), icon: CloudSun },
  ];

  const platformNav = [
    {
      href: '/marketplace',
      label: t('marketplace'),
      icon: ShoppingCart,
      disabled: false,
      requiresAuth: true,
    },
    {
      href: '/community',
      label: t('community'),
      icon: Users,
      disabled: false,
      requiresAuth: true,
    },
    {
      href: '/messages',
      label: t('messages'),
      icon: MessageSquare,
      disabled: false,
      requiresAuth: true,
    },
  ];

  const userNav = [
    { href: '/profile', label: t('profile'), icon: User, disabled: false, requiresAuth: true },
    { href: '/settings', label: t('settings'), icon: Settings, disabled: false, requiresAuth: true },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Leaf className="w-8 h-8 text-primary" />
          <span className="font-headline text-xl font-bold group-data-[collapsible=icon]:hidden">Farmingo</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard'}
              tooltip={t('dashboard')}
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>{t('dashboard')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <NavCategory title={t('ai-tools')} items={aiToolsNav} user={user} pathname={pathname} />
        <NavCategory title={t('platform')} items={platformNav} user={user} pathname={pathname} />
        <NavCategory title={t('account')} items={userNav} user={user} pathname={pathname} />

      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={t('logout')}>
                <LogOut />
                <span>{t('logout')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/login'} tooltip={t('login')}>
                  <Link href="/login">
                    <LogIn />
                    <span>{t('login')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/signup'} tooltip={t('signup')}>
                  <Link href="/signup">
                    <UserPlus />
                    <span>{t('signup')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
