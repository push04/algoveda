import { NextResponse } from 'next/server';

const INDICES = [
  'NIFTY 50', 'NIFTY BANK', 'NIFTY IT', 'NIFTY AUTO', 'NIFTY PHARMA', 'NIFTY METAL'
];

export async function GET() {
  try {
    // Fetch NSE indices
    const results = await Promise.all(
      INDICES.map(async (indexName) => {
        const data = await fetchIndexData(indexName);
        return {
          name: indexName,
          value: data?.value || 0,
          change: data?.change || 0,
          changeP: data?.changeP || 0,
        };
      })
    );

    return NextResponse.json({ indices: results });
  } catch (error) {
    console.error('Indices error:', error);
    return NextResponse.json({ error: 'Failed to fetch indices' }, { status: 500 });
  }
}

async function fetchIndexData(indexName: string): Promise<any> {
  try {
    const symbol = indexName === 'NIFTY 50' ? 'NIFTY' : indexName;
    
    const response = await fetch(
      `https://www.nseindia.com/api/quoteIndex?index=${encodeURIComponent(symbol)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://www.nseindia.com/',
        },
        next: { revalidate: 30 }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    return {
      value: parseFloat(data.last) || 0,
      change: parseFloat(data.change) || 0,
      changeP: parseFloat(data.pChange) || 0,
    };
  } catch (error) {
    // Fallback - try Yahoo
    try {
      const yahooSymbol = indexName === 'NIFTY 50' ? '^NSEI' : 
                          indexName === 'NIFTY BANK' ? '^NSEBANK' :
                          indexName === 'NIFTY IT' ? '^NSECP' :
                          `${indexName.replace('NIFTY ', '^NSEI_').toUpperCase()}`;
      
      const yRes = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`,
        { next: { revalidate: 30 } }
      );
      
      if (!yRes.ok) return null;
      
      const yData = await yRes.json();
      const result = yData.chart?.result?.[0];
      const meta = result?.meta;
      
      return {
        value: meta?.regularMarketPrice || 0,
        change: meta?.regularMarketChange || 0,
        changeP: meta?.regularMarketChangePercent || 0,
      };
    } catch {
      return null;
    }
  }
}