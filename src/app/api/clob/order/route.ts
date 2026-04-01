/**
 * POST /api/clob/order
 * DEPRECATED — Orders are now placed directly on-chain via wagmi/writeContract.
 * This route is kept as a stub to avoid 404s from any lingering client calls.
 */
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Orders are now placed directly on-chain. Please update your client.' },
    { status: 410 }
  );
}
