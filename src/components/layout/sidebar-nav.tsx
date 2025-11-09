
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
  TrendingUp,
  User,
  UserPlus,
  Users,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const mainNav = [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];

const aiToolsNav = [
  { href: '/price-prediction', label: 'Price Prediction', icon: TrendingUp },
  { href: '/disease-diagnosis', label: 'Disease Diagnosis', icon: Bug },
  { href: '/weather-prediction', label: 'Weather Prediction', icon: CloudSun },
];

const platformNav = [
  {
    href: '/marketplace',
    label: 'Marketplace',
    icon: ShoppingCart,
    disabled: false,
    requiresAuth: true,
  },
  {
    href: '/community',
    label: 'Community',
    icon: Users,
    disabled: false,
    requiresAuth: true,
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: MessageSquare,
    disabled: false,
    requiresAuth: true,
  },
];

const userNav = [
  { href: '/profile', label: 'Profile', icon: User, disabled: false, requiresAuth: true },
  { href: '/settings', label: 'Settings', icon: Settings, disabled: false, requiresAuth: true },
];

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

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      // Redirect to home or login page after logout
      window.location.href = '/';
    }
  };

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
          {mainNav.map(item => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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

        <NavCategory title="AI Tools" items={aiToolsNav} user={user} pathname={pathname} />
        <NavCategory title="Platform" items={platformNav} user={user} pathname={pathname} />
        <NavCategory title="Account" items={userNav} user={user} pathname={pathname} />

      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/login'} tooltip="Login">
                  <Link href="/login">
                    <LogIn />
                    <span>Login</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/signup'} tooltip="Sign up">
                  <Link href="/signup">
                    <UserPlus />
                    <span>Sign up</span>
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
