"use strict";
/**
 * Shared Redis connection + BullMQ queue definitions.
 * Used by both the Next.js app (producers) and the worker process (consumers).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEUE_NAMES = void 0;
exports.getRedis = getRedis;
exports.getFxRefreshQueue = getFxRefreshQueue;
exports.getMarketExpiryQueue = getMarketExpiryQueue;
exports.getOracleFinalizeQueue = getOracleFinalizeQueue;
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
// ── Connection ─────────────────────────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
// Singleton connection — reused across queues in the same process
let _redis = null;
function getRedis() {
    if (!_redis) {
        _redis = new ioredis_1.default(REDIS_URL, {
            maxRetriesPerRequest: null, // required by BullMQ
            enableReadyCheck: false,
            lazyConnect: false,
        });
        _redis.on('error', (err) => console.error('[Redis] connection error:', err));
    }
    return _redis;
}
// ── Queue names ────────────────────────────────────────────────────────────
exports.QUEUE_NAMES = {
    FX_REFRESH: 'fx-refresh',
    MARKET_EXPIRY: 'market-expiry',
    ORACLE_FINALIZE: 'oracle-finalize',
};
// ── Lazy queue factory (do NOT instantiate at module load — breaks Next.js) ──
let _fxQueue = null;
let _marketExpiryQueue = null;
let _oracleFinalizeQueue = null;
function makeOpts() {
    return {
        connection: getRedis(),
        defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 200,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        },
    };
}
function getFxRefreshQueue() {
    if (!_fxQueue)
        _fxQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.FX_REFRESH, makeOpts());
    return _fxQueue;
}
function getMarketExpiryQueue() {
    if (!_marketExpiryQueue)
        _marketExpiryQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.MARKET_EXPIRY, makeOpts());
    return _marketExpiryQueue;
}
function getOracleFinalizeQueue() {
    if (!_oracleFinalizeQueue)
        _oracleFinalizeQueue = new bullmq_1.Queue(exports.QUEUE_NAMES.ORACLE_FINALIZE, makeOpts());
    return _oracleFinalizeQueue;
}
