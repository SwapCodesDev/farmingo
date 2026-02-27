
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Middleware handles language detection and redirection
  // This root page is a fallback that redirects to dashboard
  redirect('/dashboard');
}
