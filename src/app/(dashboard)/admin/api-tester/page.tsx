'use client';

import { useState } from 'react';

type ApiEndpoint = {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  defaultParams?: Record<string, string>;
  defaultBody?: string;
  description: string;
  category: string;
};

const ENDPOINTS: ApiEndpoint[] = [
  // Market Data
  {
    name: 'Market Indices',
    url: '/api/market/indices',
    method: 'GET',
    description: 'Fetches major Indian indices (Nifty 50, Bank Nifty, etc.) via Yahoo Finance v8.',
    category: 'Market Data',
  },
  {
    name: 'Stock Quote',
    url: '/api/market/quote',
    method: 'GET',
    defaultParams: { symbol: 'RELIANCE' },
    description: 'Fetches real-time OHLCV quote for a specific equity via Yahoo Finance v8.',
    category: 'Market Data',
  },
  {
    name: 'HDFC Bank Quote',
    url: '/api/market/quote',
    method: 'GET',
    defaultParams: { symbol: 'HDFCBANK' },
    description: 'Test with HDFCBANK symbol.',
    category: 'Market Data',
  },
  {
    name: 'TCS Quote',
    url: '/api/market/quote',
    method: 'GET',
    defaultParams: { symbol: 'TCS' },
    description: 'Test with TCS symbol.',
    category: 'Market Data',
  },
  // AI Services
  {
    name: 'Groq AI Research (RELIANCE)',
    url: '/api/groq/research',
    method: 'GET',
    defaultParams: { symbol: 'RELIANCE' },
    description: 'Generates institutional equity research via llama3-70b-8192. Takes ~3-5s.',
    category: 'AI Services',
  },
  {
    name: 'Groq AI Research (INFY)',
    url: '/api/groq/research',
    method: 'GET',
    defaultParams: { symbol: 'INFY' },
    description: 'Test Groq research with Infosys.',
    category: 'AI Services',
  },
  {
    name: 'Groq Screener Summary',
    url: '/api/groq/screener',
    method: 'POST',
    description: 'Summarizes screener results using AI.',
    defaultBody: JSON.stringify({
      stocks: [
        { symbol: 'TATASTEEL', price: 154, changeP: 1.2, sector: 'Materials' },
        { symbol: 'RELIANCE', price: 2850, changeP: 0.8, sector: 'Energy' },
      ],
      filters: { minChange: 0.5 }
    }, null, 2),
    category: 'AI Services',
  },
  // Platform
  {
    name: 'Platform Stats',
    url: '/api/stats',
    method: 'GET',
    description: 'Platform-wide metrics: total backtests, users, uptime.',
    category: 'Platform',
  },
  {
    name: 'Admin Plans List',
    url: '/api/admin/plans',
    method: 'GET',
    description: 'Lists all subscription plans from database.',
    category: 'Platform',
  },
  // Backtest
  {
    name: 'Create Backtest Job',
    url: '/api/backtest',
    method: 'POST',
    description: 'Queue a new backtest job (requires auth).',
    defaultBody: JSON.stringify({
      symbol: 'RELIANCE',
      strategy: 'MA_CROSSOVER',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      initialCapital: 100000,
      params: { fastPeriod: 10, slowPeriod: 30 }
    }, null, 2),
    category: 'Backtest',
  },
  {
    name: 'List Backtest Jobs',
    url: '/api/backtest',
    method: 'GET',
    description: 'List all backtest jobs for the authenticated user.',
    category: 'Backtest',
  },
];

const CATEGORIES = ['Market Data', 'AI Services', 'Platform', 'Backtest'];

const STATUS_COLOR = (s: number) => {
  if (s === 0) return 'text-stone-400';
  if (s < 300) return 'text-emerald-400';
  if (s < 400) return 'text-amber-400';
  return 'text-red-400';
};

