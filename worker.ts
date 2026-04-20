/**
 * SabiMarkets Background Worker
 *
 * Run as a separate Railway service: `node --require tsconfig-paths/register worker.js`
 * (compiled via `tsc --project tsconfig.worker.json`)
 *
 * Jobs:
 *   - fx-refresh       every 5 minutes
 *   - market-expiry    every 1 hour
 *   - oracle-finalize  on-demand (enqueued by market-expiry)
 */

import 'dotenv/config';
import { Worker, Queue, QueueScheduler } from 'bullmq';
import { getRedis, QUEUE_NAMES } from './src/lib/queue';
import { runFxRefresh } from './src/workers/fx-refresh';
import { runMarketExpiry } from './src/workers/market-expiry';
import { processOracleFinalize } from './src/workers/oracle-finalize';
import type { OracleFinalizeJob } from './src/lib/queue';

const redis = getRedis();

console.log('[worker] SabiMarkets background worker starting...');

// ── FX Refresh — runs every 5 minutes via BullMQ repeatable job ────────────

const fxQueue = new Queue(QUEUE_NAMES.FX_REFRESH, { connection: redis });

fxQueue.add('tick', {}, {
  repeat: { every: 5 * 60 * 1000 }, // 5 minutes
  removeOnComplete: 10,
  removeOnFail: 50,
  jobId: 'fx-refresh-repeat',
});

new Worker(QUEUE_NAMES.FX_REFRESH, async () => {
  await runFxRefresh(redis);
}, { connection: redis });

console.log('[worker] fx-refresh worker started (every 5 min)');

// ── Market Expiry — runs every 1 hour ──────────────────────────────────────

const oracleFinalizeQueue = new Queue<OracleFinalizeJob>(QUEUE_NAMES.ORACLE_FINALIZE, { connection: redis });
const marketExpiryQueue = new Queue(QUEUE_NAMES.MARKET_EXPIRY, { connection: redis });

marketExpiryQueue.add('tick', {}, {
  repeat: { every: 60 * 60 * 1000 }, // 1 hour
  removeOnComplete: 10,
  removeOnFail: 50,
  jobId: 'market-expiry-repeat',
});

new Worker(QUEUE_NAMES.MARKET_EXPIRY, async () => {
  await runMarketExpiry(redis, oracleFinalizeQueue);
}, { connection: redis });

console.log('[worker] market-expiry worker started (every 1 hr)');

// ── Oracle Finalize — on-demand, triggered by market-expiry ───────────────

new Worker<OracleFinalizeJob>(QUEUE_NAMES.ORACLE_FINALIZE, async (job) => {
  await processOracleFinalize(job.data);
}, {
  connection: redis,
  concurrency: 3, // process up to 3 oracle verdicts in parallel
});

console.log('[worker] oracle-finalize worker started (on-demand)');

// ── Graceful shutdown ──────────────────────────────────────────────────────

async function shutdown() {
  console.log('[worker] shutting down...');
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Run fx-refresh immediately on startup (warm the cache before first request)
runFxRefresh(redis).catch(console.error);
