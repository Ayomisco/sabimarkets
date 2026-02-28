"use client";

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ChevronDown, Globe, Loader2, X, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en',  label: 'English',         flag: '🇬🇧', region: 'Global' },
  { code: 'fr',  label: 'Français',        flag: '🇫🇷', region: 'Francophone Africa' },
  { code: 'ar',  label: 'العربية',         flag: '🇪🇬', region: 'North Africa' },
  { code: 'pt',  label: 'Português',       flag: '🇦🇴', region: 'Lusophone Africa' },
  { code: 'sw',  label: 'Kiswahili',       flag: '🇰🇪', region: 'East Africa' },
  { code: 'am',  label: 'አማርኛ',           flag: '🇪🇹', region: 'Ethiopia' },
  { code: 'so',  label: 'Soomaali',        flag: '🇸🇴', region: 'Somalia' },
  { code: 'ha',  label: 'Hausa',           flag: '🇳🇬', region: 'West Africa' },
  { code: 'yo',  label: 'Yorùbá',          flag: '🇳🇬', region: 'Nigeria / Benin' },
  { code: 'ig',  label: 'Igbo',            flag: '🇳🇬', region: 'Nigeria' },
  { code: 'pcm', label: 'Naija Pidgin',    flag: '🇳🇬', region: 'Nigeria' },
  { code: 'tw',  label: 'Twi',             flag: '🇬🇭', region: 'Ghana' },
  { code: 'zu',  label: 'isiZulu',         flag: '🇿🇦', region: 'South Africa' },
  { code: 'xh',  label: 'isiXhosa',        flag: '🇿🇦', region: 'South Africa' },
  { code: 'rw',  label: 'Kinyarwanda',     flag: '🇷🇼', region: 'Rwanda' },
  { code: 'lg',  label: 'Luganda',         flag: '🇺🇬', region: 'Uganda' },
];

const KNOWN_LOCALES = LANGUAGES.map(l => l.code);

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  const handleSelect = (code: string) => {
    if (code === locale) { setIsOpen(false); return; }
    setLoading(true);
    setIsOpen(false);
    // Hard full-page navigation ensures server re-renders with translateMarkets()
    const segments = window.location.pathname.split('/').filter(Boolean);
    const newPath = KNOWN_LOCALES.includes(segments[0])
      ? '/' + code + (segments.length > 1 ? '/' + segments.slice(1).join('/') : '')
      : '/' + code + window.location.pathname;
    window.location.href = newPath + window.location.search;
  };

  // Close on outside click (desktop)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const LanguageList = () => (
    <div className="overflow-y-auto flex-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] transition-colors border-b border-white/[0.04] last:border-0 ${
            locale === lang.code
              ? 'bg-[#00D26A]/10 text-[#00D26A]'
              : 'text-[#ccc] hover:bg-white/[0.05] active:bg-white/[0.08]'
          }`}
        >
          <span className="text-xl w-8 text-center">{lang.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{lang.label}</p>
            <p className="text-[11px] text-[#7A7068] truncate">{lang.region}</p>
          </div>
          {locale === lang.code && (
            <Check size={15} className="text-[#00D26A] shrink-0" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div ref={ref} className="relative">
        {/* Trigger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="cursor-pointer flex items-center gap-1.5 px-2.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-[13px] text-[#ccc] hover:text-white transition-all disabled:opacity-60"
        >
          {loading
            ? <Loader2 size={14} className="animate-spin text-[#00D26A]" />
            : <Globe size={14} className="text-[#7A7068]" />
          }
          {/* Show flag only on mobile (no label) */}
          <span className="text-base sm:hidden">{currentLang.flag}</span>
          {/* Full label on desktop */}
          <span className="hidden sm:inline text-[#7A7068]">{currentLang.flag}</span>
          <span className="hidden sm:inline font-medium">{loading ? 'Loading…' : currentLang.label}</span>
          <ChevronDown size={12} className={`text-[#7A7068] transition-transform ${isOpen ? 'rotate-180' : ''} hidden sm:block`} />
        </button>

        {/* ── Desktop dropdown (hidden on mobile) ── */}
        {isOpen && (
          <div className="hidden sm:flex flex-col absolute right-0 top-full mt-2 w-64 bg-[#0F0D0B] border border-white/[0.09] rounded-xl shadow-2xl z-[60] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.06] shrink-0">
              <p className="text-[10px] font-semibold text-[#7A7068] uppercase tracking-widest">Language / Uzungumzaji</p>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-white/[0.05] ${
                    locale === lang.code ? 'bg-[#00D26A]/10 text-[#00D26A]' : 'text-[#ccc]'
                  }`}
                >
                  <span className="text-base w-6 text-center">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{lang.label}</p>
                    <p className="text-[10px] text-[#7A7068] truncate">{lang.region}</p>
                  </div>
                  {locale === lang.code && <Check size={13} className="text-[#00D26A] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile full-screen bottom sheet (hidden on sm+) ── */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-[#0F0D0B] rounded-t-3xl flex flex-col max-h-[80vh] animate-slide-up">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
              <div>
                <p className="font-bold text-white text-[15px]">Language</p>
                <p className="text-[11px] text-[#7A7068]">Select your preferred language</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/[0.06] text-[#7A7068] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {/* List */}
            <LanguageList />
          </div>
        </div>
      )}
    </>
  );
}
