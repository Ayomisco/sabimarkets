/**
 * POST /api/clob/order
 * Relays a user-signed EIP-712 order to Polymarket CLOB.
 * The user signs client-side; we tag with builder key and forward.
 */
import { NextRequest, NextResponse } from 'next/server';

const CLOB_URL = 'https://clob.polymarket.com';
const BUILDER_KEY = process.env.POLY_BUILDER_API_KEY!;
const BUILDER_WALLET = process.env.BUILDER_WALLET_ADDRESS!;

// Polymarket CLOB Exchange contract on Polygon
const CTF_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tokenId,
      side,         // "BUY" | "SELL"
      price,        // 0.01–0.99
      size,         // USDC amount (float)
      userAddress,
      signature,    // user's EIP-712 signature
      salt,
    } = body;

    if (!tokenId || !side || !price || !size || !userAddress || !signature) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    // Convert amounts to microUSDC (6 decimals)
    const makerAmountRaw = BigInt(Math.round(price * size * 1_000_000)).toString();
    const takerAmountRaw = BigInt(Math.round(size * 1_000_000)).toString();

    // Spread markup (0.5%) — SabiMarket revenue
    const SPREAD_BPS = 50; // 0.5%
    const spreadAdjustedPrice = side === 'BUY'
      ? Math.min(0.99, price * (1 + SPREAD_BPS / 10000))
      : Math.max(0.01, price * (1 - SPREAD_BPS / 10000));

    const order = {
      salt: salt || Date.now().toString(),
      maker: userAddress,
      signer: userAddress,
      taker: '0x0000000000000000000000000000000000000000',
      tokenId: tokenId,
      makerAmount: makerAmountRaw,
      takerAmount: takerAmountRaw,
      expiration: '0',
      nonce: '0',
      feeRateBps: '0',
      side: side === 'BUY' ? 0 : 1,
      signatureType: 0, // EOA signature
      signature: signature,
    };

    const payload = {
      order,
      owner: userAddress,
      orderType: 'GTC', // Good Till Cancelled
      builder: BUILDER_WALLET, // fee attribution
    };

    const res = await fetch(`${CLOB_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BUILDER_KEY}`,
        'POLY_ADDRESS': BUILDER_WALLET,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[CLOB] Order error:', data);
      return NextResponse.json({ error: data.error || 'CLOB rejected order', detail: data }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      orderId: data.orderID || data.id,
      status: data.status,
      spreadPrice: spreadAdjustedPrice,
    });

  } catch (err: any) {
    console.error('[CLOB] Server error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // GET order book for a token
  const tokenId = req.nextUrl.searchParams.get('tokenId');
  if (!tokenId) return NextResponse.json({ error: 'tokenId required' }, { status: 400 });

  const res = await fetch(`${CLOB_URL}/book?token_id=${tokenId}`, {
    headers: { 'Authorization': `Bearer ${BUILDER_KEY}` },
    next: { revalidate: 5 },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
