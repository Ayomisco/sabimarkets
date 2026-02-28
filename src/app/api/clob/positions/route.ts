/**
 * GET /api/clob/positions?address=0x...
 * Fetches real on-chain positions for a user from Polymarket Gamma API.
 * Replaces localStorage simulation.
 */
import { NextRequest, NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  try {
    // Fetch real positions
    const [posRes, tradeRes] = await Promise.all([
      fetch(`${GAMMA_API}/positions?user=${address}&sizeThreshold=0.01`, {
        next: { revalidate: 30 },
      }),
      fetch(`${GAMMA_API}/trades?user=${address}&limit=50`, {
        next: { revalidate: 30 },
      }),
    ]);

    if (!posRes.ok) {
      return NextResponse.json({ positions: [], trades: [] });
    }

    const positions = await posRes.json();
    const trades = tradeRes.ok ? await tradeRes.json() : [];

    // Enrich positions with P&L
    const enriched = (Array.isArray(positions) ? positions : []).map((p: any) => {
      const currentPrice = parseFloat(p.currentPrice || p.pricePerShare || '0.5');
      const avgPrice = parseFloat(p.avgPrice || p.averagePrice || '0.5');
      const shares = parseFloat(p.size || '0');
      const totalCost = shares * avgPrice;
      const currentValue = shares * currentPrice;
      const pnl = currentValue - totalCost;
      const pnlPct = totalCost > 0 ? ((pnl / totalCost) * 100).toFixed(1) : '0';

      return {
        id: p.id || p.proxyWallet + p.conditionId,
        marketTitle: p.title || p.market?.question || 'Unknown Market',
        outcome: p.outcome || (p.side === 0 ? 'YES' : 'NO'),
        shares,
        avgPrice,
        currentPrice,
        totalCost,
        currentValue,
        pnl,
        pnlPct: parseFloat(pnlPct),
        conditionId: p.conditionId,
        tokenId: p.asset || p.tokenId,
        isWinner: currentPrice > 0.9,
      };
    });

    // Portfolio stats
    const totalValue = enriched.reduce((s: number, p: any) => s + p.currentValue, 0);
    const totalCost = enriched.reduce((s: number, p: any) => s + p.totalCost, 0);
    const totalPnl = totalValue - totalCost;
    const winRate = enriched.length > 0
      ? Math.round((enriched.filter((p: any) => p.pnl > 0).length / enriched.length) * 100)
      : 0;

    return NextResponse.json({
      positions: enriched,
      trades: Array.isArray(trades) ? trades.slice(0, 20) : [],
      stats: { totalValue, totalCost, totalPnl, winRate, count: enriched.length },
    });
  } catch (err: any) {
    console.error('[Positions] Error:', err);
    return NextResponse.json({ positions: [], trades: [], stats: { totalValue: 0, totalCost: 0, totalPnl: 0, winRate: 0, count: 0 } });
  }
}
