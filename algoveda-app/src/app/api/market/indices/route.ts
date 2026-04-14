import { NextResponse } from 'next/server';
import { fetchYahooV8 } from '../quote/route';

// Yahoo Finance symbols for Indian indices
const INDEX_MAP: Record<string, string> = {
  'NIFTY 50': '^NSEI',
  'NIFTY BANK': '^NSEBANK',
  'NIFTY IT': '^CNXIT',
  'NIFTY AUTO': '^CNXAUTO',
  'NIFTY PHARMA': '^CNXPHARMA',
  'NIFTY METAL': '^CNXMETAL',
};

// Fallback hardcoded data (updated approximate values)
const FALLBACK_INDICES = [
  { name: 'NIFTY 50', value: 24578.35, change: 182.45, changeP: 0.75 },
  { name: 'NIFTY BANK', value: 52286.40, change: -156.74, changeP: -0.30 },
  { name: 'NIFTY IT', value: 38678.90, change: 342.15, changeP: 0.89 },
  { name: 'NIFTY AUTO', value: 22678.45, change: 124.67, changeP: 0.55 },
  { name: 'NIFTY PHARMA', value: 21234.12, change: 89.34, changeP: 0.42 },
  { name: 'NIFTY METAL', value: 8876.54, change: -45.23, changeP: -0.51 },
];

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET() {
  try {
    const entries = Object.entries(INDEX_MAP);

    // Fetch all in parallel
    const results = await Promise.allSettled(
      entries.map(async ([name, symbol]) => {
        const data = await fetchYahooV8(symbol);
        if (!data || !data.price) return null;
        return {
          name,
          value: data.price,
          change: data.change,
          changeP: data.changeP,
        };
      })
    );

    const indices = results
      .map((r, i) => {
        if (r.status === 'fulfilled' && r.value) return r.value;
        // Use fallback for this index
        return FALLBACK_INDICES[i] ?? null;
      })
      .filter(Boolean);

    const liveCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

    return NextResponse.json(
      {
        indices,
        timestamp: new Date().toISOString(),
        source: liveCount > 0 ? 'yahoo-v8' : 'fallback',
        liveCount,
      },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' } }
    );
  } catch (err) {
    console.error('Indices fetch error:', err);
    return NextResponse.json({
      indices: FALLBACK_INDICES,
      error: 'Using fallback data',
      source: 'fallback',
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}
