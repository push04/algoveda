import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function GET(_request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // Return cached picks if they exist
    const { data: existing } = await supabase
      .from('daily_picks')
      .select('*')
      .eq('pick_date', today)
      .order('created_at', { ascending: true })
      .limit(3);

    if (existing && existing.length >= 3) {
      return NextResponse.json({ picks: existing, cached: true });
    }

    // Generate picks via Groq
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    // Delete any stale partial picks from today
    await supabase.from('daily_picks').delete().eq('pick_date', today);

    // Fetch a couple of live prices for context
    const liveContext: string[] = [];
    for (const sym of ['RELIANCE', 'HDFCBANK', 'TCS']) {
      try {
        const res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${sym}.NS?interval=1d&range=5d`, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const d = await res.json();
          const meta = d.chart?.result?.[0]?.meta;
          if (meta?.regularMarketPrice) {
            const prev = meta.chartPreviousClose ?? meta.regularMarketPrice;
            const cp = ((meta.regularMarketPrice - prev) / prev * 100).toFixed(2);
            liveContext.push(`${sym}: ₹${meta.regularMarketPrice.toFixed(2)} (${parseFloat(cp) >= 0 ? '+' : ''}${cp}%)`);
          }
        }
      } catch { /* ignore */ }
    }

    const today_str = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata',
    });

    const prompt = `You are a senior equity analyst providing AlgoVeda's daily morning stock picks for Indian markets (NSE/BSE).

Date: ${today_str}
Market context: ${liveContext.join(', ') || 'Use your knowledge of Indian equity markets'}

Select the 3 BEST NSE stock picks for today based on: technical setups, fundamental quality, sector momentum, and risk-reward ratio. Make picks diverse across sectors (e.g., Banking, IT, Auto, Pharma, Consumer).

Respond ONLY with a valid JSON array (no markdown, no commentary):
[{"symbol":"SYMBOL","company_name":"Full Company Name","recommendation":"BUY","target_price":<3-6 month realistic target>,"stop_loss":<risk mgmt stop price>,"rationale":"<2-3 sentence specific rationale with technical and/or fundamental reasoning>"},{"symbol":"..."}]`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json();
      return NextResponse.json({ error: err.error?.message ?? 'Groq failed' }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content ?? '[]';

    let picks: Array<Record<string, unknown>>;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      picks = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse Groq response' }, { status: 500 });
    }

    if (!Array.isArray(picks) || picks.length === 0) {
      return NextResponse.json({ error: 'Invalid picks structure' }, { status: 500 });
    }

    const inserted = [];
    for (const pick of picks.slice(0, 3)) {
      const { data, error } = await supabase
        .from('daily_picks')
        .insert({
          symbol: String(pick.symbol ?? '').toUpperCase(),
          company_name: String(pick.company_name ?? ''),
          pick_date: today,
          recommendation: String(pick.recommendation ?? 'BUY'),
          target_price: Number(pick.target_price ?? 0),
          stop_loss: Number(pick.stop_loss ?? 0),
          rationale: String(pick.rationale ?? ''),
        })
        .select()
        .single();
      if (!error && data) inserted.push(data);
    }

    return NextResponse.json({ picks: inserted.length > 0 ? inserted : picks, generated: true });
  } catch (err: any) {
    console.error('Picks error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
