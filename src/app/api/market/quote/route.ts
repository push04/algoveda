import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') ?? 'RELIANCE';

  try {
    const data = await fetchYahoo(symbol);
    if (data) return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=15' }
    });
    return NextResponse.json({ error: 'No data available' }, { status: 503 });
  } catch (err) {
    console.error('Quote error:', err);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

async function fetchYahoo(symbol: string) {
  try {
    // Append .NS for NSE stocks if not already a Yahoo symbol
    const yahoSym = symbol.startsWith('^') ? symbol
      : symbol.includes('.') ? symbol
      : `${symbol}.NS`;

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahoSym}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,regularMarketVolume,shortName`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlgoVeda/1.0)' },
      next: { revalidate: 30 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const q = json.quoteResponse?.result?.[0];
    if (!q || !q.regularMarketPrice) return null;

    return {
      symbol: symbol.toUpperCase(),
      name: q.shortName ?? symbol,
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changeP: q.regularMarketChangePercent ?? 0,
      open: q.regularMarketOpen ?? 0,
      high: q.regularMarketDayHigh ?? 0,
      low: q.regularMarketDayLow ?? 0,
      volume: q.regularMarketVolume ?? 0,
      timestamp: new Date().toISOString(),
      source: 'yahoo',
    };
  } catch {
    return null;
  }
}