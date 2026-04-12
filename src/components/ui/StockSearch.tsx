'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

interface StockSearchProps {
  onSelect?: (stock: StockSearchResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  clearOnSelect?: boolean;
}

export default function StockSearch({
  onSelect,
  placeholder = 'Search NSE / BSE stocks... (e.g. RELIANCE)',
  className = '',
  autoFocus = false,
  clearOnSelect = true
}: StockSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when typing outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced Search API call
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('Failed to search stocks', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (stock: StockSearchResult) => {
    if (onSelect) {
      onSelect(stock);
    } else {
      // Default action if no onSelect provided: Navigate to research page for that stock
      router.push(`/research?symbol=${stock.symbol}`);
    }

    if (clearOnSelect) {
      setQuery('');
    } else {
      setQuery(stock.symbol);
    }
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative flex items-center w-full">
        <span className="material-symbols-outlined absolute left-3 text-stone-400 pointer-events-none text-[20px]">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A4D2E] focus:border-transparent font-body text-sm text-stone-800 placeholder-stone-400 transition-shadow shadow-sm"
          autoComplete="off"
          spellCheck="false"
        />
        
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-stone-200 border-t-[#1A4D2E] rounded-full animate-spin"></div>
          </div>
        ) : query.length > 0 ? (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 rounded-full flex items-center justify-center transition-colors"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        ) : (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded text-[10px] font-bold text-stone-500 font-data border border-stone-200 pointer-events-none">
            Ctrl K
          </span>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-[#E8E6DF] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading && results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-stone-500 font-body">
              Searching Indian Markets...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto overscroll-contain py-2 custom-scrollbar">
              <div className="px-3 pb-2 pt-1 mb-1 text-[10px] font-bold uppercase tracking-widest text-[#795900] font-data border-b border-stone-100 flex justify-between">
                <span>Symbols</span>
                <span>Exchange</span>
              </div>
              <ul className="flex flex-col">
                {results.map((result, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <li key={`${result.exchange}-${result.symbol}`}>
                      <button
                        type="button"
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors ${
                          isSelected 
                            ? 'bg-[#1A4D2E]/10 border-l-2 border-[#1A4D2E]' 
                            : 'bg-white border-l-2 border-transparent hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 truncate pr-4">
                          <span className={`font-ui font-bold text-sm truncate ${isSelected ? 'text-[#00361a]' : 'text-stone-800'}`}>
                            {result.symbol}
                          </span>
                          <span className={`font-body text-xs truncate ${isSelected ? 'text-[#1A4D2E]' : 'text-stone-500'}`}>
                            {result.name}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-2 py-1 rounded-[4px] text-[10px] font-bold font-data ${
                            result.exchange === 'NSE' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {result.exchange}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="px-4 py-8 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-stone-300 text-4xl mb-3">search_off</span>
              <p className="font-ui font-bold text-stone-700 text-sm mb-1">No stocks found</p>
              <p className="font-body text-stone-500 text-xs">We couldn't find any matches for "{query}". Try checking the spelling.</p>
            </div>
          )}
          
          <div className="bg-stone-50 px-3 py-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-body">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Data delayed by up to 15 mins
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1">
                <kbd className="bg-white border border-stone-200 rounded px-1.5 py-0.5 font-data text-[9px] shadow-sm">↑↓</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-white border border-stone-200 rounded px-1.5 py-0.5 font-data text-[9px] shadow-sm">↵</kbd> to select
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
