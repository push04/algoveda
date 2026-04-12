'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BuySignal {
  recommendation: string;
  idealEntryRange: string;
  stopLoss: string;
  target1: string;
  target2: string;
  timeframe: string;
  rationale: string;
}

interface ResearchReport {
  overview: string;
  technicalAnalysis: string;
  bullThesis: string[];
  bearThesis: string[];
  aiRating: 'BUY' | 'HOLD' | 'SELL';
  targetPrice: string;
  keyMetrics: { sector: string; marketCap: string; moat: string; riskLevel: string };
  summary: string;
  sentiment: string;
  sentimentScore: number;
  buySignal: BuySignal;
  newsImpact: string;
  catalysts: string[];
  risks: string[];
}

interface ApiResponse {
  symbol: string;
  report: ResearchReport;
  priceData: { price: number; changeP: number; high: number; low: number; volume: number; previousClose: number } | null;
  generatedAt: string;
  model: string;
  planInfo: { plan: string; suggestionLimit: number; currentCount: number; canGenerate: boolean };
}

const POPULAR_STOCKS = [
  { sym: 'RELIANCE', label: 'Reliance' },
  { sym: 'HDFCBANK', label: 'HDFC Bank' },
  { sym: 'INFY', label: 'Infosys' },
  { sym: 'TCS', label: 'TCS' },
  { sym: 'TITAN', label: 'Titan' },
  { sym: 'WIPRO', label: 'Wipro' },
  { sym: 'SBIN', label: 'SBI' },
  { sym: 'ICICIBANK', label: 'ICICI' },
  { sym: 'BAJFINANCE', label: 'Bajaj Fin' },
  { sym: 'MARUTI', label: 'Maruti' },
];

const RATING_STYLE: Record<string, string> = {
  BUY: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  HOLD: 'bg-amber-100 text-amber-800 border-amber-200',
  SELL: 'bg-red-100 text-red-700 border-red-200',
};

const NEWS_IMPACT_STYLE: Record<string, string> = {
  positive: 'text-emerald-600 bg-emerald-50',
  neutral: 'text-amber-600 bg-amber-50',
  negative: 'text-red-600 bg-red-50',
};

const RECOMMENDATION_STYLE: Record<string, string> = {
  'Buy Now': 'bg-emerald-600 text-white',
  'Wait for Dip': 'bg-amber-500 text-white',
  'Avoid': 'bg-red-600 text-white',
};

