import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { ParsedIntent } from '../types';

interface Props {
  onSearch: (query: string, city: string, budget?: number, locality?: string) => void;
  isLoading: boolean;
  currentIntent?: ParsedIntent | null;
}

export const SearchHero: React.FC<Props> = ({ onSearch, isLoading, currentIntent }) => {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState('Lucknow');
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [locality, setLocality] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, city, budget, locality.trim() ? locality.trim() : undefined);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-warm-300 shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4">
        {/* Main AI Search Bar */}
        <div className="flex-1 relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you need in natural language..."
            className="w-full pl-10 pr-4 py-3 bg-warm-50 border border-warm-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 rounded-xl text-sm font-sans text-stone-800 placeholder-stone-400 transition-all outline-none"
          />
        </div>

        {/* Refinements */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-warm-200 text-xs text-stone-600 shadow-2xs flex-1 md:flex-none">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent text-stone-800 focus:outline-none w-20 font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <span>{isLoading ? 'Searching...' : 'Search'}</span>
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
