import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|pcm|yo|ha|ig|sw|am|ar|fr|pt|zu|xh|so|rw|tw|lg)/:path*']
};
