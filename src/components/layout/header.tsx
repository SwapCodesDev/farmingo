
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { Bell, LogOut, Search, User as UserIcon, Settings, Sun, Moon, Languages } from 'lucide-react';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { signOut } from 'firebase/auth';
import { ThemeToggle } from './theme-toggle';
import LanguageSwitcher from './language-switcher';
import NotificationDropdown from './notification-dropdown';
import { Input } from '../ui/input';
import { Breadcrumbs } from './breadcrumbs';
import { useSearch } from '@/context/search-provider';
import { useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LogoutDialog } from './logout-dialog';
import { useTheme } from 'next-themes';

export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { searchTerm, setSearchTerm } = useSearch();
  const t = useTranslations('Navigation');
  const tSettings = useTranslations('Settings');
  const locale = useLocale();
  const { setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  // State for the community search bar
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const changeLanguage = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.replace('/');
    }
  };

  const handleCommunitySearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (communitySearchQuery.trim()) {
      router.push(`/community/search?q=${encodeURIComponent(communitySearchQuery)}`);
    }
  };

  // Show dashboard search bar on the dashboard page
  const showDashboardSearch = pathname === '/dashboard';
  // Show community search bar on any community-related page
  const showCommunitySearch = pathname.startsWith('/community') || pathname.startsWith('/c/');

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6 transition-all duration-300">
      <SidebarTrigger />
      <Breadcrumbs />

      <div className="flex-1" />

      {showDashboardSearch && (
         <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dashboard features..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {showCommunitySearch && (
        <form onSubmit={handleCommunitySearch} className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search community..."
                className="pl-9"
                value={communitySearchQuery}
                onChange={(e) => setCommunitySearchQuery(e.target.value)}
            />
        </form>
      )}


      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        {user && <NotificationDropdown />}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>
                    {user.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user.email
                      ? user.email.charAt(0).toUpperCase()
                      : '?'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <p>{t('account')}</p>
                <p className="text-xs text-muted-foreground font-normal overflow-hidden text-ellipsis">
                  {user.displayName || user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="h-4 w-4" />
                  <span>{t('profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  <span>{t('settings')}</span>
                </Link>
              </DropdownMenuItem>

              {/* Mobile-only Theme Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="sm:hidden">
                  <div className="relative h-4 w-4 shrink-0">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </div>
                  <span>{tSettings('theme') || 'Theme'}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      {tSettings('theme-light') || 'Light'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      {tSettings('theme-dark') || 'Dark'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      {tSettings('theme-system') || 'System'}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Mobile-only Language Submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="sm:hidden">
                  <Languages />
                  <span>Language</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => changeLanguage('en')} disabled={locale === 'en'}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('hi')} disabled={locale === 'hi'}>
                      हिन्दी (Hindi)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('mr')} disabled={locale === 'mr'}>
                      मराठी (Marathi)
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator className="sm:hidden" />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLogoutDialogOpen(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">{t('login')}</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">{t('signup')}</Link>
            </Button>
          </div>
        )}
      </div>
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </header>
  );
}
