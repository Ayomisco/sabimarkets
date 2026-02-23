"use client";

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value as any });
  };

  return (
    <div className="relative inline-block text-left font-mono">
      <select 
        value={locale} 
        onChange={handleSwitch}
        className="bg-black/50 border border-[#d2a373]/30 text-[#d2a373] text-sm rounded-lg focus:ring-[#00C566] focus:border-[#00C566] block w-full p-2 appearance-none outline-none hover:bg-black/80 transition-all cursor-pointer shadow-[0_0_10px_rgba(210,163,115,0.1)] focus:shadow-[0_0_10px_rgba(0,197,102,0.4)]"
      >
        <option value="en">🇬🇧 English</option>
        <option value="pcm">🇳🇬 Pidgin</option>
      </select>
    </div>
  );
}
