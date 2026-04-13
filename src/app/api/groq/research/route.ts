import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { fetchYahooV8 } from '@/app/api/market/quote/route';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 45;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Indian market news via GNews (or fallback to synthetic context)
async function fetchMarketNews(symbol: string): Promise<string> {
  try {
    const apiKey = process.env.GNEWS_API_KEY;
    if (apiKey) {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(symbol + ' NSE India stock')}&lang=en&max=5&token=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        const headlines = (data.articles ?? []).slice(0, 5).map((a: { title: string; description?: string }) =>
          `• ${a.title}${a.description ? ' — ' + a.description.slice(0, 100) : ''}`
        ).join('\n');
        if (headlines) return headlines;
      }
    }
  } catch { /* ignore */ }
  return `No live news available. Use your knowledge of ${symbol} as of your training data to assess recent developments.`;
}

// FREE_LIMIT: 2 researches per 3 hours per user
const FREE_LIMIT = 2;
const WINDOW_HOURS = 3;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') ?? 'RELIANCE';

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Check plan
  let plan = 'explorer';
  let isPaidUser = false;
  if (user) {
    const { data: profile } = await adminSupabase.from('profiles').select('plan').eq('id', user.id).single();
    plan = profile?.plan ?? 'explorer';
    isPaidUser = !['explorer', 'free', ''].includes(plan.toLowerCase());
  }

  // Rate limit: free/explorer users get 2 per 3 hours
  if (!isPaidUser) {
    if (user) {
      // Count usage in last 3 hours
      const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();
      const { count } = await adminSupabase
        .from('research_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('used_at', windowStart);

      if ((count ?? 0) >= FREE_LIMIT) {
        const resetTime = new Date(Date.now() + 30 * 60 * 1000);
        return NextResponse.json({
          error: `Free plan allows ${FREE_LIMIT} AI researches every ${WINDOW_HOURS} hours. Upgrade to Pro for unlimited access.`,
          rateLimited: true,
          resetAt: resetTime.toISOString(),
          upgradeUrl: '/pricing',
        }, { status: 429 });
      }
    } else {
      // Anonymous users: deny
      return NextResponse.json({
        error: 'Please sign in to use AI Research.',
        rateLimited: true,
        upgradeUrl: '/auth/login',
      }, { status: 401 });
    }
  }

  try {
    // Fetch live price
    const priceData = await fetchYahooV8(symbol);

    const priceContext = priceData && priceData.price > 0
      ? `Current Price: ₹${priceData.price.toFixed(2)}, Change: ${priceData.changeP > 0 ? '+' : ''}${priceData.changeP?.toFixed(2)}%, Day High: ₹${priceData.high?.toFixed(2)}, Day Low: ₹${priceData.low?.toFixed(2)}, Volume: ${priceData.volume?.toLocaleString('en-IN')}, Previous Close: ₹${priceData.previousClose?.toFixed(2)}`
      : 'Live price unavailable — base analysis on fundamentals only.';

    // Fetch recent news
    const newsContext = await fetchMarketNews(symbol);

    const prompt = `You are AlgoVeda's institutional-grade AI research analyst covering Indian equity markets (NSE/BSE).
Generate a comprehensive equity research report for ${symbol.toUpperCase()}.

LIVE MARKET DATA:
${priceContext}

RECENT NEWS HEADLINES:
${newsContext}

Return a JSON object with EXACTLY this structure (no extra fields):
{
  "overview": "3-4 sentence company overview including sector, business model, competitive positioning, and market share",
  "technicalAnalysis": "3-4 sentences analyzing price action, trend direction (bullish/bearish/sideways), key support levels, resistance levels, RSI estimate, and volume analysis",
  "bullThesis": ["4-5 specific, data-driven bull case arguments with reasons"],
  "bearThesis": ["3-4 specific bear case risks with quantification where possible"],
  "aiRating": "BUY or HOLD or SELL",
  "targetPrice": "₹XXXX (12-month DCF/peer-comparison estimate)",
  "keyMetrics": {
    "sector": "Specific sector name",
    "marketCap": "Large Cap / Mid Cap / Small Cap",
    "moat": "Wide / Narrow / None",
    "riskLevel": "Low / Medium / High"
  },
  "summary": "One sentence executive summary for portfolio managers",
  "sentiment": "Bullish / Neutral / Bearish",
  "sentimentScore": 75,
  "buySignal": {
    "recommendation": "Buy Now / Wait for Dip / Avoid",
    "idealEntryRange": "₹XXXX - ₹XXXX",
    "stopLoss": "₹XXXX",
    "target1": "₹XXXX (3-month)",
    "target2": "₹XXXX (12-month)",
    "timeframe": "Short-term / Medium-term / Long-term",
    "rationale": "2 sentence entry rationale"
  },
  "newsImpact": "positive / neutral / negative",
  "catalysts": ["2-3 upcoming potential catalysts that could move the stock"],
  "risks": ["2-3 specific downside risks to monitor"]
}

Be precise, data-driven, and use Indian market context. sentimentScore is 0-100 (0=very bearish, 100=very bullish).`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    let report: Record<string, unknown>;
    try {
      report = JSON.parse(raw);
    } catch {
      report = { error: 'Parse failed', raw };
    }

    // Record usage for free users (ignore errors — don't let tracking block response)
    if (user && !isPaidUser) {
      try {
        await adminSupabase.from('research_usage').insert({ user_id: user.id, symbol });
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      report,
      priceData: priceData ?? null,
      generatedAt: new Date().toISOString(),
      planInfo: {
        plan,
        isPaidUser,
        freeLimit: FREE_LIMIT,
        windowHours: WINDOW_HOURS,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI research failed';
    console.error('Groq research error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
