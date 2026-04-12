import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') ?? 'RELIANCE';

  try {
    // Fetch real price data first
    const priceRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://algoveda.vercel.app'}/api/market/quote?symbol=${symbol}`,
      { next: { revalidate: 60 } }
    );
    const priceData = priceRes.ok ? await priceRes.json() : null;

    const priceContext = priceData && priceData.price > 0
      ? `Current Price: ₹${priceData.price.toFixed(2)}, Change: ${priceData.changeP > 0 ? '+' : ''}${priceData.changeP?.toFixed(2)}%, Volume: ${priceData.volume?.toLocaleString()}`
      : 'Live price unavailable — base analysis on fundamentals only.';

    const prompt = `You are AlgoVeda's institutional-grade AI research analyst covering Indian equity markets (NSE/BSE). 
Generate a concise but thorough equity research report for ${symbol}.

Market snapshot: ${priceContext}

Return a JSON object with EXACTLY this structure:
{
  "overview": "2-3 sentence company overview including sector, business model, and market position",
  "technicalAnalysis": "2-3 sentences on price action, trend, key support/resistance levels",
  "bullThesis": ["3-4 bullet points of bull case arguments"],
  "bearThesis": ["2-3 bullet points of bear case / key risks"],
  "aiRating": "BUY | HOLD | SELL",
  "targetPrice": "₹XXXX (12-month institutional price target estimate)",
  "keyMetrics": {
    "sector": "Sector name",
    "marketCap": "Large Cap / Mid Cap / Small Cap",
    "moat": "Wide / Narrow / None",
    "riskLevel": "Low / Medium / High"
  },
  "summary": "One sentence executive summary for busy portfolio managers"
}

Be precise, data-driven, and use Indian market context. Do not hallucinate specific financial figures for metrics you don't know with certainty — say 'Data pending' instead.`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    let report: Record<string, any>;
    try {
      report = JSON.parse(raw);
    } catch {
      report = { error: 'Parse failed', raw };
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      report,
      priceData: priceData ?? null,
      generatedAt: new Date().toISOString(),
      model: 'llama3-70b-8192',
    });
  } catch (err: any) {
    console.error('Groq research error:', err);
    return NextResponse.json({ error: err.message ?? 'AI research failed' }, { status: 500 });
  }
}
