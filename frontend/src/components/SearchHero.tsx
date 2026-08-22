import React, { useState } from 'react';
import { Search, MapPin, IndianRupee, ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { ParsedIntent } from '../types';

interface Props {
  onSearch: (query: string, city: string, budget?: number, locality?: string) => void;
  isLoading: boolean;
  currentIntent?: ParsedIntent | null;
}

const SAMPLE_QUERIES = [
  "Student near Bhoothnath market in Lucknow. Need safe budget hostel under ₹8,000 with meals included.",
  "Working woman relocating to Gomti Nagar Lucknow. Looking for women's PG with late curfew, 24x7 pharmacy, and metro access.",
  "Women's hostel near Lucknow University New Campus in Jankipuram with healthcare nearby."
];

export const SearchHero: React.FC<Props> = ({ onSearch, isLoading, currentIntent }) => {
  const [query, setQuery] = useState(SAMPLE_QUERIES[0]);
  const [city, setCity] = useState('Lucknow');
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [locality, setLocality] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, city, budget, locality.trim() ? locality.trim() : undefined);
    }
  };

  const handleSelectSample = (sample: string) => {
    setQuery(sample);
    setBudget(undefined);
    setLocality('');
  };

  return (
    <div className="relative rounded-3xl bg-white border border-warm-300 p-6 sm:p-8 shadow-sm">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Search Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Where are you relocating?
          </h1>
          <p className="text-sm text-stone-600 font-sans max-w-lg mx-auto">
            Describe what you need in natural language. We'll cross-reference verified accommodations, transit, and healthcare.
          </p>
        </div>

        {/* Human-Centered Natural Search Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative bg-warm-50 rounded-2xl border border-warm-300 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-rose-100 transition-all overflow-hidden p-2 sm:p-3 shadow-inner">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g. female student moving to Lucknow looking for hostel under ₹8k with nearby hospital..."
              rows={2}
              className="w-full bg-transparent px-3 py-2 text-stone-800 placeholder-stone-400 text-sm sm:text-base focus:outline-none resize-none font-sans leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 border-t border-warm-200 px-2 flex-wrap gap-2">
              <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                AI intent extraction
              </span>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 disabled:opacity-50 text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
              >
                <span>{isLoading ? 'Verifying resources...' : 'Search Network'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Criteria Refinement Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-warm-200 hover:border-warm-300 transition-colors">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-stone-500 font-medium">City:</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent text-stone-800 focus:outline-none w-full font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-warm-200 hover:border-warm-300 transition-colors">
              <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-stone-500 font-medium">Budget:</span>
              <input
                type="number"
                value={budget !== undefined ? budget : (currentIntent?.budget_max || '')}
                onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={currentIntent?.budget_max ? `₹${currentIntent.budget_max.toLocaleString()}` : "Auto"}
                className="bg-transparent text-stone-800 focus:outline-none w-full font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-warm-200 hover:border-warm-300 transition-colors">
              <Compass className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-stone-500 font-medium">Locality:</span>
              <input
                type="text"
                value={locality || (currentIntent?.target_location || '')}
                onChange={(e) => setLocality(e.target.value)}
                placeholder={currentIntent?.target_location || "Auto"}
                className="bg-transparent text-stone-800 focus:outline-none w-full font-semibold truncate"
              />
            </div>
          </div>

          {/* Understated Editorial Situation Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-stone-500 hidden md:block mr-2">
              Try a scenario:
            </span>
            {SAMPLE_QUERIES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="text-left text-xs px-3.5 py-1.5 rounded-full bg-warm-50 hover:bg-warm-100 border border-warm-200 text-stone-600 hover:text-stone-900 transition-all truncate max-w-[200px] sm:max-w-[250px]"
              >
                <span className="mr-1.5 opacity-70">{idx === 0 ? '🎓' : idx === 1 ? '💼' : '🏛️'}</span>
                {sample}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};
