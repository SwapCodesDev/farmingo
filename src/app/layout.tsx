
import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { UserProfileDialogProvider } from '@/context/user-profile-dialog-provider';
import { CartProvider } from '@/context/cart-provider';
import { SearchProvider } from '@/context/search-provider';

export const metadata: Metadata = {
  title: 'Farmingo: Grow Together',
  description:
    'An agriculture platform for farmers combining community, ecommerce, and ML-driven insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Noto+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <UserProfileDialogProvider>
              <CartProvider>
                <SearchProvider>
                  <AppLayout>{children}</AppLayout>
                </SearchProvider>
              </CartProvider>
            </UserProfileDialogProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
