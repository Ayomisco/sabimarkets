"use strict";
/**
 * FX Refresh Worker
 * Runs every 5 minutes — fetches African FX rates and caches them in Redis.
 * This ensures the /api/oracle/fx endpoint always returns warm data instantly.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FX_CACHE_TTL = exports.FX_CACHE_KEY = void 0;
exports.runFxRefresh = runFxRefresh;
exports.FX_CACHE_KEY = 'fx:rates:usd';
exports.FX_CACHE_TTL = 360; // 6 min — slightly longer than the job interval
const AFRICAN_CURRENCIES = [
    'NGN', 'KES', 'GHS', 'ZAR', 'EGP', 'UGX', 'TZS', 'ETB', 'RWF',
    'XOF', 'XAF', 'MAD', 'ZMW', 'MZN', 'AOA', 'EUR', 'GBP',
];
async function fetchLiveRates() {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (apiKey) {
        const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
        if (res.ok) {
            const data = await res.json();
            if (data.result === 'success') {
                const rates = { USD: 1 };
                for (const cur of AFRICAN_CURRENCIES) {
                    if (data.conversion_rates[cur])
                        rates[cur] = data.conversion_rates[cur];
                }
                return rates;
            }
        }
    }
    // Frankfurter fallback (free, no key)
    const symbols = AFRICAN_CURRENCIES.join(',');
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${symbols}`);
    if (!res.ok)
        throw new Error(`Frankfurter failed: ${res.status}`);
    const data = await res.json();
    return { USD: 1, ...data.rates };
}
async function runFxRefresh(redis) {
    console.log('[fx-refresh] fetching live rates...');
    const rates = await fetchLiveRates();
    const payload = JSON.stringify({ rates, updatedAt: new Date().toISOString() });
    await redis.setex(exports.FX_CACHE_KEY, exports.FX_CACHE_TTL, payload);
    console.log(`[fx-refresh] cached ${Object.keys(rates).length} rates`);
}
