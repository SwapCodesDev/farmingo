import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { UserProfileDialogProvider } from '@/context/user-profile-dialog-provider';
import { CartProvider } from '@/context/cart-provider';
import { SearchProvider } from '@/context/search-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
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
    </NextIntlClientProvider>
  );
}
