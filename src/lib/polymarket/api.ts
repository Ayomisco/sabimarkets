import { Market } from './types';

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

const AFRICAN_KEYWORDS = ['nigeria', 'afcon', 'africa', 'naira', 'kenya', 'south africa', 'ghana', 'tinubu', 'egypt', 'brics'];

/**
 * Helper to categorize markets for the UI
 */
function assignCategory(market: Market): string {
    const q = (market.question + ' ' + (market.description || '')).toLowerCase();
    
    // Explicit exclusions or overrides
    if (q.includes('crypto') || q.includes('bitcoin') || q.includes('btc') || q.includes('eth') || q.includes('solana') || q.includes('airdrop') || q.includes('nft')) return 'Crypto';
    if (q.includes('election') || q.includes('president') || q.includes('policy') || q.includes('tinubu') || q.includes('trump') || q.includes('biden')) return 'Politics';
    if (q.includes('football') || q.includes('afcon') || q.includes('sports') || q.includes('match') || q.includes('team') || q.includes('nfl') || q.includes('nba')) return 'Sports';
    if (q.includes('rate') || q.includes('inflation') || q.includes('naira') || q.includes('usd') || q.includes('economy') || q.includes('fed')) return 'Economy';
    if (q.includes('movie') || q.includes('artist') || q.includes('award') || q.includes('music') || q.includes('oscars') || q.includes('grammy')) return 'Entertainment';
    
    return 'Global';
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

    // To ensure UI has at least 50 highly active markets, we add generic global markets.
    // We intentionally avoid markets with string "USA" or specific overly-american niche things if we can,
    // to give it a truly "Generic / Global / African" feel as requested.
    const avoidKeywords = ['usa ', 'california', 'new york', 'super bowl', 'trump', 'biden', 'american', 'nfl', 'nba', 'democrat', 'republican', 'senate', 'congress', 'united states', 'uk', 'london', 'china', 'russia', 'taylor swift'];
    
    const backfillCount = 40 - strictAfrican.length;
    const paddingMarkets = backfillCount > 0 
        ? sortedData.filter(m => {
            if (strictAfrican.includes(m)) return false;
            const q = m.question.toLowerCase();
            return !avoidKeywords.some(kw => q.includes(kw));
        }).slice(0, backfillCount)
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
