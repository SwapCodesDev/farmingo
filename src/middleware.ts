
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  // 1. Root '/'
  // 2. Paths starting with locale prefix (en|hi|mr)
  // 3. Any other path that is NOT an asset, API, or system file
  matcher: [
    '/', 
    '/(hi|mr|en)/:path*', 
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
