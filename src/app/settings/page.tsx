import { redirect } from 'next/navigation';

// The default page for /settings should redirect to the profile settings.
export default function SettingsPage() {
  redirect('/settings/profile');
}
