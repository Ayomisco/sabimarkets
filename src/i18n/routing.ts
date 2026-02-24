import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: [
    'en',   // English
    'pcm',  // Nigerian Pidgin
    'yo',   // Yoruba
    'ha',   // Hausa
    'ig',   // Igbo
    'sw',   // Swahili (Kenya, Tanzania, Uganda)
    'am',   // Amharic (Ethiopia)
    'ar',   // Arabic (North Africa)
    'fr',   // French (West & Central Africa)
    'pt',   // Portuguese (Angola, Mozambique, Cape Verde)
    'zu',   // Zulu (South Africa)
    'xh',   // Xhosa (South Africa)
    'so',   // Somali
    'rw',   // Kinyarwanda (Rwanda)
    'tw',   // Twi (Ghana)
    'lg',   // Luganda (Uganda)
  ],
  defaultLocale: 'en'
});

export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
