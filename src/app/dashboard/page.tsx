import { redirect } from 'next/navigation';

export default function NonLocalizedDashboardPage() {
  // Redirect to localized dashboard to avoid route conflicts
  redirect('/dashboard');
}
