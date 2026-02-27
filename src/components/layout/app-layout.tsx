'use client';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Header } from './header';
import { SidebarNav } from './sidebar-nav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutPages = ['/', '/login', '/signup', '/welcome'];

  if (noLayoutPages.includes(pathname)) {
    return <>{children}</>;
  }

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
