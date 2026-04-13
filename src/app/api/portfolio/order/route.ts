import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchYahooV8 } from '@/app/api/market/quote/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// NSE market hours: Mon–Fri, 9:15 AM – 3:30 PM IST
function isMarketOpen(): boolean {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = ist.getDay(); // 0=Sun, 6=Sat
  const h = ist.getHours();
  const m = ist.getMinutes();
  const totalMins = h * 60 + m;
  return day >= 1 && day <= 5 && totalMins >= 555 && totalMins < 930; // 9:15–15:30
}

function nextMarketOpenIST(): string {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = ist.getDay();
  // Days until next Monday if it's weekend
  const daysUntilOpen = day === 0 ? 1 : day === 6 ? 2 : 1;
  const next = new Date(ist);
  const h = ist.getHours();
  const m = ist.getMinutes();
  const totalMins = h * 60 + m;
  // If before 9:15 today (weekday), open today
  if (day >= 1 && day <= 5 && totalMins < 555) {
    next.setHours(9, 15, 0, 0);
  } else {
    // Next trading day
    next.setDate(next.getDate() + daysUntilOpen);
    next.setHours(9, 15, 0, 0);
  }
  return next.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { symbol, side, quantity: rawQty, order_type = 'MARKET', limit_price } = body;

  if (!symbol || !side || !rawQty) {
    return NextResponse.json({ error: 'Missing required fields: symbol, side, quantity' }, { status: 400 });
  }

  const quantity = parseInt(rawQty, 10);
  if (quantity <= 0 || isNaN(quantity)) {
    return NextResponse.json({ error: 'Quantity must be a positive integer' }, { status: 400 });
  }

  if (!['BUY', 'SELL'].includes(side.toUpperCase())) {
    return NextResponse.json({ error: 'side must be BUY or SELL' }, { status: 400 });
  }

  const marketOpen = isMarketOpen();

  // Fetch portfolio
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'paper')
    .eq('is_active', true)
    .single();

  if (!portfolio) return NextResponse.json({ error: 'Portfolio not found. Please subscribe to activate paper trading.' }, { status: 404 });

  // Fetch live price (or last known price if market is closed)
  const quote = await fetchYahooV8(symbol.toUpperCase());
  if (!quote || !quote.price) {
    return NextResponse.json({ error: `Could not fetch price for ${symbol}. Try again during market hours.` }, { status: 400 });
  }

  const execPrice = order_type === 'LIMIT' && limit_price ? parseFloat(limit_price) : quote.price;
  const totalCost = execPrice * quantity;
  const sideCaps = side.toUpperCase() as 'BUY' | 'SELL';

  // Outside market hours — accept order as PENDING, will execute at open
  const orderStatus = marketOpen ? 'EXECUTED' : 'PENDING';
  const marketNote = marketOpen
    ? null
    : `Market is closed. Your order will be executed at ₹${execPrice.toFixed(2)} when NSE opens on ${nextMarketOpenIST()} IST. Price may vary at execution.`;

  if (sideCaps === 'BUY') {
    if (portfolio.current_cash < totalCost) {
      return NextResponse.json({
        error: `Insufficient virtual cash. Need ₹${totalCost.toFixed(2)}, available ₹${portfolio.current_cash.toFixed(2)}`
      }, { status: 400 });
    }

    // Deduct cash immediately (reserved for pending orders too)
    await supabase
      .from('portfolios')
      .update({ current_cash: portfolio.current_cash - totalCost })
      .eq('id', portfolio.id);

    // Upsert holding
    const { data: existing } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', portfolio.id)
      .eq('symbol', symbol.toUpperCase())
      .maybeSingle();

    if (existing) {
      const newQty = existing.quantity + quantity;
      const newAvg = ((existing.average_price * existing.quantity) + (execPrice * quantity)) / newQty;
      await supabase
        .from('portfolio_holdings')
        .update({ quantity: newQty, average_price: newAvg, current_price: quote.price, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('portfolio_holdings')
        .insert({
          portfolio_id: portfolio.id,
          symbol: symbol.toUpperCase(),
          quantity,
          average_price: execPrice,
          current_price: quote.price,
        });
    }

  } else {
    // SELL
    const { data: existing } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('portfolio_id', portfolio.id)
      .eq('symbol', symbol.toUpperCase())
      .maybeSingle();

    if (!existing || existing.quantity < quantity) {
      return NextResponse.json({
        error: `Insufficient holdings. Have ${existing?.quantity ?? 0} shares of ${symbol}`
      }, { status: 400 });
    }

    const proceeds = execPrice * quantity;
    await supabase
      .from('portfolios')
      .update({ current_cash: portfolio.current_cash + proceeds })
      .eq('id', portfolio.id);

    const remainingQty = existing.quantity - quantity;
    if (remainingQty === 0) {
      await supabase.from('portfolio_holdings').delete().eq('id', existing.id);
    } else {
      await supabase
        .from('portfolio_holdings')
        .update({ quantity: remainingQty, current_price: quote.price, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    }
  }

  // Record the order
  const { data: order } = await supabase
    .from('paper_orders')
    .insert({
      portfolio_id: portfolio.id,
      symbol: symbol.toUpperCase(),
      side: sideCaps,
      quantity,
      order_type,
      executed_price: execPrice,
      status: orderStatus,
    })
    .select()
    .single();

  return NextResponse.json({
    success: true,
    order,
    executedPrice: execPrice,
    totalValue: totalCost,
    marketOpen,
    marketNote,
    message: marketOpen
      ? `${sideCaps} ${quantity} × ${symbol.toUpperCase()} @ ₹${execPrice.toFixed(2)} executed successfully`
      : `Order placed! ${marketNote}`,
  });
}
