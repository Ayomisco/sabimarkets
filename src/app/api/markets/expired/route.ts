import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Internal endpoint: list expired, unresolved markets
 * Called by the market-expiry BullMQ worker
 * Protected by x-cron-secret header
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Fetch markets whose resolution deadline has passed and are still unresolved
    // Prisma model: Market { id, question, description, endTime, status, ... }
    const markets = await prisma.market.findMany({
      where: {
        endTime: { lte: now },
        status: "ACTIVE", // still active = needs resolution
      },
      select: {
        id: true,
        question: true,
        description: true,
        endTime: true,
        evidenceUri: true,
      },
    });

    return NextResponse.json({ markets, count: markets.length });
  } catch (err) {
    console.error("[markets/expired] DB error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
