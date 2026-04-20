/**
 * FX Rates API — African & global currencies
 *
 * Sources (in priority order):
 *   1. ExchangeRate-API (EXCHANGE_RATE_API_KEY) — 1,500 req/month free
 *   2. Frankfurter (https://frankfurter.dev) — fully free, EUR-based, no key needed
 *
 * African currencies covered: NGN, KES, GHS, ZAR, EGP, UGX, TZS, ETB, RWF, XOF, XAF, MAD, ZMW, MZN
 *
 * Returns rates relative to USD, plus cross-rates for USDC<>local display.
 */

import { NextRequest, NextResponse } from 'next/server';

// African + major currencies we care about
const AFRICAN_CURRENCIES = [
  'NGN', // Nigerian Naira
  'KES', // Kenyan Shilling
  'GHS', // Ghanaian Cedi
  'ZAR', // South African Rand
  'EGP', // Egyptian Pound
  'UGX', // Ugandan Shilling
  'TZS', // Tanzanian Shilling
  'ETB', // Ethiopian Birr
  'RWF', // Rwandan Franc
  'XOF', // West African CFA (Senegal, Mali, Côte d'Ivoire…)
  'XAF', // Central African CFA
  'MAD', // Moroccan Dirham
  'ZMW', // Zambian Kwacha
  'MZN', // Mozambican Metical
  'AOA', // Angolan Kwanza
  'EUR', // Euro
  'GBP', // British Pound
  'USD', // Base
];

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Simple in-process cache
let cache: { rates: Record<string, number>; updatedAt: number } | null = null;

async function fetchFromExchangeRateAPI(apiKey: string): Promise<Record<string, number>> {
  const symbols = AFRICAN_CURRENCIES.join(',');
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`ExchangeRate-API: ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success') throw new Error('ExchangeRate-API returned error');
  // Filter to only the currencies we want
  const rates: Record<string, number> = {};
  for (const cur of AFRICAN_CURRENCIES) {
    if (data.conversion_rates[cur]) {
      rates[cur] = data.conversion_rates[cur];
    }
  }
  return rates;
}

async function fetchFromFrankfurter(): Promise<Record<string, number>> {
  // Frankfurter is EUR-based — fetch USD and convert
  const symbols = AFRICAN_CURRENCIES.filter(c => c !== 'USD').join(',');
  const res = await fetch(
    `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${symbols}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`Frankfurter: ${res.status}`);
  const data = await res.json();
  return { USD: 1, ...data.rates };
}

async function getRates(): Promise<Record<string, number>> {
  // Return cached if fresh
  if (cache && Date.now() - cache.updatedAt < CACHE_TTL_MS) {
    return cache.rates;
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  let rates: Record<string, number>;

  try {
    if (apiKey) {
      rates = await fetchFromExchangeRateAPI(apiKey);
    } else {
      rates = await fetchFromFrankfurter();
    }
  } catch (err) {
    console.warn('Primary FX source failed, trying fallback:', err);
    try {
      rates = await fetchFromFrankfurter();
    } catch (fallbackErr) {
      // If we have stale cache, return it
      if (cache) return cache.rates;
      throw fallbackErr;
    }
  }

  cache = { rates, updatedAt: Date.now() };
  return rates;
}

// ── Handlers ───────────────────────────────────────────────────────────────

/**
 * GET /api/oracle/fx
 * Returns: { base: 'USD', rates: { NGN: 1620, KES: 131, ... }, updatedAt: ISO }
 *
 * GET /api/oracle/fx?from=NGN&to=USD&amount=5000
 * Returns: { from, to, amount, result, rate }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from')?.toUpperCase();
    const to = searchParams.get('to')?.toUpperCase();
    const amount = parseFloat(searchParams.get('amount') ?? '1');

    const rates = await getRates();

    // Conversion mode
    if (from && to) {
      const fromRate = from === 'USD' ? 1 : rates[from];
      const toRate = to === 'USD' ? 1 : rates[to];

      if (!fromRate || !toRate) {
        return NextResponse.json(
          { error: `Unsupported currency: ${!fromRate ? from : to}` },
          { status: 400 }
        );
      }

      const usdAmount = amount / fromRate;
      const result = usdAmount * toRate;
      const rate = toRate / fromRate;

      return NextResponse.json(
        { from, to, amount, result: parseFloat(result.toFixed(6)), rate: parseFloat(rate.toFixed(8)) },
        { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' } }
      );
    }

    // All rates mode
    return NextResponse.json(
      {
        base: 'USD',
        rates,
        updatedAt: cache ? new Date(cache.updatedAt).toISOString() : new Date().toISOString(),
        source: process.env.EXCHANGE_RATE_API_KEY ? 'exchangerate-api' : 'frankfurter',
      },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' } }
    );
  } catch (err) {
    console.error('FX rates error:', err);
    return NextResponse.json({ error: 'FX rate service unavailable' }, { status: 503 });
  }
}
