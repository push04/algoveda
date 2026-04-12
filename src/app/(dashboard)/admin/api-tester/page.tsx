'use client';

import { useState } from 'react';

type ApiEndpoint = {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  defaultParams?: Record<string, string>;
  defaultBody?: string;
  description: string;
};

const ENDPOINTS: ApiEndpoint[] = [
  {
    name: 'Market Indices',
    url: '/api/market/indices',
    method: 'GET',
    description: 'Fetches major Indian indices (Nifty, Sensex) via Yahoo Finance.',
  },
  {
    name: 'Market Quote',
    url: '/api/market/quote',
    method: 'GET',
    defaultParams: { symbol: 'RELIANCE' },
    description: 'Fetches real-time quote for a specific equity symbol.',
  },
  {
    name: 'Groq AI Research',
    url: '/api/groq/research',
    method: 'GET',
    defaultParams: { symbol: 'HDFCBANK' },
    description: 'Generates institutional equity research via llama3-70b-8192.',
  },
  {
    name: 'Platform Stats',
    url: '/api/stats',
    method: 'GET',
    description: 'Retrieves Supabase agg stats (users, backtests) used in the hero bar.',
  },
  {
    name: 'Admin Plans (GET)',
    url: '/api/admin/plans',
    method: 'GET',
    description: 'Lists all available subscription plans publicly.',
  },
  {
    name: 'Groq Screener',
    url: '/api/groq/screener',
    method: 'POST',
    description: 'Summarizes screener hits.',
    defaultBody: JSON.stringify({
      stocks: [{ symbol: 'TATASTEEL', price: 154, changeP: 1.2, sector: 'Materials' }],
      filters: { minChange: 1 }
    }, null, 2),
  }
];

export default function ApiTesterPage() {
  const [selected, setSelected] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [params, setParams] = useState<Record<string, string>>(selected.defaultParams ?? {});
  const [body, setBody] = useState<string>(selected.defaultBody ?? '');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: number; data: any; timeMs: number } | null>(null);

  const handleSelect = (idx: number) => {
    const e = ENDPOINTS[idx];
    setSelected(e);
    setParams(e.defaultParams ?? {});
    setBody(e.defaultBody ?? '');
    setResult(null);
  };

  const handleParamChange = (key: string, val: string) => {
    setParams(prev => ({ ...prev, [key]: val }));
  };

  const addParam = () => {
    setParams(prev => ({ ...prev, ['']: '' }));
  };

  const removeParam = (key: string) => {
    const newP = { ...params };
    delete newP[key];
    setParams(newP);
  };

  const doTest = async () => {
    setLoading(true);
    setResult(null);
    const start = performance.now();
    try {
      const search = new URLSearchParams(params).toString();
      const finalUrl = selected.url + (search ? `?${search}` : '');
      
      const req: RequestInit = { method: selected.method };
      if (selected.method === 'POST') {
        req.headers = { 'Content-Type': 'application/json' };
        req.body = body || '{}';
      }

      const res = await fetch(finalUrl, req);
      let data = null;
      const text = await res.text();
      try { data = JSON.parse(text); } catch { data = text; }

      setResult({
        status: res.status,
        data,
        timeMs: Math.round(performance.now() - start),
      });
    } catch (e: any) {
      setResult({
        status: 0,
        data: { error: e.message },
        timeMs: Math.round(performance.now() - start),
      });
    }
    setLoading(false);
  };

  return (
    <main className="pt-24 pb-16 px-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">Admin Utilities</span>
        <h2 className="text-4xl font-headline text-[#00361a] mt-1">Live API Tester</h2>
        <p className="text-stone-500 font-body text-sm mt-2 max-w-2xl">
          Use this sandbox to run comprehensive, real-time tests against all endpoints in production. Watch latency, inspect raw JSON, and ensure components respond as designed.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Controls Panel */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-card border border-stone-100 p-6">
            <h3 className="font-ui font-bold text-sm uppercase tracking-widest text-[#1A4D2E] mb-4">Request Configuration</h3>
            
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1.5">Select Endpoint</label>
              <select
                value={ENDPOINTS.indexOf(selected)}
                onChange={(e) => handleSelect(Number(e.target.value))}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-ui bg-stone-50 focus:outline-[#1A4D2E]"
              >
                {ENDPOINTS.map((ep, i) => (
                  <option key={ep.url} value={i}>{ep.method} {ep.name}</option>
                ))}
              </select>
              <p className="text-xs text-stone-500 mt-2 italic">{selected.description}</p>
            </div>

            <div className="mb-5 flex gap-2">
              <div className={`px-2 py-1 rounded text-[10px] font-bold ${selected.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {selected.method}
              </div>
              <div className="font-data text-sm flex-1 truncate">{selected.url}</div>
            </div>

            {selected.method === 'GET' && (
              <div className="mb-5 border-t border-stone-100 pt-5">
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[10px] font-bold uppercase text-stone-500">Query Parameters</label>
                  <button onClick={addParam} className="text-[#1A4D2E] text-xs font-bold font-ui">Add +</button>
                </div>
                {Object.keys(params).length === 0 && <p className="text-xs text-stone-400 italic">No parameters</p>}
                {Object.entries(params).map(([k, v], i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      placeholder="Key" value={k} onChange={(e) => {
                        const newP = { ...params };
                        delete newP[k]; newP[e.target.value] = v; setParams(newP);
                      }}
                      className="w-1/3 border border-stone-200 rounded px-2 py-1 text-xs font-data"
                    />
                    <span className="text-stone-400 mt-1">=</span>
                    <input
                      placeholder="Value" value={v} onChange={(e) => handleParamChange(k, e.target.value)}
                      className="flex-1 border border-stone-200 rounded px-2 py-1 text-xs font-data"
                    />
                    <button onClick={() => removeParam(k)} className="text-stone-400 hover:text-red-500"><span className="material-symbols-outlined text-[16px]">close</span></button>
                  </div>
                ))}
              </div>
            )}

            {selected.method === 'POST' && (
              <div className="mb-5 border-t border-stone-100 pt-5">
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-2">JSON Body</label>
                <textarea
                  className="w-full h-40 font-data text-xs border border-stone-200 rounded p-2 bg-stone-50"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={doTest}
              disabled={loading}
              className="w-full py-3 bg-[#1A4D2E] text-white font-ui font-bold text-sm rounded-lg hover:bg-[#143D24] transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> In Flight...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">send</span> Execute Request</>
              )}
            </button>
          </div>
        </div>

        {/* Response Panel */}
        <div className="col-span-12 md:col-span-7">
          <div className="bg-[#0F1A14] text-stone-300 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="bg-[#0A120E] px-4 py-3 flex justify-between items-center border-b border-white/5 flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
              </div>
              {result && (
                <div className="flex gap-4 text-[10px] font-data font-bold uppercase tracking-wider">
                  <span className={result.status >= 200 && result.status < 300 ? 'text-emerald-400' : 'text-red-400'}>
                    STATUS: {result.status}
                  </span>
                  <span className="text-[#D4A843]">TIME: {result.timeMs}ms</span>
                </div>
              )}
            </div>
            <div className="p-5 overflow-auto flex-1 font-data text-xs leading-relaxed scrollbar-gold">
              {!result && <div className="text-stone-600 italic mt-4 text-center">Hit execute to see JSON response...</div>}
              {result && (
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
