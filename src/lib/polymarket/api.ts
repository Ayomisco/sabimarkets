import { Market } from './types';
import { createPublicClient, http, formatUnits } from 'viem';
import { flowTestnet, CONTRACTS, FACTORY_ABI, MARKET_ABI } from '@/lib/contracts';

const client = createPublicClient({
  chain: flowTestnet,
  transport: http(),
});

/**
 * Helper to categorize markets for the UI
 */
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

/**
 * Read a single market's data from its on-chain contract
 */
async function readMarket(address: `0x${string}`): Promise<Market | null> {
  try {
    const [info, yesPrice, noPrice] = await Promise.all([
      client.readContract({
        address,
        abi: MARKET_ABI,
        functionName: 'getMarketInfo',
      }),
      client.readContract({
        address,
        abi: MARKET_ABI,
        functionName: 'getYesPrice',
      }),
      client.readContract({
        address,
        abi: MARKET_ABI,
        functionName: 'getNoPrice',
      }),
    ]);

    const [question, category, imageUri, endTime, totalYes, totalNo, totalCollateral, resolved, outcome, createdAt] = info;

    // Prices are scaled to 1e6 (e.g. 500_000 = 50%)
    const yesPriceFmt = (Number(yesPrice) / 1_000_000).toFixed(4);
    const noPriceFmt = (Number(noPrice) / 1_000_000).toFixed(4);

    // Volume = totalCollateral in USDC (6 decimals)
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
  } catch (err) {
    console.error(`Failed to read market ${address}:`, err);
    return null;
  }
}

/**
 * Fetch all markets from the SabiMarketFactory on Flow EVM Testnet
 */
export async function fetchAfricanMarkets(): Promise<(Market & { uiCategory: string })[]> {
  try {
    // Get total market count
    const count = await client.readContract({
      address: CONTRACTS.FACTORY,
      abi: FACTORY_ABI,
      functionName: 'getMarketCount',
    });

    const total = Number(count);
    if (total === 0) return [];

    // Fetch all market addresses (paginate in batches of 50)
    const batchSize = 50;
    const addressPromises: Promise<readonly `0x${string}`[]>[] = [];
    for (let offset = 0; offset < total; offset += batchSize) {
      addressPromises.push(
        client.readContract({
          address: CONTRACTS.FACTORY,
          abi: FACTORY_ABI,
          functionName: 'getMarkets',
          args: [BigInt(offset), BigInt(batchSize)],
        }) as Promise<readonly `0x${string}`[]>
      );
    }
    const batches = await Promise.all(addressPromises);
    const allAddresses = batches.flat();

    // Read all market data in parallel
    const marketPromises = allAddresses.map((addr) => readMarket(addr as `0x${string}`));
    const markets = await Promise.all(marketPromises);

    // Filter out null results and sort by volume (highest first)
    const validMarkets = markets
      .filter((m): m is Market => m !== null)
      .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));

    // Assign UI categories
    return validMarkets.map(m => ({
      ...m,
      uiCategory: assignCategory(m.category, m.question),
    }));
  } catch (error) {
    console.error('Error fetching on-chain markets:', error);
    return [];
  }
}

/**
 * Get a single market by its contract address
 */
export async function getMarket(address: string): Promise<Market | null> {
  return readMarket(address as `0x${string}`);
}

