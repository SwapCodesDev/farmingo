
'use client';
import { usePathname, useRouter } from '@/i18n/routing';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Header } from './header';
import { SidebarNav } from './sidebar-nav';
import { Loader2 } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();

  const publicPages = ['/', '/login', '/signup'];
  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicPage) {
        // If not logged in and trying to access a private page, redirect to the welcome page
        router.replace('/');
      } else if (user && (pathname === '/login' || pathname === '/signup')) {
        // If already logged in and trying to access auth pages, redirect to dashboard
        router.replace('/dashboard');
      }
    }
  }, [user, loading, isPublicPage, pathname, router]);

  // While auth status is being determined for a protected route, show a full-screen loading state
  if (loading && !isPublicPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Public pages (root welcome, login, signup) are rendered directly without the sidebar layout
  if (isPublicPage) {
    return <>{children}</>;
  }

  // If user is not present and it's a private page, the redirect in useEffect will handle it.
  // We return null to prevent any flickering of protected content.
  if (!user) {
    return null;
  }

  // Authenticated layout with Sidebar and Header
  return (
    <SidebarProvider>
      <Sidebar className="border-r" collapsible="icon">
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