export default function ResearchPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [customSymbol, setCustomSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [userPlan, setUserPlan] = useState('explorer');
  const [papderTrading, setPaperTrading] = useState(false);
  const [paperToast, setPaperToast] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<{ current_cash: number } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Load user plan
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
        if (p?.plan) setUserPlan(p.plan);
      }
      // Load portfolio
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const d = await res.json();
        setPortfolio(d.portfolio);
      }
    };
    init();
  }, []);

  const generate = async (sym?: string) => {
    const target = sym ?? (customSymbol.toUpperCase() || symbol);

    // Check plan limit from previous result's planInfo
    if (result?.planInfo && usageCount >= result.planInfo.suggestionLimit) {
      setError(`You've reached your ${result.planInfo.suggestionLimit} report limit on the ${userPlan} plan. Upgrade for more.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/groq/research?symbol=${target}&count=${usageCount + 1}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const data: ApiResponse = await res.json();
      if ((data.report as unknown as Record<string, unknown>)?.error) throw new Error('Report generation failed — try again');
      setResult(data);
      setUsageCount(c => c + 1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
    setLoading(false);
  };

  const handlePaperTrade = async () => {
    if (!result) return;
    const price = result.priceData?.price;
    if (!price) { setPaperToast('Could not get live price'); return; }

    setPaperTrading(true);
    try {
      const res = await fetch('/api/portfolio/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: result.symbol,
          side: 'BUY',
          quantity: 1,
          order_type: 'MARKET',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaperToast(`✅ Bought 1 share of ${result.symbol} @ ₹${price.toFixed(2)} in your paper portfolio!`);
        // Reload portfolio balance
        const pRes = await fetch('/api/portfolio');
        if (pRes.ok) { const pd = await pRes.json(); setPortfolio(pd.portfolio); }
      } else {
        setPaperToast(`❌ ${data.error ?? 'Order failed'}`);
      }
    } catch {
      setPaperToast('❌ Network error');
    }
    setPaperTrading(false);
    setTimeout(() => setPaperToast(null), 5000);
  };

  const report = result?.report;
  const price = result?.priceData;
  const planInfo = result?.planInfo;
  const sentimentScore = report?.sentimentScore ?? 50;

  return (
    <main className="pt-24 pb-16 px-8">
      <div className="max-w-[1024px] mx-auto space-y-8">

        {/* Header */}
        <div className="animate-fade-in-up">
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Powered by Groq · llama3-70b</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">AI Research Engine</h2>
          <p className="text-stone-500 font-body text-sm mt-2">Institutional-grade analysis with live market data, sentiment & buy/sell signals.</p>
        </div>

        {/* Paper Toast */}
        {paperToast && (
          <div className="fixed top-6 right-6 z-[200] px-5 py-3 rounded-xl shadow-xl font-ui text-sm text-white bg-[#1A4D2E] flex items-center gap-2 animate-fade-in-down max-w-sm">
            {paperToast}
          </div>
        )}

        {/* Plan usage bar */}
        {planInfo && (
          <div className="glass-panel px-5 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-amber-600">auto_awesome</span>
              <div>
                <p className="text-xs font-ui font-bold text-stone-700">Research Reports Used</p>
                <p className="text-[10px] text-stone-400 font-data">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} plan · {usageCount}/{planInfo.suggestionLimit} this session</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((usageCount / planInfo.suggestionLimit) * 100, 100)}%` }}
                />
              </div>
              {userPlan === 'explorer' && (
                <a href="/pricing" className="text-[10px] font-ui font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full hover:bg-amber-100 transition-colors">
                  Upgrade for more →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Stock Selector */}
        <div className="glass-panel p-6 rounded-xl space-y-4 animate-fade-in-up">
          <p className="text-[10px] font-ui font-bold uppercase tracking-widest text-stone-500">Select stock or type NSE symbol</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STOCKS.map(s => (
              <button
                key={s.sym}
                onClick={() => { setSymbol(s.sym); setCustomSymbol(''); }}
                className={`px-4 py-2 font-ui font-bold text-xs rounded-lg transition-all ${
                  symbol === s.sym && !customSymbol
                    ? 'bg-[#1A4D2E] text-white shadow-lg shadow-[#1A4D2E]/20'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              value={customSymbol}
              onChange={e => { setCustomSymbol(e.target.value.toUpperCase()); setSymbol(''); }}
              placeholder="Or type NSE symbol (e.g. BAJFINANCE)"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-data focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 placeholder:font-body"
            />
            <button
              onClick={() => generate()}
              disabled={loading}
              className="px-8 py-2.5 bg-[#1A4D2E] text-white font-ui font-bold text-sm rounded-xl hover:bg-[#143D24] disabled:opacity-60 transition-colors flex items-center gap-2 shadow-lg shadow-[#1A4D2E]/20 btn-press"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">auto_awesome</span> Generate Report</>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
            {!error.includes('limit') && (
              <button onClick={() => generate()} className="ml-auto font-bold underline">Retry</button>
            )}
            {error.includes('limit') && (
              <a href="/pricing" className="ml-auto font-bold underline">Upgrade Plan →</a>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 bg-stone-100 rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-stone-100 rounded-xl" />)}
            </div>
            <div className="h-48 bg-stone-100 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-40 bg-stone-100 rounded-xl" />
              <div className="h-40 bg-stone-100 rounded-xl" />
            </div>
          </div>
        )}

        {/* Report */}
        {report && !loading && (
          <div className="space-y-6 animate-fade-in-up">

            {/* Title + Price + Sentiment */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-3xl font-headline text-[#00361a]">{result!.symbol}</h3>
                  <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${RATING_STYLE[report.aiRating] ?? RATING_STYLE.HOLD}`}>
                    {report.aiRating}
                  </span>
                  {report.newsImpact && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${NEWS_IMPACT_STYLE[report.newsImpact] ?? 'text-stone-500 bg-stone-100'}`}>
                      News: {report.newsImpact}
                    </span>
                  )}
                </div>
                <p className="font-body text-stone-600 text-sm max-w-lg">{report.summary}</p>

                {/* Sentiment Gauge */}
                {report.sentiment && (
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-ui text-stone-500">Market Sentiment</span>
                    <div className="w-32 h-2 bg-gradient-to-r from-red-400 via-amber-400 to-emerald-500 rounded-full relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#1A4D2E] rounded-full shadow"
                        style={{ left: `calc(${sentimentScore}% - 6px)` }}
                      />
                    </div>
                    <span className={`text-xs font-bold font-ui ${sentimentScore > 60 ? 'text-emerald-600' : sentimentScore < 40 ? 'text-red-600' : 'text-amber-600'}`}>
                      {report.sentiment} ({sentimentScore}/100)
                    </span>
                  </div>
                )}
              </div>

              {price && price.price > 0 && (
                <div className="glass-panel p-5 rounded-xl text-right min-w-[200px]">
                  <p className="text-[10px] font-data uppercase text-stone-400 mb-1">Live Market Data</p>
                  <p className="text-3xl font-data font-bold text-[#00361a]">₹{price.price.toFixed(2)}</p>
                  <p className={`text-sm font-data font-bold mt-0.5 ${price.changeP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {price.changeP >= 0 ? '▲' : '▼'} {Math.abs(price.changeP)?.toFixed(2)}%
                  </p>
                  <div className="mt-2 pt-2 border-t border-stone-100 grid grid-cols-2 gap-1 text-[10px]">
                    <span className="text-stone-400">H: <span className="text-stone-600 font-bold">₹{price.high?.toFixed(0)}</span></span>
                    <span className="text-stone-400">L: <span className="text-stone-600 font-bold">₹{price.low?.toFixed(0)}</span></span>
                    <span className="text-stone-400 col-span-2">Prev: <span className="text-stone-600 font-bold">₹{price.previousClose?.toFixed(2)}</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Key Metrics */}
            {report.keyMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Sector', val: report.keyMetrics.sector },
                  { label: 'Market Cap', val: report.keyMetrics.marketCap },
                  { label: 'Economic Moat', val: report.keyMetrics.moat },
                  { label: 'Risk Level', val: report.keyMetrics.riskLevel,
                    color: ({ Low: 'text-emerald-600', Medium: 'text-amber-600', High: 'text-red-600' } as Record<string, string>)[report.keyMetrics.riskLevel] },
                ].map(m => (
                  <div key={m.label} className="bg-white rounded-xl p-4 border border-stone-100 shadow-card">
                    <p className="text-[10px] font-ui font-bold uppercase tracking-widest text-stone-400 mb-1">{m.label}</p>
                    <p className={`font-ui font-bold text-sm ${m.color ?? 'text-[#00361a]'}`}>{m.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Buy Signal Card */}
            {report.buySignal && (
              <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-card">
                <div className="bg-[#1A4D2E] text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>track_changes</span>
                    <div>
                      <p className="text-[10px] font-data uppercase tracking-wider opacity-70">AI Trade Signal</p>
                      <p className="font-headline text-lg">{report.targetPrice}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl font-ui font-bold text-sm ${RECOMMENDATION_STYLE[report.buySignal.recommendation] ?? 'bg-white/20 text-white'}`}>
                    {report.buySignal.recommendation}
                  </span>
                </div>
                <div className="bg-white p-5 grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div>
                    <p className="text-[10px] font-ui text-stone-400 uppercase tracking-wider mb-1">Ideal Entry Range</p>
                    <p className="font-data font-bold text-[#00361a]">{report.buySignal.idealEntryRange}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-ui text-stone-400 uppercase tracking-wider mb-1">Stop Loss</p>
                    <p className="font-data font-bold text-red-600">{report.buySignal.stopLoss}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-ui text-stone-400 uppercase tracking-wider mb-1">Timeframe</p>
                    <p className="font-data font-bold text-stone-700">{report.buySignal.timeframe}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-ui text-stone-400 uppercase tracking-wider mb-1">Target 1 (3M)</p>
                    <p className="font-data font-bold text-emerald-600">{report.buySignal.target1}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-ui text-stone-400 uppercase tracking-wider mb-1">Target 2 (12M)</p>
                    <p className="font-data font-bold text-emerald-700">{report.buySignal.target2}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-[10px] font-ui text-stone-400 uppercase tracking-wider mb-1">Entry Rationale</p>
                    <p className="text-sm text-stone-600 font-body">{report.buySignal.rationale}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Overview + Technical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-card border border-stone-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#1A4D2E] text-[20px]">info</span>
                  <h3 className="font-ui font-bold text-sm uppercase tracking-widest text-stone-500">Company Overview</h3>
                </div>
                <p className="font-body text-stone-600 leading-relaxed text-sm">{report.overview}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-card border border-stone-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#1A4D2E] text-[20px]">analytics</span>
                  <h3 className="font-ui font-bold text-sm uppercase tracking-widest text-stone-500">Technical Analysis</h3>
                </div>
                <p className="font-body text-stone-600 leading-relaxed text-sm">{report.technicalAnalysis}</p>
              </div>
            </div>

            {/* Bull / Bear */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">trending_up</span>
                  <h3 className="font-ui font-bold text-sm text-emerald-800">Bull Thesis</h3>
                </div>
                <ul className="space-y-2">
                  {(report.bullThesis ?? []).map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-900">
                      <span className="material-symbols-outlined text-emerald-500 text-[16px] mt-0.5 flex-shrink-0">arrow_forward</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">trending_down</span>
                  <h3 className="font-ui font-bold text-sm text-red-800">Key Risks</h3>
                </div>
                <ul className="space-y-2">
                  {(report.bearThesis ?? []).map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                      <span className="material-symbols-outlined text-red-400 text-[16px] mt-0.5 flex-shrink-0">warning</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Catalysts + Risks */}
            {(report.catalysts?.length > 0 || report.risks?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.catalysts?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-blue-500 text-[18px]">rocket_launch</span>
                      <h3 className="font-ui font-bold text-sm text-blue-800">Upcoming Catalysts</h3>
                    </div>
                    <ul className="space-y-2">
                      {report.catalysts.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-blue-900">
                          <span className="material-symbols-outlined text-blue-400 text-[14px] mt-0.5 flex-shrink-0">bolt</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.risks?.length > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-orange-500 text-[18px]">gpp_maybe</span>
                      <h3 className="font-ui font-bold text-sm text-orange-800">Downside Risks to Monitor</h3>
                    </div>
                    <ul className="space-y-2">
                      {report.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-orange-900">
                          <span className="material-symbols-outlined text-orange-400 text-[14px] mt-0.5 flex-shrink-0">report</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Paper Trade CTA */}
            {report.aiRating !== 'SELL' && price && price.price > 0 && (
              <div className="bg-gradient-to-r from-[#1A4D2E] to-[#2D7A4F] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white">
                  <p className="font-headline text-xl mb-1">Try it with Paper Trading?</p>
                  <p className="text-sm opacity-80 font-body">
                    Buy 1 share of {result!.symbol} @ ₹{price.price.toFixed(2)} using your virtual ₹1,00,000 balance
                    {portfolio && ` · Cash available: ₹${portfolio.current_cash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={handlePaperTrade}
                    disabled={papderTrading}
                    className="px-6 py-3 bg-[#D4A843] text-[#0F1A14] rounded-xl font-ui font-bold text-sm hover:bg-[#C8A040] transition-all btn-press disabled:opacity-60 flex items-center gap-2"
                  >
                    {papderTrading ? (
                      <><span className="w-3 h-3 border-2 border-[#0F1A14]/30 border-t-[#0F1A14] rounded-full animate-spin" /> Buying...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">swap_horiz</span> Buy 1 Share Now</>
                    )}
                  </button>
                  <a href="/dashboard/paper-trade" className="px-6 py-3 bg-white/10 text-white rounded-xl font-ui font-bold text-sm hover:bg-white/20 transition-all border border-white/20">
                    View Portfolio →
                  </a>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-data">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              Generated {new Date(result!.generatedAt).toLocaleTimeString('en-IN')} · Model: {result!.model}
              <span className="ml-auto">For research only — not investment advice</span>
            </div>
          </div>
        )}

        {/* Initial CTA */}
        {!result && !loading && !error && (
          <div className="bg-white rounded-2xl shadow-card p-16 text-center border border-stone-100">
            <div className="w-20 h-20 bg-[#1A4D2E]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[40px] text-[#1A4D2E]">auto_awesome</span>
            </div>
            <h3 className="font-headline text-2xl text-[#00361a] mb-2">AI Research Engine</h3>
            <p className="font-body text-stone-500 mb-2 max-w-md mx-auto">
              Institutional-grade equity analysis with live data, sentiment scores, buy/sell signals, and paper trade integration — powered by Groq AI.
            </p>
            <p className="text-xs font-ui text-stone-400 mb-8">
              {userPlan === 'explorer' ? '2 free reports · ' : ''}Upgrade for unlimited reports
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {POPULAR_STOCKS.slice(0, 4).map(s => (
                <button
                  key={s.sym}
                  onClick={() => { setSymbol(s.sym); generate(s.sym); }}
                  className="px-5 py-2.5 border border-[#1A4D2E]/20 text-[#1A4D2E] font-ui font-bold text-sm rounded-lg hover:bg-[#1A4D2E]/5 transition-colors"
                >
                  Analyse {s.label} →
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
