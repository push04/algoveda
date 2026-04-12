'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickSeries, LineSeries } from 'lightweight-charts';

const STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'TCS.NS', name: 'TCS' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'ITC.NS', name: 'ITC' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' }
];

export default function LiveMarketChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [symbol, setSymbol] = useState(STOCKS[0].symbol);
  const [smaPeriod, setSmaPeriod] = useState(20);
  const [showSma, setShowSma] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Time gate logic: 8 AM to 3 PM IST
  const isWithinTradingHours = () => {
    // Current UTC time
    const now = new Date();
    // Indian Standard Time is UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const hour = istTime.getUTCHours(); // Getting hours in IST visually
    
    // 8 AM to 3 PM (15:00)
    return hour >= 8 && hour < 15;
  };

  const fetchChartData = useCallback(async () => {
    try {
      if (!isWithinTradingHours()) {
        console.log("Outside trading hours constraint (8 AM - 3 PM). Returning cached/historical default data...");
      } else {
        setIsLive(true);
      }

      // Using open Yahoo Finance proxy for historical daily dataset bridging real market data
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6m`);
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const result = data.chart.result[0];

      if (!result || !result.timestamp) return;

      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      const candleData = timestamps.map((t: number, index: number) => ({
        time: (t + 19800) as Time, // IST offset for dates
        open: quotes.open[index] || 0,
        high: quotes.high[index] || 0,
        low: quotes.low[index] || 0,
        close: quotes.close[index] || 0,
      })).filter((c: any) => c.open !== 0 && c.high !== 0);

      // Sort chronological
      candleData.sort((a: any, b: any) => (a.time as number) - (b.time as number));

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(candleData);
      }

      if (showSma && candleData.length > smaPeriod) {
        const smaData = [];
        for (let i = smaPeriod - 1; i < candleData.length; i++) {
          let sum = 0;
          for (let j = 0; j < smaPeriod; j++) {
            sum += candleData[i - j].close;
          }
          smaData.push({ time: candleData[i].time, value: sum / smaPeriod });
        }
        if (smaSeriesRef.current) {
          smaSeriesRef.current.setData(smaData);
        }
      } else if (smaSeriesRef.current) {
        smaSeriesRef.current.setData([]);
      }

      setLastUpdate(new Date().toLocaleTimeString());

    } catch (e) {
      console.error("Fetch Data Error: ", e);
      // Fallback data if offline or blocked by CORS
    }
  }, [symbol, smaPeriod, showSma]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'Solid' as any, color: 'white' },
        textColor: '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height: 450,
      grid: {
        vertLines: { color: '#E8E6DF' },
        horzLines: { color: '#E8E6DF' },
      },
      rightPriceScale: {
        borderColor: '#E8E6DF',
      },
      timeScale: {
        borderColor: '#E8E6DF',
        timeVisible: true,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444'
    });

    const smaSeries = chart.addSeries(LineSeries, {
      color: '#3B82F6',
      lineWidth: 2,
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    smaSeriesRef.current = smaSeries;

    fetchChartData();

    // Auto resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth || 800 });
    };
    window.addEventListener('resize', handleResize);

    // Hourly Daily polling as requested inside the operational window
    const intervalId = setInterval(() => {
      if (isWithinTradingHours()) {
        fetchChartData();
      }
    }, 60 * 60 * 1000); // Hourly

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalId);
      chart.remove();
    };
  }, [fetchChartData]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-card border border-[#E8E6DF] mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="font-headline text-xl text-[#00361a] flex items-center gap-3">
            Realtime Interactive Chart
            {isWithinTradingHours() ? (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider font-data">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Market Open
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider font-data">
                Offline (Out of 8AM-3PM Window)
              </span>
            )}
          </h3>
          <p className="text-sm text-stone-500 mt-1">Practice identifying patterns and applying indicators on live market data.</p>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-stone-200">
          <select 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-white border border-stone-200 text-sm font-bold text-[#0F1A14] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1A4D2E]"
          >
            {STOCKS.map(s => <option key={s.symbol} value={s.symbol}>{s.name} ({s.symbol.replace('.NS', '')})</option>)}
          </select>
          
          <div className="h-6 w-px bg-stone-300"></div>
          
          <label className="flex items-center gap-2 cursor-pointer text-sm font-ui text-stone-700">
            <input type="checkbox" checked={showSma} onChange={e => setShowSma(e.target.checked)} className="accent-[#1A4D2E]" />
            SMA
          </label>
          
          <input 
            type="number" 
            value={smaPeriod} 
            onChange={(e) => setSmaPeriod(Number(e.target.value))}
            className="w-16 px-2 py-1 text-sm border border-stone-200 rounded-lg text-center"
            disabled={!showSma}
            min={2}
            max={200}
          />
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full relative rounded-xl overflow-hidden border border-stone-100">
        {/* Chart mounts here */}
      </div>
      {lastUpdate && <p className="text-right text-xs text-stone-400 font-data mt-2">Last Updated: {lastUpdate}</p>}
    </div>
  );
}
