
import { redirect } from 'next/navigation';

export default function NonLocalizedSettingsPage() {
  // Rely on middleware to handle locale detection or default to /en
  redirect('/en/settings/profile');
}
