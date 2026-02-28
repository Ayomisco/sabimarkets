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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  const handleSelect = (code: string) => {
    if (code === locale) { setIsOpen(false); return; }
    setLoading(true);
    setIsOpen(false);
    const segments = window.location.pathname.split('/').filter(Boolean);
    const newPath = KNOWN_LOCALES.includes(segments[0])
      ? '/' + code + (segments.length > 1 ? '/' + segments.slice(1).join('/') : '')
      : '/' + code + window.location.pathname;
    window.location.href = newPath + window.location.search;
  };

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const LanguageList = () => (
    <div className="overflow-y-auto flex-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          className={`w-full flex items-center gap-3 px-5 py-3.5 text-left text-[14px] transition-colors active:bg-white/[0.08] ${
            locale === lang.code
              ? 'bg-[#00D26A]/10 text-[#00D26A]'
              : 'text-[#ccc] hover:bg-white/[0.05]'
          }`}
        >
          <span className="text-xl w-8 text-center shrink-0">{lang.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{lang.label}</p>
            <p className="text-[11px] text-[#7A7068] truncate">{lang.region}</p>
          </div>
          {locale === lang.code && <Check size={15} className="text-[#00D26A] shrink-0" />}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Trigger button ── */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="cursor-pointer flex items-center gap-1.5 px-2.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-[13px] text-[#ccc] hover:text-white transition-all disabled:opacity-60"
        >
          {loading
            ? <Loader2 size={13} className="animate-spin text-[#00D26A]" />
            : <Globe size={13} className="text-[#7A7068]" />
          }
          <span className="hidden sm:inline text-[#7A7068]">{currentLang.flag}</span>
          <span className="hidden sm:inline font-medium">{loading ? 'Loading...' : currentLang.label}</span>
          <ChevronDown size={12} className={`text-[#7A7068] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* ── Desktop dropdown (sm+) ── */}
        {isOpen && (
          <div className="hidden sm:flex flex-col absolute right-0 top-full mt-2 w-64 max-h-[380px] bg-[#0F0D0B] border border-white/[0.09] rounded-xl shadow-2xl z-[60] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.06] shrink-0">
              <p className="text-[10px] font-semibold text-[#7A7068] uppercase tracking-widest">Language / Lugha</p>
            </div>
            <LanguageList />
          </div>
        )}
      </div>

      {/* ── Mobile full-screen sheet (< sm) ── */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-[100] flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Sheet — slides up from bottom */}
          <div className="relative mt-auto w-full bg-[#0F0D0B] rounded-t-3xl border-t border-white/[0.09] flex flex-col max-h-[85vh] shadow-2xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] shrink-0">
              <div>
                <p className="font-bold text-white text-[15px]">Choose Language</p>
                <p className="text-[11px] text-[#7A7068]">Chagua lugha yako</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-[#7A7068] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <LanguageList />
            {/* Safe area */}
            <div className="h-6 shrink-0" />
          </div>
        </div>
      )}
    </>
  );
}
