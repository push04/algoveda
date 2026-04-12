import { NextResponse } from 'next/server';

// Real market data from NSE India (using their public endpoints)
// Fallback to Yahoo Finance if NSE fails

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'NIFTY 50';
  
  try {
    // Try NSE India API first
    const nseData = await fetchNSEData(symbol);
    if (nseData) {
      return NextResponse.json(nseData);
    }
    
    // Fallback to Yahoo Finance
    const yahooData = await fetchYahooData(symbol);
    if (yahooData) {
      return NextResponse.json(yahooData);
    }
    
    return NextResponse.json({ error: 'No data available' }, { status: 503 });
  } catch (error) {
    console.error('Market data error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

async function fetchNSEData(symbol: string): Promise<any> {
  try {
    const cleanSymbol = symbol.replace('.NS', '').replace('-eq', '');
    
    // NSE Quote API (official)
    const response = await fetch(
      `https://www.nseindia.com/api/quoteEquity?symbol=${cleanSymbol}&section=info`,
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
      symbol: data.metadata?.symbol || cleanSymbol,
      price: parseFloat(data.priceInfo?.lastPrice || 0),
      change: parseFloat(data.priceInfo?.change || 0),
      changeP: parseFloat(data.priceInfo?.pChange || 0),
      open: parseFloat(data.priceInfo?.open || 0),
      high: parseFloat(data.priceInfo?.dayHigh || 0),
      low: parseFloat(data.priceInfo?.dayLow || 0),
      volume: parseInt(data.metadata?.totalTradedVolume || 0),
      timestamp: new Date().toISOString(),
      source: 'nse',
    };
  } catch (error) {
    return null;
  }
}

async function fetchYahooData(symbol: string): Promise<any> {
  try {
    const cleanSymbol = symbol.includes('NSE') || symbol.includes('NS') 
      ? symbol 
      : `${symbol}.NS`;
    
    // Yahoo Finance API via rapidapi or direct
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSymbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 30 }
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) return null;
    
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    
    return {
      symbol: meta.symbol,
      price: meta.regularMarketPrice || 0,
      change: meta.regularMarketChange || 0,
      changeP: meta.regularMarketChangePercent || 0,
      open: meta.chartPreviousClose || meta.regularMarketOpen || 0,
      high: meta.regularMarketDayHigh || 0,
      low: meta.regularMarketDayLow || 0,
      volume: meta.regularMarketVolume || 0,
      timestamp: new Date().toISOString(),
      source: 'yahoo',
    };
  } catch (error) {
    return null;
  }
}