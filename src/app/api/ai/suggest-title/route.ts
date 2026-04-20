import { NextRequest, NextResponse } from 'next/server';

const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== 'string' || question.trim().length < 10) {
      return NextResponse.json({ error: 'Question must be at least 10 characters' }, { status: 400 });
    }

    const prompt = `You are helping create a prediction market for an African audience. Given the following market question, generate a concise, compelling market title of 4-8 words. Return ONLY the title text, no quotes, no punctuation at the end.\n\nQuestion: ${question.trim()}\n\nTitle:`;

    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (groqKey) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 32,
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const title = data.choices?.[0]?.message?.content?.trim() ?? question.trim().slice(0, 60);
        return NextResponse.json({ title });
      }
    }

    if (openaiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 32,
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const title = data.choices?.[0]?.message?.content?.trim() ?? question.trim().slice(0, 60);
        return NextResponse.json({ title });
      }
    }

    // Fallback: derive from question
    const fallback = question.trim().replace(/\?$/, '').slice(0, 60);
    return NextResponse.json({ title: fallback });
  } catch {
    return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 });
  }
}
