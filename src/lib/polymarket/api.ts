import { Market } from './types';
import { createPublicClient, http, formatUnits } from 'viem';
import { flowTestnet, CONTRACTS, FACTORY_ABI, MARKET_ABI } from '@/lib/contracts';

const client = createPublicClient({
  chain: flowTestnet,
  transport: http(),
});

function assignCategory(category: string, question: string): string {
  const cat = category.toLowerCase();
  const q = question.toLowerCase();

  if (cat === 'crypto' || q.includes('bitcoin') || q.includes('btc') || q.includes('eth') || q.includes('solana') || q.includes('crypto')) return 'Crypto';
  if (cat === 'politics' || q.includes('election') || q.includes('president') || q.includes('tinubu') || q.includes('trump')) return 'Politics';
  if (cat === 'sports' || q.includes('afcon') || q.includes('football') || q.includes('sports') || q.includes('match')) return 'Sports';
  if (cat === 'economy' || q.includes('naira') || q.includes('inflation') || q.includes('economy') || q.includes('gdp')) return 'Economy';
  if (cat === 'entertainment' || q.includes('music') || q.includes('movie') || q.includes('award')) return 'Entertainment';

  return 'Global';
}

function parseMarket(
  address: `0x${string}`,
  info: readonly [string, string, string, bigint, bigint, bigint, bigint, boolean, number, bigint],
  yesPrice: bigint,
  noPrice: bigint,
): Market {
  const [question, category, imageUri, endTime, totalYes, totalNo, totalCollateral, resolved, outcome, createdAt] = info;
  const yesPriceFmt = (Number(yesPrice) / 1_000_000).toFixed(4);
  const noPriceFmt = (Number(noPrice) / 1_000_000).toFixed(4);
  const volumeUsdc = Number(formatUnits(totalCollateral, 6));
  const isEnded = Number(endTime) * 1000 < Date.now();

  return {
    id: address,
    condition_id: address,
    question,
    description: '',
    category,
    imageUri,
    image: imageUri,
    outcomes: ['Yes', 'No'],
    outcomePrices: [yesPriceFmt, noPriceFmt],
    volume: Math.round(volumeUsdc).toString(),
    active: !resolved && !isEnded,
    closed: resolved || isEnded,
    resolved,
    outcome,
    endDate: new Date(Number(endTime) * 1000).toISOString(),
    totalYesShares: formatUnits(totalYes, 6),
    totalNoShares: formatUnits(totalNo, 6),
    totalCollateral: formatUnits(totalCollateral, 6),
    createdAt: Number(createdAt),
  };
}

/**
 * Fetch all markets from the SabiMarketFactory on Flow EVM Testnet.
 * Uses multicall to batch all contract reads into a single RPC request,
 * avoiding rate-limit (429) errors from firing 33+ calls in parallel.
 */
export async function fetchAfricanMarkets(): Promise<(Market & { uiCategory: string })[]> {
  try {
    // 1 RPC call — get total count
    const count = await client.readContract({
      address: CONTRACTS.FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getMarketCount',
    });

    const total = Number(count);
    if (total === 0) return [];

    // 1 RPC call — get all addresses at once
    const allAddresses = await client.readContract({
      address: CONTRACTS.FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getMarkets',
      args: [BigInt(0), BigInt(total)],
    }) as readonly `0x${string}`[];

    // 1 RPC call — multicall batches getMarketInfo + getYesPrice + getNoPrice
    // for ALL markets into a single eth_call via Multicall3
    const calls = allAddresses.flatMap((address) => [
      { address, abi: MARKET_ABI, functionName: 'getMarketInfo' as const },
      { address, abi: MARKET_ABI, functionName: 'getYesPrice' as const },
      { address, abi: MARKET_ABI, functionName: 'getNoPrice' as const },
    ]);

    const results = await client.multicall({ contracts: calls, allowFailure: true });

    const markets: Market[] = [];
    for (let i = 0; i < allAddresses.length; i++) {
      const infoResult = results[i * 3];
      const yesPriceResult = results[i * 3 + 1];
      const noPriceResult = results[i * 3 + 2];

      if (infoResult.status === 'failure') {
        console.error(`Failed to read market ${allAddresses[i]}`);
        continue;
      }

      const info = infoResult.result as readonly [string, string, string, bigint, bigint, bigint, bigint, boolean, number, bigint];
      const yesPrice = yesPriceResult.status === 'success' ? yesPriceResult.result as bigint : BigInt(500000);
      const noPrice = noPriceResult.status === 'success' ? noPriceResult.result as bigint : BigInt(500000);

      markets.push(parseMarket(allAddresses[i], info, yesPrice, noPrice));
    }

    return markets
      .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
      .map(m => ({ ...m, uiCategory: assignCategory(m.category, m.question) }));
  } catch (error) {
    console.error('Error fetching on-chain markets:', error);
    return [];
  }
}

/**
 * Get a single market by its contract address.
 * Uses multicall to batch all 3 reads into a single RPC call.
 */
export async function getMarket(address: string): Promise<Market | null> {
  try {
    const addr = address as `0x${string}`;
    const results = await client.multicall({
      contracts: [
        { address: addr, abi: MARKET_ABI, functionName: 'getMarketInfo' },
        { address: addr, abi: MARKET_ABI, functionName: 'getYesPrice' },
        { address: addr, abi: MARKET_ABI, functionName: 'getNoPrice' },
      ],
      allowFailure: true,
    });

    if (results[0].status === 'failure') return null;

    const info = results[0].result as readonly [string, string, string, bigint, bigint, bigint, bigint, boolean, number, bigint];
    const yesPrice = results[1].status === 'success' ? results[1].result as bigint : BigInt(500000);
    const noPrice = results[2].status === 'success' ? results[2].result as bigint : BigInt(500000);

    return parseMarket(addr, info, yesPrice, noPrice);
  } catch (err) {
    console.error(`Failed to read market ${address}:`, err);
    return null;
  }
}

