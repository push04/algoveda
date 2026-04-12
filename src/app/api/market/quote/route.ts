import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') ?? 'RELIANCE';

  try {
    const data = await fetchYahooV8(symbol);
    if (data) return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=15' }
    });
    return NextResponse.json({ error: 'No data available' }, { status: 503 });
  } catch (err) {
    console.error('Quote error:', err);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

export async function fetchYahooV8(symbol: string) {
  // Append .NS for NSE stocks if not already a Yahoo symbol
  const yahoSym = symbol.startsWith('^') ? symbol
    : symbol.includes('.') ? symbol
    : `${symbol}.NS`;

  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoSym)}?interval=1d&range=5d&includePrePost=false`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://finance.yahoo.com/',
        'Origin': 'https://finance.yahoo.com',
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const result = json.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
    const price = meta.regularMarketPrice ?? 0;
    if (!price) return null;

    const change = price - prevClose;
    const changeP = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol: symbol.toUpperCase(),
      name: meta.longName ?? meta.shortName ?? symbol,
      price,
      change,
      changeP,
      open: meta.regularMarketOpen ?? 0,
      high: meta.regularMarketDayHigh ?? 0,
      low: meta.regularMarketDayLow ?? 0,
      volume: meta.regularMarketVolume ?? 0,
      previousClose: prevClose,
      timestamp: new Date().toISOString(),
      source: 'yahoo-v8',
    };
  } catch {
    return null;
  }
}
