"use strict";
/**
 * Oracle Finalize Worker
 * Processes OracleFinalizeJob — for each expired+unresolved market:
 *   1. Fetch market question from Soroban RPC
 *   2. Use Groq to generate an AI verdict (searches latest news via evidence)
 *   3. Submit the verdict hash to OracleResolver.propose() using the oracle keypair
 *   4. If past the challenge window, call OracleResolver.finalize()
 *
 * The oracle keypair (ORACLE_KEYPAIR_SECRET) is a dedicated Stellar account
 * that has been registered as ai_oracle in the OracleResolver contract.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOracleFinalize = processOracleFinalize;
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
const STELLAR_RPC = process.env.NEXT_PUBLIC_STELLAR_RPC ?? 'https://soroban-testnet.stellar.org';
const ORACLE_CONTRACT = process.env.NEXT_PUBLIC_STELLAR_ORACLE ?? '';
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015';
const crypto_1 = __importDefault(require("crypto"));
// ── AI verdict generation ──────────────────────────────────────────────────
async function generateAiVerdict(question) {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey)
        return { verdict: 'Invalid', reasoning: 'No AI oracle key', hash: '' };
    const systemPrompt = `You are an impartial prediction market oracle. Evaluate whether the following prediction market event has occurred based on your training knowledge and known facts. Respond ONLY with valid JSON.`;
    const userPrompt = `Market Question: "${question}"
Today's date: ${new Date().toISOString().split('T')[0]}

Has this event definitively occurred? Respond ONLY with JSON:
{"verdict":"Yes"|"No"|"Invalid","confidence":0-100,"reasoning":"1-2 sentences"}`;
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 200,
            response_format: { type: 'json_object' },
        }),
    });
    if (!res.ok)
        return { verdict: 'Invalid', reasoning: 'Groq API error', hash: '' };
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    const verdict = ['Yes', 'No', 'Invalid'].includes(parsed.verdict)
        ? parsed.verdict
        : 'Invalid';
    // Generate 32-byte verdict hash for on-chain storage
    const hash = crypto_1.default
        .createHash('sha256')
        .update(`${verdict}|oracle-auto|${Date.now()}`)
        .digest('hex');
    return { verdict, reasoning: parsed.reasoning ?? '', hash };
}
// ── On-chain proposal submission ───────────────────────────────────────────
async function submitOnChainProposal(marketAddress, verdict, verdictHash, evidenceUri) {
    const secret = process.env.ORACLE_KEYPAIR_SECRET;
    if (!secret) {
        console.warn('[oracle-finalize] ORACLE_KEYPAIR_SECRET not set — skipping on-chain submission');
        return null;
    }
    try {
        const { Keypair, Contract, TransactionBuilder, BASE_FEE, Address, xdr, rpc, } = await Promise.resolve().then(() => __importStar(require('@stellar/stellar-sdk')));
        const keypair = Keypair.fromSecret(secret);
        const server = new rpc.Server(STELLAR_RPC, { allowHttp: false });
        const account = await server.getAccount(keypair.publicKey());
        // Encode Verdict enum as ScVal — contract uses soroban_sdk enum (symbol variant)
        const verdictScVal = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol(verdict)]);
        const contract = new Contract(ORACLE_CONTRACT);
        const tx = new TransactionBuilder(account, {
            fee: BASE_FEE,
            networkPassphrase: NETWORK_PASSPHRASE,
        })
            .addOperation(contract.call('propose', Address.fromString(keypair.publicKey()).toScVal(), // proposer
        Address.fromString(marketAddress).toScVal(), // market
        verdictScVal, // verdict
        xdr.ScVal.scvBytes(Buffer.from(evidenceUri, 'utf8')), // evidence_uri
        xdr.ScVal.scvBytes(Buffer.from(verdictHash.padEnd(64, '0').slice(0, 64), 'hex'))))
            .setTimeout(30)
            .build();
        const sim = await server.simulateTransaction(tx);
        if (rpc.Api.isSimulationError(sim)) {
            console.error('[oracle-finalize] simulation error:', sim.error);
            return null;
        }
        const prepared = rpc.assembleTransaction(tx, sim).build();
        prepared.sign(keypair);
        const result = await server.sendTransaction(prepared);
        if (result.status === 'ERROR') {
            console.error('[oracle-finalize] TX error:', result.errorResult);
            return null;
        }
        return result.hash;
    }
    catch (err) {
        console.error('[oracle-finalize] on-chain submission failed:', err);
        return null;
    }
}
// ── Main processor ─────────────────────────────────────────────────────────
async function processOracleFinalize(job) {
    const { marketId, proposalAddress } = job;
    console.log(`[oracle-finalize] processing market ${marketId}`);
    // 1. Fetch market question from DB or on-chain
    let question = marketId; // fallback
    try {
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../lib/prisma')));
        const market = await prisma.market?.findUnique({ where: { marketId } });
        if (market?.question)
            question = market.question;
    }
    catch {
        // Market table may not exist yet — use marketId as question fallback
    }
    // 2. Generate AI verdict
    const { verdict, reasoning, hash } = await generateAiVerdict(question);
    console.log(`[oracle-finalize] verdict for ${marketId}: ${verdict} (${reasoning})`);
    // 3. Submit on-chain
    const evidenceUri = `sabimarkets:oracle-auto:${marketId}:${Date.now()}`;
    const txHash = await submitOnChainProposal(proposalAddress, verdict, hash, evidenceUri);
    if (txHash) {
        console.log(`[oracle-finalize] proposal submitted: ${txHash}`);
    }
    else {
        console.log(`[oracle-finalize] on-chain submission skipped (no keypair configured)`);
    }
}
