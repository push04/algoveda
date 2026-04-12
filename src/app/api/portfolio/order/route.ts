import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchYahooV8 } from '@/app/api/market/quote/route';

export const runtime = 'nodejs';

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

  // Fetch portfolio
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'paper')
    .eq('is_active', true)
    .single();

  if (!portfolio) return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });

  // Fetch live price
  const quote = await fetchYahooV8(symbol.toUpperCase());
  if (!quote || !quote.price) {
    return NextResponse.json({ error: `Could not fetch live price for ${symbol}` }, { status: 400 });
  }

  const execPrice = order_type === 'LIMIT' && limit_price ? parseFloat(limit_price) : quote.price;
  const totalCost = execPrice * quantity;
  const sideCaps = side.toUpperCase() as 'BUY' | 'SELL';

  if (sideCaps === 'BUY') {
    if (portfolio.current_cash < totalCost) {
      return NextResponse.json({
        error: `Insufficient virtual cash. Need ₹${totalCost.toFixed(2)}, available ₹${portfolio.current_cash.toFixed(2)}`
      }, { status: 400 });
    }

    // Deduct cash
    await supabase
      .from('portfolios')
      .update({ current_cash: portfolio.current_cash - totalCost })
      .eq('id', portfolio.id);

    // Upsert holding (average down/up)
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
    // Add cash back
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
      status: 'EXECUTED',
    })
    .select()
    .single();

  return NextResponse.json({
    success: true,
    order,
    executedPrice: execPrice,
    totalValue: totalCost,
    message: `${sideCaps} ${quantity} × ${symbol.toUpperCase()} @ ₹${execPrice.toFixed(2)} executed`,
  });
}
