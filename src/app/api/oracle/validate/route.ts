/**
 * Oracle News Validation — off-chain AI verdict service
 *
 * Flow:
 *   1. Receive market question + evidence_uri (URL to news article / IPFS hash)
 *   2. Fetch evidence text if it is a URL
 *   3. Send to Groq for structured verdict (Yes / No / Invalid)
 *   4. Return { verdict, confidence, reasoning, evidenceSummary, verdictHash }
 *      where verdictHash = SHA-256(verdict + market_id + timestamp) for on-chain storage
 *
 * The calling client then signs & submits the verdict to OracleResolver.propose()
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // latest reasoning model on Groq

const MAX_EVIDENCE_CHARS = 8_000; // stay well inside context window

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchEvidence(uri: string): Promise<string> {
  // Support: https:// URLs, ipfs:// URIs, plain text blobs
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    const res = await fetch(`https://cloudflare-ipfs.com/ipfs/${cid}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`IPFS fetch failed: ${res.status}`);
    return (await res.text()).slice(0, MAX_EVIDENCE_CHARS);
  }
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    const res = await fetch(uri, {
      headers: { 'User-Agent': 'SabiMarkets-Oracle/1.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Evidence fetch failed: ${res.status}`);
    const raw = await res.text();
    // Strip HTML tags for cleaner context
    const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
    return text.slice(0, MAX_EVIDENCE_CHARS);
  }
  // Plain text passed directly
  return uri.slice(0, MAX_EVIDENCE_CHARS);
}

function hashVerdict(verdict: string, marketId: string, timestamp: number): string {
  return crypto
    .createHash('sha256')
    .update(`${verdict}|${marketId}|${timestamp}`)
    .digest('hex');
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { marketId, question, evidenceUri, context: extraContext } = await req.json();

    if (!marketId || !question || !evidenceUri) {
      return NextResponse.json(
        { error: 'marketId, question, and evidenceUri are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Oracle service not configured' }, { status: 503 });
    }

    // 1. Fetch evidence
    let evidenceText: string;
    try {
      evidenceText = await fetchEvidence(evidenceUri);
    } catch (err) {
      return NextResponse.json(
        { error: `Could not fetch evidence: ${(err as Error).message}` },
        { status: 422 }
      );
    }

    // 2. Build Groq prompt
    const systemPrompt = `You are an impartial prediction market oracle for SabiMarkets, an African prediction market platform.
Your job is to evaluate news evidence and determine whether a market question resolves YES, NO, or INVALID.

Rules:
- YES: Evidence clearly confirms the event happened or the condition is met.
- NO: Evidence clearly contradicts or shows the event did not happen / condition not met.
- INVALID: Evidence is insufficient, contradictory, off-topic, or the question cannot be resolved from this evidence alone.
- Be conservative — only use YES or NO when you have HIGH confidence (≥85%).
- Focus on facts, not speculation.
- Your response MUST be valid JSON matching the schema provided.`;

    const userPrompt = `Market Question: "${question}"
Market ID: ${marketId}
${extraContext ? `Additional Context: ${extraContext}\n` : ''}
Evidence:
---
${evidenceText}
---

Evaluate the evidence and respond with ONLY valid JSON in this exact schema:
{
  "verdict": "Yes" | "No" | "Invalid",
  "confidence": <number 0-100>,
  "reasoning": "<1-3 sentence explanation>",
  "evidenceSummary": "<1-2 sentence neutral summary of the evidence>",
  "keyFacts": ["<fact1>", "<fact2>"]
}`;

    // 3. Call Groq
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1, // low temperature for factual tasks
        max_tokens: 512,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('Groq error:', err);
      return NextResponse.json({ error: 'AI oracle request failed' }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content ?? '{}';
    let parsed: {
      verdict: 'Yes' | 'No' | 'Invalid';
      confidence: number;
      reasoning: string;
      evidenceSummary: string;
      keyFacts: string[];
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Oracle returned malformed response' }, { status: 502 });
    }

    // Validate verdict value
    if (!['Yes', 'No', 'Invalid'].includes(parsed.verdict)) {
      parsed.verdict = 'Invalid';
    }

    // 4. Generate verdict hash for on-chain storage
    const timestamp = Math.floor(Date.now() / 1000);
    const verdictHash = hashVerdict(parsed.verdict, marketId, timestamp);

    return NextResponse.json({
      marketId,
      verdict: parsed.verdict,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      evidenceSummary: parsed.evidenceSummary,
      keyFacts: parsed.keyFacts ?? [],
      verdictHash,       // bytes32 hex for OracleResolver.propose()
      timestamp,
      model: GROQ_MODEL,
    });
  } catch (err) {
    console.error('Oracle validate error:', err);
    return NextResponse.json({ error: 'Internal oracle error' }, { status: 500 });
  }
}
