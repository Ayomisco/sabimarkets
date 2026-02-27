/**
 * Market content translator
 * Translates dynamic Polymarket data (questions, descriptions) into the active locale.
 * Uses the free Google Translate API — no API key needed.
 * Results are cached in-memory per locale+text to avoid redundant calls.
 */

// In-memory cache: Map<"locale:text", translatedText>
const translationCache = new Map<string, string>();

// Locale → Google Translate language code mapping
const LOCALE_TO_GTRANSLATE: Record<string, string> = {
  en:  'en',
  pcm: 'en',  // Nigerian Pidgin not supported by Google → fallback English
  yo:  'yo',
  ha:  'ha',
  ig:  'ig',
  sw:  'sw',
  am:  'am',
  ar:  'ar',
  fr:  'fr',
  pt:  'pt',
  zu:  'zu',
  xh:  'xh',
  so:  'so',
  rw:  'rw',
  tw:  'ak',  // Twi → Akan (Google's code)
  lg:  'lg',
};

/**
 * Translate a single string via the Google Translate free API endpoint.
 * Falls back to the original text on any error.
 */
async function translateText(text: string, targetLocale: string): Promise<string> {
  const gtLang = LOCALE_TO_GTRANSLATE[targetLocale];

  // Skip if we don't need translation
  if (!gtLang || gtLang === 'en' || !text.trim()) return text;

  const cacheKey = `${gtLang}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(gtLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 }, // cache for 1 hour on Next.js
    });

    if (!res.ok) return text;

    const data = await res.json();
    // Google Translate API response structure: [[["translated", "original", ...]]]
    const translated: string = data[0]
      ?.map((chunk: any[]) => chunk[0])
      .filter(Boolean)
      .join('') || text;

    translationCache.set(cacheKey, translated);
    return translated;
  } catch {
    return text; // silent fallback
  }
}

/**
 * Batch-translate an array of strings for efficiency.
 * Joins them with a separator that survives translation, splits back after.
 */
async function batchTranslate(texts: string[], locale: string): Promise<string[]> {
  const gtLang = LOCALE_TO_GTRANSLATE[locale];
  if (!gtLang || gtLang === 'en') return texts;

  // Translate each string individually but concurrently (capped at 10 parallel)
  const MAX_CONCURRENT = 10;
  const results: string[] = new Array(texts.length).fill('');

  for (let i = 0; i < texts.length; i += MAX_CONCURRENT) {
    const batch = texts.slice(i, i + MAX_CONCURRENT);
    const translated = await Promise.all(batch.map(t => translateText(t, locale)));
    for (let j = 0; j < translated.length; j++) {
      results[i + j] = translated[j];
    }
  }
  return results;
}

export type TranslatableMarket = {
  question: string;
  description?: string;
  [key: string]: any;
};

/**
 * Translate a list of markets' question and description fields.
 * Returns the markets with translated content, all other fields untouched.
 */
export async function translateMarkets<T extends TranslatableMarket>(
  markets: T[],
  locale: string
): Promise<T[]> {
  const gtLang = LOCALE_TO_GTRANSLATE[locale];
  // English or unsupported → return as-is
  if (!gtLang || gtLang === 'en') return markets;

  // Collect all questions and descriptions
  const questions = markets.map(m => m.question);
  const descriptions = markets.map(m => m.description || '');

  // Translate both arrays concurrently
  const [translatedQuestions, translatedDescriptions] = await Promise.all([
    batchTranslate(questions, locale),
    batchTranslate(descriptions, locale),
  ]);

  return markets.map((market, i) => ({
    ...market,
    question: translatedQuestions[i] || market.question,
    description: translatedDescriptions[i] || market.description,
  }));
}
