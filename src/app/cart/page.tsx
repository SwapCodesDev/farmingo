
import { redirect } from 'next/navigation';

export default function NonLocalizedCartPage() {
  // Redirect to localized cart to avoid context provider errors during build
  redirect('/cart');
}
