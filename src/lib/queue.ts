/**
 * Shared Redis connection + BullMQ queue definitions.
 * Used by both the Next.js app (producers) and the worker process (consumers).
 */

import IORedis from 'ioredis';
import { Queue, type QueueOptions } from 'bullmq';

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

export type FxRefreshJob      = Record<string, never>;
export type MarketExpiryJob   = Record<string, never>;
export type OracleFinalizeJob = { marketId: string; proposalAddress: string };

// ── Lazy queue factory (do NOT instantiate at module load — breaks Next.js) ──

let _fxQueue: Queue<FxRefreshJob> | null = null;
let _marketExpiryQueue: Queue<MarketExpiryJob> | null = null;
let _oracleFinalizeQueue: Queue<OracleFinalizeJob> | null = null;

function makeOpts(): QueueOptions {
  return {
    connection: getRedis(),
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
    },
  };
}

export function getFxRefreshQueue(): Queue<FxRefreshJob> {
  if (!_fxQueue) _fxQueue = new Queue<FxRefreshJob>(QUEUE_NAMES.FX_REFRESH, makeOpts());
  return _fxQueue;
}

export function getMarketExpiryQueue(): Queue<MarketExpiryJob> {
  if (!_marketExpiryQueue) _marketExpiryQueue = new Queue<MarketExpiryJob>(QUEUE_NAMES.MARKET_EXPIRY, makeOpts());
  return _marketExpiryQueue;
}

export function getOracleFinalizeQueue(): Queue<OracleFinalizeJob> {
  if (!_oracleFinalizeQueue) _oracleFinalizeQueue = new Queue<OracleFinalizeJob>(QUEUE_NAMES.ORACLE_FINALIZE, makeOpts());
  return _oracleFinalizeQueue;
}