export default function ApiTesterPage() {
  const [selectedCategory, setSelectedCategory] = useState('Market Data');
  const [selected, setSelected] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [params, setParams] = useState<Record<string, string>>(ENDPOINTS[0].defaultParams ?? {});
  const [body, setBody] = useState<string>(ENDPOINTS[0].defaultBody ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: number; data: unknown; timeMs: number } | null>(null);
  const [history, setHistory] = useState<Array<{ url: string; status: number; timeMs: number; ts: string }>>([]);

  const handleSelect = (ep: ApiEndpoint) => {
    setSelected(ep);
    setParams(ep.defaultParams ?? {});
    setBody(ep.defaultBody ?? '');
    setResult(null);
  };

  const handleParamChange = (key: string, val: string) => setParams(prev => ({ ...prev, [key]: val }));

  const addParam = () => setParams(prev => ({ ...prev, '': '' }));

  const removeParam = (key: string) => {
    const p = { ...params };
    delete p[key];
    setParams(p);
  };

  const doTest = async () => {
    setLoading(true);
    setResult(null);
    const start = performance.now();
    try {
      const search = new URLSearchParams(params).toString();
      const finalUrl = selected.url + (search ? `?${search}` : '');
      const req: RequestInit = { method: selected.method };
      if (selected.method === 'POST' || selected.method === 'PUT') {
        req.headers = { 'Content-Type': 'application/json' };
        req.body = body || '{}';
      }
      const res = await fetch(finalUrl, req);
      const text = await res.text();
      let data: unknown;
      try { data = JSON.parse(text); } catch { data = text; }
      const timeMs = Math.round(performance.now() - start);
      setResult({ status: res.status, data, timeMs });
      setHistory(prev => [{ url: finalUrl, status: res.status, timeMs, ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Network error';
      const timeMs = Math.round(performance.now() - start);
      setResult({ status: 0, data: { error: message }, timeMs });
    }
    setLoading(false);
  };

  const runAll = async () => {
    for (const ep of ENDPOINTS.filter(e => e.method === 'GET' && e.category === selectedCategory)) {
      handleSelect(ep);
      await new Promise(r => setTimeout(r, 200));
      await doTest();
    }
  };

  const categoryEndpoints = ENDPOINTS.filter(e => e.category === selectedCategory);

  return (
    <main className="pt-24 pb-16 px-8 max-w-[1400px] mx-auto page-enter">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Admin Utilities</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Live API Tester</h2>
          <p className="text-stone-500 font-body text-sm mt-2 max-w-2xl">
            Comprehensive real-time testing sandbox for all platform endpoints. Monitor latency, inspect JSON payloads, and validate production reliability.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runAll}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[#1A4D2E] text-[#1A4D2E] text-sm font-ui font-bold rounded-lg hover:bg-[#1A4D2E]/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">playlist_play</span>
            Run All GET
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 border-b border-stone-200 pb-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); handleSelect(ENDPOINTS.find(e => e.category === cat)!); }}
            className={`px-4 py-2.5 text-sm font-ui font-bold border-b-2 transition-all -mb-px ${
              selectedCategory === cat
                ? 'border-[#1A4D2E] text-[#1A4D2E]'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Endpoint List */}
          <div className="bg-white rounded-xl shadow-card border border-stone-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
              <h3 className="font-ui font-bold text-xs uppercase tracking-widest text-stone-500">{selectedCategory} Endpoints</h3>
            </div>
            <div className="divide-y divide-stone-50">
              {categoryEndpoints.map((ep) => (
                <button
                  key={ep.url + ep.name}
                  onClick={() => handleSelect(ep)}
                  className={`w-full text-left px-4 py-3.5 transition-all hover:bg-stone-50 ${selected.name === ep.name ? 'bg-emerald-50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-data ${
                      ep.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                      ep.method === 'POST' ? 'bg-amber-100 text-amber-700' :
                      ep.method === 'PUT' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>{ep.method}</span>
                    <span className={`text-sm font-ui ${selected.name === ep.name ? 'font-bold text-[#1A4D2E]' : 'text-stone-700'}`}>{ep.name}</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1 font-data truncate">{ep.url}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Request Config */}
          <div className="bg-white rounded-xl shadow-card border border-stone-100 p-5">
            <h3 className="font-ui font-bold text-xs uppercase tracking-widest text-stone-500 mb-4">Request Configuration</h3>

            <div className="mb-3 p-3 bg-stone-50 rounded-lg">
              <p className="text-[10px] text-stone-500 font-ui mb-1">Description</p>
              <p className="text-xs text-stone-700 font-body leading-relaxed">{selected.description}</p>
            </div>

            {selected.method === 'GET' && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Query Params</label>
                  <button onClick={addParam} className="text-[#1A4D2E] text-xs font-bold font-ui">+ Add</button>
                </div>
                {Object.keys(params).length === 0 && <p className="text-xs text-stone-400 italic">No parameters</p>}
                {Object.entries(params).map(([k, v], i) => (
                  <div key={i} className="flex gap-1.5 mb-1.5 items-center">
                    <input placeholder="key" value={k}
                      onChange={e => { const p = { ...params }; delete p[k]; p[e.target.value] = v; setParams(p); }}
                      className="w-2/5 border border-stone-200 rounded px-2 py-1.5 text-xs font-data bg-stone-50 focus:outline-[#1A4D2E]" />
                    <span className="text-stone-300 text-xs">=</span>
                    <input placeholder="value" value={v}
                      onChange={e => handleParamChange(k, e.target.value)}
                      className="flex-1 border border-stone-200 rounded px-2 py-1.5 text-xs font-data bg-stone-50 focus:outline-[#1A4D2E]" />
                    <button onClick={() => removeParam(k)} className="text-stone-300 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(selected.method === 'POST' || selected.method === 'PUT') && (
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-2">JSON Body</label>
                <textarea
                  className="w-full h-36 font-data text-xs border border-stone-200 rounded-lg p-2 bg-stone-50 resize-none focus:outline-[#1A4D2E] focus:border-[#1A4D2E]"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={doTest}
              disabled={loading}
              className="w-full py-3 bg-[#1A4D2E] text-white font-ui font-bold text-sm rounded-lg hover:bg-[#143D24] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1A4D2E]/15 btn-press"
            >
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> In Flight...</>
              ) : (
                <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span> Execute Request</>
              )}
            </button>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl shadow-card border border-stone-100 p-4">
              <h3 className="font-ui font-bold text-xs uppercase tracking-widest text-stone-500 mb-3">Request History</h3>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] font-data">
                    <span className="text-stone-500 truncate flex-1">{h.url}</span>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className={STATUS_COLOR(h.status)}>{h.status || 'ERR'}</span>
                      <span className="text-[#D4A843]">{h.timeMs}ms</span>
                      <span className="text-stone-300">{h.ts}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Response Panel */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="bg-[#0A120E] text-stone-300 rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ minHeight: '580px' }}>
            {/* Terminal Header */}
            <div className="bg-[#070E0B] px-5 py-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-stone-600 text-xs font-data ml-2">algoveda-api-tester</span>
              </div>
              {result && (
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1.5 text-[10px] font-data font-bold uppercase tracking-wider ${STATUS_COLOR(result.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${result.status >= 200 && result.status < 300 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    STATUS {result.status || 'ERROR'}
                  </div>
                  <div className="text-[10px] font-data font-bold text-[#D4A843] uppercase tracking-wider">
                    {result.timeMs}ms
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))}
                    className="text-stone-600 hover:text-stone-300 transition-colors"
                    title="Copy response"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </div>
              )}
            </div>

            {/* URL Bar */}
            <div className="bg-[#0D1810] px-5 py-2.5 border-b border-white/5 flex items-center gap-3">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-data ${
                selected.method === 'GET' ? 'bg-blue-900/50 text-blue-400' :
                selected.method === 'POST' ? 'bg-amber-900/50 text-amber-400' :
                'bg-purple-900/50 text-purple-400'
              }`}>{selected.method}</span>
              <span className="text-stone-500 font-data text-xs flex-1 truncate">
                {selected.url}{Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : ''}
              </span>
              {loading && <span className="text-[#D4A843] text-[10px] font-data animate-pulse">● fetching...</span>}
            </div>

            {/* Response Body */}
            <div className="p-5 overflow-auto flex-1 font-data text-xs leading-relaxed scrollbar-gold">
              {!result && !loading && (
                <div className="text-stone-600 mt-12 text-center">
                  <span className="material-symbols-outlined text-[36px] text-stone-700 block mb-3">terminal</span>
                  <p>Select an endpoint and hit <span className="text-[#D4A843]">Execute Request</span> to see the response</p>
                </div>
              )}
              {loading && (
                <div className="mt-12 text-center">
                  <div className="flex justify-center gap-1 mb-3">
                    <span className="w-2 h-2 bg-[#D4A843] rounded-full loading-dot" />
                    <span className="w-2 h-2 bg-[#D4A843] rounded-full loading-dot" />
                    <span className="w-2 h-2 bg-[#D4A843] rounded-full loading-dot" />
                  </div>
                  <p className="text-stone-500">Request in flight...</p>
                </div>
              )}
              {result && !loading && (
                <pre className="text-[11px] leading-relaxed">
                  <code className="text-emerald-300">
                    {JSON.stringify(result.data, null, 2)}
                  </code>
                </pre>
              )}
            </div>
          </div>

          {/* Quick Test All */}
          <div className="bg-white rounded-xl border border-stone-100 shadow-card p-5">
            <h3 className="font-ui font-bold text-sm text-stone-700 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#1A4D2E]">speed</span>
              Quick Health Check
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Yahoo Finance', url: '/api/market/quote?symbol=RELIANCE', color: 'blue' },
                { label: 'Indices Feed', url: '/api/market/indices', color: 'green' },
                { label: 'Groq AI', url: '/api/groq/research?symbol=INFY', color: 'purple' },
                { label: 'Platform Stats', url: '/api/stats', color: 'amber' },
              ].map(({ label, url, color }) => (
                <QuickCheck key={url} label={label} url={url} color={color} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function QuickCheck({ label, url, color }: { label: string; url: string; color: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'fail'>('idle');
  const [ms, setMs] = useState<number | null>(null);

  const check = async () => {
    setState('loading');
    const start = performance.now();
    try {
      const res = await fetch(url);
      setMs(Math.round(performance.now() - start));
      setState(res.ok ? 'ok' : 'fail');
    } catch {
      setMs(Math.round(performance.now() - start));
      setState('fail');
    }
  };

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-emerald-50 border-emerald-200',
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
  };

  return (
    <button
      onClick={check}
      disabled={state === 'loading'}
      className={`p-3 rounded-lg border text-left transition-all card-hover ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-ui font-bold text-stone-700">{label}</span>
        {state === 'loading' && <span className="w-3 h-3 border-2 border-stone-400/30 border-t-stone-400 rounded-full animate-spin" />}
        {state === 'ok' && <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>}
        {state === 'fail' && <span className="material-symbols-outlined text-[14px] text-red-500">error</span>}
        {state === 'idle' && <span className="material-symbols-outlined text-[14px] text-stone-300">radio_button_unchecked</span>}
      </div>
      <p className="text-[9px] font-data text-stone-400 truncate">{url}</p>
      {ms !== null && (
        <p className={`text-[10px] font-data font-bold mt-1 ${state === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
          {state === 'ok' ? `✓ ${ms}ms` : `✗ ${ms}ms`}
        </p>
      )}
      {state === 'idle' && <p className="text-[9px] text-stone-400 mt-1">Click to test</p>}
    </button>
  );
}
