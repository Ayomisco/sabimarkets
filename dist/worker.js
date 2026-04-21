"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const queue_1 = require("./src/lib/queue");
const fx_refresh_1 = require("./src/workers/fx-refresh");
const market_expiry_1 = require("./src/workers/market-expiry");
const oracle_finalize_1 = require("./src/workers/oracle-finalize");
const redis = (0, queue_1.getRedis)();
console.log('[worker] SabiMarkets background worker starting...');
// ── FX Refresh — runs every 5 minutes via BullMQ repeatable job ────────────
const fxQueue = new bullmq_1.Queue(queue_1.QUEUE_NAMES.FX_REFRESH, { connection: redis });
fxQueue.add('tick', {}, {
    repeat: { every: 5 * 60 * 1000 }, // 5 minutes
    removeOnComplete: 10,
    removeOnFail: 50,
    jobId: 'fx-refresh-repeat',
});
new bullmq_1.Worker(queue_1.QUEUE_NAMES.FX_REFRESH, async () => {
    await (0, fx_refresh_1.runFxRefresh)(redis);
}, { connection: redis });
console.log('[worker] fx-refresh worker started (every 5 min)');
// ── Market Expiry — runs every 1 hour ──────────────────────────────────────
const oracleFinalizeQueue = new bullmq_1.Queue(queue_1.QUEUE_NAMES.ORACLE_FINALIZE, { connection: redis });
const marketExpiryQueue = new bullmq_1.Queue(queue_1.QUEUE_NAMES.MARKET_EXPIRY, { connection: redis });
marketExpiryQueue.add('tick', {}, {
    repeat: { every: 60 * 60 * 1000 }, // 1 hour
    removeOnComplete: 10,
    removeOnFail: 50,
    jobId: 'market-expiry-repeat',
});
new bullmq_1.Worker(queue_1.QUEUE_NAMES.MARKET_EXPIRY, async () => {
    await (0, market_expiry_1.runMarketExpiry)(redis, oracleFinalizeQueue);
}, { connection: redis });
console.log('[worker] market-expiry worker started (every 1 hr)');
// ── Oracle Finalize — on-demand, triggered by market-expiry ───────────────
new bullmq_1.Worker(queue_1.QUEUE_NAMES.ORACLE_FINALIZE, async (job) => {
    await (0, oracle_finalize_1.processOracleFinalize)(job.data);
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
(0, fx_refresh_1.runFxRefresh)(redis).catch(console.error);
