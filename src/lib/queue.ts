/**
 * Shared Redis connection + BullMQ queue definitions.
 * Used by both the Next.js app (producers) and the worker process (consumers).
 */

import IORedis from 'ioredis';
import { Queue, QueueOptions } from 'bullmq';

// ── Connection ─────────────────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

// Singleton connection — reused across queues in the same process
let _redis: IORedis | null = null;

export function getRedis(): IORedis {
  if (!_redis) {
    _redis = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null, // required by BullMQ
      enableReadyCheck: false,
      lazyConnect: false,
    });
    _redis.on('error', (err) => console.error('[Redis] connection error:', err));
  }
  return _redis;
}

// ── Queue names ────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  FX_REFRESH:       'fx-refresh',
  MARKET_EXPIRY:    'market-expiry',
  ORACLE_FINALIZE:  'oracle-finalize',
} as const;

// ── Job type definitions ───────────────────────────────────────────────────

export type FxRefreshJob     = Record<string, never>;
export type MarketExpiryJob  = Record<string, never>;
export type OracleFinalizeJob = { marketId: string; proposalAddress: string };

// ── Queue factory ──────────────────────────────────────────────────────────

const defaultOpts: QueueOptions = {
  connection: getRedis(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
  },
};

export const fxRefreshQueue    = new Queue<FxRefreshJob>(QUEUE_NAMES.FX_REFRESH, defaultOpts);
export const marketExpiryQueue = new Queue<MarketExpiryJob>(QUEUE_NAMES.MARKET_EXPIRY, defaultOpts);
export const oracleFinalizeQueue = new Queue<OracleFinalizeJob>(QUEUE_NAMES.ORACLE_FINALIZE, defaultOpts);
