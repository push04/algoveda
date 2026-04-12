'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  symbol: string;
  price: number;
  change: number;
}

export default function ResearchPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [reportSymbol, setReportSymbol] = useState('RELIANCE');
  const [loading, setLoading] = useState(false);

  const POPULAR_STOCKS = ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'TITAN', 'LTIM'];

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'financials', label: 'Financials' },
    { id: 'technical', label: 'Technical' },
    { id: 'risks', label: 'Risks' },
  ];

  const generateReport = async () => {
    setLoading(true);
    // Would call API to generate AI report
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <main className="pt-24 pb-16 max-w-[900px] mx-auto px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[10px] font-data uppercase tracking-[0.3em] text-[#795900]">AI Research</span>
          <h2 className="text-4xl font-headline text-[#00361a] mt-1">Research Reports</h2>
        </div>
      </div>

      {/* Symbol Selector */}
      <div className="flex gap-2 mb-8">
        {POPULAR_STOCKS.map(s => (
          <button
            key={s}
            onClick={() => setReportSymbol(s)}
            className={`px-4 py-2 rounded-lg font-ui text-sm font-bold ${reportSymbol === s ? 'bg-[#00361a] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <div className="bg-white rounded-2xl shadow-card p-12 text-center">
        <span className="material-symbols-outlined text-[64px] text-stone-300 mb-4 block">menu_book</span>
        <h3 className="font-headline text-2xl text-[#00361a] mb-2">Generate AI Research Report</h3>
        <p className="font-body text-stone-500 mb-6 max-w-md mx-auto">
          Get comprehensive analysis for {reportSymbol} including financials, technicals, and AI-generated insights
        </p>
        <button 
          onClick={generateReport}
          disabled={loading}
          className="px-8 py-4 bg-[#1A4D2E] text-white rounded-xl font-ui font-bold hover:bg-[#143D24] disabled:opacity-50"
        >
          {loading ? 'Generating...' : `Generate ${reportSymbol} Report`}
        </button>
      </div>

      {/* Info */}
      <div className="grid grid-cols-3 gap-6 mt-12">
        <div className="bg-white p-6 rounded-xl shadow-card text-center">
          <span className="material-symbols-outlined text-[32px] text-[#1A4D2E] mb-2 block">auto_awesome</span>
          <p className="text-sm text-stone-500">AI-powered analysis using Groq LLM</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-card text-center">
          <span className="material-symbols-outlined text-[32px] text-[#1A4D2E] mb-2 block">analytics</span>
          <p className="text-sm text-stone-500">Real-time market data integration</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-card text-center">
          <span className="material-symbols-outlined text-[32px] text-[#1A4D2E] mb-2 block">verified</span>
          <p className="text-sm text-stone-500">Professional-grade insights</p>
        </div>
      </div>
    </main>
  );
}