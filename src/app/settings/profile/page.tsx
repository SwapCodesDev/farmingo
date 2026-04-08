
import { redirect } from 'next/navigation';

export default function NonLocalizedProfileSettingsPage() {
  // Redirect to localized profile settings. Middleware will handle the prefix.
  redirect('/settings/profile');
}
