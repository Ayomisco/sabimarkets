import { Market } from './types';

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

const AFRICAN_KEYWORDS = ['nigeria', 'afcon', 'africa', 'naira', 'kenya', 'south africa', 'ghana', 'tinubu', 'egypt', 'brics'];

/**
 * Helper to categorize markets for the UI
 */
function assignCategory(market: Market): string {
    const q = (market.question + ' ' + (market.description || '')).toLowerCase();
    if (q.includes('election') || q.includes('president') || q.includes('policy') || q.includes('tinubu')) return 'Politics';
    if (q.includes('football') || q.includes('afcon') || q.includes('sports') || q.includes('match') || q.includes('team')) return 'Sports';
    if (q.includes('rate') || q.includes('inflation') || q.includes('naira') || q.includes('usd') || q.includes('economy')) return 'Economy';
    if (q.includes('movie') || q.includes('artist') || q.includes('award') || q.includes('music')) return 'Entertainment';
    return 'World News';
}

export async function fetchAfricanMarkets(): Promise<(Market & { uiCategory: string })[]> {
  try {
    // Fetch a large pool of active markets
    const res = await fetch(`${GAMMA_API_URL}/markets?active=true&closed=false&limit=100`, {
      next: { revalidate: 60 } 
    });
    
    if (!res.ok) return [];

    const data: any[] = await res.json();
    const parsedData: Market[] = data.map(m => ({
        ...m,
        outcomes: typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes,
        outcomePrices: typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices,
        clobTokenIds: typeof m.clobTokenIds === 'string' ? JSON.parse(m.clobTokenIds) : m.clobTokenIds,
    }));
    
    // Sort strictly by volume to get the best markets at the top
    const sortedData = parsedData.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));

    // First, grab anything technically African.
    const strictAfrican = sortedData.filter((market) => {
        const questionText = market.question.toLowerCase() + (market.description || '').toLowerCase();
        return AFRICAN_KEYWORDS.some((keyword) => questionText.includes(keyword));
    });

    // To ensure UI has at least 30 highly active markets as requested for the MVP, 
    // we backfill with top global Poly liquidity if strict African isn't enough.
    // This allows the full platform (sorting, odds flashing, categories) to be tested beautifully.
    const backfillCount = 40 - strictAfrican.length;
    const paddingMarkets = backfillCount > 0 
        ? sortedData.filter(m => !strictAfrican.includes(m)).slice(0, backfillCount)
        : [];

    const finalFeed = [...strictAfrican, ...paddingMarkets].map(m => ({
        ...m,
        uiCategory: assignCategory(m)
    }));

    return finalFeed;
  } catch (error) {
    console.error('Error fetching Polymarket Markets:', error);
    return [];
  }
}

export async function getMarket(conditionId: string): Promise<Market | null> {
    try {
        const res = await fetch(`${GAMMA_API_URL}/markets?condition_id=${conditionId}`);
        if (!res.ok) return null;
        const data = await res.json();
        const m = data[0];
        if (!m) return null;
        return {
            ...m,
            outcomes: typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes,
            outcomePrices: typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices,
            clobTokenIds: typeof m.clobTokenIds === 'string' ? JSON.parse(m.clobTokenIds) : m.clobTokenIds,
        };
    } catch {
        return null;
    }
}
