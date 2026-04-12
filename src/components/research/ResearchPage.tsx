'use client';

import { useState } from 'react';

interface ResearchReport {
  overview: string;
  technicalAnalysis: string;
  bullThesis: string[];
  bearThesis: string[];
  aiRating: 'BUY' | 'HOLD' | 'SELL';
  targetPrice: string;
  keyMetrics: {
    sector: string;
    marketCap: string;
    moat: string;
    riskLevel: string;
  };
  summary: string;
}

interface ApiResponse {
  symbol: string;
  report: ResearchReport;
  priceData: {
    price: number;
    changeP: number;
    high: number;
    low: number;
    volume: number;
  } | null;
  generatedAt: string;
  model: string;
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
];

const RATING_STYLE: Record<string, string> = {
  BUY: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  HOLD: 'bg-amber-100 text-amber-800 border-amber-200',
  SELL: 'bg-red-100 text-red-700 border-red-200',
};

const RISK_COLOR: Record<string, string> = {
  Low: 'text-emerald-600',
  Medium: 'text-amber-600',
  High: 'text-red-600',
};

export default function ResearchPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [customSymbol, setCustomSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (sym?: string) => {
    const target = sym ?? (customSymbol.toUpperCase() || symbol);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/groq/research?symbol=${target}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const data: ApiResponse = await res.json();
      if ((data.report as any)?.error) throw new Error('Report generation failed — try again');
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    }
    setLoading(false);
  };

  const report = result?.report;
  const price = result?.priceData;

  return (
    <main className="pt-24 pb-16 px-8">
      <div className="max-w-[960px] mx-auto space-y-8">

        {/* Header */}
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Powered by Groq · llama3-70b</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">AI Research Reports</h2>
          <p className="text-stone-500 font-body text-sm mt-2">Institutional-grade equity analysis generated in seconds.</p>
        </div>

        {/* Stock Selector */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <p className="text-[10px] font-ui font-bold uppercase tracking-widest text-stone-500">Select or type a symbol</p>
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
              className="flex-1 border border-stone-200 rounded-lg px-4 py-2.5 text-sm font-data focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 placeholder:font-body"
            />
            <button
              onClick={() => generate()}
              disabled={loading}
              className="px-8 py-2.5 bg-[#1A4D2E] text-white font-ui font-bold text-sm rounded-lg hover:bg-[#143D24] disabled:opacity-60 transition-colors flex items-center gap-2 shadow-lg shadow-[#1A4D2E]/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
            <span className="material-symbols-outlined">error</span>
            {error}
            <button onClick={() => generate()} className="ml-auto font-bold underline">Retry</button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-stone-100 rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-stone-100 rounded-xl" />)}
            </div>
            <div className="h-64 bg-stone-100 rounded-xl" />
          </div>
        )}

        {/* Report */}
        {report && !loading && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">

            {/* Title + Price */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-headline text-[#00361a]">{result!.symbol}</h3>
                  <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${RATING_STYLE[report.aiRating] ?? RATING_STYLE.HOLD}`}>
                    {report.aiRating}
                  </span>
                </div>
                <p className="font-body text-stone-600 text-sm max-w-lg">{report.summary}</p>
              </div>
              {price && price.price > 0 && (
                <div className="glass-panel p-4 rounded-xl text-right min-w-[180px]">
                  <p className="text-[10px] font-data uppercase text-stone-400">Live Price</p>
                  <p className="text-2xl font-data font-bold text-[#00361a]">₹{price.price.toFixed(2)}</p>
                  <p className={`text-sm font-data font-bold ${price.changeP >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {price.changeP >= 0 ? '+' : ''}{price.changeP?.toFixed(2)}%
                  </p>
                  <p className="text-[9px] text-stone-400 mt-1">
                    H: ₹{price.high?.toFixed(2)} · L: ₹{price.low?.toFixed(2)}
                  </p>
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
                    extra: RISK_COLOR[report.keyMetrics.riskLevel] },
                ].map(m => (
                  <div key={m.label} className="bg-white rounded-xl p-4 border border-stone-100 shadow-card">
                    <p className="text-[10px] font-ui font-bold uppercase tracking-widest text-stone-400 mb-1">{m.label}</p>
                    <p className={`font-ui font-bold text-sm ${m.extra ?? 'text-[#00361a]'}`}>{m.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Target Price */}
            <div className="bg-[#1A4D2E] text-white rounded-xl p-5 flex items-center gap-4">
              <span className="material-symbols-outlined text-[32px] opacity-80">track_changes</span>
              <div>
                <p className="text-[10px] font-data uppercase tracking-wider opacity-70">12-Month Price Target</p>
                <p className="text-2xl font-headline">{report.targetPrice}</p>
              </div>
            </div>

            {/* Overview + Technical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-card border border-stone-100 ai-report">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#1A4D2E] text-[20px]">info</span>
                  <h3 className="font-ui font-bold text-sm uppercase tracking-widest text-stone-500">Company Overview</h3>
                </div>
                <p className="font-body text-stone-600 leading-relaxed text-sm">{report.overview}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-card border border-stone-100 ai-report">
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

            {/* Footer meta */}
            <div className="flex items-center gap-2 text-[10px] text-stone-400 font-data">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              Generated {new Date(result!.generatedAt).toLocaleTimeString('en-IN')} · Model: {result!.model}
              <span className="ml-auto">For research only — not investment advice</span>
            </div>
          </div>
        )}

        {/* Initial CTA state */}
        {!result && !loading && !error && (
          <div className="bg-white rounded-2xl shadow-card p-16 text-center border border-stone-100">
            <div className="w-20 h-20 bg-[#1A4D2E]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[40px] text-[#1A4D2E]">auto_awesome</span>
            </div>
            <h3 className="font-headline text-2xl text-[#00361a] mb-2">AI Research Engine</h3>
            <p className="font-body text-stone-500 mb-8 max-w-md mx-auto">
              Select a stock above and click "Generate Report" to get institutional-grade AI analysis powered by Groq's ultra-fast LLM.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {POPULAR_STOCKS.slice(0, 4).map(s => (
                <button
                  key={s.sym}
                  onClick={() => { setSymbol(s.sym); generate(s.sym); }}
                  className="px-5 py-2.5 border border-[#1A4D2E]/20 text-[#1A4D2E] font-ui font-bold text-sm rounded-lg hover:bg-[#1A4D2E]/5 transition-colors"
                >
                  Try {s.label} →
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}