import { NextResponse } from 'next/server';
import { searchSymbols } from '@/lib/market-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchSymbols(query);
    // Add some predefined fallback BSE stocks for the autocomplete requirement
    const bseFallbacks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'BSE' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'BSE' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'BSE' },
    ];
    
    // Inject BSE fallbacks if query matches 
    const bseMatches = bseFallbacks.filter(b => b.symbol.toLowerCase().includes(query.toLowerCase()) || b.name.toLowerCase().includes(query.toLowerCase()));
    
    // Merge without duplicates based on symbol
    const merged = [...results];
    for (const bse of bseMatches) {
      if (!merged.find(m => m.symbol === bse.symbol)) {
        merged.push(bse);
      }
    }

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json([]);
  }
}
