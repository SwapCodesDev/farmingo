
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
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { Bell, LogOut, Search, User as UserIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { ThemeToggle } from './theme-toggle';
import LanguageSwitcher from './LanguageSwitcher';
import { usePathname, useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { useSearch } from '@/context/search-provider';
import { useState } from 'react';

export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { searchTerm, setSearchTerm } = useSearch();

  // State for the community search bar
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
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
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger />

      {showDashboardSearch && (
         <div className="relative flex-1">
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
        <form onSubmit={handleCommunitySearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search community..."
                className="pl-9"
                value={communitySearchQuery}
                onChange={(e) => setCommunitySearchQuery(e.target.value)}
            />
        </form>
      )}

      {!showDashboardSearch && !showCommunitySearch && (
        <div className="flex-1" />
      )}


      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
        {user && (
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        )}

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
                <p>My Account</p>
                <p className="text-xs text-muted-foreground font-normal overflow-hidden text-ellipsis">
                  {user.displayName || user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
