/**
 * GET /api/clob/positions?address=0x...
 * Reads on-chain positions from SabiMarket contracts on Flow EVM.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, getAddress } from 'viem';
import { CONTRACTS, FACTORY_ABI, MARKET_ABI, flowTestnet } from '@/lib/contracts';

const client = createPublicClient({
  chain: flowTestnet,
  transport: http(),
});

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 });

  try {
    const userAddr = getAddress(address);

    const count = await client.readContract({
      address: CONTRACTS.FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getMarketCount',
    }) as bigint;

    const markets = await client.readContract({
      address: CONTRACTS.FACTORY as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: 'getMarkets',
      args: [0n, count],
    }) as `0x${string}`[];

    const enriched: any[] = [];

    // Batch all per-market reads into a single multicall RPC request
    const calls = markets.flatMap((marketAddr) => [
      { address: marketAddr, abi: MARKET_ABI, functionName: 'getUserPosition' as const, args: [userAddr] as [`0x${string}`] },
      { address: marketAddr, abi: MARKET_ABI, functionName: 'getMarketInfo' as const },
      { address: marketAddr, abi: MARKET_ABI, functionName: 'getYesPrice' as const },
    ]);

    const results = await client.multicall({ contracts: calls, allowFailure: true });

    for (let idx = 0; idx < markets.length; idx++) {
      const marketAddr = markets[idx];
      try {
        const posResult    = results[idx * 3];
        const infoResult   = results[idx * 3 + 1];
        const priceResult  = results[idx * 3 + 2];

        if (posResult.status === 'failure' || infoResult.status === 'failure') continue;

        const position = posResult.result  as [bigint, bigint, boolean];
        const info     = infoResult.result as [string, string, string, bigint, bigint, bigint, bigint, boolean, number, bigint];
        const yesPrice = priceResult.status === 'success' ? priceResult.result as bigint : BigInt(500000);

        const [yesShares, noShares] = position;
          if (yesShares === 0n && noShares === 0n) continue;

          const question = info[0];
          const currentYesPrice = Number(yesPrice) / 1e6;
          const currentNoPrice = 1 - currentYesPrice;

          if (yesShares > 0n) {
            const shares = Number(yesShares) / 1e6;
            const avgPrice = currentYesPrice;
            const currentValue = shares * currentYesPrice;
            enriched.push({
              id: marketAddr + '-YES',
              marketTitle: question,
              outcome: 'YES',
              shares,
              avgPrice,
              currentPrice: currentYesPrice,
              totalCost: shares * avgPrice,
              currentValue,
              pnl: 0,
              pnlPct: 0,
              tokenId: marketAddr,
            });
          }

          if (noShares > 0n) {
            const shares = Number(noShares) / 1e6;
            const avgPrice = currentNoPrice;
            const currentValue = shares * currentNoPrice;
            enriched.push({
              id: marketAddr + '-NO',
              marketTitle: question,
              outcome: 'NO',
              shares,
              avgPrice,
              currentPrice: currentNoPrice,
              totalCost: shares * avgPrice,
              currentValue,
              pnl: 0,
              pnlPct: 0,
              tokenId: marketAddr,
            });
          }
      } catch {
        // skip markets that fail
      }
    }

    const totalValue = enriched.reduce((s: number, p: any) => s + p.currentValue, 0);
    const totalCost = enriched.reduce((s: number, p: any) => s + p.totalCost, 0);
    const totalPnl = totalValue - totalCost;
    const winRate = enriched.length > 0
      ? Math.round((enriched.filter((p: any) => p.pnl > 0).length / enriched.length) * 100)
      : 0;

    return NextResponse.json({
      positions: enriched,
      stats: { totalValue, totalCost, totalPnl, winRate, count: enriched.length },
    });
  } catch (err: any) {
    console.error('[Positions] Error:', err);
    return NextResponse.json({
      positions: [],
      stats: { totalValue: 0, totalCost: 0, totalPnl: 0, winRate: 0, count: 0 },
    });
  }
}
