import { NextResponse } from 'next/server';

// Yahoo Finance symbols for Indian indices
const INDEX_MAP: Record<string, string> = {
  'NIFTY 50': '^NSEI',
  'NIFTY BANK': '^NSEBANK',
  'NIFTY IT': 'NIFTYIT.NS',
  'NIFTY AUTO': 'NIFTYAUTO.NS',
  'NIFTY PHARMA': 'NIFTYPHARMA.NS',
  'NIFTY METAL': 'NIFTYMETAL.NS',
};

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET() {
  try {
    const symbols = Object.values(INDEX_MAP).join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,shortName`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlgoVeda/1.0)' },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Yahoo API ${res.status}`);

    const json = await res.json();
    const quotes: Record<string, any>[] = json.quoteResponse?.result ?? [];

    const symbolToName: Record<string, string> = {};
    Object.entries(INDEX_MAP).forEach(([name, sym]) => {
      symbolToName[sym] = name;
    });

    const indices = quotes.map((q: any) => ({
      name: symbolToName[q.symbol] ?? q.symbol,
      value: q.regularMarketPrice ?? 0,
      change: q.regularMarketChange ?? 0,
      changeP: q.regularMarketChangePercent ?? 0,
    })).filter((i) => i.value > 0);

    return NextResponse.json(
      { indices, timestamp: new Date().toISOString(), source: 'yahoo' },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' } }
    );
  } catch (err) {
    console.error('Indices fetch error:', err);
    // Return empty so UI can gracefully degrade
    return NextResponse.json({ indices: [], error: 'unavailable' }, { status: 200 });
  }
}