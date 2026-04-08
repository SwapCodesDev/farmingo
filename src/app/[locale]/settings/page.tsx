
import { redirect } from 'next/navigation';

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Use explicit localized redirect to avoid routing ambiguity
  redirect(`/${locale}/settings/profile`);
}
