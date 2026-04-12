import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stocks, filters } = body;
    // stocks: array of { symbol, price, changeP, volume, sector }
    // filters: { minPrice, maxPrice, sectors, minChange }

    if (!stocks || stocks.length === 0) {
      return NextResponse.json({ error: 'No stocks provided' }, { status: 400 });
    }

    const stockList = stocks.slice(0, 8).map((s: any) =>
      `${s.symbol} (${s.sector ?? 'Equity'}) — ₹${s.price?.toFixed(2) ?? 'N/A'}, ${s.changeP > 0 ? '+' : ''}${s.changeP?.toFixed(2) ?? 0}% today`
    ).join('\n');

    const filterDesc = filters
      ? `Applied filters: ${JSON.stringify(filters)}`
      : 'No specific filters applied.';

    const prompt = `You are AlgoVeda's AI screener analyst for Indian equity markets.

${filterDesc}

The following stocks passed the screen:
${stockList}

For each stock, provide a one-line AI rationale explaining WHY it passed the screen and whether it's worth investigating further. Return JSON:
{
  "rationales": [
    { "symbol": "SYMBOL", "rationale": "One concise sentence explaining the signal.", "conviction": "High | Medium | Low" }
  ],
  "summary": "2-sentence summary of the overall screen results and market conditions driving these signals."
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const result = JSON.parse(raw);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Groq screener error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
