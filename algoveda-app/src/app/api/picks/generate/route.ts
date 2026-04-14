import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 45;

// This endpoint is called by Vercel Cron at 8 AM IST (2:30 AM UTC) Mon-Fri
// Also callable via GET for manual refresh

export async function GET(request: NextRequest) {
  // Verify cron secret or allow admin
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Still allow if no cron secret is set (dev mode)
    if (cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  // Check if picks exist for today
  const { data: existing } = await supabase
    .from('daily_picks')
    .select('id')
    .eq('pick_date', today)
    .limit(3);

  if (existing && existing.length >= 3) {
    return NextResponse.json({ message: 'Picks already generated for today', date: today, cached: true });
  }

  // Delete any partial picks for today
  await supabase.from('daily_picks').delete().eq('pick_date', today);

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // Get real stock prices for context
  const stocksToAnalyze = ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ICICIBANK', 'SBIN', 'TITAN', 'LTIM', 'BAJFINANCE', 'MARUTI', 'WIPRO', 'AXISBANK'];
  const priceContext: string[] = [];

  for (const sym of stocksToAnalyze.slice(0, 6)) {
    try {
      const yahoSym = `${sym}.NS`;
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${yahoSym}?interval=1d&range=5d`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const meta = data.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          const price = meta.regularMarketPrice;
          const prev = meta.chartPreviousClose ?? meta.previousClose ?? price;
          const changeP = ((price - prev) / prev * 100).toFixed(2);
          priceContext.push(`${sym}: ₹${price.toFixed(2)} (${parseFloat(changeP) >= 0 ? '+' : ''}${changeP}%)`);
        }
      }
    } catch { /* ignore */ }
  }

  const today_date = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });

  const prompt = `You are a senior equity analyst at AlgoVeda providing the daily morning briefing for Indian stock market (NSE/BSE).

Today is ${today_date}.

Live prices this morning:
${priceContext.join('\n') || 'Use your knowledge of Indian markets'}

Based on current market conditions, technical setups, fundamentals, and sector momentum, select the 3 BEST stock picks for today.

Respond ONLY with a valid JSON array (no markdown, no extra text):
[
  {
    "symbol": "STOCK_SYMBOL",
    "company_name": "Full Company Name",
    "recommendation": "BUY",
    "target_price": <realistic 3-6 month target>,
    "stop_loss": <risk management stop loss price>,
    "rationale": "<2-3 sentence specific rationale based on current conditions, catalysts, and technical setup>"
  }
]

Make picks diverse across sectors. Be specific and data-driven. Do NOT always pick the same stocks.`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json();
      return NextResponse.json({ error: errData.error?.message ?? 'Groq API failed' }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content ?? '[]';

    let picks: Array<Record<string, unknown>>;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      picks = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    if (!Array.isArray(picks) || picks.length === 0) {
      return NextResponse.json({ error: 'Invalid picks format' }, { status: 500 });
    }

    // Insert picks
    const inserted = [];
    for (const pick of picks.slice(0, 3)) {
      const { data, error } = await supabase.from('daily_picks').insert({
        symbol: String(pick.symbol ?? ''),
        company_name: String(pick.company_name ?? ''),
        pick_date: today,
        recommendation: String(pick.recommendation ?? 'BUY'),
        target_price: Number(pick.target_price ?? 0),
        stop_loss: Number(pick.stop_loss ?? 0),
        rationale: String(pick.rationale ?? ''),
      }).select().single();

      if (!error && data) inserted.push(data);
    }

    return NextResponse.json({ picks: inserted, generated: true, date: today, priceContext });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
